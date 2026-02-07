import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/private/', // Exemple de dossier caché
    },
    sitemap: 'https://nkonilonko.com/sitemap.xml', // On mettra ton vrai domaine plus tard
  };
}