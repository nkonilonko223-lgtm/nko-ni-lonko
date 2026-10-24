/* eslint-disable no-console */ // outil en ligne de commande : son rôle est d'afficher un rapport
// ============================================================================
// N'KO NI LONKO — Images de partage des ARTICLES (WhatsApp, Facebook, X…)
// ============================================================================
// Une image 1200×630 par article. Modèle 2 (21 octobre 2026), « photo d'abord » comme les grands
// journaux : la couverture seule, cadrée sur le point d'intérêt du Studio, et en bas un dégradé
// discret avec le numéro, la catégorie et la signature. Le titre n'est PAS écrit sur la photo :
// WhatsApp et Facebook l'affichent dessous (X n'affiche que l'image : le nom N'Ko de la revue reste
// donc dans le bandeau). Une couverture qui porte déjà son titre et la signature (case « servir telle
// quelle » cochée dans le Studio) sert telle quelle, sans bandeau. Sans couverture : modèle « titre » (fond au
// motif du site, numéro, catégorie, titre N'Ko et titre français). Rendu par Google
// Chrome (lettres N'Ko liées), comme scripts/images-partage/generer.mjs. Rien n'est écrit dans Sanity.
// N'Ko JAMAIS retapé : titres et catégories lus dans les données (titre coupé par separerTitre),
// numéro fabriqué par numeroNko (règle de la rédaction), libellés des catégories lus dans
// app/messages/*.json, nom du site lu dans app/page.tsx. Tout est vérifié en NFC.
//
// Usage (depuis la racine du projet ; connexion Internet : couvertures et police Montserrat) :
//   node scripts/images-partage/articles.mjs
//        articles PUBLIÉS (API publique de Sanity, lecture seule)
//   node scripts/images-partage/articles.mjs --export <sauvegarde.tar.gz>
//        sauvegarde Sanity, brouillons compris (le brouillon l'emporte) : pour préparer les images
//        d'un numéro avant sa publication
//   Options : --slug <slug> (seulement cet article ; répétable)
//             --essai <dossier> (images écrites dans ce dossier seulement, le site n'est pas touché)
//             --image <fichier> [--point x,y] (avec --essai et --slug : une image de l'ordinateur à la
//             place de la couverture, cadrée sur le point x,y entre 0 et 1 ; pour voir le résultat
//             AVANT l'import dans Sanity) ; --telle-quelle : comme si la case était cochée
// Résultat : public/og/articles/<slug>-<empreinte>.jpg et la liste app/lib/images-partage-articles.json
// (lue par la page article). L'empreinte change avec le titre, la catégorie, le numéro, la
// couverture ou le modèle : les réseaux sociaux voient une nouvelle adresse et reprennent l'image.
// ============================================================================
import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import {
  PROJET, SAUT, exiger, importer, images, nomNko, numeroNko, numeroFr, lireSauvegarde, versionsAJour,
  imageDeLaSauvegarde, f, echapper, pastille, modelePhoto, preparerCouverture, rendreEnJpeg,
} from './commun.mjs'; // outils partagés avec scripts/images-partage/numeros.mjs

const MODELE = 3; // 3 : palette « Nuit du Mandé » (24 octobre 2026) ; à augmenter si l'apparence change : toutes les images reçoivent une nouvelle adresse
const DOSSIER = join(PROJET, 'public/og/articles');
const LISTE = join(PROJET, 'app/lib/images-partage-articles.json');

// --- Options ------------------------------------------------------------------------
const args = process.argv.slice(2);
const option = (nom) => { const i = args.indexOf(nom); return i >= 0 ? args[i + 1] : undefined; };
const cheminExport = option('--export');
const essai = option('--essai');
const seulement = args.flatMap((a, i) => (a === '--slug' ? [args[i + 1]] : []));
const imageLocale = option('--image');
const point = option('--point')?.split(',').map(Number);
const forcerTelleQuelle = args.includes('--telle-quelle');
if (forcerTelleQuelle && !essai) throw new Error('--telle-quelle est réservé aux essais (--essai) : sinon, cocher la case dans le Studio');
if (imageLocale && (!essai || seulement.length !== 1)) throw new Error('--image exige --essai <dossier> et un seul --slug');
if (point && (point.length !== 2 || point.some((v) => !(v >= 0 && v <= 1)))) throw new Error('--point attend x,y entre 0 et 1 (ex. 0.17,0.4)');

// --- Textes et outils du site (jamais recopiés à la main) ------------------------------
const { separerTitre } = await importer('app/components/numero/titre.ts');
const messages = { nko: exiger('./app/messages/nko.json'), fr: exiger('./app/messages/fr.json') };
// Catégorie N'Ko (Sanity) → clé du dictionnaire : la table unique du site (app/lib/categories.ts ;
// avant le 23 octobre 2026, elle était lue dans ArticleCard.tsx, où elle n'est plus)
const { CATEGORY_REVERSE_MAP: TABLE } = await importer('app/lib/categories.ts');
if (Object.keys(TABLE).length < 5) throw new Error('Table des catégories illisible dans app/lib/categories.ts');

