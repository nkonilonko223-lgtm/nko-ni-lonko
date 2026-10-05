/* eslint-disable no-console */ // outil en ligne de commande : son rôle est d'afficher un rapport
// ============================================================================
// N'KO NI LONKO — Fabrication des images de partage (WhatsApp, Facebook, X…)
// ============================================================================
// Pourquoi : l'outil next/og ne LIE pas les lettres N'Ko. Ici, Google Chrome
// (déjà installé sur l'ordinateur) fait le rendu : le N'Ko est parfait.
// Logo : public/icon-512x512.png (monogramme officiel, fond noir fondu en mode « screen »).
// Le N'Ko est LU dans les fichiers du site (jamais retapé) et vérifié en NFC.
//
// Usage (depuis la racine du projet, connexion Internet pour la police Montserrat) :
//   node scripts/images-partage/generer.mjs
// Résultat : public/og/accueil-v<N>.jpg et public/og/lexique-v<N>.jpg (1200×630, < 300 Ko)
// Après un changement d'image : augmenter VERSION ici ET dans app/lib/partage.ts
// (les réseaux sociaux gardent l'ancienne image en mémoire tant que l'adresse ne change pas).
// ============================================================================
import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const VERSION = 1;
const PROJET = resolve(import.meta.dirname, '../..');
const sharp = createRequire(join(PROJET, 'package.json'))('sharp');
const CHROME = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find((c) => c && existsSync(c));
if (!CHROME) throw new Error('Chrome ou Edge introuvable (indiquer son chemin dans CHROME_PATH).');

// --- Textes, lus dans le site ---------------------------------------------------
const page = readFileSync(join(PROJET, 'app/page.tsx'), 'utf8');
const og = page.slice(page.indexOf('openGraph:'));
const ligne = (cle) => og.split('\n').find((l) => l.trim().startsWith(cle + ': "')).split('"')[1];
const [nomNko, nomFr] = ligne('title').split(' | ');
const accrocheNko = ligne('description').split('. ')[0]; // phrase approuvée par le propriétaire (5 octobre 2026)
const { TEXTES_LEXIQUE } = await import(pathToFileURL(join(PROJET, 'app/components/lexique/textes.ts')).href);
const T = {
  nomNko, nomFr, accrocheNko, accrocheFr: 'Science et savoir pour tous',
  dicoNko: TEXTES_LEXIQUE.dictionnaire.nko, dicoFr: TEXTES_LEXIQUE.dictionnaire.fr,
  lexiqueNko: TEXTES_LEXIQUE.lexique.nko, lexiqueFr: TEXTES_LEXIQUE.lexique.fr,
};
for (const [cle, texte] of Object.entries(T)) {
  if (!texte) throw new Error(`Texte introuvable : ${cle}`);
  if (texte !== texte.normalize('NFC')) throw new Error(`Texte non NFC : ${cle}`);
}

// --- Modèles (HTML) ---------------------------------------------------------------
const f = (p) => pathToFileURL(join(PROJET, 'public', p)).href;
const base = `
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800&display=block" rel="stylesheet">
<style>
@font-face{font-family:Kigelia;src:url(${f('fonts/Kigelia.otf')});font-weight:400}
@font-face{font-family:Kigelia;src:url(${f('fonts/Kigelia1.otf')});font-weight:700}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1200px;height:630px;overflow:hidden;background:#02040a}
.abs{position:absolute;inset:0}
.contenu{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.nko{font-family:Kigelia;direction:rtl}
.fr{font-family:Montserrat}
.cadre{position:absolute;inset:22px;border:1px solid rgba(251,191,36,.22);border-radius:6px}
</style>`;

