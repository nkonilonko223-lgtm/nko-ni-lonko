/* eslint-disable no-console */ // outil en ligne de commande : son rôle est d'afficher un rapport
// ============================================================================
// N'KO NI LONKO — Export du corpus N'Ko ↔ français (modèle de traduction ByT5, Lot 2)
// ============================================================================
// Fabrique un jeu de données DATÉ et FIGÉ à partir du contenu PUBLIÉ seulement (jamais les
// brouillons, jamais les abonnés). Lecture seule : rien n'est écrit dans Sanity.
// Le corpus est PRIVÉ : il n'est jamais écrit dans le projet (le dépôt GitHub est public).
// Méthode et règles : docs/PLAN-LOT-2.md (« Modèle de traduction ») et docs/DONNEES-CORPUS.md.
//
// Usage (depuis la racine du projet) :
//   node scripts/exporter-corpus.mts --sortie <dossier hors du projet>
//        ex. --sortie "C:/Dev/archives/corpus" → crée corpus-AAAA-MM-JJ/ dans ce dossier
//   Option : --export <sauvegarde.tar.gz> (lire une sauvegarde au lieu de l'API publique ;
//            seuls les documents publiés sont gardés)
//
// Ce qui est apparié (N'Ko ↔ français), toujours copié tel quel :
//   - titres d'articles (« N'Ko (français) », coupés comme sur le site) ;
//   - paragraphes : les textes sont écrits par SECTIONS (plusieurs paragraphes N'Ko, puis les mêmes
//     en français) ; dans chaque section, le paragraphe n est apparié au paragraphe n, les encadrés
//     entre eux ; si les nombres diffèrent, la section entière forme une seule paire ;
//   - légendes d'images, intertitres de rubrique, titres d'encadrés ;
//   - lexique : termes et définitions ; rubriques : titres.
// Contrôles : NFC, doublons retirés, rapport de longueurs, mêmes nombres des deux côtés
// (chiffres N'Ko convertis) ; une paire douteuse est gardée, marquée « a-verifier ».
// Découpage PAR ARTICLE (80 % entraînement, 10 % validation, 10 % test) par empreinte du slug :
// stable d'un export à l'autre, le test reste figé.
// ============================================================================
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import { join, resolve, relative, isAbsolute } from 'node:path';
import { pathToFileURL } from 'node:url';

const PROJET = resolve(import.meta.dirname, '..');
const SAUT = String.fromCharCode(10);

// --- Options ------------------------------------------------------------------------
const args = process.argv.slice(2);
const option = (nom: string) => { const i = args.indexOf(nom); return i >= 0 ? args[i + 1] : undefined; };
const sortieDemandee = option('--sortie');
const cheminExport = option('--export');
if (!sortieDemandee) {
  console.error('Usage : node scripts/exporter-corpus.mts --sortie <dossier hors du projet> [--export <sauvegarde.tar.gz>]');
  process.exit(1);
}
const racine = resolve(sortieDemandee);
const rel = relative(PROJET, racine);
if (!rel || (!rel.startsWith('..') && !isAbsolute(rel))) {
  console.error('Refusé : le corpus est privé, il ne doit pas être écrit dans le projet (dépôt GitHub public).');
  process.exit(1);
}

// --- Types ----------------------------------------------------------------------------
type Enfant = { text?: string };
type Bloc = {
  _type: string; _key?: string; style?: string; listItem?: string; children?: Enfant[];
  text?: string; titleNko?: string; titleFr?: string; captionNko?: string; caption?: string;
};
type Image = { captionNko?: string; caption?: string };
type Doc = {
  _id: string; _type: string; title?: string; slug?: { current?: string } | string; body?: Bloc[]; mainImage?: Image;
  termeNko?: string; termeFr?: string; definitionNko?: string; definitionFr?: string; domaine?: string;
  titleNko?: string; titleFr?: string;
};
type Nature = 'titre' | 'paragraphe' | 'section' | 'encadre' | 'titre-encadre' | 'legende' | 'intertitre' | 'terme' | 'definition' | 'rubrique';
type Paire = { id: string; nqo: string; fr: string; nature: Nature; source: string; partie: string; controle: 'ok' | 'a-verifier'; raisons: string[] };

const { separerTitre } = (await import(pathToFileURL(join(PROJET, 'app/components/numero/titre.ts')).href)) as {
  separerTitre: (t: string) => { nko: string; fr: string | null };
};

// --- Lecture des données (publiées seulement) -------------------------------------------
function lireSauvegarde(chemin: string): Doc[] {
  // Archive « tar » : même lecture que scripts/verifier-import.mts (aucune dépendance)
  const tar = gunzipSync(readFileSync(chemin));
  const texte = (b: Buffer) => { const fin = b.indexOf(0); return b.subarray(0, fin < 0 ? b.length : fin).toString('utf8'); };
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
      const contenu = texte(donnees);
      nomPax = type === 'L' ? contenu : (contenu.split(SAUT).find((l) => l.includes(' path=')) || '').split(' path=')[1] || '';
    } else if (nom.endsWith('data.ndjson')) {
      return donnees.toString('utf8').split(SAUT).filter((l) => l.trim()).map((l) => JSON.parse(l) as Doc);
    }
    pos += 512 + Math.ceil(taille / 512) * 512;
  }
  throw new Error('data.ndjson introuvable dans la sauvegarde');
}

