/* eslint-disable no-console */ // outil en ligne de commande : son rôle est d'afficher un rapport
// ============================================================================
// N'KO NI LONKO — Contrôle de l'impression des articles (23 octobre 2026)
// ============================================================================
// Google Chrome (sans fenêtre) ouvre chaque article et appuie sur le bouton « Imprimer » de la
// barre d'outils (l'impression elle-même est simulée). Puis, en mode impression, il vérifie :
//   1. aucune image du texte n'est vide au moment d'imprimer ;
//   2. le fond est blanc partout (pas de zone noire : encre gaspillée) ;
//   3. les légendes des images sont foncées (lisibles sur papier) ;
//   4. les paragraphes peuvent se couper (pas de demi-page vide) et les titres restent
//      avec leur texte ;
//   5. la lettrine a sa place au-dessus du premier paragraphe.
// Option --pdf <dossier> : enregistre aussi le PDF A4 de chaque article, pour le relire.
// Lecture seule : rien n'est écrit dans Sanity ni sur le site.
//
// Usage : node scripts/tester-impression.mjs [adresse du site] [--article <slug>] [--pdf <dossier>]
//   (par défaut https://www.nkonilonko.com et tous les articles publiés)
// Résultat : code 0 = tout est juste ; code 1 = au moins un défaut.
// ============================================================================
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find((c) => c && existsSync(c));
if (!CHROME) throw new Error('Chrome ou Edge introuvable (indiquer son chemin dans CHROME_PATH).');

const args = process.argv.slice(2);
const option = (nom) => { const i = args.indexOf(nom); return i >= 0 ? args[i + 1] : undefined; };
const valeursOptions = new Set(['--article', '--pdf'].map(option));
const site = (args.find((a) => !a.startsWith('--') && !valeursOptions.has(a)) || 'https://www.nkonilonko.com').replace(/[/]$/, '');
const dossierPdf = option('--pdf');
if (dossierPdf) mkdirSync(dossierPdf, { recursive: true });

// Articles publiés (API publique de Sanity, lecture seule), ou un seul avec --article
const REQUETE = '*[_type == "article" && !(_id in path("drafts.**"))] | order(publishedAt desc).slug.current';
const slugs = option('--article')
  ? [option('--article')]
  : ((await (await fetch(`https://yfsyhc2p.apicdn.sanity.io/v2025-02-19/data/query/production?query=${encodeURIComponent(REQUETE)}`)).json()).result);

