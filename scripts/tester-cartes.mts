/* eslint-disable no-console */ // outil en ligne de commande : son rôle est d'afficher un rapport
// ============================================================================
// N'KO NI LONKO — Test de la séparation N'Ko / français des cartes de partage
// ============================================================================
// Vérifie separerLangues (app/components/numero/titre.ts) :
// 1. sur des cas fabriqués (les « mots N'Ko » sont des suites de lettres sans sens,
//    construites par leur code : aucun texte N'Ko n'est écrit ici) ;
// 2. sur les titres et résumés des articles PUBLIÉS (API publique de Sanity, lecture seule)
//    et, en option, sur ceux de fichiers d'import (ex. les brouillons du N°003).
// Garanties contrôlées : chaque partie est un morceau EXACT du texte d'origine (rien
// n'est réécrit), toutes les lettres N'Ko sont gardées, et la partie française n'en a aucune.
//
// Usage : node scripts/tester-cartes.mts [fichier-import.json …]
// Résultat : code 0 = tout est juste ; code 1 = au moins un texte mal traité.
// ============================================================================

import { readFileSync } from 'node:fs';

type Parties = { nko: string | null; fr: string | null };
const { separerLangues } = (await import(new URL('../app/components/numero/titre.ts', import.meta.url).href)) as {
  separerLangues: (texte?: string | null) => Parties;
};

const estNko = (c: string) => { const n = c.codePointAt(0) ?? 0; return n >= 0x07c0 && n <= 0x07ff; };
const lettresNko = (t: string | null) => [...(t ?? '')].filter(estNko).join('');
// Faux mots N'Ko : une lettre répétée (pas de vrai texte)
const A = String.fromCodePoint(0x07ca).repeat(3);
const B = String.fromCodePoint(0x07cb).repeat(4);

let erreurs = 0;
let avertissements = 0;
const verifier = (source: string, texte: string, attendu?: Parties) => {
  const r = separerLangues(texte);
  const problemes: string[] = [];
  if (attendu && (r.nko !== attendu.nko || r.fr !== attendu.fr)) problemes.push(`attendu ${JSON.stringify(attendu)}`);
  // Chaque morceau (séparé par « | » ajouté entre groupes) existe tel quel dans le texte d'origine
  for (const partie of [r.nko, r.fr]) for (const m of (partie ?? '').split(' | ')) if (m && !texte.includes(m)) problemes.push(`morceau réécrit : « ${m.slice(0, 30)} »`);
  if (lettresNko(r.nko) !== lettresNko(texte)) problemes.push('lettres N\'Ko perdues');
  if (lettresNko(r.fr)) problemes.push('du N\'Ko dans la partie française');
  if (problemes.length) erreurs++;
  // Avertissement (pas une erreur) : des lettres latines restent dans la partie N'Ko
  // (ex. un nom scientifique cité dans une phrase N'Ko) ; la carte mélangera encore un peu
  const latinDansNko = /[A-Za-zÀ-ÿ]/.test(r.nko ?? '');
  if (latinDansNko) avertissements++;
  const resume = `N'Ko : ${r.nko ? `${[...lettresNko(r.nko)].length} lettres` : '—'} · français : ${r.fr ? `« ${r.fr.slice(0, 40)} »` : '—'}`;
  console.log(`${problemes.length ? '❌' : latinDansNko ? '⚠️ ' : '✅'} ${source.slice(0, 40).padEnd(40)} ${resume}${problemes.length ? `  ← ${problemes.join(' ; ')}` : ''}${latinDansNko ? '  ← lettres latines dans la partie N\'Ko' : ''}`);
};

console.log('— Cas fabriqués');
verifier('parenthèse finale', `${A} ${B} (Le géant à crête du Niger)`, { nko: `${A} ${B}`, fr: 'Le géant à crête du Niger' });
verifier('barre', `${A} | N'Ko ni Lonko`, { nko: A, fr: "N'Ko ni Lonko" });
verifier('barre et tiret', `${A} | À Propos — ${B}`, { nko: `${A} | ${B}`, fr: 'À Propos' });
verifier('fin de phrase', `${A} ${B}. Science et Savoir pour tous.`, { nko: `${A} ${B}.`, fr: 'Science et Savoir pour tous.' });
verifier('numéro', `${A}° · N°003 — Le Soleil`, { nko: `${A}°`, fr: 'N°003 — Le Soleil' });
verifier('français seul (tiret et phrases)', "Contactez l'équipe — plateforme bilingue. Email : contact@nkonilonko.com.", { nko: null, fr: "Contactez l'équipe — plateforme bilingue. Email : contact@nkonilonko.com." });
verifier('français seul avec parenthèse', 'Bienvenue (édition spéciale)', { nko: null, fr: 'Bienvenue (édition spéciale)' });
verifier('N\'Ko seul', `${A} ${B}`, { nko: `${A} ${B}`, fr: null });
verifier('vide', '', { nko: null, fr: null });
verifier('parenthèse au début', `(Bienvenue sur N'Ko ni Lonko) ${A} ${B}`, { nko: `${A} ${B}`, fr: "Bienvenue sur N'Ko ni Lonko" });
verifier('parenthèse au début, sans N\'Ko après', '(Note) Texte français', { nko: null, fr: '(Note) Texte français' });

console.log('\n— Titres et résumés des articles publiés (Sanity, lecture seule)');
const REQUETE = '*[_type == "article" && !(_id in path("drafts.**"))] | order(publishedAt asc) { "slug": slug.current, title, excerpt }';
const url = `https://yfsyhc2p.apicdn.sanity.io/v2025-02-19/data/query/production?query=${encodeURIComponent(REQUETE)}`;
const publies = ((await (await fetch(url)).json()) as { result: { slug: string; title?: string; excerpt?: string }[] }).result;
const textes: { source: string; texte: string }[] = [];
for (const a of publies) {
  if (a.title) textes.push({ source: `titre · ${a.slug}`, texte: a.title });
  if (a.excerpt) textes.push({ source: `résumé · ${a.slug}`, texte: a.excerpt });
}
for (const fichier of process.argv.slice(2)) {
  const brut = JSON.parse(readFileSync(fichier, 'utf8'));
  for (const d of (Array.isArray(brut) ? brut : [brut]) as { _id?: string; title?: string; excerpt?: string }[]) {
    if (d.title) textes.push({ source: `import titre · ${d._id}`, texte: d.title });
    if (d.excerpt) textes.push({ source: `import résumé · ${d._id}`, texte: d.excerpt });
  }
}
for (const { source, texte } of textes) verifier(source, texte);

console.log(erreurs ? `\n${erreurs} texte(s) mal traité(s).` : '\nTous les textes sont justes.');
if (avertissements) console.log(`${avertissements} avertissement(s) : partie N'Ko contenant des lettres latines.`);
// exitCode plutôt que process.exit() : évite un plantage de Node sous Windows juste après une requête réseau
process.exitCode = erreurs ? 1 : 0;
