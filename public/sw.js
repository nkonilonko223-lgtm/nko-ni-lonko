/* ============================================================================
 * N'KO NI LONKO — Lecture hors ligne (service worker écrit à la main, Lot 2)
 * ============================================================================
 * Serwist ne fonctionne pas avec Turbopack : ce fichier le remplace, sans dépendance.
 *
 * Règles (prudentes) :
 * - PAGES : toujours le réseau d'abord. La copie gardée sert SEULEMENT sans connexion
 *   (jamais de page périmée pour un lecteur connecté). Sans copie : la page /offline.
 * - « Ma bibliothèque » : les articles sauvegardés avec le signet sont gardés à part,
 *   sans limite, avec leurs images, pour être lus sans connexion (message « garder » / « oublier »).
 * - NUMÉROS TÉLÉCHARGÉS (« Télécharger le numéro ») : la page du numéro et ses articles, avec
 *   leurs images, dans un cache par numéro et par langue (nko-numero-003-nqo), sans limite.
 *   Le lecteur le retire quand il veut. Copies gardées (bibliothèque, numéros) : mises à jour
 *   à chaque lecture connectée.
 * - FICHIERS du site aux noms uniques (/_next/static) ou versionnés (polices d'icônes « ?v= ») :
 *   gardés une fois pour toutes (une seule version par fichier). Fichiers à adresse fixe (polices
 *   /fonts, motif de fond) : montrés tout de suite depuis la copie, puis mis à jour en arrière-plan.
 * - LOGO de la page d'erreur (app/components/PageErreur.tsx) : gardé dès l'installation, car cette
 *   page paraît justement quand le réseau manque. Mis à jour en arrière-plan.
 * - IMAGES (/_next/image, 200 au plus) : celles de Sanity ont une adresse unique (empreinte du
 *   fichier) : la copie suffit, sans rien retélécharger (données mobiles épargnées) ; les autres
 *   sont mises à jour en arrière-plan. Sans connexion, à défaut de la taille demandée : la même
 *   image à une autre taille.
 * - Page « pas de connexion » (/offline, /fr/offline : la langue du lecteur) : gardée à part,
 *   jamais effacée par la limite des pages lues.
 * - JAMAIS : le Studio (/studio), les formulaires et services (/api/), les données de
 *   navigation interne de Next.js (?_rsc=), les réponses « no-store » (aperçu des brouillons),
 *   les autres sites. Rien n'est envoyé nulle part : tout reste sur l'appareil du lecteur.
 *
 * ARRÊT D'URGENCE (si un jour il pose problème) : remplacer TOUT ce fichier par
 *   self.addEventListener("install", () => self.skipWaiting());
 *   self.addEventListener("activate", (e) => e.waitUntil((async () => {
 *     for (const k of await caches.keys()) await caches.delete(k);
 *     await self.registration.unregister();
 *     for (const c of await self.clients.matchAll()) c.navigate(c.url);
 *   })()));
 * puis mettre en ligne : chaque lecteur le reçoit à sa prochaine visite (docs/HORS-LIGNE.md).
 * ============================================================================ */

const CACHE_PAGES = "nko-pages";
const CACHE_BIBLIOTHEQUE = "nko-bibliotheque";
const CACHE_FICHIERS = "nko-fichiers";
const CACHE_IMAGES = "nko-images";
const CACHE_SECOURS = "nko-secours"; // pages « pas de connexion », hors de la limite des pages lues
const CACHES = [CACHE_PAGES, CACHE_BIBLIOTHEQUE, CACHE_FICHIERS, CACHE_IMAGES, CACHE_SECOURS];
const PREFIXE_NUMERO = "nko-numero-"; // un cache par numéro téléchargé et par langue
const estGarde = (nom) => nom === CACHE_BIBLIOTHEQUE || nom.startsWith(PREFIXE_NUMERO); // gardés par le lecteur
const PAGE_HORS_LIGNE = "/offline";
const LOGO_ERREUR = "/application/onglet-192.png";
const MAX_PAGES = 60;
const MAX_IMAGES = 200;

