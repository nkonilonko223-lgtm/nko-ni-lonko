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
// 4. SÉCURITÉ (Bouclier & Compatibilité Studio + Turnstile)
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
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        // 🚀 NOUVEAU : CSP pour Cloudflare Turnstile + Newsletter
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com",
            "style-src 'self' 'unsafe-inline'",
            "font-src 'self' data:",
            "img-src 'self' data: https: blob:",
            "connect-src 'self' https://challenges.cloudflare.com https://*.nkonilonko.com",
            "frame-src 'self' https://challenges.cloudflare.com",
            "worker-src 'self' blob:"
          ].join('; ')
        }
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