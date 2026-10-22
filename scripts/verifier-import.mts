/* eslint-disable no-console */ // outil en ligne de commande : son rôle est d'afficher un rapport
// ============================================================================
// N'KO NI LONKO — Vérification d'un fichier d'import AVANT écriture dans Sanity
// ============================================================================
// « Test à blanc » : lit un fichier JSON (tableau de documents Sanity) et liste
// les problèmes. N'ÉCRIT RIEN dans Sanity et ne se connecte à rien.
// Types acceptés : article, terme, rubrique, numero.
//
// NFC (décision du propriétaire, 5 octobre 2026) : la normalisation NFC n'est PAS
// une modification du texte. Si des textes ne sont pas en NFC, le script crée une
// copie normalisée <fichier>.nfc.json (après contrôle : aucun caractère ajouté ni
// retiré) et liste chaque mot concerné. C'est cette copie qu'il faut importer.
// Les autres défauts (ex. nasalisation U+07F2 tapée deux fois) sont seulement signalés, jamais corrigés.
//
// Option --export <sauvegarde.tar.gz> (la sauvegarde faite avant chaque import) :
// vérifie que chaque référence (auteur, terme, rubrique, article, image) existe.
// Règle du propriétaire (15 octobre 2026) : une référence vers un document qui
// n'existe qu'en BROUILLON n'est acceptée que si elle est FAIBLE
// (_weak: true et _strengthenOnPublish), comme les liens du lexique ; sinon, erreur.
// Signale aussi les documents qui existent déjà (l'import sera alors une mise à jour).
//
// Usage :   node scripts/verifier-import.mts <fichier.json> [--export <sauvegarde.tar.gz>]
// Résultat : code 0 = aucune erreur bloquante ; code 1 = erreurs à corriger.
// Les listes autorisées (catégories, types d'encadrés…) sont lues dans le schéma.
// ============================================================================

import { readFileSync, writeFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';

// Import « dynamique » du schéma : Node sait lire le .ts, et la construction du site n'est pas gênée
const { default: article } = await import(new URL('../sanity/schemas/article.ts', import.meta.url).href);

type Doc = Record<string, unknown> & { _id?: string; _type?: string };
type Reference = { _ref?: string; _key?: string; _weak?: boolean; _strengthenOnPublish?: unknown };
type Bloc = {
  _type?: string; _key?: string; style?: string; intent?: string; titleNko?: string; alt?: string;
  asset?: { _ref?: string };
  children?: { text?: string; marks?: string[] }[];
  markDefs?: { _key: string; _type?: string; terme?: Reference }[];
};

// --- Arguments ----------------------------------------------------------------
const args = process.argv.slice(2);
let cheminExport: string | undefined;
const positionnels: string[] = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--export') cheminExport = args[++i];
  else positionnels.push(args[i]);
}
const fichier = positionnels[0];
if (!fichier || (args.includes('--export') && !cheminExport)) {
  console.error('Usage : node scripts/verifier-import.mts <fichier.json> [--export <sauvegarde.tar.gz>]');
  process.exit(2);
}

