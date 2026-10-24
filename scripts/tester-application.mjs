/* eslint-disable no-console */ // outil en ligne de commande : son rôle est d'afficher un rapport
// ============================================================================
// N'KO NI LONKO — Contrôle de l'application du site (23 octobre 2026)
// ============================================================================
// Google Chrome sans fenêtre ; chaque scénario part d'un profil VIERGE (nouveau lecteur) :
//   A. Manifestes N'Ko et français : sans erreur, installables, bonnes langues, icônes, raccourcis,
//      captures ; écrans de démarrage de l'iPhone et barre d'état noire.
//   B. Proposition d'installer (téléphone Android) : absente au 1er article, présente au 2ᵉ à la
//      moitié de l'article, absente après « Plus tard ».
//   C. iPhone : la proposition ouvre le guide (3 étapes, touche Échap pour fermer) ; le bouton
//      « Installer » du menu de l'accueil aussi.
//   D. « Ma bibliothèque » : l'article gardé l'est AVEC ses images ; la page « pas de connexion »
//      le propose ; « oublier » retire l'article et ses images.
//   E. (avec --telechargement <page>) « Télécharger le numéro » : tout est gardé, puis, réseau
//      coupé (page et service worker), chaque article s'ouvre avec toutes ses images ;
//      « Retirer de l'appareil » efface tout.
// Lecture seule : rien n'est écrit dans Sanity ni sur le site (profils jetables).
//
// Usage : node scripts/tester-application.mjs [adresse] [--telechargement <page>] [--captures <dossier>]
//   adresse : par défaut http://localhost:3100 (serveur d'essai « next start » : le service worker
//   ne s'installe pas avec « next dev ») ; page : ex. /fr/numeros/003 ;
//   --captures : enregistre des images de la proposition et du guide, pour les regarder.
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
const valeurs = new Set(['--telechargement', '--captures'].map(option));
const site = (args.find((a) => !a.startsWith('--') && !valeurs.has(a)) || 'http://localhost:3100').replace(/[/]$/, '');
const pageTelechargement = option('--telechargement');
const dossierCaptures = option('--captures');
if (dossierCaptures) mkdirSync(dossierCaptures, { recursive: true });

// Trois articles publiés avec image (API publique de Sanity, lecture seule)
const REQUETE = '*[_type == "article" && !(_id in path("drafts.**")) && defined(mainImage)] | order(publishedAt desc)[0...3].slug.current';
const slugs = (await (await fetch(`https://yfsyhc2p.apicdn.sanity.io/v2025-02-19/data/query/production?query=${encodeURIComponent(REQUETE)}`)).json()).result;
if (!Array.isArray(slugs) || slugs.length < 3) throw new Error('Il faut au moins 3 articles publiés avec image.');

const pause = (ms) => new Promise((r) => setTimeout(r, ms));
let defauts = 0;
const verifier = (ok, texte, detail = '') => {
  console.log(`${ok ? 'OK    ' : 'DÉFAUT'} ${texte}${detail ? ` — ${detail}` : ''}`);
  if (!ok) defauts++;
};

