/* eslint-disable no-console */ // outil en ligne de commande : son rôle est d'afficher un rapport
// ============================================================================
// N'KO NI LONKO — Image de partage d'un NUMÉRO (WhatsApp, Facebook, X…)
// ============================================================================
// 1200×630 : la couverture du numéro (sans texte), cadrée sur son point d'intérêt, et un bandeau FIN
// groupé à droite : nom N'Ko de la revue, NKONILONKO.COM et le numéro (règle numeroNko). Comme les
// grands magazines, l'image partagée porte toujours la marque (X n'affiche que l'image d'un lien).
// Le bas gauche reste libre (N°003 : la mère et l'enfant y sont). Le bandeau n'existe QUE sur
// l'image de partage : la couverture affichée sur le site reste sans texte.
// Sans couverture : aucune image fabriquée (la page garde l'image de partage de l'accueil).
// Rien n'est écrit dans Sanity. Même modèle que les articles (scripts/images-partage/commun.mjs).
//
// Usage (depuis la racine du projet ; connexion Internet : couverture et police Montserrat) :
//   node scripts/images-partage/numeros.mjs                    numéros PUBLIÉS (API publique)
//   node scripts/images-partage/numeros.mjs --export <sauvegarde.tar.gz>   brouillons compris
//   Options : --numero <n> (seulement ce numéro)
//             --essai <dossier> (image écrite dans ce dossier seulement, le site n'est pas touché)
//             --image <fichier> [--point x,y] (avec --essai et --numero : une image de l'ordinateur à la
//             place de la couverture, cadrée sur le point x,y entre 0 et 1 ; pour voir AVANT l'import)
// Résultat : public/og/numeros/<slug>-<empreinte>.jpg et la liste app/lib/images-partage-numeros.json
// (lue par la page du numéro). L'empreinte change avec la couverture ou le modèle : les réseaux
// sociaux voient une nouvelle adresse et reprennent l'image.
// ============================================================================
import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { PROJET, SAUT, images, lireSauvegarde, versionsAJour, imageDeLaSauvegarde, modelePhoto, preparerCouverture, rendreEnJpeg } from './commun.mjs';

const MODELE = 2; // 2 : palette « Nuit du Mandé » (24 octobre 2026) ; à augmenter si l'apparence change : les images reçoivent une nouvelle adresse
const DOSSIER = join(PROJET, 'public/og/numeros');
const LISTE = join(PROJET, 'app/lib/images-partage-numeros.json');

// --- Options ------------------------------------------------------------------------
const args = process.argv.slice(2);
const option = (nom) => { const i = args.indexOf(nom); return i >= 0 ? args[i + 1] : undefined; };
const cheminExport = option('--export');
const essai = option('--essai');
const seul = option('--numero') ? Number(option('--numero')) : undefined;
const imageLocale = option('--image');
const point = option('--point')?.split(',').map(Number);
if (imageLocale && (!essai || !seul)) throw new Error('--image exige --essai <dossier> et --numero <n>');
if (point && (point.length !== 2 || point.some((v) => !(v >= 0 && v <= 1)))) throw new Error('--point attend x,y entre 0 et 1 (ex. 0.17,0.45)');

// --- Numéros : API publique (publiés) ou sauvegarde (brouillons compris) --------------
async function numerosPublies() {
  const requete = `*[_type == "numero" && defined(slug.current) && !(_id in path("drafts.**"))]{ numero, "slug": slug.current, couverture }`;
  const r = await fetch(`https://yfsyhc2p.apicdn.sanity.io/v2024-01-01/data/query/production?query=${encodeURIComponent(requete)}`);
  if (!r.ok) throw new Error(`API Sanity : ${r.status}`);
  return (await r.json()).result;
}

function numerosDeLaSauvegarde(chemin) {
  return [...versionsAJour(lireSauvegarde(chemin)).values()]
    .filter((d) => d._type === 'numero')
    .map((d) => ({ numero: d.numero, slug: d.slug?.current, couverture: imageDeLaSauvegarde(d.couverture) }));
}

// --- Fabrication ------------------------------------------------------------------------
const numeros = (cheminExport ? numerosDeLaSauvegarde(cheminExport) : await numerosPublies())
  .filter((n) => typeof n.numero === 'number' && (!seul || n.numero === seul))
  .map((n) => ({ ...n, slug: n.slug || String(n.numero).padStart(3, '0') }));
if (!numeros.length) throw new Error('Aucun numéro trouvé');
const sortie = essai ? resolve(essai) : DOSSIER;
mkdirSync(sortie, { recursive: true });
const liste = existsSync(LISTE) ? JSON.parse(readFileSync(LISTE, 'utf8')) : {};
const travail = mkdtempSync(join(tmpdir(), 'og-numeros-'));
try {
  for (const n of numeros) {
    // Couverture recadrée selon le cadrage choisi dans Sanity (zone et point d'intérêt),
    // ou image de l'ordinateur (--image, essai avant l'import)
    const adresse = imageLocale
      ? `local:${resolve(imageLocale)}:${point?.join(',') || 'centre'}`
      : n.couverture?.asset?._ref ? images.image(n.couverture).width(1200).height(630).fit('crop').format('jpg').quality(85).url() : '';
    if (!adresse) {
      console.log(`– N°${n.numero} : pas de couverture, pas d'image (la page garde l'image de partage de l'accueil)`);
      continue;
    }
    await preparerCouverture({ travail, imageLocale, point, adresse, nom: `N°${n.numero}` });
    const empreinte = createHash('sha256').update(JSON.stringify([MODELE, n.numero, adresse])).digest('hex').slice(0, 8);
    const nom = `${n.slug}-${empreinte}.jpg`;
    const jpg = await rendreEnJpeg(modelePhoto({ numero: n.numero, bandeau: true, fin: true }), travail, `N°${n.numero}`);
    writeFileSync(join(sortie, nom), jpg);
    rmSync(join(travail, 'couverture.jpg'), { force: true });
    if (!essai) {
      // Les anciennes images du même numéro sont retirées ; la liste pointe vers la nouvelle
      for (const ancien of readdirSync(DOSSIER)) if (ancien !== nom && new RegExp(`^${n.slug}-[0-9a-f]{8}[.]jpg$`).test(ancien)) rmSync(join(DOSSIER, ancien));
      liste[n.slug] = nom;
    }
    console.log(`✓ ${nom} · ${Math.round(jpg.length / 1024)} Ko · N°${n.numero}`);
  }
  if (!essai) {
    const triee = Object.fromEntries(Object.keys(liste).sort().map((k) => [k, liste[k]]));
    writeFileSync(LISTE, JSON.stringify(triee, null, 2) + SAUT);
    console.log(`Liste à jour : app/lib/images-partage-numeros.json (${Object.keys(triee).length} numéro(s))`);
  }
} finally {
  rmSync(travail, { recursive: true, force: true });
}