// --- Listes autorisées, lues dans le schéma « article » --------------------
type Champ = { name: string; options?: { list?: { value: string }[] }; of?: { name?: string; type?: string; fields?: Champ[] }[] };
const champs = (article as unknown as { fields: Champ[] }).fields;
const valeurs = (c?: Champ) => new Set((c?.options?.list || []).map((x) => x.value));
const CATEGORIES = valeurs(champs.find((c) => c.name === 'category'));
const callout = champs.find((c) => c.name === 'body')?.of?.find((o) => o.name === 'callout');
const INTENTIONS = valeurs(callout?.fields?.find((f) => f.name === 'intent'));
const STYLES = new Set(['normal', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote']);

// --- Outils -----------------------------------------------------------------
const erreurs: string[] = [];
const avertissements: string[] = [];
const contientNko = (t = '') => [...t].some((c) => { const n = c.codePointAt(0) ?? 0; return n >= 0x07c0 && n <= 0x07ff; });
const codes = (t: string) => [...t].map((c) => 'U+' + (c.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, '0')).join(' ');
const slugValide = (s?: string) => !!s && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s);
const idPublie = (id?: string) => (id || '').replace(/^drafts\./, '');
const lienDe = (d: Doc) => (d.slug as { current?: string } | undefined)?.current;
// « 3 » → « 003 » : le lien d'un numéro se calcule à partir de son numéro
const enLien = (n: unknown) => (Number.isInteger(n) && (n as number) > 0 ? String(n).padStart(3, '0') : '');
const entier = (n: unknown, min: number) => Number.isInteger(n) && (n as number) >= min;

// NFC : normalisation automatique, avec contrôle « mêmes caractères » (seul l'ordre des marques change)
const normalisations: string[] = [];
const estMarque = (n: number) => (n >= 0x07eb && n <= 0x07f3) || n === 0x07fd || (n >= 0x0300 && n <= 0x036f);
const memesCaracteres = (a: string, b: string) => [...a].sort().join('|') === [...b].sort().join('|');

// Découpe un texte en groupes : une lettre suivie de ses marques (tons, nasalisation…)
function groupes(t: string) {
  const res: string[] = [];
  for (const c of t) {
    if (estMarque(c.codePointAt(0) ?? 0) && res.length) res[res.length - 1] += c;
    else res.push(c);
  }
  return res;
}

function normaliser(v: unknown, chemin: string, id: string): unknown {
  if (typeof v === 'string') {
    // Marque tapée deux fois dans le même groupe (ex. U+07F2 U+07F2) : signalée, jamais corrigée
    for (const g of groupes(v)) {
      const marques = [...g].slice(1);
      if (new Set(marques).size < marques.length) avertissements.push(`[${id}] ${chemin} : marque tapée deux fois (${codes(g)}) → à faire vérifier par la rédaction.`);
    }
    const n = v.normalize('NFC');
    if (n === v) return v;
    if (!memesCaracteres(v, n)) {
      erreurs.push(`[${id}] ${chemin} : la normalisation NFC changerait des caractères (${codes(v).slice(0, 60)}…) → à vérifier à la main.`);
      return v;
    }
    const mots = v.split(/\s+/).filter((m) => m !== m.normalize('NFC'));
    normalisations.push(...mots.map((m) => `[${id}] ${chemin} : « ${m} » ${codes(m)} → ${codes(m.normalize('NFC'))}`));
    return n;
  }
  if (Array.isArray(v)) return v.map((x, i) => normaliser(x, `${chemin}[${i}]`, id));
  if (v && typeof v === 'object') {
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, k.startsWith('_') ? x : normaliser(x, chemin ? `${chemin}.${k}` : k, id)]));
  }
  return v;
}

// --- Sauvegarde (--export) : lecture du fichier data.ndjson dans l'archive .tar.gz ----
// Archive « tar » : blocs de 512 octets (en-tête : nom à l'octet 0, taille en octal à l'octet 124,
// type à l'octet 156) suivis des données. Aucune dépendance : seulement zlib (inclus dans Node).
type Fiche = { _id: string; _type: string; slug?: string; numero?: unknown };
function lireSauvegarde(chemin: string): Map<string, Fiche> {
  const tar = gunzipSync(readFileSync(chemin));
  const texte = (b: Buffer) => { const fin = b.indexOf(0); return b.subarray(0, fin < 0 ? b.length : fin).toString('utf8'); };
  const SAUT = String.fromCharCode(10);
  let pos = 0;
  let nomPax = '';
  while (pos + 512 <= tar.length) {
    const entete = tar.subarray(pos, pos + 512);
    if (entete.every((o) => o === 0)) break;
    const nom = nomPax || texte(entete.subarray(0, 100));
    const taille = parseInt(texte(entete.subarray(124, 136)).trim() || '0', 8);
    const type = String.fromCharCode(entete[156]);
    const donnees = tar.subarray(pos + 512, pos + 512 + taille);
    nomPax = '';
    if (type === 'x' || type === 'L') {
      // En-tête étendu : nom long du fichier suivant
      const contenu = texte(donnees);
      nomPax = type === 'L' ? contenu : (contenu.split(SAUT).find((l) => l.includes(' path=')) || '').split(' path=')[1] || '';
    } else if (nom.endsWith('data.ndjson')) {
      const fiches = new Map<string, Fiche>();
      for (const ligne of donnees.toString('utf8').split(SAUT)) {
        if (!ligne.trim()) continue;
        const d = JSON.parse(ligne) as Doc & { numero?: unknown };
        if (d._id && d._type) fiches.set(d._id, { _id: d._id, _type: d._type, slug: lienDe(d), numero: d.numero });
      }
      return fiches;
    }
    pos += 512 + Math.ceil(taille / 512) * 512;
  }
  throw new Error('data.ndjson introuvable dans la sauvegarde');
}

