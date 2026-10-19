import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.nkonilonko.com';

// Robots d'entraînement d'IA : OpenAI, Google (Gemini), Common Crawl, Anthropic (nouveau et anciens
// noms), Apple, ByteDance, Meta, Cohere
const ROBOTS_ENTRAINEMENT_IA = [
  'GPTBot', 'Google-Extended', 'CCBot', 'ClaudeBot', 'anthropic-ai', 'Claude-Web',
  'Applebot-Extended', 'Bytespider', 'meta-externalagent', 'cohere-training-data-crawler',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // 👑 Règle principale — tous les crawlers légitimes
      {
        userAgent: '*',
        allow: '/',
       disallow: ['/studio/', '/api/', '/_next/static/media/', '/favicon.ico'],
      },
      // 🛡️ Blocage IA : Ton contenu N'Ko t'appartient. Seulement les robots qui collectent des textes
      // pour ENTRAÎNER des IA (noms à jour le 19 octobre 2026 ; anciens noms gardés) ; les moteurs de
      // recherche restent autorisés. Politique publique : Conditions d'utilisation, partie 10
      // (/terms#intelligence-artificielle) ; réserve lisible par les machines : /.well-known/tdmrep.json
      ...ROBOTS_ENTRAINEMENT_IA.map((userAgent) => ({ userAgent, disallow: ['/'] })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}