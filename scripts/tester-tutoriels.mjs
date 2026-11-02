/* eslint-disable no-console */ // outil en ligne de commande : son rôle est d'afficher un rapport
// ============================================================================
// N'KO NI LONKO — Contrôle de la page Tutoriels (/tutoriels et /fr/tutoriels)
// ============================================================================
// Lecture seule : rien n'est écrit dans Sanity ni sur le site. Google Chrome sans fenêtre.
// Page sans vidéo publiée : page ouverte mais non indexée, ni lien de menu, ni plan du site.
// Page avec vidéos :
//   A. Ce que le serveur envoie : langue et sens, aucun lecteur, données Google, images, légendes.
//   B. Téléphone 360 px, N'Ko et français : rien vers YouTube avant le toucher, cadre 9:16, pas de
//      débordement, ordre des diapositives selon le sens, flèches, points, doigt, clavier, polices,
//      lecteur youtube-nocookie.com au toucher, sans lecture automatique.
//   C. Avant l'arrivée du code (JavaScript coupé) : le bouton mène à YouTube, flèches éteintes.
//   D. Ordinateur : vidéo de 420 px au plus, côté selon le sens, menu sans débordement à 1024 px.
//
// Usage : node scripts/tester-tutoriels.mjs [adresse]   (par défaut http://localhost:3100)
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