// --- Articles : API publique (publiés) ou sauvegarde (brouillons compris) -------------
async function articlesPublies() {
  const requete = `*[_type == "article" && defined(slug.current) && !(_id in path("drafts.**"))]{
    title, "slug": slug.current, category, mainImage,
    "numero": *[_type == "numero" && !(_id in path("drafts.**")) && references(^._id)][0].numero
  }`;
  const r = await fetch(`https://yfsyhc2p.apicdn.sanity.io/v2024-01-01/data/query/production?query=${encodeURIComponent(requete)}`);
  if (!r.ok) throw new Error(`API Sanity : ${r.status}`);
  return (await r.json()).result;
}

function articlesDeLaSauvegarde(chemin) {
  // Une version par document : le brouillon l'emporte (c'est lui qui sera publié)
  const derniers = versionsAJour(lireSauvegarde(chemin));
  const numeros = [...derniers.values()].filter((d) => d._type === 'numero');
  return [...derniers.entries()].filter(([, d]) => d._type === 'article' && d.slug?.current).map(([id, d]) => {
    const mainImage = imageDeLaSauvegarde(d.mainImage);
    const numero = numeros.find((n) => (n.sommaire || []).some((r) => r._ref === id))?.numero;
    return { title: d.title, slug: d.slug.current, category: d.category, mainImage, numero };
  });
}

// --- Modèle « titre » (sans couverture) ; le modèle « photo d'abord » est dans commun.mjs ---
const modele =({ titre, numero, categorie, couverture }) => `<!doctype html><html lang="nqo"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&display=block" rel="stylesheet">
<style>
@font-face{font-family:Kigelia;src:url(${f('fonts/Kigelia.otf')});font-weight:400}
@font-face{font-family:Kigelia;src:url(${f('fonts/Kigelia1.otf')});font-weight:700}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1200px;height:630px;overflow:hidden;background:#0e1322}
.abs{position:absolute;inset:0}
.fond{background:url(couverture.jpg) center/cover}
.motif{background:url(${f('arriere-plan.webp')}) center/240px repeat;opacity:.16}
.halo{background:radial-gradient(ellipse 70% 60% at 50% 30%,rgba(242,181,68,.16) 0%,transparent 60%)}
.voile{background:linear-gradient(180deg,rgba(14,19,34,.25) 0%,rgba(14,19,34,.40) 28%,rgba(14,19,34,.88) 60%,rgba(14,19,34,.97) 100%)}
.cadre{position:absolute;inset:22px;border:1px solid rgba(242,181,68,.25);border-radius:6px}
.bas{position:absolute;left:70px;right:70px;bottom:50px;display:flex;flex-direction:column;align-items:center;text-align:center}
.nko{font-family:Kigelia;direction:rtl}
.fr{font-family:Montserrat}
.pastilles{display:flex;gap:14px;margin-bottom:22px}
.pastille{display:flex;align-items:center;gap:12px;padding:6px 20px;border:1px solid rgba(242,181,68,.55);border-radius:999px;background:rgba(14,19,34,.6)}
.pastille .nko{font-weight:700;font-size:24px;color:#f2b544;line-height:1.35}
.pastille .fr{font-weight:700;font-size:14px;letter-spacing:.24em;color:#f2b544;padding-left:.24em}
.pastille .sep{width:1px;height:20px;background:rgba(242,181,68,.5)}
#titre{font-weight:700;font-size:60px;line-height:1.45;color:#ebe5d8;text-shadow:0 2px 24px rgba(0,0,0,.7);max-height:174px;overflow:hidden}
#titrefr{font-weight:600;font-size:26px;line-height:1.3;color:#f2b544;margin-top:8px;max-height:68px;overflow:hidden}
.filet{width:110px;height:2px;background:linear-gradient(90deg,transparent,#f2b544,transparent);margin:20px 0 14px}
.marque{display:flex;align-items:center;gap:14px}
.marque img{width:76px;height:76px;margin:-20px -12px -20px -16px;mix-blend-mode:screen}
.marque .nko{font-weight:700;font-size:25px;color:#ebe5d8;line-height:1.2}
.marque .point{color:rgba(242,181,68,.7);font-size:22px}
.marque .fr{font-weight:600;font-size:16px;letter-spacing:.18em;color:rgba(242,181,68,.9)}
</style></head><body>
${couverture ? '<div class="abs fond"></div>' : '<div class="abs motif"></div><div class="abs halo"></div>'}<div class="abs voile"></div><div class="cadre"></div>
<div class="bas">
  <div class="pastilles">${numero ? pastille(numeroNko(numero), numeroFr(numero)) : ''}${pastille(categorie.nko, categorie.fr)}</div>
  <div id="titre" class="nko" dir="rtl" lang="nqo">${echapper(titre.nko)}</div>
  ${titre.fr ? `<div id="titrefr" class="fr" lang="fr">${echapper(titre.fr)}</div>` : ''}
  <div class="filet"></div>
  <div class="marque"><img src="${f('icon-512x512.png')}"><span class="nko" dir="rtl" lang="nqo">${nomNko}</span><span class="point">·</span><span class="fr" lang="fr">NKONILONKO.COM</span></div>
</div>
<script>
// Titres trop longs : la taille diminue jusqu'à tenir sur deux lignes
document.fonts.ready.then(() => {
  const ajuster = (id, min) => { const e = document.getElementById(id); if (!e) return; let t = parseFloat(getComputedStyle(e).fontSize); while (e.scrollHeight > e.clientHeight + 1 && t > min) { t -= 2; e.style.fontSize = t + 'px'; } };
  ajuster('titre', 36); ajuster('titrefr', 18);
});
</script>
</body></html>`;

