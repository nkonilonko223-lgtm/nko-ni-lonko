/* eslint-disable no-console */ // outil en ligne de commande : son rôle est d'afficher un rapport
// ============================================================================
// N'KO NI LONKO — Test du correcteur N'Ko du Studio (sanity/correcteur-nko.ts)
// ============================================================================
// 1. Cas d'essai fabriqués par leurs numéros Unicode (aucun texte N'Ko écrit ici).
// 2. En option, mesure sur une sauvegarde : combien d'alertes chaque article recevrait
//    (des nombres seulement ; rien n'est écrit, rien n'est envoyé).
//
// Usage : node scripts/tester-correcteur.mts [--export <sauvegarde.tar.gz>]
// Résultat : code 0 = tous les cas d'essai sont justes ; code 1 = au moins un cas faux.
// ============================================================================

import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';

const { motsNko, marquesDoublees, construireVocabulaire, ecritsAutrement, textesDe } = await import(
  new URL('../sanity/correcteur-nko.ts', import.meta.url).href
);

const c = (...codes: number[]) => String.fromCodePoint(...codes);
const KA = 0x07de, A = 0x07ca, MA = 0x07e1, HAUT = 0x07eb, BAS = 0x07ec, NASAL = 0x07f2;

const cas: { nom: string; obtenu: unknown; attendu: unknown }[] = [
  { nom: 'deux mots, chiffres et ponctuation ignorés', obtenu: motsNko(`${c(KA, A)} ${c(0x07c1, 0x07c2)}${c(0x07f8)} ${c(MA, A, BAS)}`).length, attendu: 2 },
  { nom: 'un ton : rien à signaler', obtenu: marquesDoublees(c(KA, A, BAS)).length, attendu: 0 },
  { nom: 'ton + nasalisation : rien à signaler', obtenu: marquesDoublees(c(KA, A, BAS, NASAL)).length, attendu: 0 },
  { nom: 'même ton deux fois : signalé', obtenu: marquesDoublees(c(KA, A, BAS, BAS)).length, attendu: 1 },
  { nom: 'deux tons sur une lettre : signalé', obtenu: marquesDoublees(c(KA, A, HAUT, BAS)).length, attendu: 1 },
  { nom: 'nasalisation deux fois : signalé', obtenu: marquesDoublees(c(KA, A, NASAL, NASAL)).length, attendu: 1 },
  { nom: 'tons sur deux lettres différentes : rien à signaler', obtenu: marquesDoublees(c(KA, A, BAS, MA, A, HAUT)).length, attendu: 0 },
];

const vocabulaire = construireVocabulaire([c(KA, A, BAS, MA, A, HAUT)]);
cas.push(
  { nom: 'mot connu tel quel : rien', obtenu: ecritsAutrement(c(KA, A, BAS, MA, A, HAUT), vocabulaire).length, attendu: 0 },
  { nom: 'marque intérieure oubliée : signalé', obtenu: ecritsAutrement(c(KA, A, MA, A, HAUT), vocabulaire).length, attendu: 1 },
  { nom: 'seule la marque de fin change : rien', obtenu: ecritsAutrement(c(KA, A, BAS, MA, A, BAS), vocabulaire).length, attendu: 0 },
  { nom: 'mot nouveau (lettres inconnues) : rien', obtenu: ecritsAutrement(c(MA, A, KA, A), vocabulaire).length, attendu: 0 },
  { nom: 'forme connue proposée', obtenu: ecritsAutrement(c(KA, A, MA, A, HAUT), vocabulaire)[0]?.ailleurs[0], attendu: c(KA, A, BAS, MA, A, HAUT) },
  { nom: 'textes d\'un document sans clés techniques', obtenu: textesDe({ _id: 'x', title: 'a', body: [{ _type: 'block', children: [{ text: 'b' }] }], slug: { current: 'c' } }).join(','), attendu: 'a,b' },
);

let faux = 0;
for (const { nom, obtenu, attendu } of cas) {
  const juste = obtenu === attendu;
  if (!juste) faux++;
  console.log(`${juste ? '✓' : '✗'} ${nom}${juste ? '' : ` (obtenu ${String(obtenu)}, attendu ${String(attendu)})`}`);
}
console.log(`\n${cas.length - faux}/${cas.length} cas justes`);

// Fichier data.ndjson d'une sauvegarde .tar.gz (même lecture que scripts/verifier-import.mts :
// blocs de 512 octets, nom à l'octet 0, taille en octal à l'octet 124, type à l'octet 156)
function lireDocuments(chemin: string): Record<string, unknown>[] {
  const tar = gunzipSync(readFileSync(chemin));
  const texte = (b: Buffer) => { const fin = b.indexOf(0); return b.subarray(0, fin < 0 ? b.length : fin).toString('utf8'); };
  let pos = 0;
  let nomLong = '';
  while (pos + 512 <= tar.length) {
    const entete = tar.subarray(pos, pos + 512);
    if (entete.every((o) => o === 0)) break;
    const nom = nomLong || texte(entete.subarray(0, 100));
    const taille = parseInt(texte(entete.subarray(124, 136)).trim() || '0', 8);
    const type = String.fromCharCode(entete[156]);
    const donnees = tar.subarray(pos + 512, pos + 512 + taille);
    nomLong = '';
    if (type === 'x' || type === 'L') {
      const contenu = texte(donnees);
      nomLong = type === 'L' ? contenu : (contenu.split(String.fromCharCode(10)).find((l) => l.includes(' path=')) || '').split(' path=')[1] || '';
    } else if (nom.endsWith('data.ndjson')) {
      return donnees.toString('utf8').split(String.fromCharCode(10)).filter((l) => l.trim()).map((l) => JSON.parse(l));
    }
    pos += 512 + Math.ceil(taille / 512) * 512;
  }
  throw new Error('data.ndjson introuvable dans la sauvegarde');
}

// Mesure facultative sur une sauvegarde (lecture seule)
const i = process.argv.indexOf('--export');
if (i > 0 && process.argv[i + 1]) {
  const docs = lireDocuments(process.argv[i + 1]) as ({ _id: string; _type: string } & Record<string, unknown>)[];
  const publies = docs.filter((d) => !d._id.startsWith('drafts.') && !d._id.startsWith('versions.'));
  const termes = publies.filter((d) => d._type === 'terme');
  const textesDoc = (d: Record<string, unknown>) => Object.entries(d).filter(([k]) => !k.startsWith('_')).flatMap(([, v]) => textesDe(v)).join('\n');
  console.log('\nMesure sur la sauvegarde (nombre d\'alertes par article) :');
  for (const a of docs.filter((d) => d._type === 'article')) {
    const id = String(a._id).replace(/^drafts\./, '');
    const autres = publies.filter((d) => d._type === 'article' && d._id !== id);
    const vocab = construireVocabulaire([...autres, ...termes].map(textesDoc));
    const texte = textesDoc(a);
    console.log(`  ${String(a._id).slice(0, 38).padEnd(38)} marques doublées : ${marquesDoublees(texte).length} · écrits autrement : ${ecritsAutrement(texte, vocab).length}`);
  }
}

process.exit(faux ? 1 : 0);
