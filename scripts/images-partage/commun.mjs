// ============================================================================
// N'KO NI LONKO — Outils communs des images de partage (articles et numéros)
// ============================================================================
// Rendu par Google Chrome (lettres N'Ko liées), jamais par next/og. Utilisé par
// scripts/images-partage/articles.mjs et scripts/images-partage/numeros.mjs.
// N'Ko JAMAIS retapé : nom du site lu dans app/[lang]/page.tsx, numéro fabriqué par numeroNko
// (règle de la rédaction). Rien n'est écrit dans Sanity.
// ============================================================================
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { gunzipSync } from 'node:zlib';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const PROJET = resolve(import.meta.dirname, '../..');
export const SAUT = String.fromCharCode(10);
export const exiger = createRequire(join(PROJET, 'package.json'));
export const sharp = exiger('sharp');
const CHROME = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find((c) => c && existsSync(c));
if (!CHROME) throw new Error('Chrome ou Edge introuvable (indiquer son chemin dans CHROME_PATH).');

// --- Textes et outils du site (jamais recopiés à la main) ------------------------------
export const importer = (fichier) => import(pathToFileURL(join(PROJET, fichier)).href);
export const { numeroNko, numeroFr } = await importer('app/components/numero/textes.ts');
const { createImageUrlBuilder } = await import(pathToFileURL(exiger.resolve('@sanity/image-url')).href);
export const images = createImageUrlBuilder({ projectId: 'yfsyhc2p', dataset: 'production' });
const page = readFileSync(join(PROJET, 'app/[lang]/page.tsx'), 'utf8');
export const nomNko = page.slice(page.indexOf('openGraph:')).split(SAUT).find((l) => l.trim().startsWith('title: "')).split('"')[1].split(' | ')[0];

