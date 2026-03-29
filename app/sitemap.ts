import { MetadataRoute } from 'next';
import { client } from '../sanity/client';

// ==============================================================================
// 1. TYPAGE STRICT (Dogme 2 : Zéro Any)
// ==============================================================================
interface SitemapArticle {
  slug: string;
  publishedAt: string | null;
  title: string;
  mainImageUrl: string | null;
  excerpt: string | null;
}

// 👑 N'Ko is King : GROQ enrichi avec image et titre
const ARTICLES_QUERY = `*[_type == "article" && defined(slug.current)] {
  "slug": slug.current,
  publishedAt,
  title,
  excerpt,
  "mainImageUrl": mainImage.asset->url
}`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nkonilonko.com';

  // ==============================================================================
  // 2. FETCH DYNAMIQUE
  // ==============================================================================
  let articles: SitemapArticle[] = [];
  try {
    articles = await client.fetch<SitemapArticle[]>(
      ARTICLES_QUERY,
      {},
      { next: { revalidate: 3600 } }
    );
  } catch (error) {
    console.error("🚨 [Sitemap] Échec de la récupération des articles Sanity :", error);
  }

  // ==============================================================================
  // 3. GÉNÉRATION DES ROUTES AVEC IMAGES
  // ==============================================================================
  const postEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${baseUrl}/article/${article.slug}`,
    lastModified: article.publishedAt ? new Date(article.publishedAt) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
    // 👑 Google Images — chaque article expose son image
    ...(article.mainImageUrl && !article.mainImageUrl.includes('.heif') && {
      images: [
        `${article.mainImageUrl}?fm=jpg&q=80`
      ]
    }),
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    ...postEntries,
  ];
}