let sauvegarde: Map<string, Fiche> | undefined;
if (cheminExport) {
  try {
    sauvegarde = lireSauvegarde(cheminExport);
  } catch (e) {
    console.error(`Sauvegarde illisible (${cheminExport}) : ${(e as Error).message}`);
    process.exit(1);
  }
}

// --- Lecture du fichier -----------------------------------------------------
let docs: Doc[];
try {
  const brut = JSON.parse(readFileSync(fichier, 'utf8'));
  docs = Array.isArray(brut) ? brut : [brut];
} catch (e) {
  console.error(`Fichier illisible (JSON invalide) : ${(e as Error).message}`);
  process.exit(1);
}

// Tous les contrôles suivants portent sur les textes normalisés
docs = docs.map((d) => normaliser(d, '', d._id || '(sans _id)') as Doc);
let fichierNfc = '';
if (normalisations.length) {
  fichierNfc = (fichier.endsWith('.json') ? fichier.slice(0, -'.json'.length) : fichier) + '.nfc.json';
  writeFileSync(fichierNfc, JSON.stringify(docs, null, 2) + '\n', 'utf8');
}

const termesDuFichier = new Set(docs.filter((d) => d._type === 'terme').map((d) => idPublie(d._id)));
const nomsTermes = new Map<string, string>();
// Documents créés par ce fichier (tous en brouillon) : identifiant publié → type
const brouillonsDuFichier = new Map(docs.map((d) => [idPublie(d._id), String(d._type)]));

// Vérifie une référence grâce à la sauvegarde (--export) et au fichier.
// Publié : accepté. Seulement en brouillon : accepté si la référence est faible. Introuvable : erreur.
function verifierReference(ref: Reference | undefined, types: string[], ou: string, id: string) {
  const cible = ref?._ref;
  if (!cible || !sauvegarde) return;
  const faible = ref?._weak === true && !!ref?._strengthenOnPublish;
  const publie = sauvegarde.get(cible);
  const typeBrouillon = sauvegarde.get('drafts.' + cible)?._type ?? brouillonsDuFichier.get(cible);
  const type = publie?._type ?? typeBrouillon;
  if (!type) {
    erreurs.push(`[${id}] ${ou} : « ${cible} » introuvable (ni dans le fichier ni dans la sauvegarde).`);
    return;
  }
  if (!types.includes(type)) erreurs.push(`[${id}] ${ou} : « ${cible} » est un document « ${type} », attendu : ${types.join(' ou ')}.`);
  if (!publie && !faible) {
    erreurs.push(`[${id}] ${ou} : « ${cible} » n'existe qu'en brouillon → la référence doit être faible (_weak: true et _strengthenOnPublish).`);
  }
}

// Avec la sauvegarde : le document existe-t-il déjà ? Le lien est-il pris par un autre document ?
function verifierExistence(d: Doc, id: string) {
  if (!sauvegarde) return;
  const pub = idPublie(d._id);
  const etats = [sauvegarde.has('drafts.' + pub) && 'en brouillon', sauvegarde.has(pub) && 'publié'].filter(Boolean);
  if (etats.length) avertissements.push(`[${id}] existe déjà dans Sanity (${etats.join(' et ')}) : l'import sera une MISE À JOUR (remplacement ou modification), pas une création.`);
  const lien = lienDe(d);
  if (!lien) return;
  for (const f of sauvegarde.values()) {
    if (f._type === d._type && f.slug === lien && idPublie(f._id) !== pub) {
      erreurs.push(`[${id}] lien « ${lien} » déjà utilisé par un autre document « ${d._type} » (${f._id}).`);
      break;
    }
  }
}

const liensRubriques = new Map<string, string>();
const ordresRubriques = new Map<number, string>();
const numerosDuFichier = new Map<number, string>();

