/* eslint-disable no-console */ // outil en ligne de commande : son rôle est d'afficher un rapport
// ============================================================================
// N'KO NI LONKO — Contrôle de la lecture hors ligne (public/sw.js), 23 octobre 2026
// ============================================================================
// Google Chrome (sans fenêtre, profil neuf) visite le site comme un lecteur, met un article
// français dans « Ma bibliothèque », puis COUPE LE RÉSEAU (page et service worker) et vérifie :
//   1. le service worker est actif et contrôle la page ;
//   2. l'article français mis en bibliothèque est gardé (/fr/article/…) et s'ouvre sans connexion ;
//   3. les pages « pas de connexion » N'Ko (/offline) et française (/fr/offline) sont gardées à part,
//      et une page jamais lue affiche celle de SA langue ;
//   4. les polices d'icônes sont gardées avec leur version (?v=…) et s'affichent sans connexion.
// Lecture seule : rien n'est écrit dans Sanity ni sur le site (tout reste dans un profil jetable).
//
// Usage : node scripts/tester-hors-ligne.mjs [adresse du site] [--article <slug>]
//   (par défaut http://localhost:3100, le serveur d'essai local : le service worker ne s'installe
//    qu'en production, donc avec « next start », pas « next dev »)
// Résultat : code 0 = tout est juste ; code 1 = au moins un défaut.
// ============================================================================
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
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
const site = (args.find((a) => !a.startsWith('--') && a !== option('--article')) || 'http://localhost:3100').replace(/[/]$/, '');
const REQUETE = '*[_type == "article" && !(_id in path("drafts.**"))] | order(publishedAt desc)[0].slug.current';
const slug = option('--article')
  || (await (await fetch(`https://yfsyhc2p.apicdn.sanity.io/v2025-02-19/data/query/production?query=${encodeURIComponent(REQUETE)}`)).json()).result;
const article = `/fr/article/${slug}`;

