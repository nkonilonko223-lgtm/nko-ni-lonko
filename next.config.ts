import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

// =========================================================
// CONFIGURATION PWA (SERWIST)
// =========================================================
const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  // 🛡️ CRITIQUE : Le Fallback Explicite (Empêche la page '/' de disparaître)
  additionalPrecacheEntries: [{ url: "/offline", revision: null }],
});

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
          // 🛡️ NOUVEAU BOUCLIER 2 : Protection anti-injections
         {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // 🛡️ NOUVEAU BOUCLIER 3 : Désactive les capteurs inutiles
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
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

export default withSerwist(nextConfig);