// --- Sauvegarde Sanity (.tar.gz) --------------------------------------------------------
// Sauvegarde « tar » : blocs de 512 octets (nom à l'octet 0, taille en octal à l'octet 124, type à
// l'octet 156), même lecture que scripts/verifier-import.mts. Aucune dépendance.
export function lireSauvegarde(chemin) {
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

// Une version par document : le brouillon l'emporte (c'est lui qui sera publié)
export function versionsAJour(docs) {
  const derniers = new Map();
  for (const d of docs) {
    const id = d._id.replace(/^drafts[.]/, '');
    if (!derniers.has(id) || d._id.startsWith('drafts.')) derniers.set(id, d);
  }
  return derniers;
}

// Dans une sauvegarde, l'image est notée « image@file://./images/<id>-<taille>.<ext> »
export function imageDeLaSauvegarde(image) {
  const fichier = image?._sanityAsset?.split('/images/')[1];
  return fichier ? { ...image, asset: { _ref: 'image-' + fichier.replace('.', '-') } } : image;
}

// --- Modèle « photo d'abord » ------------------------------------------------------------
export const f = (p) => pathToFileURL(join(PROJET, 'public', p)).href;
export const echapper = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
export const pastille = (nko, fr) =>
  `<div class="pastille">${nko ? `<span class="nko" dir="rtl" lang="nqo">${echapper(nko)}</span><span class="sep"></span>` : ''}${fr ? `<span class="fr" lang="fr">${echapper(fr.toUpperCase())}</span>` : ''}</div>`;

// Modèle 2 « photo d'abord » : la couverture (déjà recadrée en 1200×630), un dégradé discret en bas
// avec la signature (à droite, N'Ko d'abord) et le numéro et la catégorie (à gauche).
// bandeau = false : la couverture porte déjà son titre et sa signature (case « servir telle quelle »).
// fin = true (image d'un numéro) : dégradé plus bas, signature et numéro groupés à droite, le bas
// gauche reste libre (sur la couverture du N°003, la mère et l'enfant sont en bas à gauche).
export const modelePhoto = ({ numero, categorie, bandeau, fin = false }) => `<!doctype html><html lang="nqo"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&display=block" rel="stylesheet">
<style>
@font-face{font-family:Kigelia;src:url(${f('fonts/Kigelia1.otf')});font-weight:700}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1200px;height:630px;overflow:hidden;background:#0e1322}
.abs{position:absolute;inset:0}
.fond{background:url(couverture.jpg) center/cover}
.voile{background:${fin
  ? 'linear-gradient(180deg,rgba(14,19,34,0) 0%,rgba(14,19,34,0) 78%,rgba(14,19,34,.5) 90%,rgba(14,19,34,.85) 100%)'
  : 'linear-gradient(180deg,rgba(14,19,34,0) 0%,rgba(14,19,34,0) 64%,rgba(14,19,34,.55) 82%,rgba(14,19,34,.9) 100%)'}}
.bas{position:absolute;left:40px;right:40px;bottom:${fin ? '22px' : '28px'};display:flex;align-items:center;justify-content:${fin ? 'flex-start;gap:16px' : 'space-between'};direction:rtl}
.nko{font-family:Kigelia;direction:rtl}
.fr{font-family:Montserrat}
.marque{display:flex;align-items:center;gap:12px}
.marque img{width:64px;height:64px;margin:-16px -10px -16px -12px;mix-blend-mode:screen}
.marque .nko{font-weight:700;font-size:26px;color:#ebe5d8;line-height:1.2;text-shadow:0 1px 10px rgba(0,0,0,.6)}
.marque .point{color:rgba(242,181,68,.8);font-size:20px}
.marque .fr{font-weight:600;font-size:15px;letter-spacing:.18em;color:rgba(242,181,68,.95)}
.pastilles{display:flex;gap:10px;direction:ltr}
.pastille{display:flex;align-items:center;gap:10px;padding:5px 16px;border:1px solid rgba(242,181,68,.55);border-radius:999px;background:rgba(14,19,34,.65)}
.pastille .nko{font-weight:700;font-size:21px;color:#f2b544;line-height:1.35}
.pastille .fr{font-weight:700;font-size:12px;letter-spacing:.22em;color:#f2b544;padding-left:.22em}
.pastille .sep{width:1px;height:18px;background:rgba(242,181,68,.5)}
</style></head><body>
<div class="abs fond"></div>
${bandeau ? `<div class="abs voile"></div>
<div class="bas">
  <div class="marque"><img src="${f('icon-512x512.png')}"><span class="nko" dir="rtl" lang="nqo">${nomNko}</span><span class="point">·</span><span class="fr" lang="fr">NKONILONKO.COM</span></div>
  <div class="pastilles">${categorie ? pastille(categorie.nko, categorie.fr) : ''}${numero ? pastille(numeroNko(numero), numeroFr(numero)) : ''}</div>
</div>` : ''}
</body></html>`;

// Image de l'ordinateur (--image) recadrée en 1200×630, centrée sur le point d'intérêt comme le fait
// le service d'images de Sanity (sans point : le centre)
export async function cadrerImageLocale(fichier, [px, py] = [0.5, 0.5]) {
  const { width, height } = await sharp(fichier).metadata();
  const echelle = Math.max(1200 / width, 630 / height);
  const l = Math.round(width * echelle), h = Math.round(height * echelle);
  const borne = (v, max) => Math.min(Math.max(Math.round(v), 0), max);
  return sharp(fichier).resize(l, h).extract({ left: borne(px * l - 600, l - 1200), top: borne(py * h - 315, h - 630), width: 1200, height: 630 })
    .jpeg({ quality: 92 }).toBuffer();
}

// Couverture prête dans le dossier de travail : image de l'ordinateur (essai) ou adresse Sanity
export async function preparerCouverture({ travail, imageLocale, point, adresse, nom }) {
  if (imageLocale) {
    writeFileSync(join(travail, 'couverture.jpg'), await cadrerImageLocale(resolve(imageLocale), point));
  } else if (adresse) {
    const r = await fetch(adresse);
    if (!r.ok) throw new Error(`${nom} : couverture introuvable (${r.status})`);
    writeFileSync(join(travail, 'couverture.jpg'), Buffer.from(await r.arrayBuffer()));
  }
}

// Page HTML → image JPEG 1200×630 de moins de 300 Ko (exigence de WhatsApp)
export async function rendreEnJpeg(html, travail, nom) {
  writeFileSync(join(travail, 'page.html'), html, 'utf8');
  const png = join(travail, 'page.png');
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    '--window-size=1200,630', '--virtual-time-budget=10000', '--allow-file-access-from-files',
    `--screenshot=${png}`, pathToFileURL(join(travail, 'page.html')).href], { stdio: 'ignore', timeout: 60000 });
  const image = readFileSync(png); // lecture en mémoire : évite les chemins Windows trop longs
  const { width, height } = await sharp(image).metadata();
  if (width !== 1200 || height !== 630) throw new Error(`${nom} : taille ${width}×${height} au lieu de 1200×630`);
  // La qualité baisse par paliers si la photo est très détaillée
  let jpg;
  for (const qualite of [86, 80, 74, 68, 62]) {
    jpg = await sharp(image).jpeg({ quality: qualite, mozjpeg: true, chromaSubsampling: qualite >= 80 ? '4:4:4' : '4:2:0' }).toBuffer();
    if (jpg.length <= 290 * 1024) break;
  }
  if (jpg.length > 300 * 1024) throw new Error(`${nom} : ${Math.round(jpg.length / 1024)} Ko (WhatsApp exige moins de 300 Ko)`);
  return jpg;
}
