/* ============================================================================
 * N'KO NI LONKO — Lecture hors ligne (service worker écrit à la main, Lot 2)
 * ============================================================================
 * Serwist ne fonctionne pas avec Turbopack : ce fichier le remplace, sans dépendance.
 *
 * Règles (prudentes) :
 * - PAGES : toujours le réseau d'abord. La copie gardée sert SEULEMENT sans connexion
 *   (jamais de page périmée pour un lecteur connecté). Sans copie : la page /offline.
 * - « Ma bibliothèque » : les articles sauvegardés avec le signet sont gardés à part,
 *   sans limite, pour être lus sans connexion (message « garder » / « oublier »).
 * - FICHIERS du site (/_next/static : noms uniques, jamais modifiés ; polices ; icônes ;
 *   motif de fond) : gardés une fois pour toutes. IMAGES (/_next/image) : montrées tout de
 *   suite depuis la copie, puis mises à jour en arrière-plan (200 au plus).
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
const CACHES = [CACHE_PAGES, CACHE_BIBLIOTHEQUE, CACHE_FICHIERS, CACHE_IMAGES];
const PAGE_HORS_LIGNE = "/offline";
const MAX_PAGES = 60;
const MAX_IMAGES = 200;

// Clé d'une page : son adresse sans paramètres ni ancre (#titre-…)
const cleDePage = (url) => {
  const u = new URL(url, self.location.origin);
  return u.origin + u.pathname;
};

const gardable = (reponse) =>
  reponse && reponse.ok && !reponse.redirected && reponse.type === "basic" &&
  !(reponse.headers.get("Cache-Control") || "").includes("no-store");

// Garde au plus « max » éléments (les plus anciens partent d'abord)
async function limiter(nomCache, max) {
  const cache = await caches.open(nomCache);
  const cles = await cache.keys();
  for (const cle of cles.slice(0, Math.max(0, cles.length - max))) await cache.delete(cle);
}

// Garde une page et les fichiers qu'elle utilise (pour qu'elle s'affiche entière sans connexion)
async function garderPage(chemin, nomCache) {
  const reponse = await fetch(chemin, { credentials: "same-origin", cache: "no-cache" });
  if (!gardable(reponse)) return;
  const html = await reponse.clone().text();
  await (await caches.open(nomCache)).put(cleDePage(chemin), reponse);
  const fichiers = [...new Set(html.match(/\/_next\/static\/[^"'\s)]+/g) || [])];
  const cache = await caches.open(CACHE_FICHIERS);
  await Promise.all(fichiers.map(async (f) => {
    if (await cache.match(f)) return;
    try { const r = await fetch(f); if (r.ok) await cache.put(f, r); } catch { /* sans connexion : tant pis */ }
  }));
}

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    try { await garderPage(PAGE_HORS_LIGNE, CACHE_PAGES); } catch { /* réessayé à la prochaine installation */ }
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    for (const nom of await caches.keys()) if (!CACHES.includes(nom)) await caches.delete(nom);
    if (self.registration.navigationPreload) await self.registration.navigationPreload.enable();
    await self.clients.claim();
  })());
});

// Pages : réseau d'abord ; sans connexion, la copie (bibliothèque ou pages lues), sinon /offline
async function page(event) {
  const cle = cleDePage(event.request.url);
  try {
    const reponse = (await event.preloadResponse) || (await fetch(event.request));
    if (gardable(reponse)) {
      // Deux copies faites AVANT de rendre la page (après, son contenu est déjà lu par le navigateur)
      const copie = reponse.clone();
      const copieBiblio = reponse.clone();
      event.waitUntil((async () => {
        await (await caches.open(CACHE_PAGES)).put(cle, copie);
        const biblio = await caches.open(CACHE_BIBLIOTHEQUE);
        if (await biblio.match(cle)) await biblio.put(cle, copieBiblio); // la bibliothèque reste à jour
        await limiter(CACHE_PAGES, MAX_PAGES);
      })());
    }
    return reponse;
  } catch {
    return (await caches.match(cle)) || (await caches.match(cleDePage(PAGE_HORS_LIGNE))) || Response.error();
  }
}

// Fichiers aux noms uniques : la copie d'abord
async function fichier(request) {
  const cache = await caches.open(CACHE_FICHIERS);
  const copie = await cache.match(request);
  if (copie) return copie;
  const reponse = await fetch(request);
  if (reponse.ok && reponse.type === "basic") await cache.put(request, reponse.clone());
  return reponse;
}

// Images : la copie tout de suite, mise à jour en arrière-plan
async function image(event) {
  const cache = await caches.open(CACHE_IMAGES);
  const copie = await cache.match(event.request);
  const reseau = fetch(event.request).then(async (reponse) => {
    if (reponse.ok && reponse.type === "basic") {
      await cache.put(event.request, reponse.clone());
      await limiter(CACHE_IMAGES, MAX_IMAGES);
    }
    return reponse;
  });
  if (copie) {
    event.waitUntil(reseau.catch(() => undefined));
    return copie;
  }
  return reseau;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/studio") || url.pathname.startsWith("/api/") || url.searchParams.has("_rsc")) return;

  if (request.mode === "navigate") return event.respondWith(page(event));
  if (/^\/(_next\/static|icones|fonts)\//.test(url.pathname) || url.pathname.startsWith("/arriere-plan.")) {
    return event.respondWith(fichier(request));
  }
  if (url.pathname === "/_next/image") return event.respondWith(image(event));
});

// « Ma bibliothèque » : garder ou oublier un article (adresse /article/<slug> seulement)
self.addEventListener("message", (event) => {
  const { type, chemin } = event.data || {};
  if (typeof chemin !== "string" || !/^\/article\/[a-z0-9-]+$/.test(chemin)) return;
  if (type === "garder") event.waitUntil(garderPage(chemin, CACHE_BIBLIOTHEQUE).catch(() => undefined));
  if (type === "oublier") event.waitUntil(caches.open(CACHE_BIBLIOTHEQUE).then((c) => c.delete(cleDePage(chemin))));
});
