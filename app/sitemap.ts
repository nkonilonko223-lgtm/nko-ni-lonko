import { MetadataRoute } from 'next';
// On pointe vers le vrai client Sanity de votre projet V1
import { client } from '../sanity/client';

// ✅ QUERY GROQ : Récupérer les slugs réels depuis Sanity
const ARTICLES_QUERY = `*[_type == "article" && defined(slug.current)] {
  "slug": slug.current,
  publishedAt
}`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // URL de production (à changer si vous avez un nom de domaine final différent)
  const baseUrl = 'https://nkonilonko.com';

  // 1. Récupérer les articles depuis la base de données (Sanity)
  // On utilise 'any' ici pour éviter les conflits de types stricts dans le sitemap
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const articles = await client.fetch<any[]>(ARTICLES_QUERY);

  // 2. Générer les liens dynamiques pour chaque article
  const postEntries = articles.map((article) => ({
    url: `${baseUrl}/article/${article.slug}`, // L'URL réelle de vos articles
    lastModified: article.publishedAt ? new Date(article.publishedAt) : new Date(),
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