const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const PORT = 9400 + Math.floor(Math.random() * 400);
const profil = mkdtempSync(join(tmpdir(), 'tester-impression-'));
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profil}`, 'about:blank'], { stdio: 'ignore' });
let defauts = 0;
try {
  let cibles;
  for (let i = 0; i < 60 && !cibles; i++) { await pause(250); try { cibles = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json(); } catch { /* démarrage */ } }
  if (!cibles) throw new Error('Chrome ne répond pas');
  const ws = new WebSocket(cibles.find((c) => c.type === 'page').webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r, { once: true }));
  let id = 0;
  const attente = new Map();
  ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && attente.has(m.id)) { attente.get(m.id)(m); attente.delete(m.id); } });
  const envoyer = (method, params = {}) => new Promise((r) => { const n = ++id; attente.set(n, r); ws.send(JSON.stringify({ id: n, method, params })); });
  const evaluer = async (expression) => (await envoyer('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result.result?.value;
  await envoyer('Page.enable');
  // Ordinateur : c'est là que le bouton « Imprimer » existe
  await envoyer('Emulation.setDeviceMetricsOverride', { width: 1366, height: 900, deviceScaleFactor: 1, mobile: false });

  for (const slug of slugs) {
    await envoyer('Emulation.setEmulatedMedia', { media: 'screen' });
    await envoyer('Page.navigate', { url: `${site}/article/${slug}` });
    await pause(2500);
    await evaluer(`new Promise((ok) => { if (document.readyState === 'complete') ok(); else addEventListener('load', () => ok(), { once: true }); })`);

    // 1. Bouton « Imprimer » : window.print est remplacé, on compte les images vides à cet instant
    const imagesVides = await evaluer(`(async () => {
      window.__imagesVides = null;
      window.print = () => { window.__imagesVides = [...document.querySelectorAll('.article-content img')].filter((i) => !(i.complete && i.naturalWidth > 0)).length; };
      const bouton = document.querySelector('aside button .ph-printer')?.closest('button');
      if (!bouton) return -1;
      bouton.click();
      for (let k = 0; k < 120 && window.__imagesVides === null; k++) await new Promise((r) => setTimeout(r, 100));
      return window.__imagesVides ?? -2;
    })()`);

    // 2 à 5 : en mode impression
    await envoyer('Emulation.setEmulatedMedia', { media: 'print' });
    await pause(300);
    const r = await evaluer(`(() => {
      const couleur = (c) => { const m = c.match(/rgba?[(]([^)]+)[)]/); if (!m) return null; const [r, g, b, a = 1] = m[1].split(',').map(Number); return { moyenne: (r + g + b) / 3, a }; };
      const sombre = (c) => { const x = couleur(c); return !!x && x.a > 0.3 && x.moyenne < 128; };
      const nom = (el) => (el.tagName.toLowerCase() + '.' + String(el.className).trim().split(/\\s+/).slice(0, 2).join('.')).slice(0, 50);
      const fond = [document.documentElement, document.body].filter((el) => sombre(getComputedStyle(el).backgroundColor)).map(nom);
      const blocsSombres = [...document.querySelectorAll('body *')].filter((el) => {
        const s = getComputedStyle(el); if (s.display === 'none' || s.visibility === 'hidden') return false;
        const q = el.getBoundingClientRect(); return q.width * q.height > 20000 && sombre(s.backgroundColor);
      }).map(nom);
      const legendes = [...document.querySelectorAll('.article-content figcaption p')].filter((p) => { const x = couleur(getComputedStyle(p).color); return !x || x.moyenne > 140; }).length;
      const paragraphesBloques = [...document.querySelectorAll('.article-content .apparition')].filter((d) => d.querySelector(':scope > p, :scope > ul, :scope > ol') && getComputedStyle(d).breakInside === 'avoid').length;
      const titresSeuls = [...document.querySelectorAll('.article-content .apparition')].filter((d) => d.querySelector(':scope > :is(h2, h3, h4, h5, h6, .titre-rubrique)') && getComputedStyle(d).breakAfter !== 'avoid').length;
      const lettrine = document.querySelector('.article-content .lettrine');
      const lettrineSansPlace = lettrine ? parseFloat(getComputedStyle(lettrine.closest('p')).paddingTop) <= 0 : false;
      return { fond, blocsSombres: blocsSombres.slice(0, 3), legendes, paragraphesBloques, titresSeuls, lettrine: !!lettrine, lettrineSansPlace };
    })()`);

    const problemes = [];
    if (imagesVides === -1) problemes.push('bouton « Imprimer » introuvable');
    else if (imagesVides === -2) problemes.push('le bouton « Imprimer » n\'a pas lancé l\'impression');
    else if (imagesVides > 0) problemes.push(`${imagesVides} image(s) vide(s) au moment d'imprimer`);
    if (r.fond.length) problemes.push(`fond sombre : ${r.fond.join(', ')}`);
    if (r.blocsSombres.length) problemes.push(`zone(s) noire(s) : ${r.blocsSombres.join(' ; ')}`);
    if (r.legendes) problemes.push(`${r.legendes} légende(s) trop claire(s) pour le papier`);
    if (r.paragraphesBloques) problemes.push(`${r.paragraphesBloques} paragraphe(s) interdit(s) de coupure`);
    if (r.titresSeuls) problemes.push(`${r.titresSeuls} titre(s) pouvant rester seul(s) en bas de page`);
    if (r.lettrineSansPlace) problemes.push('lettrine sans place au-dessus du paragraphe');

    let pages = '';
    if (dossierPdf) {
      const pdf = await envoyer('Page.printToPDF', { paperWidth: 8.27, paperHeight: 11.69, printBackground: true, preferCSSPageSize: true });
      const octets = Buffer.from(pdf.result.data, 'base64');
      writeFileSync(join(dossierPdf, `${slug}.pdf`), octets);
      pages = ` · ${(octets.toString('latin1').match(/[/]Type\s*[/]Page[^s]/g) || []).length} pages`;
    }
    if (problemes.length) defauts++;
    console.log(`${problemes.length ? '❌' : '✅'} ${slug.slice(0, 48).padEnd(48)}${pages}${r.lettrine ? '' : ' · (pas de lettrine)'}${problemes.length ? `\n      ${problemes.join('\n      ')}` : ''}`);
  }
  ws.close();
} finally {
  chrome.kill();
  await pause(600);
  try { rmSync(profil, { recursive: true, force: true }); } catch { /* verrou de Chrome */ }
}
console.log(defauts ? `\n${defauts} article(s) avec un défaut d'impression.` : `\nImpression juste pour les ${slugs.length} article(s).${dossierPdf ? ` PDF dans ${dossierPdf}` : ''}`);
process.exitCode = defauts ? 1 : 0;
