import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nkonilonko.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/studio/', '/api/'], // 🛡️ Interdit à Google d'indexer l'API ou le panneau d'administration
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}