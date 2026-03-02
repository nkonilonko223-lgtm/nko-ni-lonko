import { client } from "../../../sanity/client";
import { urlFor } from "../../../sanity/image";
import ArticleClient from "../../components/ArticleClient";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortableTextBlock } from "@portabletext/types";

// ==============================================================================
// CONSTANTE GLOBALE (Sécurité SEO)
// ==============================================================================
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nkonilonko.com";

// ==============================================================================
// 1. TYPES UTILITAIRES
// ==============================================================================
interface SanityImage {
  _type: 'image';
  asset: { _ref: string; _type: 'reference'; };
  alt?: string;
  hotspot?: { x: number; y: number; height: number; width: number };
  crop?: { top: number; bottom: number; left: number; right: number };
}

interface SocialLink {
  _key: string;
  platform: string;
  url: string;
}

// ==============================================================================
// 2. DÉFINITIONS STRICTES (Architecture "Zero Trust")
// ==============================================================================
interface SanityArticleRaw {
  title: string;
  slug: string;
  mainImage: SanityImage | null;
  publishedAt: string;
  body: PortableTextBlock[]; 
  excerpt?: string;
  category?: string;
  categories?: { title: string }[];
  // 🚀 SYNCHRONISATION 1/1000 : Multi-Paternité et Données Scientifiques
  authors?: Array<{
    name: string;
    nameNko?: string;
    image?: SanityImage | null;
    bio?: PortableTextBlock[]; 
    role?: string;
    institution?: string;
    orcid?: string;
    expertise?: string[];
    socials?: SocialLink[];
  }>;
}

export interface SafeArticleData {
  title: string;
  slug: string;
  mainImageUrl: string | null;
  mainImageRaw: SanityImage | null; 
  publishedAt: string;
  body: PortableTextBlock[];
  excerpt: string;
  category: string;
  readingTime: number; 
  wordCount: number;
  // 🚀 NOUVEAU CONTRAT : Un tableau robuste d'auteurs
  authors: Array<{
    name: string;
    nameNko: string | null;
    imageUrl: string | null;
    bio: PortableTextBlock[] | null;
    role: string;
    institution: string | null;
    orcid: string | null;
    expertise: string[];
    socials: SocialLink[];
  }>; 
}

// ==============================================================================
// 3. FACTORY DE SÉCURITÉ & ANALYSEUR LEXICAL
// ==============================================================================
function safeUrlFor(source: SanityImage | null | undefined): string | null {
  if (!source) return null;
  try { return urlFor(source)?.url() || null; } 
  catch { return null; } 
}

function calculateReadingMetrics(blocks: PortableTextBlock[]): { wordCount: number; readingTime: number } {
  if (!blocks || blocks.length === 0) return { wordCount: 0, readingTime: 1 };
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const textString = blocks.map((block: any) => {
    if (block._type !== 'block' || !block.children) return '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return block.children.map((child: any) => child.text).join('');
  }).join(' ');

  const wordCount = textString.split(/\s+/).filter(word => word.length > 0).length;
  const readingTime = Math.ceil(wordCount / 150) || 1; 

  return { wordCount, readingTime };
}

function transformSafeArticle(raw: SanityArticleRaw): SafeArticleData {
  if (!raw) throw new Error("Données article manquantes");

  // 🚀 SÉCURITÉ : Mapping du tableau d'auteurs
  const safeAuthors = (raw.authors || []).map(author => ({
    name: author.name || "N'Ko ni Lonko",
    nameNko: author.nameNko || null,
    imageUrl: safeUrlFor(author.image),
    bio: author.bio || null,
    role: author.role || "ߛߓߍߦߟߊ | Chercheur",
    institution: author.institution || null,
    orcid: author.orcid || null,
    expertise: author.expertise || [],
    socials: author.socials || []
  }));

  const category = raw.category || (raw.categories && raw.categories[0]?.title) || "ߟߐ߲ߞߏ | Science";
  const metrics = calculateReadingMetrics(raw.body || []);

  return {
    title: raw.title || "ߛߊ߲߬ߕߊ߫ ߕߍ߫ | Sans titre",
    slug: raw.slug, 
    mainImageUrl: safeUrlFor(raw.mainImage),
    mainImageRaw: raw.mainImage || null,
    publishedAt: raw.publishedAt || new Date().toISOString(),
    body: raw.body || [],
    excerpt: raw.excerpt || "",
    category: category,
    readingTime: metrics.readingTime,
    wordCount: metrics.wordCount,
    authors: safeAuthors
  };
}

// ==============================================================================
// 4. RÉCUPÉRATION & PRÉ-GÉNÉRATION STATIQUE
// ==============================================================================
export async function generateStaticParams() {
  const query = `*[_type == "article"]{ "slug": slug.current }`;
  try {
    const slugs = await client.fetch<{slug: string}[]>(query);
    return slugs.map((article) => ({
      slug: article.slug,
    }));
  } catch (error) {
    console.error("Erreur generateStaticParams:", error);
    return [];
  }
}