async function lireApi(): Promise<Doc[]> {
  // API publique : sans clé, seuls les documents publiés sont visibles (les abonnés sont privés)
  const requete = `*[_type in ["article", "terme", "rubrique"] && !(_id in path("drafts.**"))]{
    _id, _type, title, slug, body, mainImage, termeNko, termeFr, definitionNko, definitionFr, domaine, titleNko, titleFr
  }`;
  const r = await fetch(`https://yfsyhc2p.apicdn.sanity.io/v2024-01-01/data/query/production?query=${encodeURIComponent(requete)}`);
  if (!r.ok) throw new Error(`API Sanity : ${r.status}`);
  return ((await r.json()) as { result: Doc[] }).result;
}

const tous = cheminExport ? lireSauvegarde(cheminExport) : await lireApi();
const docs = tous.filter((d) => !d._id.startsWith('drafts.') && !d._id.includes('.') && ['article', 'terme', 'rubrique'].includes(d._type));

// --- Outils ---------------------------------------------------------------------------
const estNko = (c: string) => { const n = c.codePointAt(0) ?? 0; return n >= 0x07c0 && n <= 0x07ff; };
const contientNko = (t: string) => [...t].some(estNko);
const propre = (t: string | undefined) => (t || '').replace(/[ ]+/g, ' ').trim();
const texteBloc = (b: Bloc) => propre((b.children || []).map((c) => c.text || '').join(''));
const slugDe = (d: Doc) => (typeof d.slug === 'string' ? d.slug : d.slug?.current) || d._id;
// Nombres présents (chiffres N'Ko U+07C0–U+07C9 convertis en chiffres latins ; « 8 800 » = « 8800 »)
const ESPACES_MILLIERS = new RegExp('([0-9])[' + String.fromCharCode(0x20, 0xa0, 0x202f) + '](?=[0-9]{3})', 'g');
const nombres = (t: string) => {
  const latin = [...t].map((c) => { const n = c.codePointAt(0) ?? 0; return n >= 0x07c0 && n <= 0x07c9 ? String(n - 0x07c0) : c; }).join('');
  return new Set(latin.replace(ESPACES_MILLIERS, '$1').match(/[0-9]+/g) || []);
};
const partieDe = (cle: string) => {
  const v = parseInt(createHash('sha256').update(cle).digest('hex').slice(0, 8), 16) % 10;
  return v === 0 ? 'test' : v === 1 ? 'validation' : 'entrainement';
};

const paires: Paire[] = [];
const vues = new Set<string>();
const nonNfc: string[] = [];
let doublons = 0;
function ajouter(nqo: string | undefined, fr: string | null | undefined, nature: Nature, source: string, partie: string) {
  const a = propre(nqo), b = propre(fr ?? '');
  if (!a || !b) return;
  if (a !== a.normalize('NFC') || b !== b.normalize('NFC')) { nonNfc.push(`${source} (${nature})`); return; }
  const cle = a + SAUT + b;
  if (vues.has(cle)) { doublons++; return; }
  vues.add(cle);
  const raisons: string[] = [];
  if (!contientNko(a)) raisons.push('côté N\'Ko sans lettre N\'Ko');
  if (contientNko(b)) raisons.push('côté français contenant du N\'Ko');
  const rapport = b.length / a.length;
  if (a.length > 20 && (rapport < 0.5 || rapport > 2.5)) raisons.push(`longueurs très différentes (×${rapport.toFixed(2)})`);
  const na = nombres(a), nb = nombres(b);
  const manquants = [...na].filter((x) => !nb.has(x)).concat([...nb].filter((x) => !na.has(x)));
  if (manquants.length) raisons.push(`nombres différents (${manquants.slice(0, 4).join(', ')})`);
  paires.push({ id: createHash('sha256').update(cle).digest('hex').slice(0, 12), nqo: a, fr: b, nature, source, partie, controle: raisons.length ? 'a-verifier' : 'ok', raisons });
}

