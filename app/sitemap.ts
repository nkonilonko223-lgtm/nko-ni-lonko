import { MetadataRoute } from 'next';
import { client } from '../sanity/client';
import { getLiensNumeros } from './lib/numeros';
import { adresse } from './lib/langue';

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
      // Étiquette « article » : la sonnette Sanity (/api/revalidate) met aussi le plan du site à jour
      { next: { tags: ["article"], revalidate: 3600 } }
    );
  } catch (error) {
    console.error("🚨 [Sitemap] Échec de la récupération des articles Sanity :", error);
  }

  // 📖 Dictionnaire : une entrée par terme du lexique
  let termes: { slug: string }[] = [];
  try {
    termes = await client.fetch<{ slug: string }[]>(
      `*[_type == "terme" && defined(slug.current)]{ "slug": slug.current }`,
      {},
      { next: { tags: ["terme"], revalidate: 3600 } }
    );
  } catch (error) {
    console.error("🚨 [Sitemap] Échec de la récupération du lexique :", error);
  }
  const termeEntries: MetadataRoute.Sitemap = termes.map((t) => ({
    url: `${baseUrl}/lexique/${t.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  // 📚 Numéros de la revue (étiquette « numero », vidée par la sonnette)
  const numeroEntries: MetadataRoute.Sitemap = (await getLiensNumeros()).map((n) => ({
    url: `${baseUrl}/numeros/${n.slug}`,
    lastModified: n.publishedAt ? new Date(n.publishedAt) : undefined,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // ==============================================================================
  // 3. GÉNÉRATION DES ROUTES AVEC IMAGES
  // ==============================================================================
  const postEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${baseUrl}/article/${article.slug}`,
    lastModified: article.publishedAt ? new Date(article.publishedAt) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
    // 👑 Google Images — chaque article expose son image
    ...(article.mainImageUrl && {
      images: [
        article.mainImageUrl
      ]
    }),
  }));

  const pages: MetadataRoute.Sitemap = [
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
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.6,
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
    {
      url: `${baseUrl}/numeros`,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    ...numeroEntries,
    ...postEntries,
    {
      url: `${baseUrl}/lexique`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    ...termeEntries,
  ];

  // Langue dans l'adresse (B6, 22 octobre 2026) : chaque page en N'Ko (adresse sans préfixe)
  // et en français (/fr), reliées entre elles (hreflang) pour que Google montre la bonne version
  return pages.flatMap((page) => {
    const chemin = page.url.slice(baseUrl.length) || "/";
    const languages = { nqo: adresse("nqo", chemin), fr: adresse("fr", chemin), "x-default": adresse("nqo", chemin) };
    return [
      { ...page, url: languages.nqo, alternates: { languages } },
      { ...page, url: languages.fr, alternates: { languages } },
    ];
  });
}