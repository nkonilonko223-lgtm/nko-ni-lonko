import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.nkonilonko.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // 👑 Règle principale — tous les crawlers légitimes
      {
        userAgent: '*',
        allow: '/',
       disallow: ['/studio/', '/api/', '/_next/static/media/', '/favicon.ico'],
      },
      // 🛡️ Blocage IA : Ton contenu N'Ko t'appartient
      {
        userAgent: 'GPTBot',
        disallow: ['/'],
      },
      {
        userAgent: 'Google-Extended',
        disallow: ['/'],
      },
      {
        userAgent: 'CCBot',
        disallow: ['/'],
      },
      {
        userAgent: 'anthropic-ai',
        disallow: ['/'],
      },
      {
        userAgent: 'Claude-Web',
        disallow: ['/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}