async function getArticle(slug: string): Promise<SafeArticleData | null> {
  // 🚀 REQUÊTE 1/1000 : On télécharge le tableau complet des auteurs et leurs données scientifiques
  const query = `*[_type == "article" && slug.current == $slug][0] {
    title,
    mainImage,
    publishedAt,
    body,
    excerpt,
    category,
    categories[]->{title},
    "slug": slug.current,
    authors[]->{
      name, nameNko, image, bio, role, institution, orcid, expertise, socials
    }
  }`;
  
  try {
    const rawArticle = await client.fetch<SanityArticleRaw>(
      query, 
      { slug }, 
      { next: { tags: ["article", `article-${slug}`], revalidate: 3600 } }
    );
    if (!rawArticle) return null;
    return transformSafeArticle(rawArticle);
  } catch (error) {
    console.error("Erreur Fetch Article:", error);
    return null;
  }
}

// ==============================================================================
// 5. MÉTADONNÉES (SEO World Class & Google Scholar)
// ==============================================================================
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) return { title: "ߞߎߡߘߊ ߡߊ߫ ߛߐ߬ߘߐ߲߬ | Article introuvable" };

  const ogImage = article.mainImageUrl || `${SITE_URL}/images/og-default.jpg`;
  const articleUrl = `${SITE_URL}/article/${slug}`;
  
  const siteLanguages = {
    'nqo': articleUrl,
    'fr-FR': articleUrl
  } as Record<string, string>;

  const dynamicKeywords = [
    "ߒߞߏ", "N'Ko", "ߟߐ߲ߞߏ", "Science", "Afrique", "Mali", "Recherche",
    article.category,
    ...(article.title ? article.title.split(' ').filter(w => w.length > 4) : []),
    ...(article.authors.flatMap(a => a.expertise)) // Ajout de l'expertise aux mots-clés SEO
  ];

  return {
    title: `${article.title} | ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ`,
    description: article.excerpt || "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ | Publication Scientifique.",
    metadataBase: new URL(SITE_URL), 
    alternates: {
      canonical: articleUrl,
      languages: siteLanguages 
    },
    keywords: dynamicKeywords, 
    robots: { 
      index: true, 
      follow: true,
      googleBot: {
        index: true, follow: true,
        'max-image-preview': 'large', 
        'max-snippet': -1,
      },
    },
    // 🚀 LE BOUCLIER GOOGLE SCHOLAR (Highwire Press Tags)
    other: {
      "citation_title": article.title,
      "citation_publication_date": new Date(article.publishedAt).getFullYear().toString(),
      "citation_journal_title": "N'Ko ni Lonko",
      "citation_language": "nqo",
      "citation_author": article.authors.map(a => a.name), // Génère une balise par auteur
    },
    openGraph: {
      title: article.title,
      description: article.excerpt || "Science et Savoir en N'Ko | ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ",
      url: articleUrl,
      siteName: "N'Ko ni Lonko",
      images: [{ url: ogImage, width: 1200, height: 630, alt: article.title }],
      locale: "nqo", 
      alternateLocale: "fr_FR", 
      type: "article",
      publishedTime: article.publishedAt,
      authors: article.authors.map(a => a.name), 
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: [ogImage],
    },
  };
}

// ==============================================================================
// 6. LA PAGE (Point d'Entrée Serveur)
// ==============================================================================
export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) return notFound(); 

  // 🚀 JSON-LD MULTI-AUTEURS (Indexation Google parfaite)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    "@id": `${SITE_URL}/article/${slug}#article`,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${SITE_URL}/article/${slug}`
    },
    "inLanguage": "nqo",
    "headline": article.title,
    "wordCount": article.wordCount, 
    "timeRequired": `PT${article.readingTime}M`, 
    "image": [
      article.mainImageUrl || `${SITE_URL}/icon-512x512.png` 
    ],
    "datePublished": article.publishedAt,
    "dateModified": article.publishedAt,
    "author": article.authors.map(author => ({
      "@type": "Person",
      "name": author.name,
      "alternateName": author.nameNko || undefined,
      "jobTitle": author.role,
      "affiliation": author.institution ? {
        "@type": "Organization",
        "name": author.institution
      } : undefined,
      "url": author.orcid ? `https://orcid.org/${author.orcid}` : `${SITE_URL}/about`
    })),
    "publisher": {
      "@type": "Organization",
      "name": "N'Ko ni Lonko | ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ",
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/icon-512x512.png`
      }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Transmission du nouvel objet robuste vers le composant d'affichage */}
      <ArticleClient article={article} />
    </>
  );
}