const modeles = {
  // 1. Accueil et pages générales : le ciel du télescope James Webb (fond de l'accueil du site)
  accueil: `<!doctype html><html lang="nqo"><head><meta charset="utf-8">${base}<style>
.fond{background:url(${f('jams-webb.png')}) center 40%/cover}
.voile{background:radial-gradient(ellipse 58% 72% at 50% 50%,rgba(2,4,10,.90) 0%,rgba(2,4,10,.78) 50%,rgba(2,4,10,.40) 100%)}
.logo{width:184px;height:184px;margin:-40px 0 -22px;mix-blend-mode:screen}
.nom{font-weight:700;font-size:116px;line-height:1.12;color:#fff;text-shadow:0 2px 30px rgba(0,0,0,.6)}
.nomfr{font-weight:700;font-size:24px;letter-spacing:.45em;text-transform:uppercase;color:#fbbf24;margin-top:4px;padding-left:.45em}
.filet{width:110px;height:2px;background:linear-gradient(90deg,transparent,#fbbf24,transparent);margin:30px 0 22px}
.acc{font-size:40px;line-height:1.45;color:#f1f5f9}
.accfr{font-weight:500;font-size:24px;color:#cbd5e1;margin-top:6px;letter-spacing:.02em}
.url{position:absolute;bottom:44px;left:0;right:0;text-align:center;font-weight:600;font-size:19px;letter-spacing:.22em;color:rgba(251,191,36,.9)}
</style></head><body>
<div class="abs fond"></div><div class="abs voile"></div><div class="cadre"></div>
<div class="contenu">
  <img class="logo" src="${f('icon-512x512.png')}">
  <div class="nko nom" dir="rtl" lang="nqo">${T.nomNko}</div>
  <div class="fr nomfr" lang="fr">${T.nomFr}</div>
  <div class="filet"></div>
  <div class="nko acc" dir="rtl" lang="nqo">${T.accrocheNko}</div>
  <div class="fr accfr" lang="fr">${T.accrocheFr}</div>
</div>
<div class="fr url" lang="fr">NKONILONKO.COM</div>
</body></html>`,

  // 2. Dictionnaire : bleu du lexique, motif « symboles africains et molécules » du site, très atténué
  lexique: `<!doctype html><html lang="nqo"><head><meta charset="utf-8">${base}<style>
body{background:#030916}
.motif{background:url(${f('arriere-plan.webp')}) center/240px repeat;filter:grayscale(1) contrast(1.1);opacity:.10}
.voile{background:radial-gradient(ellipse 60% 70% at 50% 48%,rgba(3,9,22,.96) 0%,rgba(3,9,22,.80) 55%,rgba(3,9,22,.35) 100%)}
.halo{background:radial-gradient(circle at 50% 46%,rgba(96,165,250,.16) 0%,transparent 45%)}
.cadre{border-color:rgba(147,197,253,.22)}
.etiquette{display:flex;align-items:center;gap:16px;padding:9px 26px;border:1px solid rgba(251,191,36,.45);border-radius:999px;margin-bottom:34px}
.etiquette .nko{font-size:28px;color:#fbbf24;line-height:1.3}
.etiquette .fr{font-weight:700;font-size:15px;letter-spacing:.32em;color:#fbbf24;padding-left:.32em}
.etiquette .sep{width:1px;height:22px;background:rgba(251,191,36,.45)}
.titre{font-weight:700;font-size:68px;line-height:1.3;color:#e0ecff;white-space:nowrap;text-shadow:0 2px 30px rgba(0,0,0,.6)}
.titrefr{font-weight:600;font-size:30px;color:#93c5fd;margin-top:14px;letter-spacing:.01em}
.filet{width:110px;height:2px;background:linear-gradient(90deg,transparent,#93c5fd,transparent);margin:34px 0 0}
.marque{position:absolute;bottom:42px;left:0;right:0;display:flex;align-items:center;justify-content:center;gap:14px}
.marque img{width:88px;height:88px;margin:-22px -12px -22px -18px;mix-blend-mode:screen}
.marque .nko{font-weight:700;font-size:28px;color:#fff;line-height:1.2}
.marque .point{color:rgba(147,197,253,.6);font-size:22px}
.marque .fr{font-weight:600;font-size:18px;letter-spacing:.16em;color:rgba(251,191,36,.9)}
</style></head><body>
<div class="abs motif"></div><div class="abs voile"></div><div class="abs halo"></div><div class="cadre"></div>
<div class="contenu" style="padding-bottom:40px">
  <div class="etiquette"><span class="nko" dir="rtl" lang="nqo">${T.lexiqueNko}</span><span class="sep"></span><span class="fr" lang="fr">${T.lexiqueFr.toUpperCase()}</span></div>
  <div class="nko titre" dir="rtl" lang="nqo">${T.dicoNko}</div>
  <div class="fr titrefr" lang="fr">${T.dicoFr}</div>
  <div class="filet"></div>
</div>
<div class="marque"><img src="${f('icon-512x512.png')}"><span class="nko" dir="rtl" lang="nqo">${T.nomNko}</span><span class="point">·</span><span class="fr" lang="fr">NKONILONKO.COM/LEXIQUE</span></div>
</body></html>`,
};

// --- Rendu par Chrome, puis compression JPG ---------------------------------------
const travail = mkdtempSync(join(tmpdir(), 'og-'));
mkdirSync(join(PROJET, 'public/og'), { recursive: true });
try {
  for (const [nom, html] of Object.entries(modeles)) {
    const fichierHtml = join(travail, `${nom}.html`);
    const fichierPng = join(travail, `${nom}.png`);
    writeFileSync(fichierHtml, html, 'utf8');
    execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
      '--window-size=1200,630', '--virtual-time-budget=10000', '--allow-file-access-from-files',
      `--screenshot=${fichierPng}`, pathToFileURL(fichierHtml).href], { stdio: 'ignore', timeout: 60000 });
    const png = readFileSync(fichierPng); // lecture en mémoire : évite les chemins Windows trop longs
    const { width, height } = await sharp(png).metadata();
    if (width !== 1200 || height !== 630) throw new Error(`${nom} : taille ${width}×${height} au lieu de 1200×630`);
    const jpg = await sharp(png).jpeg({ quality: 86, mozjpeg: true, chromaSubsampling: '4:4:4' }).toBuffer();
    if (jpg.length > 300 * 1024) throw new Error(`${nom} : ${Math.round(jpg.length / 1024)} Ko (WhatsApp exige moins de 300 Ko)`);
    const sortie = join(PROJET, `public/og/${nom}-v${VERSION}.jpg`);
    writeFileSync(sortie, jpg);
    console.log(`✓ public/og/${nom}-v${VERSION}.jpg · 1200×630 · ${Math.round(jpg.length / 1024)} Ko`);
  }
} finally {
  rmSync(travail, { recursive: true, force: true });
}