for (const d of docs) {
  const id = d._id || '(sans _id)';
  if (!d._id || !d._id.startsWith('drafts.')) erreurs.push(`[${id}] _id doit commencer par « drafts. » : l'IA ne crée QUE des brouillons.`);
  verifierExistence(d, id);

  if (d._type === 'terme') {
    for (const c of ['termeNko', 'termeFr', 'definitionNko', 'definitionFr']) if (!d[c]) erreurs.push(`[${id}] terme : « ${c} » obligatoire.`);
    if (d.termeNko && !contientNko(String(d.termeNko))) avertissements.push(`[${id}] termeNko ne contient pas de caractère N'Ko.`);
    if (!slugValide(lienDe(d))) erreurs.push(`[${id}] terme : slug.current invalide (a-z, chiffres, tirets).`);
    for (const c of ['termeNko', 'termeFr'] as const) {
      const cle = `${c}:${String(d[c] ?? '').normalize('NFC').toLowerCase().trim()}`;
      if (nomsTermes.has(cle)) avertissements.push(`[${id}] terme en double dans le fichier (${c}) avec ${nomsTermes.get(cle)}.`);
      nomsTermes.set(cle, id);
    }
  } else if (d._type === 'article') {
    if (!d.title) erreurs.push(`[${id}] article : « title » obligatoire.`);
    if (!d.excerpt) erreurs.push(`[${id}] article : « excerpt » (résumé) obligatoire.`);
    else if (String(d.excerpt).length > 200) avertissements.push(`[${id}] résumé de plus de 200 caractères.`);
    if (d.excerptFr && [...String(d.excerptFr)].length > 160) avertissements.push(`[${id}] résumé français (excerptFr) de plus de 160 caractères : il sera coupé sur les cartes.`);
    if (d.excerptFr && contientNko(String(d.excerptFr))) avertissements.push(`[${id}] le résumé français (excerptFr) contient du N'Ko.`);
    if (!d.publishedAt || Number.isNaN(Date.parse(String(d.publishedAt)))) erreurs.push(`[${id}] article : « publishedAt » obligatoire (date ISO).`);
    if (!slugValide(lienDe(d))) erreurs.push(`[${id}] article : slug.current invalide (a-z, chiffres, tirets).`);
    if (!d.category || !CATEGORIES.has(String(d.category))) erreurs.push(`[${id}] article : catégorie absente ou non autorisée.`);
    const img = d.mainImage as { asset?: { _ref?: string }; alt?: string } | undefined;
    if (!img?.asset?._ref) erreurs.push(`[${id}] article : image de couverture (mainImage.asset) obligatoire.`);
    if (!img?.alt) erreurs.push(`[${id}] article : texte alternatif de la couverture (mainImage.alt) obligatoire.`);
    verifierReference(img?.asset, ['sanity.imageAsset'], 'image de couverture', id);
    if (!Array.isArray(d.authors) || d.authors.length === 0) erreurs.push(`[${id}] article : au moins un auteur (référence) obligatoire.`);
    for (const a of (Array.isArray(d.authors) ? d.authors : []) as Reference[]) verifierReference(a, ['author'], 'auteur', id);
    // Rubrique de la revue (facultative)
    const rubrique = d.rubrique as Reference | undefined;
    if (rubrique) {
      if (!rubrique._ref) erreurs.push(`[${id}] article : rubrique sans référence.`);
      else if (!sauvegarde && !brouillonsDuFichier.has(rubrique._ref)) avertissements.push(`[${id}] rubrique « ${rubrique._ref} » absente du fichier : vérifier qu'elle existe dans Sanity (ou relancer avec --export).`);
      verifierReference(rubrique, ['rubrique'], 'rubrique', id);
    }

    // Corps : styles, encadrés, titres de rubrique, images, lexique
    const usages = { nko: new Map<string, number>(), fr: new Map<string, number>() };
    for (const b of (Array.isArray(d.body) ? d.body : []) as Bloc[]) {
      if (!b._key) erreurs.push(`[${id}] body : un bloc n'a pas de « _key ».`);
      if (b._type === 'block') {
        if (b.style && !STYLES.has(b.style)) erreurs.push(`[${id}] body : style « ${b.style} » non autorisé.`);
        const texte = (b.children || []).map((c) => c.text || '').join('');
        const langue = contientNko(texte) ? 'nko' : 'fr';
        const utilises = new Set((b.children || []).flatMap((c) => c.marks || []));
        for (const m of b.markDefs || []) {
          if (m._type !== 'termeLexique' || !utilises.has(m._key)) continue;
          const ref = m.terme?._ref;
          if (!ref) { erreurs.push(`[${id}] body : terme du lexique sans référence.`); continue; }
          if (!sauvegarde && !termesDuFichier.has(ref)) avertissements.push(`[${id}] terme « ${ref} » absent du fichier : vérifier qu'il existe (et est publié) dans Sanity.`);
          verifierReference(m.terme, ['terme'], 'terme du lexique', id);
          usages[langue].set(ref, (usages[langue].get(ref) || 0) + 1);
        }
      } else if (b._type === 'callout') {
        if (b.intent && !INTENTIONS.has(b.intent)) erreurs.push(`[${id}] encadré : type « ${b.intent} » non autorisé (${[...INTENTIONS].join(', ')}).`);
      } else if (b._type === 'sectionHeader') {
        if (!b.titleNko) erreurs.push(`[${id}] titre de rubrique : « titleNko » obligatoire.`);
      } else if (b._type === 'image') {
        if (!b.alt) avertissements.push(`[${id}] image du texte sans texte alternatif (alt).`);
        verifierReference(b.asset, ['sanity.imageAsset'], 'image du texte', id);
      }
    }
    for (const ref of new Set([...usages.nko.keys(), ...usages.fr.keys()])) {
      if (!usages.nko.has(ref)) avertissements.push(`[${id}] terme « ${ref} » relié en français mais pas en N'Ko.`);
      if (!usages.fr.has(ref)) avertissements.push(`[${id}] terme « ${ref} » relié en N'Ko mais pas en français.`);
      for (const l of ['nko', 'fr'] as const) if ((usages[l].get(ref) || 0) > 1) avertissements.push(`[${id}] terme « ${ref} » relié plusieurs fois en ${l === 'nko' ? "N'Ko" : 'français'} (ne relier que la 1re apparition).`);
    }
  } else if (d._type === 'rubrique') {
    for (const c of ['titleNko', 'titleFr']) if (!d[c]) erreurs.push(`[${id}] rubrique : « ${c} » obligatoire.`);
    if (d.titleNko && !contientNko(String(d.titleNko))) avertissements.push(`[${id}] rubrique : titleNko ne contient pas de caractère N'Ko.`);
    const lien = lienDe(d);
    if (!slugValide(lien)) erreurs.push(`[${id}] rubrique : slug.current invalide (a-z, chiffres, tirets).`);
    else if (liensRubriques.has(lien as string)) erreurs.push(`[${id}] rubrique : lien « ${lien} » déjà utilisé dans le fichier par ${liensRubriques.get(lien as string)}.`);
    else liensRubriques.set(lien as string, id);
    if (!entier(d.ordre, 1)) erreurs.push(`[${id}] rubrique : « ordre » doit être un nombre entier à partir de 1.`);
    else if (ordresRubriques.has(d.ordre as number)) avertissements.push(`[${id}] rubrique : ordre ${d.ordre} déjà utilisé dans le fichier par ${ordresRubriques.get(d.ordre as number)}.`);
    else ordresRubriques.set(d.ordre as number, id);
  } else if (d._type === 'numero') {
    const attendu = enLien(d.numero);
    if (!attendu) erreurs.push(`[${id}] numéro : « numero » doit être un nombre entier à partir de 1.`);
    else if (numerosDuFichier.has(d.numero as number)) erreurs.push(`[${id}] numéro : le numéro ${d.numero} est déjà utilisé dans le fichier par ${numerosDuFichier.get(d.numero as number)}.`);
    else numerosDuFichier.set(d.numero as number, id);
    if (attendu && sauvegarde) {
      for (const f of sauvegarde.values()) {
        if (f._type === 'numero' && f.numero === d.numero && idPublie(f._id) !== idPublie(d._id)) {
          erreurs.push(`[${id}] numéro : le numéro ${d.numero} est déjà utilisé dans Sanity par ${f._id}.`);
          break;
        }
      }
    }
    const lien = lienDe(d);
    if (!lien) erreurs.push(`[${id}] numéro : « slug.current » obligatoire${attendu ? ` (« ${attendu} »)` : ''}.`);
    else if (attendu && lien !== attendu) erreurs.push(`[${id}] numéro : le lien doit être « ${attendu} » (calculé à partir du numéro), pas « ${lien} ».`);
    if (d.saison !== undefined && !entier(d.saison, 1)) erreurs.push(`[${id}] numéro : « saison » doit être un nombre entier à partir de 1.`);
    if (!d.publishedAt || Number.isNaN(Date.parse(String(d.publishedAt)))) erreurs.push(`[${id}] numéro : « publishedAt » obligatoire (date ISO).`);

    // Sommaire : obligatoire, ordonné, sans doublon
    const sommaire = (Array.isArray(d.sommaire) ? d.sommaire : []) as Reference[];
    if (!sommaire.length) erreurs.push(`[${id}] numéro : le sommaire doit contenir au moins un article.`);
    const vus = new Set<string>();
    sommaire.forEach((r, i) => {
      const ou = `sommaire[${i}]`;
      if (!r?._key) erreurs.push(`[${id}] ${ou} : pas de « _key ».`);
      if (!r?._ref) { erreurs.push(`[${id}] ${ou} : référence vide.`); return; }
      if (vus.has(r._ref)) erreurs.push(`[${id}] ${ou} : l'article « ${r._ref} » figure deux fois dans le sommaire.`);
      vus.add(r._ref);
      if (!sauvegarde && !brouillonsDuFichier.has(r._ref)) avertissements.push(`[${id}] ${ou} : article « ${r._ref} » absent du fichier : vérifier qu'il existe dans Sanity (ou relancer avec --export).`);
      verifierReference(r, ['article'], ou, id);
    });
    // Édito et article à la une : facultatifs, mais toujours dans le sommaire
    for (const champ of ['edito', 'aLaUne'] as const) {
      const r = d[champ] as Reference | undefined;
      if (!r) continue;
      if (!r._ref) { erreurs.push(`[${id}] numéro : « ${champ} » sans référence.`); continue; }
      if (!vus.has(r._ref)) erreurs.push(`[${id}] numéro : « ${champ} » (« ${r._ref} ») doit aussi figurer dans le sommaire.`);
      verifierReference(r, ['article'], champ, id);
    }
    // Couverture : facultative mais conseillée ; si elle est là, le texte alternatif est obligatoire
    const couverture = d.couverture as { asset?: Reference; alt?: string } | undefined;
    if (!couverture?.asset?._ref) avertissements.push(`[${id}] numéro : pas de couverture (conseillée pour la page, l'archive et le partage).`);
    else {
      if (!couverture.alt) erreurs.push(`[${id}] numéro : texte alternatif de la couverture (couverture.alt) obligatoire.`);
      verifierReference(couverture.asset, ['sanity.imageAsset'], 'couverture', id);
    }
    if (d.seoTitle && String(d.seoTitle).length > 60) avertissements.push(`[${id}] numéro : titre SEO de plus de 60 caractères.`);
    if (d.excerpt && String(d.excerpt).length > 200) avertissements.push(`[${id}] numéro : résumé de plus de 200 caractères.`);
    if (d.excerptFr && [...String(d.excerptFr)].length > 160) avertissements.push(`[${id}] numéro : résumé français (excerptFr) de plus de 160 caractères : il sera coupé sur les cartes.`);
    if (d.excerptFr && contientNko(String(d.excerptFr))) avertissements.push(`[${id}] numéro : le résumé français (excerptFr) contient du N'Ko.`);
  } else {
    erreurs.push(`[${id}] type « ${d._type} » non prévu dans un import (seulement « article », « terme », « rubrique » et « numero »).`);
  }
}