const PORT = 9400 + Math.floor(Math.random() * 400);
const profil = mkdtempSync(join(tmpdir(), 'tester-application-'));
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profil}`, 'about:blank'], { stdio: 'ignore' });

try {
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

  // Service workers : attachés à chaque démarrage, pour pouvoir leur couper le réseau aussi
  let horsLigne = false;
  const sessionsSw = new Set();
  const reseau = async (s, coupe) => {
    await envoyer('Network.enable', {}, s);
    await envoyer('Network.emulateNetworkConditions', { offline: coupe, latency: 0, downloadThroughput: -1, uploadThroughput: -1 }, s);
  };
  ecouteurs.add(async (m) => {
    if (m.method === 'Target.detachedFromTarget') sessionsSw.delete(m.params.sessionId);
    if (m.method !== 'Target.attachedToTarget' || m.params.targetInfo.type !== 'service_worker') return;
    sessionsSw.add(m.params.sessionId);
    if (horsLigne) await reseau(m.params.sessionId, true);
    await envoyer('Runtime.runIfWaitingForDebugger', {}, m.params.sessionId);
  });
  await envoyer('Target.setAutoAttach', { autoAttach: true, waitForDebuggerOnStart: true, flatten: true, filter: [{ type: 'service_worker', exclude: false }, { exclude: true }] });

  // Nouveau lecteur : onglet de téléphone, avec un site « jamais visité » (stockage, service worker
  // et copies effacés). Pas de profil séparé : ce serait une navigation privée, où Chrome ne
  // propose jamais l'installation.
  const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
  async function lecteur({ iphone = false, langue = 'nko' } = {}) {
    const { result: { targetId } } = await envoyer('Target.createTarget', { url: 'about:blank' });
    const { result: { sessionId: s } } = await envoyer('Target.attachToTarget', { targetId, flatten: true });
    const efface = await envoyer('Storage.clearDataForOrigin', { origin: new URL(site).origin, storageTypes: 'all' }, s);
    if (efface.error) throw new Error(`Effacement des données du site impossible : ${efface.error.message}`);
    await envoyer('Page.enable', {}, s);
    await envoyer('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true }, s);
    await envoyer('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 }, s);
    // Choix de langue déjà fait (pas de fenêtre de choix sur l'accueil)
    let script = `try { localStorage.setItem("preferred-lang", ${JSON.stringify(langue)}); } catch (e) {}`;
    if (iphone) {
      await envoyer('Emulation.setUserAgentOverride', { userAgent: IPHONE, platform: 'iPhone' }, s);
      // Chrome reste Chrome : sa fenêtre d'installation est écartée, comme sur un vrai iPhone
      script += 'window.addEventListener("beforeinstallprompt", (e) => e.stopImmediatePropagation(), true);';
    }
    await envoyer('Page.addScriptToEvaluateOnNewDocument', { source: script }, s);
    const evaluer = async (expression) => (await envoyer('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }, s)).result?.result?.value;
    const ouvrir = async (chemin) => {
      const charge = new Promise((r) => {
        const f = (m) => { if (m.sessionId === s && m.method === 'Page.loadEventFired') { ecouteurs.delete(f); r(); } };
        ecouteurs.add(f);
        setTimeout(() => { ecouteurs.delete(f); r(); }, 30000);
      });
      await envoyer('Page.navigate', { url: site + chemin }, s);
      await charge;
      await pause(1500);
      // Alarme générale : une page qui plante finit sur la page d'erreur de Next.js
      if (await evaluer('document.documentElement.id === "__next_error__"')) verifier(false, `La page plante : ${chemin}`);
    };
    const attendre = async (expression, ms = 20000) => {
      for (let t = 0; t < ms; t += 400) { if (await evaluer(expression)) return true; await pause(400); }
      return false;
    };
    const defiler = async (part) => {
      await evaluer(`window.scrollTo(0, Math.round((document.documentElement.scrollHeight - innerHeight) * ${part}))`);
      await pause(1200);
    };
    const photo = async (nom) => {
      if (!dossierCaptures) return;
      const { result } = await envoyer('Page.captureScreenshot', { format: 'png' }, s);
      writeFileSync(join(dossierCaptures, `${nom}.png`), Buffer.from(result.data, 'base64'));
    };
    const touche = async (key) => {
      for (const type of ['keyDown', 'keyUp']) await envoyer('Input.dispatchKeyEvent', { type, key, code: key, windowsVirtualKeyCode: key === 'Escape' ? 27 : 0 }, s);
    };
    // Images visibles de la page (plus de 100 points de large), après l'avoir parcourue jusqu'en bas
    // (les images « paresseuses » ne se chargent qu'en descendant) : chargées ou non
    const images = async () => {
      for (const part of [0.25, 0.5, 0.75, 1]) await defiler(part);
      await pause(1500);
      return evaluer('[...document.images].filter((i) => i.getBoundingClientRect().width > 100).map((i) => i.complete && i.naturalWidth > 0)');
    };
    // Attend le service worker, puis rouvre la page (qu'il contrôle alors)
    const controler = async (chemin) => {
      await attendre('navigator.serviceWorker.ready.then(() => true)');
      await ouvrir(chemin);
      return attendre('!!navigator.serviceWorker.controller');
    };
    const fermer = () => envoyer('Target.closeTarget', { targetId });
    return { s, evaluer, ouvrir, attendre, defiler, photo, touche, images, controler, fermer };
  }
  const CARTE = '[data-proposition-installation]';
  const article = (i, fr = false) => `${fr ? '/fr' : ''}/article/${slugs[i]}`;

  // --- A. Manifestes et iPhone -----------------------------------------------------------------
  console.log(`Site : ${site}\n\nA. Manifestes`);
  {
    const l = await lecteur();
    for (const [chemin, attendu] of [['/', { id: '/', lang: 'nqo', dir: 'rtl', start_url: '/', fichier: '/manifest.json' }], ['/fr', { id: '/fr', lang: 'fr', dir: 'ltr', start_url: '/fr', fichier: '/manifest-fr.json' }]]) {
      await l.ouvrir(chemin);
      await l.controler(chemin);
      // Chrome lit le manifeste un peu après le chargement : redemandé jusqu'à 10 secondes
      let m = {};
      for (let t = 0; t < 10000 && !m.url; t += 500) {
        m = (await envoyer('Page.getAppManifest', {}, l.s)).result || {};
        if (!m.url) await pause(500);
      }
      const donnees = JSON.parse(m.data || '{}');
      const erreurs = (m.errors || []).map((e) => e.message);
      verifier(m.url.endsWith(attendu.fichier) && erreurs.length === 0, `${chemin} : manifeste ${attendu.fichier} sans erreur`, erreurs.join(' ; '));
      verifier(['id', 'lang', 'dir', 'start_url'].every((k) => donnees[k] === attendu[k]), `${chemin} : identité, langue, sens, ouverture`, `id=${donnees.id} lang=${donnees.lang} start_url=${donnees.start_url}`);
      verifier(!('orientation' in donnees) && donnees.theme_color === '#0e1322', `${chemin} : pas d'orientation imposée, couleur du site`);
      const masquables = (donnees.icons || []).filter((i) => i.purpose === 'maskable').length;
      verifier(masquables === 2 && donnees.shortcuts?.length === 3 && donnees.screenshots?.filter((c) => c.form_factor === 'wide').length >= 1 && donnees.screenshots?.filter((c) => c.form_factor === 'narrow').length >= 1,
        `${chemin} : icônes masquables, raccourcis, captures téléphone et ordinateur`, `${masquables} masquables, ${donnees.shortcuts?.length} raccourcis, ${donnees.screenshots?.length} captures`);
      const images = [...(donnees.icons || []), ...(donnees.screenshots || []), ...(donnees.shortcuts || []).flatMap((r) => r.icons)].map((i) => i.src);
      const absentes = [];
      for (const src of new Set(images)) if (!(await fetch(site + src)).ok) absentes.push(src);
      verifier(absentes.length === 0, `${chemin} : toutes les images du manifeste existent`, absentes.join(', ') || `${new Set(images).size} images`);
      const raccourcis = [];
      for (const r of donnees.shortcuts || []) if (!(await fetch(site + r.url)).ok) raccourcis.push(r.url);
      verifier(raccourcis.length === 0, `${chemin} : chaque raccourci mène à une page`, raccourcis.join(', ') || (donnees.shortcuts || []).map((r) => r.url).join(', '));
      const { result: inst } = await envoyer('Page.getInstallabilityErrors', {}, l.s);
      const bloquants = (inst.installabilityErrors || []).map((e) => e.errorId);
      verifier(bloquants.length === 0, `${chemin} : installable (critères de Chrome)`, bloquants.join(', '));
    }
    const html = await (await fetch(site + '/')).text();
    const demarrage = [...html.matchAll(/<link[^>]+rel="apple-touch-startup-image"[^>]*>/g)].map(([t]) => (t.match(/href="([^"]+)"/) || [])[1]);
    const absents = [];
    for (const href of demarrage) if (!(await fetch(site + href)).ok) absents.push(href);
    verifier(demarrage.length >= 20 && absents.length === 0, 'iPhone / iPad : écrans de démarrage présents', `${demarrage.length} images${absents.length ? `, absentes : ${absents.join(', ')}` : ''}`);
    verifier(/name="apple-mobile-web-app-status-bar-style" content="black"/.test(html), 'iPhone : barre d\'état noire opaque (rien sous l\'heure et la batterie)');
    await l.fermer();
  }

  // --- B. Proposition d'installer (Android) ------------------------------------------------------
  console.log('\nB. Proposition d\'installer (téléphone Android)');
  {
    const l = await lecteur();
    await l.ouvrir(article(0));
    await l.defiler(0.7);
    verifier(!(await l.evaluer(`!!document.querySelector('${CARTE}')`)), '1er article lu : aucune proposition');
    await l.ouvrir(article(1));
    await l.defiler(0.2);
    const tropTot = await l.evaluer(`!!document.querySelector('${CARTE}')`);
    await l.defiler(0.7);
    const montree = await l.attendre(`!!document.querySelector('${CARTE}')`, 5000);
    verifier(!tropTot && montree, '2ᵉ article : proposition à la moitié de la lecture (pas avant)');
    await l.photo('proposition-android');
    const chevauche = await l.evaluer(`(() => {
      const c = document.querySelector('${CARTE}')?.getBoundingClientRect();
      const b = [...document.querySelectorAll('aside button')].map((x) => x.getBoundingClientRect()).filter((r) => r.width && r.bottom > innerHeight - 120);
      return !!c && b.some((r) => r.left < c.right && r.right > c.left && r.top < c.bottom && r.bottom > c.top);
    })()`);
    verifier(montree && !chevauche, 'La proposition ne cache pas la barre d\'outils de l\'article');
    await l.evaluer(`document.querySelector('${CARTE} button').click()`); // « Plus tard »
    await pause(500);
    verifier(!(await l.evaluer(`!!document.querySelector('${CARTE}')`)) && !!(await l.evaluer('localStorage.getItem("nko_installation_plus_tard")')), '« Plus tard » : la proposition disparaît et c\'est retenu');
    await l.ouvrir(article(2));
    await l.defiler(0.7);
    verifier(!(await l.evaluer(`!!document.querySelector('${CARTE}')`)), 'Après « Plus tard » : plus de proposition (2 mois)');
    await l.fermer();
  }

  // --- C. iPhone : le guide --------------------------------------------------------------------
  console.log('\nC. iPhone : guide « Sur l\'écran d\'accueil »');
  {
    const l = await lecteur({ iphone: true, langue: 'fr' });
    await l.ouvrir(article(0, true));
    await l.defiler(0.7);
    await l.ouvrir(article(1, true));
    await l.defiler(0.7);
    const carte = await l.attendre(`!!document.querySelector('${CARTE}')`, 5000);
    verifier(carte, 'iPhone : proposition au 2ᵉ article');
    await l.evaluer(`document.querySelectorAll('${CARTE} button')[1]?.click()`); // « Installer »
    const guide = await l.attendre('!!document.querySelector("dialog[open]")', 5000);
    const etapes = await l.evaluer('document.querySelectorAll("dialog[open] li").length');
    const focus = await l.evaluer('!!document.activeElement?.closest("dialog[open]")');
    verifier(guide && etapes === 3 && focus, '« Installer » ouvre le guide : 3 étapes, le focus est dans la fenêtre', `${etapes} étapes`);
    await l.photo('guide-iphone');
    await l.touche('Escape');
    await pause(500);
    verifier(!(await l.evaluer('!!document.querySelector("dialog[open]")')), 'Touche Échap : le guide se ferme');
    await l.ouvrir('/fr');
    await l.evaluer('document.querySelector(".mobile-toggle")?.click()');
    await pause(1200);
    const bouton = await l.evaluer(`(() => { const b = [...document.querySelectorAll('#mobile-menu button')].find((x) => /Installer/.test(x.textContent)); b?.click(); return !!b; })()`);
    verifier(bouton && await l.attendre('!!document.querySelector("dialog[open]")', 5000), 'Menu de l\'accueil sur iPhone : « Installer l\'application » ouvre le guide');
    await l.fermer();
  }

  // --- D. « Ma bibliothèque » avec images, page « pas de connexion » -----------------------------------
  console.log('\nD. « Ma bibliothèque » : images gardées, page « pas de connexion »');
  {
    const l = await lecteur({ langue: 'fr' });
    const chemin = article(0, true);
    await l.ouvrir(chemin);
    await l.controler(chemin);
    await l.evaluer(`navigator.serviceWorker.controller.postMessage({ type: "garder", chemin: ${JSON.stringify(chemin)}, ecran: { largeur: innerWidth, densite: devicePixelRatio } })`);
    const garde = await l.attendre(`caches.open("nko-bibliotheque").then((c) => c.keys()).then((k) => k.some((r) => r.url.endsWith(${JSON.stringify(chemin)})) && k.some((r) => r.url.includes("/_next/image")))`, 30000);
    const nb = await l.evaluer('caches.open("nko-bibliotheque").then((c) => c.keys()).then((k) => k.filter((r) => r.url.includes("/_next/image")).length)');
    verifier(garde, 'Article gardé dans « Ma bibliothèque » avec ses images', `${nb} image(s)`);
    horsLigne = true;
    for (const s of [l.s, ...sessionsSw]) await reseau(s, true);
    await l.ouvrir('/fr/numeros/page-jamais-lue');
    const liste = await l.attendre(`[...document.querySelectorAll('a')].some((a) => a.getAttribute('href') === ${JSON.stringify(chemin)})`, 8000);
    verifier(liste, 'Sans connexion : la page « pas de connexion » propose l\'article de « Ma bibliothèque »');
    await l.photo('page-hors-ligne');
    await l.ouvrir(chemin);
    const chargees = await l.images();
    verifier(chargees?.length > 0 && chargees.every(Boolean), 'Sans connexion : l\'article s\'ouvre avec toutes ses images', `${chargees?.filter(Boolean).length}/${chargees?.length} images`);
    horsLigne = false;
    for (const s of [l.s, ...sessionsSw]) await reseau(s, false);
    await l.ouvrir(chemin);
    await l.evaluer(`navigator.serviceWorker.controller.postMessage({ type: "oublier", chemin: ${JSON.stringify(chemin)} })`);
    verifier(await l.attendre('caches.open("nko-bibliotheque").then((c) => c.keys()).then((k) => k.length === 0)', 15000), '« Oublier » : l\'article et ses images sont retirés');
    await l.fermer();
  }

  // --- E. « Télécharger le numéro » ------------------------------------------------------------
  if (pageTelechargement) {
    console.log(`\nE. « Télécharger le numéro » (${pageTelechargement})`);
    const l = await lecteur({ langue: pageTelechargement.startsWith('/fr') ? 'fr' : 'nko' });
    await l.ouvrir(pageTelechargement);
    await l.controler(pageTelechargement);
    verifier(await l.attendre('!!document.querySelector("[data-telecharger-numero=absent] button")'), 'Bouton « Télécharger le numéro » présent');
    const debut = Date.now();
    await l.evaluer('document.querySelector("[data-telecharger-numero=absent] button").click()');
    const fini = await l.attendre('!!document.querySelector("[data-telecharger-numero=complet]")', 240000);
    const taille = await l.evaluer('document.querySelector("[data-telecharger-numero=complet]")?.textContent');
    verifier(fini, 'Téléchargement terminé', `${Math.round((Date.now() - debut) / 1000)} s · ${taille?.trim()}`);
    await l.photo('numero-telecharge');
    const nom = await l.evaluer('caches.keys().then((k) => k.find((n) => n.startsWith("nko-numero-")))');
    const pages = await l.evaluer(`caches.open(${JSON.stringify(nom)}).then((c) => c.keys()).then((k) => k.map((r) => new URL(r.url).pathname).filter((p) => p !== "/_next/image"))`) || [];
    horsLigne = true;
    for (const s of [l.s, ...sessionsSw]) await reseau(s, true);
    for (const p of pages) {
      await l.ouvrir(p);
      const etat = await l.evaluer(`({ h1: (document.querySelector("h1")?.textContent || "").trim().slice(0, 50), horsLigne: /Aucune connexion internet/.test(document.body.innerText) })`);
      const toutes = await l.images();
      verifier(!!etat?.h1 && !etat.horsLigne && toutes?.length > 0 && toutes.every(Boolean), `Sans connexion : ${p}`, `titre « ${etat?.h1} », ${toutes?.filter(Boolean).length}/${toutes?.length} images`);
    }
    horsLigne = false;
    for (const s of [l.s, ...sessionsSw]) await reseau(s, false);
    await l.ouvrir(pageTelechargement);
    await l.attendre('!!document.querySelector("[data-telecharger-numero=complet] button")');
    await l.evaluer('document.querySelector("[data-telecharger-numero=complet] button").click()');
    verifier(await l.attendre(`caches.has(${JSON.stringify(nom)}).then((x) => !x)`, 10000) && await l.attendre('!!document.querySelector("[data-telecharger-numero=absent]")'), '« Retirer de l\'appareil » : tout est effacé');
    await l.fermer();
  } else {
    console.log('\nE. « Télécharger le numéro » : non testé (option --telechargement <page d\'un numéro>)');
  }

  ws.close();
} finally {
  chrome.kill();
  await pause(500);
  try { rmSync(profil, { recursive: true, force: true }); } catch { /* Chrome garde parfois le dossier quelques instants */ }
}

console.log(defauts ? `\n${defauts} défaut(s).` : '\nTout est juste.');
process.exit(defauts ? 1 : 0);
