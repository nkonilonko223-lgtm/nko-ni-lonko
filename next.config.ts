import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // =========================================================
  // 1. OPTIMISATION DES IMAGES (Performance Afrique)
  // =========================================================
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // =========================================================
  // 2. COMPILATEUR
  // =========================================================
  compiler: {
    styledComponents: true,
  },

  // =========================================================
  // 3. BUILD
  // =========================================================
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // =========================================================
  // 4. SÉCURITÉ
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
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
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
  // 6. CONFIGURATION TURBOPACK (Laissez-passer)
  // =========================================================
  turbopack: {},
}; // <-- C'est cette accolade finale qui manquait !

export default nextConfig;