// --- Fabrication ------------------------------------------------------------------------
const articles = (cheminExport ? articlesDeLaSauvegarde(cheminExport) : await articlesPublies())
  .filter((a) => a.title && (!seulement.length || seulement.includes(a.slug)));
if (!articles.length) throw new Error('Aucun article trouvé');
const sortie = essai ? resolve(essai) : DOSSIER;
mkdirSync(sortie, { recursive: true });
const liste = existsSync(LISTE) ? JSON.parse(readFileSync(LISTE, 'utf8')) : {};
const travail = mkdtempSync(join(tmpdir(), 'og-articles-'));
try {
  for (const a of articles) {
    const titre = separerTitre(a.title);
    const cle = TABLE[(a.category || '').trim()];
    if (!cle) console.warn(`⚠ ${a.slug} : catégorie inconnue des cartes, affichée telle quelle`);
    const categorie = cle
      ? { nko: messages.nko.home.categories[cle], fr: messages.fr.home.categories[cle] }
      : { nko: (a.category || '').trim(), fr: '' };
    for (const t of [titre.nko, titre.fr, categorie.nko]) {
      if (t && t !== t.normalize('NFC')) throw new Error(`${a.slug} : texte non NFC (à corriger dans Sanity, jamais ici)`);
    }
    // Couverture recadrée selon le cadrage choisi dans Sanity (zone et point d'intérêt),
    // ou image de l'ordinateur (--image, essai avant l'import)
    const adresse = imageLocale
      ? `local:${resolve(imageLocale)}:${point?.join(',') || 'centre'}`
      : a.mainImage?.asset?._ref ? images.image(a.mainImage).width(1200).height(630).fit('crop').format('jpg').quality(85).url() : '';
    await preparerCouverture({ travail, imageLocale, point, adresse, nom: a.slug });
    const telleQuelle = forcerTelleQuelle || a.mainImage?.telleQuelle === true; // case cochée dans le Studio
    const empreinte = createHash('sha256').update(JSON.stringify([MODELE, a.title, a.category, a.numero ?? null, adresse, telleQuelle])).digest('hex').slice(0, 8);
    const nom = `${a.slug}-${empreinte}.jpg`;
    const html = adresse
      ? modelePhoto({ numero: a.numero, categorie, bandeau: !telleQuelle })
      : modele({ titre, numero: a.numero, categorie, couverture: false });
    const jpg = await rendreEnJpeg(html, travail, a.slug);
    writeFileSync(join(sortie, nom), jpg);
    rmSync(join(travail, 'couverture.jpg'), { force: true });
    if (!essai) {
      // Les anciennes images du même article sont retirées ; la liste pointe vers la nouvelle
      for (const ancien of readdirSync(DOSSIER)) if (ancien !== nom && new RegExp(`^${a.slug}-[0-9a-f]{8}[.]jpg$`).test(ancien)) rmSync(join(DOSSIER, ancien));
      liste[a.slug] = nom;
    }
    console.log(`✓ ${nom} · ${Math.round(jpg.length / 1024)} Ko · ${a.numero ? `N°${a.numero}` : 'sans numéro'} · ${cle || 'catégorie brute'} · ${adresse ? 'couverture' : 'fond de secours'}`);
  }
  if (!essai) {
    const triee = Object.fromEntries(Object.keys(liste).sort().map((k) => [k, liste[k]]));
    writeFileSync(LISTE, JSON.stringify(triee, null, 2) + SAUT);
    console.log(`Liste à jour : app/lib/images-partage-articles.json (${Object.keys(triee).length} articles)`);
  }
} finally {
  rmSync(travail, { recursive: true, force: true });
}