// Clé d'une page : son adresse sans paramètres ni ancre (#titre-…)
const cleDePage = (url) => {
  const u = new URL(url, self.location.origin);
  return u.origin + u.pathname;
};

// Page « pas de connexion » dans la langue de l'adresse (français : /fr/…)
const horsLigneDe = (pathname) => (pathname === "/fr" || pathname.startsWith("/fr/") ? `/fr${PAGE_HORS_LIGNE}` : PAGE_HORS_LIGNE);

const gardable = (reponse) =>
  reponse && reponse.ok && !reponse.redirected && reponse.type === "basic" &&
  !(reponse.headers.get("Cache-Control") || "").includes("no-store");

// Garde au plus « max » éléments (les plus anciens partent d'abord)
async function limiter(nomCache, max) {
  const cache = await caches.open(nomCache);
  const cles = await cache.keys();
  for (const cle of cles.slice(0, Math.max(0, cles.length - max))) await cache.delete(cle);
}

// Fichiers du site cités par une page : scripts, styles, polices préchargées (/_next/static) ;
// puis, dans ses feuilles de style, les polices (adresses relatives « ../media/… » ou /icones/…),
// celles des formules (KaTeX) seulement si la page en a. Dans le code de Next.js, les adresses
// sont écrites entre « \" » : la barre oblique inverse n'en fait jamais partie.
async function garderFichiers(html) {
  const cache = await caches.open(CACHE_FICHIERS);
  const garder = async (f) => {
    const copie = await cache.match(f);
    if (copie) return copie;
    const r = await fetch(f);
    if (r.ok && r.type === "basic") await cache.put(f, r.clone());
    return r;
  };
  const formules = html.includes("katex");
  const fichiers = [...new Set(html.match(/\/_next\/static\/[^"'\s)\\]+/g) || [])];
  await Promise.all(fichiers.map(async (f) => {
    try {
      const r = await garder(f);
      if (!r.ok || !f.endsWith(".css")) return;
      const polices = new Set();
      for (const [, brut] of (await r.clone().text()).matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) {
        const u = new URL(brut, self.location.origin + f);
        if (u.origin === self.location.origin && u.pathname.endsWith(".woff2") && (formules || !u.pathname.includes("KaTeX_"))) {
          polices.add(u.pathname + u.search);
        }
      }
      await Promise.all([...polices].map((p) => garder(p).catch(() => undefined)));
    } catch { /* sans connexion : tant pis */ }
  }));
}

// --- Images d'une page (balises <img> de next/image) ---------------------------------------
// Pour chaque image, l'adresse que le navigateur choisira sur l'écran du lecteur, d'après
// « srcSet » et « sizes » (même calcul que le navigateur, simplifié). Sans connexion, une autre
// taille sert de secours (autreTaille).
const attribut = (balise, nom) => ((balise.match(new RegExp(`\\s${nom}="([^"]*)"`, "i")) || [])[1] || "").replace(/&amp;/g, "&");

// Largeur affichée (en points) selon « sizes », ex. « (max-width: 768px) 100vw, 1200px »
function largeurAffichee(sizes, largeurEcran) {
  for (const morceau of (sizes || "100vw").split(",")) {
    const m = morceau.trim().match(/^(?:\((min|max)-width:\s*(\d+(?:\.\d+)?)px\)\s+)?(\d+(?:\.\d+)?)(px|vw)$/);
    if (!m) continue;
    const [, sens, seuil, valeur, unite] = m;
    if (sens === "min" && largeurEcran < Number(seuil)) continue;
    if (sens === "max" && largeurEcran > Number(seuil)) continue;
    return unite === "vw" ? (largeurEcran * Number(valeur)) / 100 : Number(valeur);
  }
  return largeurEcran;
}

function imagesDeLaPage(html, { largeur, densite }) {
  const adresses = new Set();
  for (const [balise] of html.matchAll(/<img\b[^>]*>/gi)) {
    const candidats = attribut(balise, "srcset").split(/,\s+/).map((c) => c.trim().split(/\s+/)).filter(([u]) => u);
    let choisie = attribut(balise, "src");
    if (candidats.length) {
      const enLargeur = candidats.every(([, d]) => d && d.endsWith("w")); // « 640w » ou « 2x »
      const cible = enLargeur ? largeurAffichee(attribut(balise, "sizes"), largeur) * densite : densite;
      const tries = candidats.map(([u, d]) => [u, parseFloat(d || "1")]).sort((a, b) => a[1] - b[1]);
      choisie = (tries.find(([, v]) => v >= cible) || tries[tries.length - 1])[0];
    }
    if (choisie.startsWith("/") && !choisie.startsWith("//")) adresses.add(choisie);
  }
  return adresses;
}

// Images : demandées comme le ferait le navigateur (formats légers AVIF / WebP)
const ACCEPT_IMAGES = "image/avif,image/webp,image/*,*/*;q=0.8";

// Garde une page et ce qu'il faut pour l'afficher entière sans connexion : ses fichiers et, si
// « ecran » est donné (largeur en points, densité), ses images à la bonne taille. Rend le nombre
// d'octets gardés (page et images nouvelles).
async function garderPage(chemin, nomCache, ecran) {
  const reponse = await fetch(chemin, { credentials: "same-origin", cache: "no-cache" });
  if (!gardable(reponse)) throw new Error(`page impossible à garder : ${chemin}`);
  const html = await reponse.clone().text();
  const cache = await caches.open(nomCache);
  await cache.put(cleDePage(chemin), reponse);
  await garderFichiers(html);
  let octets = new Blob([html]).size;
  if (ecran) {
    for (const adresse of imagesDeLaPage(html, ecran)) {
      if (await cache.match(adresse, { ignoreVary: true })) continue;
      try {
        const r = await fetch(adresse, { headers: { Accept: ACCEPT_IMAGES } });
        if (!r.ok || r.type !== "basic") continue;
        octets += (await r.clone().blob()).size;
        await cache.put(adresse, r);
      } catch { /* sans connexion : cette image manquera */ }
    }
  }
  return octets;
}

// « Ma bibliothèque » : oublie un article et ses images (sauf celles d'un autre article gardé)
const sourcesDImages = (html) => new Set([...html.matchAll(/\/_next\/image\?url=([^&"\s]+)/g)].map((m) => decodeURIComponent(m[1])));
async function oublierArticle(chemin) {
  const cache = await caches.open(CACHE_BIBLIOTHEQUE);
  const cle = cleDePage(chemin);
  const page = await cache.match(cle);
  if (!page) return;
  const sources = sourcesDImages(await page.text());
  await cache.delete(cle);
  const cles = await cache.keys();
  for (const autre of cles.filter((c) => new URL(c.url).pathname !== "/_next/image")) {
    for (const s of sourcesDImages(await (await cache.match(autre)).text())) sources.delete(s);
  }
  for (const c of cles) {
    const u = new URL(c.url);
    if (u.pathname === "/_next/image" && sources.has(u.searchParams.get("url"))) await cache.delete(c);
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    try { await garderPage(PAGE_HORS_LIGNE, CACHE_SECOURS); } catch { /* réessayé à la prochaine visite */ }
    try { await (await caches.open(CACHE_FICHIERS)).add(LOGO_ERREUR); } catch { /* gardé à sa prochaine demande */ }
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    for (const nom of await caches.keys()) if (!CACHES.includes(nom) && !nom.startsWith(PREFIXE_NUMERO)) await caches.delete(nom);
    // Polices d'icônes gardées SANS version (avant le 23 octobre 2026) : effacées, pour que le
    // lecteur reçoive la police à jour (sinon : carrés vides à la place des nouvelles icônes)
    const fichiers = await caches.open(CACHE_FICHIERS);
    for (const cle of await fichiers.keys()) {
      const u = new URL(cle.url);
      if (u.pathname.startsWith("/icones/") && !u.searchParams.has("v")) await fichiers.delete(cle);
    }
    if (self.registration.navigationPreload) await self.registration.navigationPreload.enable();
    await self.clients.claim();
  })());
});

// Pages : réseau d'abord ; sans connexion, la copie (bibliothèque ou pages lues), sinon /offline
async function page(event) {
  const cle = cleDePage(event.request.url);
  const horsLigne = cleDePage(horsLigneDe(new URL(event.request.url).pathname));
  // Page « pas de connexion » de cette langue : gardée dès la première visite (la française n'est
  // pas gardée à l'installation : un lecteur N'Ko ne la télécharge jamais)
  event.waitUntil((async () => {
    if (!(await (await caches.open(CACHE_SECOURS)).match(horsLigne))) await garderPage(horsLigne, CACHE_SECOURS);
  })().catch(() => undefined));
  try {
    const reponse = (await event.preloadResponse) || (await fetch(event.request));
    if (gardable(reponse)) {
      // Deux copies faites AVANT de rendre la page (après, son contenu est déjà lu par le navigateur)
      const copie = reponse.clone();
      const copieGardee = reponse.clone();
      event.waitUntil((async () => {
        await (await caches.open(CACHE_PAGES)).put(cle, copie);
        // Copies gardées par le lecteur (bibliothèque, numéros téléchargés) : tenues à jour
        const gardes = [];
        for (const nom of (await caches.keys()).filter(estGarde)) {
          const cache = await caches.open(nom);
          if (await cache.match(cle)) gardes.push(cache);
        }
        if (gardes.length) {
          const corps = await copieGardee.blob();
          const init = { status: copieGardee.status, statusText: copieGardee.statusText, headers: copieGardee.headers };
          for (const cache of gardes) await cache.put(cle, new Response(corps, init));
        }
        await limiter(CACHE_PAGES, MAX_PAGES);
      })());
    }
    return reponse;
  } catch {
    return (await caches.match(cle)) || (await caches.match(horsLigne)) || (await caches.match(cleDePage(PAGE_HORS_LIGNE))) || Response.error();
  }
}

// Fichiers du site. Noms uniques (/_next/static) ou versionnés (« ?v= ») : la copie d'abord.
// Adresse fixe (polices /fonts, motif de fond) : la copie tout de suite, mise à jour en arrière-plan.
async function fichier(event) {
  const { request } = event;
  const url = new URL(request.url);
  const immuable = url.pathname.startsWith("/_next/static/") || url.searchParams.has("v");
  const cache = await caches.open(CACHE_FICHIERS);
  const copie = await cache.match(request);
  if (copie && immuable) return copie;
  const reseau = fetch(request).then(async (reponse) => {
    if (reponse.ok && reponse.type === "basic") {
      // Une seule version par fichier : les anciennes (autre « ?v= ») sont effacées
      for (const cle of await cache.keys(request, { ignoreSearch: true })) if (cle.url !== request.url) await cache.delete(cle);
      await cache.put(request, reponse.clone());
    }
    return reponse;
  });
  if (copie) {
    event.waitUntil(reseau.catch(() => undefined));
    return copie;
  }
  // Sans connexion : une autre version du même fichier vaut mieux que rien
  return reseau.catch(async (erreur) => (await cache.match(request, { ignoreSearch: true })) || Promise.reject(erreur));
}

// Images. Copie cherchée partout (images vues, bibliothèque, numéros), quel que soit le format
// demandé (« Vary: Accept »). Images de Sanity (adresse unique) : la copie suffit. Autres : copie
// tout de suite, mise à jour en arrière-plan. Sans connexion : une autre taille de la même image.
async function image(event) {
  const { request } = event;
  const source = new URL(request.url).searchParams.get("url") || "";
  const copie = await caches.match(request, { ignoreVary: true });
  if (copie && source.startsWith("https://cdn.sanity.io/")) return copie;
  const reseau = fetch(request).then(async (reponse) => {
    if (reponse.ok && reponse.type === "basic") {
      await (await caches.open(CACHE_IMAGES)).put(request, reponse.clone());
      await limiter(CACHE_IMAGES, MAX_IMAGES);
    }
    return reponse;
  });
  if (copie) {
    event.waitUntil(reseau.catch(() => undefined));
    return copie;
  }
  return reseau.catch(async (erreur) => (await autreTaille(source)) || Promise.reject(erreur));
}

// La même image (même « url ») gardée à une autre taille : la plus grande
async function autreTaille(source) {
  if (!source) return undefined;
  let meilleure;
  let largeurMax = -1;
  for (const nom of await caches.keys()) {
    const cache = await caches.open(nom);
    for (const cle of await cache.keys()) {
      const u = new URL(cle.url);
      const w = Number(u.searchParams.get("w")) || 0;
      if (u.pathname === "/_next/image" && u.searchParams.get("url") === source && w > largeurMax) {
        largeurMax = w;
        meilleure = await cache.match(cle, { ignoreVary: true });
      }
    }
  }
  return meilleure;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/studio") || url.pathname.startsWith("/api/") || url.searchParams.has("_rsc")) return;

  if (request.mode === "navigate") return event.respondWith(page(event));
  if (/^\/(_next\/static|icones|fonts)\//.test(url.pathname) || url.pathname.startsWith("/arriere-plan.") || url.pathname === LOGO_ERREUR) {
    return event.respondWith(fichier(event));
  }
  if (url.pathname === "/_next/image") return event.respondWith(image(event));
});

// Messages des pages (seules les adresses attendues sont acceptées) :
// - « garder » / « oublier » : « Ma bibliothèque » (/article/<slug>, ou /fr/article/<slug>) ;
// - « telecharger » : une page d'un numéro (la page du numéro ou un de ses articles), gardée dans
//   le cache de ce numéro (nko-numero-<numéro>-<langue>) ; réponse { ok, octets } par le canal
//   joint. La page envoie les adresses une par une et montre l'avancement (TelechargerNumero.tsx).
const ARTICLE = /^(\/fr)?\/article\/[a-z0-9-]+$/;
const PAGE_DE_NUMERO = /^(\/fr)?\/(numeros\/[0-9]{3}|article\/[a-z0-9-]+)$/;
const CACHE_DE_NUMERO = /^nko-numero-[0-9]{3}-(nqo|fr)$/;
// Écran du lecteur (taille des images gardées), dans des limites raisonnables
const ecranValide = (e) => ({
  largeur: Math.min(Math.max(Number(e?.largeur) || 400, 200), 4000),
  densite: Math.min(Math.max(Number(e?.densite) || 2, 1), 4),
});

self.addEventListener("message", (event) => {
  const { type, chemin, cache, ecran } = event.data || {};
  if (typeof chemin !== "string") return;
  if (type === "telecharger") {
    const [port] = event.ports;
    if (!port) return;
    if (typeof cache !== "string" || !CACHE_DE_NUMERO.test(cache) || !PAGE_DE_NUMERO.test(chemin)) {
      port.postMessage({ ok: false });
      return;
    }
    event.waitUntil(garderPage(chemin, cache, ecranValide(ecran)).then(
      (octets) => port.postMessage({ ok: true, octets }),
      () => port.postMessage({ ok: false }),
    ));
    return;
  }
  if (!ARTICLE.test(chemin)) return;
  if (type === "garder") event.waitUntil(garderPage(chemin, CACHE_BIBLIOTHEQUE, ecranValide(ecran)).catch(() => undefined));
  if (type === "oublier") event.waitUntil(oublierArticle(chemin).catch(() => undefined));
});
