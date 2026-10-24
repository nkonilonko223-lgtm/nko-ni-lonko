/* eslint-disable no-console */ // outil en ligne de commande : son rôle est d'afficher un rapport
// ============================================================================
// N'KO NI LONKO — Test de la séparation « titre N'Ko (titre français) »
// ============================================================================
// Lit les titres des articles PUBLIÉS (API publique de Sanity, lecture seule)
// et, en option, ceux de fichiers d'import (ex. les brouillons du N°003).
// Vérifie pour chaque titre que la séparation ne modifie jamais le texte :
// si elle coupe, « N'Ko + ( + français + ) » redonne exactement le titre.
//
// Usage : node scripts/tester-titres.mts [fichier-import.json …]
// Résultat : code 0 = tout est juste ; code 1 = au moins un titre mal traité.
// ============================================================================

import { readFileSync } from 'node:fs';

const { separerTitre, texteAlternatif } = await import(new URL('../app/components/numero/titre.ts', import.meta.url).href);

const REQUETE = '*[_type == "article" && !(_id in path("drafts.**"))] | order(publishedAt asc) { "slug": slug.current, title }';
const url = `https://yfsyhc2p.apicdn.sanity.io/v2025-02-19/data/query/production?query=${encodeURIComponent(REQUETE)}`;
const publies = ((await (await fetch(url)).json()) as { result: { slug: string; title: string }[] }).result;

const titres: { source: string; titre: string }[] = publies.map((a) => ({ source: `publié · ${a.slug}`, titre: a.title }));
for (const fichier of process.argv.slice(2)) {
  const brut = JSON.parse(readFileSync(fichier, 'utf8'));
  for (const d of (Array.isArray(brut) ? brut : [brut]) as { _id?: string; title?: string }[]) {
    if (d.title) titres.push({ source: `import · ${d._id}`, titre: d.title });
  }
}

let erreurs = 0;
const sansEspaces = (s: string) => s.replace(/\s+/g, '');
for (const { source, titre } of titres) {
  const { nko, fr } = separerTitre(titre) as { nko: string; fr: string | null };
  // Garantie : rien n'est ajouté, retiré ni réécrit (seuls les espaces autour de la coupure peuvent changer)
  const juste = fr === null ? nko === titre : sansEspaces(`${nko}(${fr})`) === sansEspaces(titre);
  if (!juste) erreurs++;
  console.log(`${juste ? '✅' : '❌'} ${source.slice(0, 48).padEnd(48)} ${fr === null ? 'titre entier' : `coupé → français : « ${fr} »`}`);
}
console.log(erreurs ? `\n${erreurs} titre(s) mal traité(s).` : `\n${titres.length} titres : tous justes.`);

// Description d'une image (champ « Texte alternatif (N'Ko) », 24 octobre 2026) : version N'Ko → N'Ko s'il
// existe, sinon français ; version française → français. Une lettre N'Ko (par son code) sert d'exemple.
const LETTRE = String.fromCodePoint(0x07d2);
const cas: [string, unknown, 'nqo' | 'fr', string][] = [
  ['N\'Ko présent, version N\'Ko', { alt: 'Un baobab', altNko: ` ${LETTRE} ` }, 'nqo', LETTRE],
  ['N\'Ko vide, version N\'Ko', { alt: 'Un baobab', altNko: '  ' }, 'nqo', 'Un baobab'],
  ['N\'Ko présent, version française', { alt: 'Un baobab', altNko: LETTRE }, 'fr', 'Un baobab'],
  ['aucune description', { alt: '', altNko: '' }, 'nqo', ''],
  ['pas d\'image', null, 'fr', ''],
];
for (const [nom, image, langue, attendu] of cas) {
  const juste = texteAlternatif(image as { alt?: string; altNko?: string } | null, langue) === attendu;
  if (!juste) erreurs++;
  console.log(`${juste ? '✅' : '❌'} description d'image : ${nom}`);
}
// exitCode plutôt que process.exit() : évite un plantage de Node sous Windows juste après une requête réseau
process.exitCode = erreurs ? 1 : 0;
