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
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { gunzipSync } from 'node:zlib';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const MODELE = 2; // à augmenter si l'apparence change : toutes les images reçoivent une nouvelle adresse
const PROJET = resolve(import.meta.dirname, '../..');
const DOSSIER = join(PROJET, 'public/og/articles');
const LISTE = join(PROJET, 'app/lib/images-partage-articles.json');
const SAUT = String.fromCharCode(10);
const exiger = createRequire(join(PROJET, 'package.json'));
const sharp = exiger('sharp');
const CHROME = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find((c) => c && existsSync(c));
if (!CHROME) throw new Error('Chrome ou Edge introuvable (indiquer son chemin dans CHROME_PATH).');

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
const importer = (fichier) => import(pathToFileURL(join(PROJET, fichier)).href);
const { separerTitre } = await importer('app/components/numero/titre.ts');
const { numeroNko, numeroFr } = await importer('app/components/numero/textes.ts');
const { createImageUrlBuilder } = await import(pathToFileURL(exiger.resolve('@sanity/image-url')).href);
const images = createImageUrlBuilder({ projectId: 'yfsyhc2p', dataset: 'production' });
const messages = { nko: exiger('./app/messages/nko.json'), fr: exiger('./app/messages/fr.json') };
// Catégorie N'Ko (Sanity) → clé du dictionnaire : même table que les cartes (ArticleCard.tsx)
const carte = readFileSync(join(PROJET, 'app/components/ArticleCard.tsx'), 'utf8');
const debutTable = carte.indexOf('CATEGORY_REVERSE_MAP');
const TABLE = Object.fromEntries([...carte.slice(debutTable, carte.indexOf('};', debutTable)).matchAll(/'([^']+)':[ ]*'([^']+)'/g)].map((m) => [m[1], m[2]]));
if (Object.keys(TABLE).length < 5) throw new Error('Table des catégories illisible dans ArticleCard.tsx');
const page = readFileSync(join(PROJET, 'app/page.tsx'), 'utf8');
const nomNko = page.slice(page.indexOf('openGraph:')).split(SAUT).find((l) => l.trim().startsWith('title: "')).split('"')[1].split(' | ')[0];

// --- Articles : API publique (publiés) ou sauvegarde (brouillons compris) -------------
// Sauvegarde « tar » : blocs de 512 octets (nom à l'octet 0, taille en octal à l'octet 124, type à
// l'octet 156), même lecture que scripts/verifier-import.mts. Aucune dépendance.
function lireSauvegarde(chemin) {
  const tar = gunzipSync(readFileSync(chemin));
  const texte = (b) => { const fin = b.indexOf(0); return b.subarray(0, fin < 0 ? b.length : fin).toString('utf8'); };
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
      return donnees.toString('utf8').split(SAUT).filter((l) => l.trim()).map((l) => JSON.parse(l));
    }
    pos += 512 + Math.ceil(taille / 512) * 512;
  }
  throw new Error('data.ndjson introuvable dans la sauvegarde');
}

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
  const derniers = new Map();
  for (const d of lireSauvegarde(chemin)) {
    const id = d._id.replace(/^drafts[.]/, '');
    if (!derniers.has(id) || d._id.startsWith('drafts.')) derniers.set(id, d);
  }
  const numeros = [...derniers.values()].filter((d) => d._type === 'numero');
  return [...derniers.entries()].filter(([, d]) => d._type === 'article' && d.slug?.current).map(([id, d]) => {
    // Dans une sauvegarde, l'image est notée « image@file://./images/<id>-<taille>.<ext> »
    const fichier = d.mainImage?._sanityAsset?.split('/images/')[1];
    const mainImage = fichier ? { ...d.mainImage, asset: { _ref: 'image-' + fichier.replace('.', '-') } } : d.mainImage;
    const numero = numeros.find((n) => (n.sommaire || []).some((r) => r._ref === id))?.numero;
    return { title: d.title, slug: d.slug.current, category: d.category, mainImage, numero };
  });
}

// --- Modèle (HTML) ---------------------------------------------------------------------
const f = (p) => pathToFileURL(join(PROJET, 'public', p)).href;
const echapper = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const pastille = (nko, fr) =>
  `<div class="pastille">${nko ? `<span class="nko" dir="rtl" lang="nqo">${echapper(nko)}</span><span class="sep"></span>` : ''}${fr ? `<span class="fr" lang="fr">${echapper(fr.toUpperCase())}</span>` : ''}</div>`;