const site = (process.argv[2] || 'http://localhost:3100').replace(/[/]$/, '');
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
let defauts = 0;
const verifier = (ok, texte, detail = '') => {
  console.log(`${ok ? 'OK    ' : 'DÉFAUT'} ${texte}${detail !== '' ? ` — ${detail}` : ''}`);
  if (!ok) defauts++;
};
const contientNko = (t = '') => [...t].some((c) => { const n = c.codePointAt(0); return n >= 0x07c0 && n <= 0x07ff; });
const UA = { 'user-agent': 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/141.0 Mobile Safari/537.36' };
const lire = async (chemin) => { const r = await fetch(site + chemin, { headers: UA }); return { statut: r.status, html: await r.text() }; };
const VERSIONS = [
  { nom: "N'Ko", chemin: '/tutoriels', lang: 'nqo', dir: 'rtl', accueil: '/', langueInterface: 'nko' },
  { nom: 'français', chemin: '/fr/tutoriels', lang: 'fr', dir: 'ltr', accueil: '/fr', langueInterface: 'fr' },
];

const plan = (await lire('/sitemap.xml')).html;
const pages = await Promise.all(VERSIONS.map((v) => lire(v.chemin)));
const remplie = pages.every((p) => p.html.includes('id="video-'));

// --- Ce que le serveur envoie -----------------------------------------------------------
for (const [i, v] of VERSIONS.entries()) {
  const { statut, html } = pages[i];
  const racine = (html.match(/<html[^>]*>/) || [''])[0];
  verifier(statut === 200 && racine.includes(`lang="${v.lang}"`) && racine.includes(`dir="${v.dir}"`), `${v.chemin} répond, langue et sens justes`, `${statut}`);
  verifier(!/<iframe/.test(html) && !/<(link|script)[^>]+(youtube|ytimg)/.test(html), `${v.chemin} : aucun lecteur ni fichier YouTube dans la page`);
  const noindex = /<meta[^>]+name="robots"[^>]+noindex/.test(html);
  const dansPlan = new RegExp(`//[^/]+${v.chemin}<`).test(plan);
  const accueil = (await lire(v.accueil)).html;
  const lien = accueil.includes(`href="${v.chemin}"`);
  if (!remplie) {
    verifier(noindex, `${v.chemin} vide : non indexée`);
    verifier(!dansPlan, `${v.chemin} vide : absente du plan du site`);
    verifier(!lien, `${v.accueil} : pas de lien vers une page vide`);
    continue;
  }
  verifier(!noindex, `${v.chemin} : indexable`);
  verifier(dansPlan, `${v.chemin} : dans le plan du site`);
  verifier(lien, `${v.accueil} : lien vers les tutoriels dans le menu`);

  const blocs = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].flatMap((m) => { const d = JSON.parse(m[1]); return d['@graph'] || [d]; });
  const videos = blocs.filter((b) => b['@type'] === 'VideoObject');
  verifier(videos.length > 0, `${v.chemin} : données Google VideoObject`, `${videos.length} vidéo(s)`);
  for (const d of videos) {
    const langueJuste = v.lang === 'nqo' ? contientNko(d.name) && contientNko(d.description) : !contientNko(d.name) && !contientNko(d.description);
    verifier(!!d.name && !!d.description && langueJuste, `${d['@id']} : nom et description dans la langue de la version`);
    verifier(!!d.thumbnailUrl && /^(https:|\/essai-tutoriels\/)/.test(d.thumbnailUrl), `${d['@id']} : thumbnailUrl`, d.thumbnailUrl);
    verifier(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/.test(d.uploadDate || ''), `${d['@id']} : uploadDate avec fuseau horaire`, d.uploadDate);
    verifier(/^PT\d+M\d+S$/.test(d.duration || ''), `${d['@id']} : duration`, d.duration);
    verifier(/^https:\/\/www\.youtube-nocookie\.com\/embed\/[A-Za-z0-9_-]{11}$/.test(d.embedUrl || ''), `${d['@id']} : embedUrl`, d.embedUrl);
  }
  const articles = [...html.matchAll(/<article id="video-.*?<\/article>/gs)].map((m) => m[0]);
  verifier(articles.every((a) => /<h2>.*lang="nqo" dir="rtl".*lang="fr" dir="ltr".*<\/h2>/s.test(a) && /<p lang="nqo" dir="rtl"/.test(a) && /<p lang="fr" dir="ltr"/.test(a)), `${v.chemin} : titres et résumés marqués lang et dir`, `${articles.length} tutoriel(s)`);
  const diapos = [...html.matchAll(/<figure>(.*?)<\/figure>/gs)].map((m) => m[1]);
  const imagesJustes = diapos.every((d) => /loading="lazy"/.test(d) && /540w/.test(d) && /1080w/.test(d) && /fm=webp/.test(d) && /width="1080"/.test(d) && /height="1350"/.test(d));
  verifier(imagesJustes, `${v.chemin} : images WebP 540 et 1080, chargement différé`, `${diapos.length} diapositive(s)`);
  const legendesJustes = diapos.every((d) => { const c = (d.match(/<figcaption.*<\/figcaption>/s) || [''])[0]; return /lang="nqo" dir="rtl"/.test(c) && /font-kigelia/.test(c) && /lang="fr" dir="ltr"/.test(c) && /font-fr/.test(c); });
  verifier(legendesJustes, `${v.chemin} : légendes en texte, N'Ko et français marqués`);
}
if (!remplie) {
  console.log(defauts ? `\n${defauts} défaut(s).` : '\nPage sans vidéo : tout est juste.');
  process.exit(defauts ? 1 : 0);
}

// --- Chrome ---------------------------------------------------------------------------
const PORT = 9800 + Math.floor(Math.random() * 150);
const profil = mkdtempSync(join(tmpdir(), 'tester-tutoriels-'));
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

  // Un lecteur : un onglet neuf, langue déjà choisie, sans copie ni stockage du site
  const onglet = async ({ largeur = 360, hauteur = 740, mobile = true, langue = 'nko', sansCode = false }) => {
    const { result: { browserContextId } } = await envoyer('Target.createBrowserContext');
    const { result: { targetId } } = await envoyer('Target.createTarget', { url: 'about:blank', browserContextId });
    const { result: { sessionId: s } } = await envoyer('Target.attachToTarget', { targetId, flatten: true });
    const demandes = [];
    const f = (m) => { if (m.sessionId === s && m.method === 'Network.requestWillBeSent') demandes.push(m.params.request.url); };
    ecouteurs.add(f);
    for (const domaine of ['Page', 'Network', 'Runtime']) await envoyer(`${domaine}.enable`, {}, s);
    await envoyer('Emulation.setDeviceMetricsOverride', { width: largeur, height: hauteur, deviceScaleFactor: mobile ? 3 : 1, mobile }, s);
    if (mobile) await envoyer('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 }, s);
    if (sansCode) await envoyer('Emulation.setScriptExecutionDisabled', { value: true }, s);
    await envoyer('Page.addScriptToEvaluateOnNewDocument', {
      source: `try { localStorage.setItem("preferred-lang", ${JSON.stringify(langue)}); } catch (e) {}
        window.__decalage = 0; try { new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__decalage += e.value; }).observe({ type: 'layout-shift', buffered: true }); } catch (e) {}`,
    }, s);
    const evaluer = async (expression) => (await envoyer('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }, s)).result?.result?.value;
    const ouvrir = async (chemin) => {
      const charge = new Promise((r) => {
        const g = (m) => { if (m.sessionId === s && m.method === 'Page.loadEventFired') { ecouteurs.delete(g); r(); } };
        ecouteurs.add(g);
        setTimeout(() => { ecouteurs.delete(g); r(); }, 30000);
      });
      await envoyer('Page.navigate', { url: site + chemin }, s);
      await charge;
      await pause(1500);
    };
    const attendre = async (expression, ms = 20000) => { for (let t = 0; t < ms; t += 200) { if (await evaluer(expression)) return true; await pause(200); } return false; };
    const toucher = async (expression) => {
      const p = await evaluer(`(() => { const e = ${expression}; if (!e) return null; e.scrollIntoView({ block: 'nearest', behavior: 'instant' }); const b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; })()`);
      if (!p) return false;
      await pause(150);
      await envoyer('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [p] }, s);
      await envoyer('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }, s);
      return true;
    };
    const fermer = async () => { ecouteurs.delete(f); await envoyer('Target.disposeBrowserContext', { browserContextId }); };
    return { s, demandes, evaluer, ouvrir, attendre, toucher, fermer };
  };

  const GROUPE = `document.querySelector('article [role="group"]')`;
  const FLECHES = `[...${GROUPE}.querySelectorAll('button[aria-disabled]')]`;
  // Où en est le carrousel, d'après l'écran seulement
  const etat = `(() => {
    const g = ${GROUPE}; const u = g.querySelector('ul'); const c = u.getBoundingClientRect();
    const l = [...u.children]; const milieu = (r) => r.left + r.width / 2;
    const i = l.findIndex((e) => Math.abs(milieu(e.getBoundingClientRect()) - milieu(c)) < 1.5);
    const points = [...g.querySelector('ol').querySelectorAll('button')];
    const f = [...g.querySelectorAll('button[aria-disabled]')].map((b) => b.getAttribute('aria-disabled'));
    return { i, nombre: l.length, point: points.findIndex((p) => p.getAttribute('aria-current') === 'true'), points: points.length, avant: f[0], apres: f[1], haut: scrollY, position: u.scrollLeft };
  })()`;
  // Attend que le carrousel ne bouge plus
  const repos = async (o) => {
    let dernier = null;
    for (let t = 0; t < 40; t++) {
      await pause(120);
      const e = await o.evaluer(etat);
      if (dernier !== null && e.position === dernier) { await pause(150); return o.evaluer(etat); }
      dernier = e.position;
    }
    return o.evaluer(etat);
  };

  for (const v of VERSIONS) {
    console.log(`\n--- Téléphone 360 px, ${v.nom} ---`);
    const o = await onglet({ langue: v.langueInterface });
    await o.ouvrir(v.chemin);
    const rtl = v.dir === 'rtl';

    const verrouYoutube = () => o.demandes.filter((u) => /youtube|ytimg|googlevideo/.test(u));
    verifier(verrouYoutube().length === 0, 'Rien ne part vers YouTube avant le toucher', verrouYoutube().join(' '));
    const largeurs = await o.evaluer(`({ page: document.documentElement.scrollWidth, ecran: innerWidth })`);
    verifier(largeurs.page <= largeurs.ecran, 'La page ne déborde pas en largeur', `${largeurs.page} pour ${largeurs.ecran} px`);
    const haut = await o.evaluer(`(() => { const t = document.querySelector('h1').getBoundingClientRect(); const b = document.querySelector('a.btn-lang').getBoundingClientRect(); return { titre: Math.round(t.top), bouton: Math.round(b.bottom) }; })()`);
    verifier(haut.titre >= haut.bouton, 'Le titre de la page reste sous le bouton de langue', `titre à ${haut.titre} px, bouton jusqu'à ${haut.bouton} px`);
    const cadreAvant = await o.evaluer(`(() => { const r = document.querySelector('[data-video] a').parentElement.getBoundingClientRect(); return { l: r.width, h: r.height, x: r.left, y: r.top + scrollY }; })()`);
    verifier(Math.abs(cadreAvant.l / cadreAvant.h - 9 / 16) < 0.01, 'Cadre de la vidéo au format 9:16', `${Math.round(cadreAvant.l)} × ${Math.round(cadreAvant.h)} px`);
    const nbAvant = (await o.evaluer(`performance.getEntriesByType('resource').filter((e) => /fm=webp/.test(e.name)).length`)) ?? 0;
    const nbDiapos = await o.evaluer(`document.querySelectorAll('article [role="group"] li img').length`);
    console.log(`       Images de diapositives demandées sans descendre : ${nbAvant} sur ${nbDiapos}`);
    verifier(await o.evaluer(`[...document.querySelectorAll('[lang="nqo"]:not(html)')].every((e) => /kigelia/i.test(getComputedStyle(e).fontFamily))`), "Tout le N'Ko est en Kigelia");
    verifier(await o.evaluer(`[...document.querySelectorAll('main [lang="fr"]')].every((e) => /montserrat/i.test(getComputedStyle(e).fontFamily))`), 'Tout le français est en Montserrat');

    await o.evaluer(`${GROUPE}.scrollIntoView({ block: 'start', behavior: 'instant' })`);
    verifier(await o.attendre(`(() => { const i = ${GROUPE}.querySelector('li img'); return i.complete && i.naturalWidth > 0; })()`), 'La première diapositive se charge en arrivant dessus');
    const nbApres = await o.evaluer(`performance.getEntriesByType('resource').filter((e) => /fm=webp/.test(e.name)).length`);
    console.log(`       Images de diapositives demandées en arrivant au carrousel : ${nbApres} sur ${nbDiapos}`);
    const sens = await o.evaluer(`(() => { const l = [...${GROUPE}.querySelectorAll('ul > li')].map((e) => e.getBoundingClientRect()); return { a: l[0].left, b: l[1]?.left ?? null }; })()`);
    verifier(sens.b !== null && (rtl ? sens.b < sens.a : sens.b > sens.a), rtl ? 'La première diapositive est à droite, la suivante à sa gauche' : 'La première diapositive est à gauche, la suivante à sa droite');

    const cadreDiapos = await o.evaluer(`(() => { const u = ${GROUPE}.querySelector('ul'); return { h: u.scrollHeight, c: u.clientHeight }; })()`);
    verifier(cadreDiapos.h <= cadreDiapos.c, 'Le cadre des diapositives ne défile qu\'en largeur', `${cadreDiapos.h} pour ${cadreDiapos.c} px`);
    let e = await o.evaluer(etat);
    verifier(e.i === 0 && e.point === 0 && e.points === e.nombre, 'Au départ : première diapositive, premier point', JSON.stringify({ i: e.i, point: e.point }));
    verifier(e.avant === 'true' && e.apres === 'false', 'Flèche « précédente » éteinte, « suivante » allumée', `${e.avant} / ${e.apres}`);
    const hautAvant = e.haut;

    await o.toucher(`${FLECHES}[1]`);
    e = await repos(o);
    verifier(e.i === 1 && e.point === 1, 'Flèche « suivante » : deuxième diapositive, deuxième point', JSON.stringify({ i: e.i, point: e.point }));
    verifier(Math.abs(e.haut - hautAvant) < 2, 'La flèche ne fait pas bouger la page', `${hautAvant} → ${e.haut}`);
    await o.toucher(`${FLECHES}[0]`);
    e = await repos(o);
    verifier(e.i === 0 && e.point === 0, 'Flèche « précédente » : retour à la première', JSON.stringify({ i: e.i, point: e.point }));

    await o.toucher(`${GROUPE}.querySelector('ol').querySelectorAll('button')[${e.nombre - 1}]`);
    e = await repos(o);
    verifier(e.i === e.nombre - 1 && e.point === e.nombre - 1 && e.apres === 'true', 'Dernier point : dernière diapositive, flèche « suivante » éteinte', JSON.stringify({ i: e.i, point: e.point, apres: e.apres }));
    await o.toucher(`${GROUPE}.querySelector('ol').querySelectorAll('button')[0]`);
    e = await repos(o);

    // Deux commandes rapprochées : la seconde part de la diapositive demandée, pas de celle qu'on quitte
    const points = await o.evaluer(`(() => { const c = (b) => { const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }; const g = ${GROUPE}; return { dernier: c([...g.querySelector('ol').querySelectorAll('button')].at(-1)), avant: c(g.querySelectorAll('button[aria-disabled]')[0]) }; })()`);
    for (const p of [points.dernier, points.avant]) {
      await envoyer('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [p] }, o.s);
      await envoyer('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }, o.s);
      await pause(60);
    }
    e = await repos(o);
    verifier(e.i === e.nombre - 2 && e.point === e.nombre - 2, "Dernier point puis « précédente » aussitôt : l'avant-dernière", JSON.stringify({ i: e.i, point: e.point }));
    await o.toucher(`${GROUPE}.querySelector('ol').querySelectorAll('button')[0]`);
    e = await repos(o);

    // Le doigt : glisser vers le côté de la lecture (N'Ko : vers la droite, la suivante arrive de la gauche)
    const p = await o.evaluer(`(() => { const r = ${GROUPE}.querySelector('ul').getBoundingClientRect(); return { x: r.left + r.width / 2, y: Math.min(r.top + r.height / 3, innerHeight - 40) }; })()`);
    for (let pas = 0; pas <= 11; pas++) {
      const x = p.x + (rtl ? 1 : -1) * (pas * 20 - 110);
      await envoyer('Input.dispatchTouchEvent', { type: pas === 0 ? 'touchStart' : 'touchMove', touchPoints: [{ x, y: p.y }] }, o.s);
      await pause(16);
    }
    await envoyer('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }, o.s);
    e = await repos(o);
    verifier(e.i === 1 && e.point === 1, 'Glisser au doigt : la suivante, posée au milieu', JSON.stringify({ i: e.i, point: e.point }));
    verifier(rtl ? e.position < 0 : e.position > 0, rtl ? "En N'Ko, la position part de 0 et devient négative" : 'En français, la position part de 0 et devient positive', String(e.position));

    // Un glissement vertical commencé sur une diapositive doit faire défiler la page, pas se bloquer
    const avantVertical = await o.evaluer('scrollY');
    for (let pas = 0; pas <= 10; pas++) {
      await envoyer('Input.dispatchTouchEvent', { type: pas === 0 ? 'touchStart' : 'touchMove', touchPoints: [{ x: p.x, y: p.y + pas * 12 }] }, o.s);
      await pause(16);
    }
    await envoyer('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }, o.s);
    await pause(500);
    verifier((await o.evaluer('scrollY')) < avantVertical - 20, 'Glisser vers le bas sur une diapositive fait défiler la page');

    // Téléphone tourné pendant l'usage : la même diapositive reste au milieu, le point suit
    await envoyer('Emulation.setDeviceMetricsOverride', { width: 740, height: 360, deviceScaleFactor: 3, mobile: true }, o.s);
    e = await repos(o);
    const tourneDiapo = e;
    await envoyer('Emulation.setDeviceMetricsOverride', { width: 360, height: 740, deviceScaleFactor: 3, mobile: true }, o.s);
    e = await repos(o);
    verifier(tourneDiapo.i === 1 && tourneDiapo.point === 1 && e.i === 1 && e.point === 1, 'Téléphone tourné puis redressé : la même diapositive au milieu, le bon point', JSON.stringify({ tourne: [tourneDiapo.i, tourneDiapo.point], redresse: [e.i, e.point] }));

    // Clavier
    await o.evaluer(`${GROUPE}.querySelector('ul').focus({ preventScroll: true })`);
    const touche = async (k) => {
      await envoyer('Input.dispatchKeyEvent', { type: 'keyDown', key: k, code: k, windowsVirtualKeyCode: { ArrowLeft: 37, ArrowRight: 39, Home: 36, End: 35 }[k] }, o.s);
      await envoyer('Input.dispatchKeyEvent', { type: 'keyUp', key: k, code: k, windowsVirtualKeyCode: { ArrowLeft: 37, ArrowRight: 39, Home: 36, End: 35 }[k] }, o.s);
      return repos(o);
    };
    e = await touche('Home');
    verifier(e.i === 0, 'Clavier : Début', `${e.i}`);
    e = await touche(rtl ? 'ArrowLeft' : 'ArrowRight');
    verifier(e.i === 1, `Clavier : ${rtl ? 'flèche gauche' : 'flèche droite'} = la suivante`, `${e.i}`);
    e = await touche(rtl ? 'ArrowRight' : 'ArrowLeft');
    verifier(e.i === 0, `Clavier : ${rtl ? 'flèche droite' : 'flèche gauche'} = la précédente`, `${e.i}`);
    e = await touche('End');
    verifier(e.i === e.nombre - 1, 'Clavier : Fin', `${e.i}`);
    verifier(await o.evaluer(`document.activeElement === ${GROUPE}.querySelector('ul')`), 'Le carrousel se prend au clavier (le cadre garde le focus)');

    // Le lecteur
    verifier((await o.evaluer('window.__decalage')) < 0.02, 'Pas de saut de mise en page au chargement', String(await o.evaluer('window.__decalage')));
    await o.evaluer(`window.scrollTo({ top: 0, behavior: 'instant' })`);
    await pause(200);
    await o.toucher(`document.querySelector('[data-video] a')`);
    verifier(await o.attendre(`!!document.querySelector('iframe')`, 5000), 'Le toucher ouvre le lecteur dans la page');
    const lecteur = await o.evaluer(`(() => { const f = document.querySelector('iframe'); const r = f.parentElement.getBoundingClientRect(); return { src: f.src, titre: f.title, lien: !!f.parentElement.querySelector('[data-video] a'), l: r.width, h: r.height, y: r.top + scrollY, focus: document.activeElement === f }; })()`);
    verifier(/^https:\/\/www\.youtube-nocookie\.com\/embed\/[A-Za-z0-9_-]{11}\?/.test(lecteur.src), 'Lecteur youtube-nocookie.com', lecteur.src);
    verifier(!/autoplay/.test(lecteur.src), 'Pas de lecture automatique');
    verifier(!lecteur.lien, 'Le bouton a laissé la place au lecteur');
    verifier(await o.evaluer(`getComputedStyle(document.querySelector('[data-video]')).zIndex === '9999' && !!document.querySelector('[data-video] + a[href*="youtube.com/watch"][aria-label]')`), 'Le lecteur passe au-dessus du bouton Retour ; le logo de YouTube reste sous le cadre');
    await o.evaluer(`window.scrollTo({ top: document.querySelector('[data-video]').getBoundingClientRect().top + scrollY - 10, behavior: 'instant' })`);
    await pause(200);
    const sousLeDoigt = await o.evaluer(`(() => { const b = document.querySelector('main > button').getBoundingClientRect(); return document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2)?.tagName; })()`);
    verifier(sousLeDoigt === 'IFRAME', "Cadre en haut de l'écran : le doigt touche le lecteur, pas le bouton Retour", sousLeDoigt);
    // Réseau coupé, lecteur ouvert : on touche le logo de YouTube, le message « Aucune connexion » s'ouvre
    // (NetworkBoundary) et doit passer au-dessus du lecteur, bouton « Fermer » compris
    await envoyer('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: -1, uploadThroughput: -1 }, o.s);
    await pause(800);
    await o.toucher(`document.querySelector('[data-video] + a')`);
    await o.attendre(`!!document.querySelector('[role="alertdialog"]')`, 5000);
    const dessus = await o.evaluer(`(() => { const d = document.querySelector('[role="alertdialog"]'); const f = d && [...d.querySelectorAll('button')].at(-1); const r = document.querySelector('[data-video]').getBoundingClientRect(); const point = (x, y) => document.elementFromPoint(x, y); const b = f && f.getBoundingClientRect(); return { message: !!d, cadre: d ? d.contains(point(r.left + r.width / 2, Math.min(Math.max(r.top, 0) + 60, innerHeight - 5))) : false, fermer: b ? f.contains(point(b.left + b.width / 2, b.top + b.height / 2)) : false }; })()`);
    verifier(dessus.message && dessus.cadre && dessus.fermer, 'Réseau coupé : le message « Aucune connexion » passe au-dessus du lecteur, « Fermer » se touche', JSON.stringify(dessus));
    await o.toucher(`[...document.querySelectorAll('[role="alertdialog"] button')].at(-1)`);
    await envoyer('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 }, o.s);
    await pause(800);
    verifier(lecteur.focus, 'Le clavier continue dans le lecteur');
    verifier(rtl ? contientNko(lecteur.titre) : !contientNko(lecteur.titre) && !!lecteur.titre, 'Titre du lecteur dans la langue de la page');
    verifier(Math.abs(lecteur.l - cadreAvant.l) < 1 && Math.abs(lecteur.h - cadreAvant.h) < 1 && Math.abs(lecteur.y - cadreAvant.y) < 2, 'Le cadre ne change ni de taille ni de place');
    verifier(await o.attendre(`document.querySelector('iframe') && !document.querySelector('.animate-spin.border-or')`, 20000), 'Le lecteur finit de se charger');
    if (await o.evaluer(`!!document.querySelector('[data-video] a')`)) {
      const adresse = await o.evaluer(`new URL(document.querySelector('[data-video] a').href).searchParams.get('v')`);
      await o.toucher(`document.querySelector('[data-video] a')`);
      await o.attendre(`document.querySelector('iframe')?.src.includes(${JSON.stringify(adresse)})`, 5000);
      const seul = await o.evaluer(`({ n: document.querySelectorAll('iframe').length, src: document.querySelector('iframe')?.src })`);
      verifier(seul.n === 1 && seul.src.includes(adresse), 'Toucher une autre vidéo referme le lecteur ouvert', `${seul.n} lecteur(s)`);
    }
    await o.fermer();

    // Menu et bouton de langue
    const m = await onglet({ langue: v.langueInterface });
    await m.ouvrir(v.chemin);
    const autre = v.lang === 'nqo' ? '/fr/tutoriels' : '/tutoriels';
    verifier(await m.evaluer(`document.querySelector('a.btn-lang')?.getAttribute('href') === ${JSON.stringify(autre)}`), 'Bouton de langue : mène à la même page dans l\'autre langue', autre);
    await m.ouvrir(v.accueil);
    await m.toucher(`document.querySelector('.mobile-toggle')`);
    await pause(800);
    const dansMenu = `document.querySelector('#mobile-menu a[href="${v.chemin}"]')`;
    verifier(await m.evaluer(`!!${dansMenu}`), 'Lien dans le menu du téléphone');
    await m.toucher(dansMenu);
    verifier(await m.attendre(`location.pathname === ${JSON.stringify(v.chemin)} && !!document.querySelector('article[id^="video-"]')`, 15000), 'Le lien du menu ouvre la page');
    await m.fermer();

    // Avant l'arrivée du code : JavaScript coupé
    console.log(`--- Avant l'arrivée du code, ${v.nom} ---`);
    const c = await onglet({ langue: v.langueInterface, sansCode: true });
    await c.ouvrir(v.chemin);
    // Sans JavaScript, seul le protocole de débogage lit encore la page
    const sans = await c.evaluer(`(() => { const a = document.querySelector('[data-video] a'); const g = ${GROUPE}; return { href: a?.href, cible: a?.target, fleches: [...g.querySelectorAll('button[aria-disabled]')].map((b) => b.getAttribute('aria-disabled')), defile: getComputedStyle(g.querySelector('ul')).overflowX }; })()`);
    verifier(/^https:\/\/www\.youtube\.com\/watch\?v=/.test(sans?.href || '') && sans?.cible === '_blank', 'Le bouton de lecture mène à YouTube', sans?.href);
    verifier(sans?.fleches?.every((f) => f === 'true'), 'Les flèches restent éteintes, jamais de bouton mort', JSON.stringify(sans?.fleches));
    verifier(sans?.defile === 'auto', 'Le doigt fait déjà défiler (défilement du navigateur)');
    await c.fermer();

    // Téléphone tourné : le lecteur tient en entier
    const t = await onglet({ largeur: 740, hauteur: 360, langue: v.langueInterface });
    await t.ouvrir(v.chemin);
    const tourne = await t.evaluer(`(() => { const r = document.querySelector('[data-video]').getBoundingClientRect(); return { l: r.width, h: r.height, page: document.documentElement.scrollWidth, ecran: innerWidth }; })()`);
    verifier(tourne.h <= 360 + 1 && Math.abs(tourne.l / tourne.h - 9 / 16) < 0.01 && tourne.page <= tourne.ecran, "Téléphone tourné : le lecteur tient dans l'écran", `${Math.round(tourne.l)} × ${Math.round(tourne.h)} px`);
    await t.fermer();

    // Ordinateur
    console.log(`--- Ordinateur, ${v.nom} ---`);
    for (const largeur of [1366, 1024]) {
      const d = await onglet({ largeur, hauteur: 768, mobile: false, langue: v.langueInterface });
      await d.ouvrir(v.chemin);
      const g = await d.evaluer(`(() => { const f = document.querySelector('[data-video] a').parentElement.getBoundingClientRect(); const t = document.querySelector('article header').getBoundingClientRect(); return { l: f.width, h: f.height, video: f.left + f.width / 2, texte: t.left + t.width / 2, page: document.documentElement.scrollWidth, ecran: innerWidth }; })()`);
      verifier(g.l <= 420 && Math.abs(g.l / g.h - 9 / 16) < 0.01, `${largeur} px : vidéo de 420 px au plus, 9:16`, `${Math.round(g.l)} × ${Math.round(g.h)} px`);
      verifier(rtl ? g.video > g.texte : g.video < g.texte, `${largeur} px : la vidéo du côté où la lecture commence`);
      verifier(g.page <= g.ecran, `${largeur} px : la page ne déborde pas`, `${g.page} pour ${g.ecran} px`);
      await d.ouvrir(v.accueil);
      const n = await d.evaluer(`(() => { const l = [...document.querySelectorAll('.nav-links a')].map((a) => a.getBoundingClientRect()); return { nombre: l.length, dedans: l.every((r) => r.left >= 0 && r.right <= innerWidth), lien: !!document.querySelector('.nav-links a[href="${v.chemin}"]'), lignes: new Set(l.map((r) => Math.round(r.top))).size, page: document.documentElement.scrollWidth, ecran: innerWidth }; })()`);
      verifier(n.lien && n.dedans && n.lignes === 1 && n.page <= n.ecran, `${largeur} px : lien dans le menu, tout le menu sur une ligne, sans débordement`, JSON.stringify(n));
      await d.fermer();
    }
  }
} finally {
  chrome.kill();
  await pause(500);
  try { rmSync(profil, { recursive: true, force: true }); } catch { /* Chrome garde parfois un fichier un instant */ }
}

console.log(defauts ? `\n${defauts} défaut(s).` : '\nTout est juste.');
process.exit(defauts ? 1 : 0);