const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const PORT = 9400 + Math.floor(Math.random() * 400);
const profil = mkdtempSync(join(tmpdir(), 'tester-hors-ligne-'));
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profil}`, 'about:blank'], { stdio: 'ignore' });
let defauts = 0;
const verifier = (ok, texte, detail = '') => {
  console.log(`${ok ? 'OK    ' : 'DÉFAUT'} ${texte}${detail ? ` — ${detail}` : ''}`);
  if (!ok) defauts++;
};

try {
  // --- Connexion au navigateur entier (pour atteindre aussi le service worker) -----------
  let version;
  for (let i = 0; i < 60 && !version; i++) { await pause(250); try { version = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json(); } catch { /* démarrage */ } }
  if (!version) throw new Error('Chrome ne répond pas');
  const ws = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r, { once: true }));
  let id = 0;
  const attente = new Map();
  const ecouteurs = new Set();
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    if (m.id && attente.has(m.id)) { attente.get(m.id)(m); attente.delete(m.id); } else for (const f of ecouteurs) f(m);
  });
  const envoyer = (method, params = {}, sessionId) => new Promise((r) => {
    const n = ++id; attente.set(n, r); ws.send(JSON.stringify({ id: n, method, params, ...(sessionId ? { sessionId } : {}) }));
  });

  // Le service worker s'arrête quand il n'a rien à faire et redémarre à la demande : le test
  // s'attache à CHAQUE démarrage, pour lui couper le réseau aussi (sinon il irait le chercher)
  let horsLigne = false;
  const sessionsSw = new Set();
  const couper = async (s) => {
    await envoyer('Network.enable', {}, s);
    await envoyer('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 }, s);
  };
  ecouteurs.add(async (m) => {
    if (m.method === 'Target.detachedFromTarget') sessionsSw.delete(m.params.sessionId);
    if (m.method !== 'Target.attachedToTarget' || m.params.targetInfo.type !== 'service_worker') return;
    sessionsSw.add(m.params.sessionId);
    if (horsLigne) await couper(m.params.sessionId);
    await envoyer('Runtime.runIfWaitingForDebugger', {}, m.params.sessionId);
  });
  await envoyer('Target.setAutoAttach', { autoAttach: true, waitForDebuggerOnStart: true, flatten: true, filter: [{ type: 'service_worker', exclude: false }, { exclude: true }] });

  const { result: { targetId } } = await envoyer('Target.createTarget', { url: 'about:blank' });
  const { result: { sessionId: page } } = await envoyer('Target.attachToTarget', { targetId, flatten: true });
  await envoyer('Page.enable', {}, page);

  const evaluer = async (expression) => (await envoyer('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }, page)).result?.result?.value;
  const ouvrir = async (chemin) => {
    const charge = new Promise((r) => {
      const f = (m) => { if (m.sessionId === page && m.method === 'Page.loadEventFired') { ecouteurs.delete(f); r(); } };
      ecouteurs.add(f);
      setTimeout(() => { ecouteurs.delete(f); r(); }, 30000);
    });
    await envoyer('Page.navigate', { url: site + chemin }, page);
    await charge;
    await pause(800);
  };
  // Attend qu'une condition (expression JavaScript) devienne vraie dans la page
  const attendre = async (expression, ms = 20000) => {
    for (let t = 0; t < ms; t += 500) { if (await evaluer(expression)) return true; await pause(500); }
    return false;
  };
  const dansCache = (nom, chemin) => `caches.open(${JSON.stringify(nom)}).then((c) => c.match(location.origin + ${JSON.stringify(chemin)})).then((r) => !!r)`;

  // --- 1. Service worker ------------------------------------------------------------------
  console.log(`Site : ${site} · article : ${article}\n`);
  await ouvrir('/');
  const actif = await attendre('navigator.serviceWorker.ready.then(() => true)');
  await ouvrir(article); // deuxième page : contrôlée par le service worker
  verifier(actif && await attendre('!!navigator.serviceWorker.controller'), 'Service worker actif et contrôlant la page');

  // --- 2. Article français mis dans « Ma bibliothèque » (même message que le signet) -------
  await evaluer(`navigator.serviceWorker.controller.postMessage({ type: "garder", chemin: ${JSON.stringify(article)} })`);
  verifier(await attendre(dansCache('nko-bibliotheque', article)), 'Article français gardé dans « Ma bibliothèque »', article);

  // --- 3. Pages « pas de connexion », à part ------------------------------------------------
  verifier(await attendre(dansCache('nko-secours', '/offline')), 'Page « pas de connexion » N\'Ko gardée à part', '/offline');
  verifier(await attendre(dansCache('nko-secours', '/fr/offline')), 'Page « pas de connexion » française gardée à part', '/fr/offline');

  // --- 4. Polices d'icônes : gardées avec leur version ----------------------------------------
  await attendre(`document.fonts.ready.then(() => caches.open("nko-fichiers")).then((c) => c.keys()).then((k) => k.some((r) => r.url.includes("/icones/")))`);
  const icones = await evaluer(`caches.open("nko-fichiers").then((c) => c.keys()).then((k) => k.map((r) => r.url).filter((u) => u.includes("/icones/")))`) || [];
  verifier(icones.length > 0 && icones.every((u) => /[?&]v=[0-9a-f]+/.test(u)), 'Polices d\'icônes gardées avec leur version (?v=…)', icones.map((u) => u.split('/icones/')[1]).join(', ') || 'aucune');

  // --- Coupure du réseau : la page ET le service worker (aussi à chacun de ses redémarrages) ---
  horsLigne = true;
  for (const s of [page, ...sessionsSw]) await couper(s);
  console.log('\n— Réseau coupé (page et service worker) —\n');

  // L'article gardé s'ouvre, en français, avec ses icônes
  await ouvrir(article);
  const etat = await evaluer(`({ lang: document.documentElement.lang, h1: (document.querySelector("h1")?.textContent || "").trim().slice(0, 60), horsLigne: document.body.innerText.includes("Aucune connexion internet") })`);
  verifier(etat?.lang === 'fr' && !!etat.h1 && !etat.horsLigne, 'Sans connexion : l\'article français s\'ouvre', etat ? `lang=${etat.lang}, titre « ${etat.h1} »` : 'page vide');
  const policesIcones = await evaluer(`document.fonts.ready.then(() => [...document.fonts].filter((f) => /Phosphor/.test(f.family) && f.status === "loaded").length)`);
  verifier(policesIcones > 0, 'Sans connexion : les icônes s\'affichent', `${policesIcones || 0} police(s) d'icônes chargée(s)`);

  // Une page jamais lue : la page « pas de connexion » de SA langue
  await ouvrir('/fr/numeros/page-jamais-lue');
  const fr = await evaluer(`({ lang: document.documentElement.lang, texte: document.body.innerText.includes("Aucune connexion internet") })`);
  verifier(fr?.lang === 'fr' && fr.texte, 'Sans connexion, page jamais lue en français : page « pas de connexion » française', fr ? `lang=${fr.lang}` : 'page vide');
  await ouvrir('/numeros/page-jamais-lue');
  const nko = await evaluer(`({ lang: document.documentElement.lang })`);
  verifier(nko?.lang === 'nqo', 'Sans connexion, page jamais lue en N\'Ko : page « pas de connexion » N\'Ko', nko ? `lang=${nko.lang}` : 'page vide');

  ws.close();
} finally {
  chrome.kill();
  await pause(500);
  try { rmSync(profil, { recursive: true, force: true }); } catch { /* Chrome garde parfois le dossier quelques instants */ }
}

console.log(defauts ? `\n${defauts} défaut(s).` : '\nTout est juste.');
process.exit(defauts ? 1 : 0);
