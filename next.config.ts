import type { NextConfig } from "next";

// Lecture hors ligne : service worker écrit à la main (public/sw.js, docs/HORS-LIGNE.md).
// Serwist, qui ne fonctionne pas avec Turbopack, a été retiré (Lot 2).

const nextConfig: NextConfig = {
  // =========================================================
  // 1. OPTIMISATION DES IMAGES (Performance & World Class)
  // =========================================================
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
      // 🚀 NOUVEAU : Autorisation stricte pour les miniatures YouTube
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
    ],
formats: ['image/avif', 'image/webp'],
qualities: [60, 75, 90],
// 🚀 AMÉLIORATION 1/1000 : Mise en cache agressive (30 jours)
minimumCacheTTL: 2592000,
  },

  // =========================================================
  // 2. COMPILATEUR
  // =========================================================
  compiler: {
    styledComponents: true,
  },

  // =========================================================
  // 3. BUILD (DOGME 2 : ZÉRO BUG)
  // =========================================================
  
  typescript: {
    // 🚨 CORRECTION 1/1000 : On ne ferme plus les yeux sur les erreurs de typage.
    ignoreBuildErrors: false, 
  },
  
  // =========================================================
  // 4. SÉCURITÉ (Bouclier & Compatibilité Studio)
  // =========================================================
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            // 🚀 CORRECTION : SAMEORIGIN permet à l'aperçu Sanity de fonctionner
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // 🛡️ NOUVEAU BOUCLIER 1 : Force le HTTPS strict (HSTS)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // 🛡️ NOUVEAU BOUCLIER 2 : ancien filtre anti-injections des navigateurs, retiré partout et
          // lui-même source de failles : « 0 » le désactive (recommandation OWASP, 22 octobre 2026).
          // La vraie protection est la CSP (proxy.ts).
         {
            key: 'X-XSS-Protection',
            value: '0',
          },
          // 🛡️ NOUVEAU BOUCLIER 3 : Désactive les capteurs inutiles
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
        ],
      },
      {
        // 🛡️ BOUCLIER 4 (22 octobre 2026) : une page ouverte par un autre site ne peut plus agir
        // sur la nôtre (window.opener). « allow-popups » : les fenêtres que NOUS ouvrons (partage
        // X, WhatsApp…) gardent leur lien. Pas sur le Studio, qui a ses propres fenêtres de connexion.
        source: '/((?!studio).*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
  },

  // =========================================================
  // 5. INJECTION DE REACT (Solution globale)
  // =========================================================
  webpack: (config) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const webpack = require('next/dist/compiled/webpack/webpack-lib');
    config.plugins.push(
      new webpack.ProvidePlugin({
        React: 'react',
      })
    );
    return config;
  },

  // =========================================================
  // 6. CONFIGURATION TURBOPACK
  // =========================================================
  turbopack: {},
};

export default nextConfig;