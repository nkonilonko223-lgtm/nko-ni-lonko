import { MetadataRoute } from 'next';
import { getSortedPostsData } from './lib/posts'; // Ton gestionnaire d'articles

export default function sitemap(): MetadataRoute.Sitemap {
  // 1. Récupérer tous les articles
  const posts = getSortedPostsData();
  const baseUrl = 'https://nkonilonko.com'; // ⚠️ Change ceci par ton VRAI lien Vercel une fois déployé

  // 2. Créer les entrées pour chaque article
  const postEntries = posts.map((post) => ({
    url: `${baseUrl}/posts/${post.id}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // 3. Ajouter les pages statiques (Accueil, À propos, Contact)
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.8,
    },
    ...postEntries,
  ];
}