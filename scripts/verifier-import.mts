/* eslint-disable no-console */ // outil en ligne de commande : son rôle est d'afficher un rapport
// ============================================================================
// N'KO NI LONKO — Vérification d'un fichier d'import AVANT écriture dans Sanity
// ============================================================================
// « Test à blanc » : lit un fichier JSON (tableau de documents Sanity) et liste
// les problèmes. N'ÉCRIT RIEN dans Sanity et ne se connecte à rien.
//
// NFC (décision du propriétaire, 5 octobre 2026) : la normalisation NFC n'est PAS
// une modification du texte. Si des textes ne sont pas en NFC, le script crée une
// copie normalisée <fichier>.nfc.json (après contrôle : aucun caractère ajouté ni
// retiré) et liste chaque mot concerné. C'est cette copie qu'il faut importer.
// Les autres défauts (ex. nasalisation U+07F2 tapée deux fois) sont seulement signalés, jamais corrigés.
//
// Usage :   node scripts/verifier-import.mts <fichier.json>
// Résultat : code 0 = aucune erreur bloquante ; code 1 = erreurs à corriger.
// Les listes autorisées (catégories, types d'encadrés…) sont lues dans le schéma.
// ============================================================================

import { readFileSync, writeFileSync } from 'node:fs';

// Import « dynamique » du schéma : Node sait lire le .ts, et la construction du site n'est pas gênée
const { default: article } = await import(new URL('../sanity/schemas/article.ts', import.meta.url).href);

type Doc = Record<string, unknown> & { _id?: string; _type?: string };
type Bloc = {
  _type?: string; _key?: string; style?: string; intent?: string; titleNko?: string; alt?: string;
  children?: { text?: string; marks?: string[] }[];
  markDefs?: { _key: string; _type?: string; terme?: { _ref?: string } }[];
};

const fichier = process.argv[2];
if (!fichier) {
  console.error('Usage : node scripts/verifier-import.mts <fichier.json>');
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

const termesDuFichier = new Set(docs.filter((d) => d._type === 'terme').map((d) => (d._id || '').replace(/^drafts\./, '')));
const nomsTermes = new Map<string, string>();

for (const d of docs) {
  const id = d._id || '(sans _id)';
  if (!d._id || !d._id.startsWith('drafts.')) erreurs.push(`[${id}] _id doit commencer par « drafts. » : l'IA ne crée QUE des brouillons.`);

  if (d._type === 'terme') {
    for (const c of ['termeNko', 'termeFr', 'definitionNko', 'definitionFr']) if (!d[c]) erreurs.push(`[${id}] terme : « ${c} » obligatoire.`);
    if (d.termeNko && !contientNko(String(d.termeNko))) avertissements.push(`[${id}] termeNko ne contient pas de caractère N'Ko.`);
    if (!slugValide((d.slug as { current?: string })?.current)) erreurs.push(`[${id}] terme : slug.current invalide (a-z, chiffres, tirets).`);
    for (const c of ['termeNko', 'termeFr'] as const) {
      const cle = `${c}:${String(d[c] ?? '').normalize('NFC').toLowerCase().trim()}`;
      if (nomsTermes.has(cle)) avertissements.push(`[${id}] terme en double dans le fichier (${c}) avec ${nomsTermes.get(cle)}.`);
      nomsTermes.set(cle, id);
    }
  } else if (d._type === 'article') {
    if (!d.title) erreurs.push(`[${id}] article : « title » obligatoire.`);
    if (!d.excerpt) erreurs.push(`[${id}] article : « excerpt » (résumé) obligatoire.`);
    else if (String(d.excerpt).length > 200) avertissements.push(`[${id}] résumé de plus de 200 caractères.`);
    if (!d.publishedAt || Number.isNaN(Date.parse(String(d.publishedAt)))) erreurs.push(`[${id}] article : « publishedAt » obligatoire (date ISO).`);
    if (!slugValide((d.slug as { current?: string })?.current)) erreurs.push(`[${id}] article : slug.current invalide (a-z, chiffres, tirets).`);
    if (!d.category || !CATEGORIES.has(String(d.category))) erreurs.push(`[${id}] article : catégorie absente ou non autorisée.`);
    const img = d.mainImage as { asset?: { _ref?: string }; alt?: string } | undefined;
    if (!img?.asset?._ref) erreurs.push(`[${id}] article : image de couverture (mainImage.asset) obligatoire.`);
    if (!img?.alt) erreurs.push(`[${id}] article : texte alternatif de la couverture (mainImage.alt) obligatoire.`);
    if (!Array.isArray(d.authors) || d.authors.length === 0) erreurs.push(`[${id}] article : au moins un auteur (référence) obligatoire.`);

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
          if (!termesDuFichier.has(ref)) avertissements.push(`[${id}] terme « ${ref} » absent du fichier : vérifier qu'il existe (et est publié) dans Sanity.`);
          usages[langue].set(ref, (usages[langue].get(ref) || 0) + 1);
        }
      } else if (b._type === 'callout') {
        if (b.intent && !INTENTIONS.has(b.intent)) erreurs.push(`[${id}] encadré : type « ${b.intent} » non autorisé (${[...INTENTIONS].join(', ')}).`);
      } else if (b._type === 'sectionHeader') {
        if (!b.titleNko) erreurs.push(`[${id}] titre de rubrique : « titleNko » obligatoire.`);
      } else if (b._type === 'image') {
        if (!b.alt) avertissements.push(`[${id}] image du texte sans texte alternatif (alt).`);
      }
    }
    for (const ref of new Set([...usages.nko.keys(), ...usages.fr.keys()])) {
      if (!usages.nko.has(ref)) avertissements.push(`[${id}] terme « ${ref} » relié en français mais pas en N'Ko.`);
      if (!usages.fr.has(ref)) avertissements.push(`[${id}] terme « ${ref} » relié en N'Ko mais pas en français.`);
      for (const l of ['nko', 'fr'] as const) if ((usages[l].get(ref) || 0) > 1) avertissements.push(`[${id}] terme « ${ref} » relié plusieurs fois en ${l === 'nko' ? "N'Ko" : 'français'} (ne relier que la 1re apparition).`);
    }
  } else {
    erreurs.push(`[${id}] type « ${d._type} » non prévu dans un import (seulement « article » et « terme »).`);
  }
}

// --- Rapport ----------------------------------------------------------------
console.log(`Fichier : ${fichier}`);
console.log(`Documents : ${docs.filter((d) => d._type === 'article').length} article(s), ${docs.filter((d) => d._type === 'terme').length} terme(s)`);
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