// --- Articles -----------------------------------------------------------------------------
const sections = { alignees: 0, entieres: 0, sansTraduction: 0, francaisSeul: 0 };
for (const art of docs.filter((d) => d._type === 'article')) {
  const slug = slugDe(art);
  const partie = partieDe('article:' + slug);
  if (art.title) { const t = separerTitre(art.title); ajouter(t.nko, t.fr, 'titre', slug, partie); }
  ajouter(art.mainImage?.captionNko, art.mainImage?.caption, 'legende', slug, partie);
  // Suites de blocs de texte d'une même langue ; une image ou un intertitre de rubrique coupe la suite
  type Element = { texte: string; encadre: boolean };
  const suites: { nko: boolean; elements: Element[] }[] = [];
  const pousser = (texte: string, encadre: boolean) => {
    if (!texte) return;
    const nko = contientNko(texte);
    const derniere = suites[suites.length - 1];
    if (derniere && derniere.nko === nko) derniere.elements.push({ texte, encadre });
    else suites.push({ nko, elements: [{ texte, encadre }] });
  };
  for (const b of art.body || []) {
    if (b._type === 'block') pousser(texteBloc(b), false);
    else if (b._type === 'callout') { pousser(propre(b.text), true); ajouter(b.titleNko, b.titleFr, 'titre-encadre', slug, partie); }
    else {
      if (b._type === 'image') ajouter(b.captionNko, b.caption, 'legende', slug, partie);
      if (b._type === 'sectionHeader') ajouter(b.titleNko, b.titleFr, 'intertitre', slug, partie);
      suites.push({ nko: false, elements: [] }); // coupure
    }
  }
  // Une suite N'Ko suivie d'une suite française = une section et sa traduction
  for (let i = 0; i < suites.length; i++) {
    const n = suites[i], f = suites[i + 1];
    if (!n.elements.length) continue;
    if (!n.nko) { sections.francaisSeul++; continue; }
    if (!f || f.nko || !f.elements.length) { sections.sansTraduction++; continue; }
    i++;
    const pn = n.elements.filter((e) => !e.encadre), pf = f.elements.filter((e) => !e.encadre);
    const en = n.elements.filter((e) => e.encadre), ef = f.elements.filter((e) => e.encadre);
    if (pn.length === pf.length && en.length === ef.length) {
      sections.alignees++;
      pn.forEach((e, k) => ajouter(e.texte, pf[k].texte, 'paragraphe', slug, partie));
      en.forEach((e, k) => ajouter(e.texte, ef[k].texte, 'encadre', slug, partie));
    } else {
      sections.entieres++;
      ajouter(n.elements.map((e) => e.texte).join(SAUT), f.elements.map((e) => e.texte).join(SAUT), 'section', slug, partie);
    }
  }
}

// --- Lexique et rubriques -------------------------------------------------------------------
const lexique = docs.filter((d) => d._type === 'terme').map((t) => {
  const slug = slugDe(t);
  const partie = partieDe('terme:' + slug);
  ajouter(t.termeNko, t.termeFr, 'terme', 'lexique:' + slug, partie);
  ajouter(t.definitionNko, t.definitionFr, 'definition', 'lexique:' + slug, partie);
  return { slug, termeNko: t.termeNko, termeFr: t.termeFr, definitionNko: t.definitionNko, definitionFr: t.definitionFr, domaine: t.domaine, partie };
});
for (const r of docs.filter((d) => d._type === 'rubrique')) ajouter(r.titleNko, r.titleFr, 'rubrique', 'rubrique:' + slugDe(r), partieDe('rubrique:' + slugDe(r)));

// --- Écriture -------------------------------------------------------------------------------
const date = new Date().toISOString().slice(0, 10);
const dossier = join(racine, `corpus-${date}`);
if (existsSync(dossier)) { console.error(`Refusé : ${dossier} existe déjà (un export daté est figé ; supprimer ou renommer l'ancien d'abord).`); process.exit(1); }
mkdirSync(dossier, { recursive: true });
const jsonl = (lignes: object[]) => lignes.map((l) => JSON.stringify(l)).join(SAUT) + SAUT;
writeFileSync(join(dossier, 'paires.jsonl'), jsonl(paires));
writeFileSync(join(dossier, 'lexique.jsonl'), jsonl(lexique));
const compter = (cle: (p: Paire) => string) => paires.reduce<Record<string, number>>((acc, p) => { acc[cle(p)] = (acc[cle(p)] || 0) + 1; return acc; }, {});
const fiche = {
  date, source: cheminExport ? `sauvegarde ${cheminExport}` : 'API publique Sanity (documents publiés)',
  articles: docs.filter((d) => d._type === 'article').length, termes: lexique.length, rubriques: docs.filter((d) => d._type === 'rubrique').length,
  paires: paires.length, parNature: compter((p) => p.nature), parPartie: compter((p) => p.partie), controle: compter((p) => p.controle),
  sections, doublonsRetires: doublons, nonNfcEcartes: nonNfc,
  octetsNko: paires.reduce((s, p) => s + Buffer.byteLength(p.nqo), 0), octetsFr: paires.reduce((s, p) => s + Buffer.byteLength(p.fr), 0),
  licence: 'Privé — N\'Ko ni Lonko. Interdit de diffusion. Voir docs/DONNEES-CORPUS.md',
};
writeFileSync(join(dossier, 'fiche.json'), JSON.stringify(fiche, null, 2) + SAUT);
console.log(`Corpus écrit dans ${dossier}`);
console.log(JSON.stringify({ ...fiche, nonNfcEcartes: nonNfc.length }, null, 2));