// --- Rapport ----------------------------------------------------------------
const nombre = (t: string) => docs.filter((d) => d._type === t).length;
console.log(`Fichier : ${fichier}`);
if (cheminExport && sauvegarde) console.log(`Sauvegarde utilisée pour les références : ${cheminExport} (${sauvegarde.size} documents)`);
console.log(`Documents : ${nombre('article')} article(s), ${nombre('terme')} terme(s)${nombre('rubrique') ? `, ${nombre('rubrique')} rubrique(s)` : ''}${nombre('numero') ? `, ${nombre('numero')} numéro(s)` : ''}`);
console.log(`\n❌ Erreurs (${erreurs.length}) :`);
erreurs.forEach((e) => console.log('  • ' + e));
console.log(`\n⚠️ Avertissements (${avertissements.length}) :`);
avertissements.forEach((a) => console.log('  • ' + a));
console.log(`\n🔤 Normalisations NFC faites automatiquement (${normalisations.length}) :`);
normalisations.forEach((n) => console.log('  • ' + n));
if (fichierNfc) console.log(`  → Copie normalisée créée : ${fichierNfc} (c'est CE fichier qu'il faut importer).`);
const aImporter = fichierNfc || fichier;
console.log(erreurs.length ? '\n→ Corriger les erreurs AVANT tout import.' : `\n→ Aucune erreur bloquante. Import possible (en brouillons) du fichier ${aImporter}, puis vérification dans le Studio et l'aperçu.`);
process.exit(erreurs.length ? 1 : 0);
