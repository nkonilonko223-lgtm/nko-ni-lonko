/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig, RuntimeCaching } from "serwist";
import { Serwist, CacheFirst, StaleWhileRevalidate, ExpirationPlugin } from "serwist";

// ==============================================================================
// 1. DÉCLARATION DU PÉRIMÈTRE
// ==============================================================================
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// ==============================================================================
// 2. NOS STRATÉGIES "WORLD CLASS" POUR L'AFRIQUE
// ==============================================================================
const customCaching: RuntimeCaching[] = [
  {
    matcher: ({ request, url }) => request.destination === 'font' || url.pathname.endsWith('.woff2') || url.pathname.endsWith('.woff'),
    handler: new CacheFirst({
      cacheName: 'nko-souverain-fonts',
      plugins: [
        new ExpirationPlugin({
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365,
        }),
      ],
    }),
  },
  {
    matcher: ({ url }) => url.hostname === 'cdn.sanity.io',
    handler: new StaleWhileRevalidate({
      cacheName: 'nko-sanity-images',
      plugins: [
        new ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 30,
          purgeOnQuotaError: true,
        }),
      ],
    }),
  }
];

// ==============================================================================
// 3. LE MOTEUR SERWIST
// ==============================================================================
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [...customCaching, ...defaultCache],
  
  // 🦖 LA PAGE ANTI-DINOSAURE (Sécurisée)
  fallbacks: {
    entries: [
      {
        url: "/offline", // 🛡️ CRITIQUE : L'adresse stricte (sans tilde)
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();