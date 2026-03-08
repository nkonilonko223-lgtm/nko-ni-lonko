import { MetadataRoute } from 'next';
import { client } from '../sanity/client';

// ==============================================================================
// 1. TYPAGE STRICT (Dogme 2 : Zéro Any)
// ==============================================================================
interface SitemapArticle {
  slug: string;
  publishedAt: string | null;
}

// ✅ QUERY GROQ : Récupérer les slugs réels
const ARTICLES_QUERY = `*[_type == "article" && defined(slug.current)] {
  "slug": slug.current,
  publishedAt
}`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nkonilonko.com';

  // ==============================================================================
  // 2. FETCH DYNAMIQUE (Détruit le cache pour forcer Google à voir les nouveautés)
  // ==============================================================================
  let articles: SitemapArticle[] = [];
  try {
    articles = await client.fetch<SitemapArticle[]>(
      ARTICLES_QUERY,
      {}, // Pas de paramètres
      { next: { revalidate: 3600 } } // Rafraîchit le sitemap toutes les heures
    );
  } catch (error) {
    console.error("🚨 [Sitemap] Échec de la récupération des articles Sanity :", error);
  }

  // ==============================================================================
  // 3. GÉNÉRATION DES ROUTES
  // ==============================================================================
  const postEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${baseUrl}/article/${article.slug}`, 
    lastModified: article.publishedAt ? new Date(article.publishedAt) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`, // Ajouté pour être conforme au RGPD
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`, // Ajouté pour les CGU
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    ...postEntries,
  ];
}