const modele = ({ titre, numero, categorie, couverture }) => `<!doctype html><html lang="nqo"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&display=block" rel="stylesheet">
<style>
@font-face{font-family:Kigelia;src:url(${f('fonts/Kigelia.otf')});font-weight:400}
@font-face{font-family:Kigelia;src:url(${f('fonts/Kigelia1.otf')});font-weight:700}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1200px;height:630px;overflow:hidden;background:#02040a}
.abs{position:absolute;inset:0}
.fond{background:url(couverture.jpg) center/cover}
.motif{background:url(${f('arriere-plan.webp')}) center/240px repeat;opacity:.16}
.halo{background:radial-gradient(ellipse 70% 60% at 50% 30%,rgba(251,191,36,.16) 0%,transparent 60%)}
.voile{background:linear-gradient(180deg,rgba(2,4,10,.25) 0%,rgba(2,4,10,.40) 28%,rgba(2,4,10,.88) 60%,rgba(2,4,10,.97) 100%)}
.cadre{position:absolute;inset:22px;border:1px solid rgba(251,191,36,.25);border-radius:6px}
.bas{position:absolute;left:70px;right:70px;bottom:50px;display:flex;flex-direction:column;align-items:center;text-align:center}
.nko{font-family:Kigelia;direction:rtl}
.fr{font-family:Montserrat}
.pastilles{display:flex;gap:14px;margin-bottom:22px}
.pastille{display:flex;align-items:center;gap:12px;padding:6px 20px;border:1px solid rgba(251,191,36,.55);border-radius:999px;background:rgba(2,4,10,.6)}
.pastille .nko{font-weight:700;font-size:24px;color:#fbbf24;line-height:1.35}
.pastille .fr{font-weight:700;font-size:14px;letter-spacing:.24em;color:#fbbf24;padding-left:.24em}
.pastille .sep{width:1px;height:20px;background:rgba(251,191,36,.5)}
#titre{font-weight:700;font-size:60px;line-height:1.45;color:#fff;text-shadow:0 2px 24px rgba(0,0,0,.7);max-height:174px;overflow:hidden}
#titrefr{font-weight:600;font-size:26px;line-height:1.3;color:#fbbf24;margin-top:8px;max-height:68px;overflow:hidden}
.filet{width:110px;height:2px;background:linear-gradient(90deg,transparent,#fbbf24,transparent);margin:20px 0 14px}
.marque{display:flex;align-items:center;gap:14px}
.marque img{width:76px;height:76px;margin:-20px -12px -20px -16px;mix-blend-mode:screen}
.marque .nko{font-weight:700;font-size:25px;color:#fff;line-height:1.2}
.marque .point{color:rgba(251,191,36,.7);font-size:22px}
.marque .fr{font-weight:600;font-size:16px;letter-spacing:.18em;color:rgba(251,191,36,.9)}
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

// Modèle 2 « photo d'abord » : la couverture (déjà recadrée en 1200×630), un dégradé discret en bas
// avec la signature (à droite, N'Ko d'abord) et le numéro et la catégorie (à gauche).
// bandeau = false : la couverture porte déjà son titre et sa signature (case « servir telle quelle »).
const modelePhoto = ({ numero, categorie, bandeau }) => `<!doctype html><html lang="nqo"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&display=block" rel="stylesheet">
<style>
@font-face{font-family:Kigelia;src:url(${f('fonts/Kigelia1.otf')});font-weight:700}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1200px;height:630px;overflow:hidden;background:#02040a}
.abs{position:absolute;inset:0}
.fond{background:url(couverture.jpg) center/cover}
.voile{background:linear-gradient(180deg,rgba(2,4,10,0) 0%,rgba(2,4,10,0) 64%,rgba(2,4,10,.55) 82%,rgba(2,4,10,.9) 100%)}
.bas{position:absolute;left:40px;right:40px;bottom:28px;display:flex;align-items:center;justify-content:space-between;direction:rtl}
.nko{font-family:Kigelia;direction:rtl}
.fr{font-family:Montserrat}
.marque{display:flex;align-items:center;gap:12px}
.marque img{width:64px;height:64px;margin:-16px -10px -16px -12px;mix-blend-mode:screen}
.marque .nko{font-weight:700;font-size:26px;color:#fff;line-height:1.2;text-shadow:0 1px 10px rgba(0,0,0,.6)}
.marque .point{color:rgba(251,191,36,.8);font-size:20px}
.marque .fr{font-weight:600;font-size:15px;letter-spacing:.18em;color:rgba(251,191,36,.95)}
.pastilles{display:flex;gap:10px;direction:ltr}
.pastille{display:flex;align-items:center;gap:10px;padding:5px 16px;border:1px solid rgba(251,191,36,.55);border-radius:999px;background:rgba(2,4,10,.65)}
.pastille .nko{font-weight:700;font-size:21px;color:#fbbf24;line-height:1.35}
.pastille .fr{font-weight:700;font-size:12px;letter-spacing:.22em;color:#fbbf24;padding-left:.22em}
.pastille .sep{width:1px;height:18px;background:rgba(251,191,36,.5)}
</style></head><body>
<div class="abs fond"></div>
${bandeau ? `<div class="abs voile"></div>
<div class="bas">
  <div class="marque"><img src="${f('icon-512x512.png')}"><span class="nko" dir="rtl" lang="nqo">${nomNko}</span><span class="point">·</span><span class="fr" lang="fr">NKONILONKO.COM</span></div>
  <div class="pastilles">${pastille(categorie.nko, categorie.fr)}${numero ? pastille(numeroNko(numero), numeroFr(numero)) : ''}</div>
</div>` : ''}
</body></html>`;

// Image de l'ordinateur (--image) recadrée en 1200×630, centrée sur le point d'intérêt comme le fait
// le service d'images de Sanity (sans point : le centre)
async function cadrerImageLocale(fichier, [px, py] = [0.5, 0.5]) {
  const { width, height } = await sharp(fichier).metadata();
  const echelle = Math.max(1200 / width, 630 / height);
  const l = Math.round(width * echelle), h = Math.round(height * echelle);
  const borne = (v, max) => Math.min(Math.max(Math.round(v), 0), max);
  return sharp(fichier).resize(l, h).extract({ left: borne(px * l - 600, l - 1200), top: borne(py * h - 315, h - 630), width: 1200, height: 630 })
    .jpeg({ quality: 92 }).toBuffer();
}

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
    if (imageLocale) {
      writeFileSync(join(travail, 'couverture.jpg'), await cadrerImageLocale(resolve(imageLocale), point));
    } else if (adresse) {
      const r = await fetch(adresse);
      if (!r.ok) throw new Error(`${a.slug} : couverture introuvable (${r.status})`);
      writeFileSync(join(travail, 'couverture.jpg'), Buffer.from(await r.arrayBuffer()));
    }
    const telleQuelle = forcerTelleQuelle || a.mainImage?.telleQuelle === true; // case cochée dans le Studio
    const empreinte = createHash('sha256').update(JSON.stringify([MODELE, a.title, a.category, a.numero ?? null, adresse, telleQuelle])).digest('hex').slice(0, 8);
    const nom = `${a.slug}-${empreinte}.jpg`;
    const html = adresse
      ? modelePhoto({ numero: a.numero, categorie, bandeau: !telleQuelle })
      : modele({ titre, numero: a.numero, categorie, couverture: false });
    writeFileSync(join(travail, 'page.html'), html, 'utf8');
    const png = join(travail, 'page.png');
    execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
      '--window-size=1200,630', '--virtual-time-budget=10000', '--allow-file-access-from-files',
      `--screenshot=${png}`, pathToFileURL(join(travail, 'page.html')).href], { stdio: 'ignore', timeout: 60000 });
    const image = readFileSync(png); // lecture en mémoire : évite les chemins Windows trop longs
    const { width, height } = await sharp(image).metadata();
    if (width !== 1200 || height !== 630) throw new Error(`${a.slug} : taille ${width}×${height} au lieu de 1200×630`);
    // Moins de 300 Ko (exigence de WhatsApp) : la qualité baisse par paliers si la photo est très détaillée
    let jpg;
    for (const qualite of [86, 80, 74, 68, 62]) {
      jpg = await sharp(image).jpeg({ quality: qualite, mozjpeg: true, chromaSubsampling: qualite >= 80 ? '4:4:4' : '4:2:0' }).toBuffer();
      if (jpg.length <= 290 * 1024) break;
    }
    if (jpg.length > 300 * 1024) throw new Error(`${a.slug} : ${Math.round(jpg.length / 1024)} Ko (WhatsApp exige moins de 300 Ko)`);
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
