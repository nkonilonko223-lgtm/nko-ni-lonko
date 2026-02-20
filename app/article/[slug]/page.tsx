import { client } from "../../../sanity/client";
import { urlFor } from "../../../sanity/image";
import ArticleClient from "../../components/ArticleClient";
import { LanguageProvider } from "../../components/LanguageProvider";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortableTextBlock } from "@portabletext/types";

// ==============================================================================
// 1. TYPES UTILITAIRES (Pour tuer les 'any')
// ==============================================================================

// Structure standard d'une image Sanity
interface SanityImage {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
  alt?: string;
  hotspot?: { x: number; y: number; height: number; width: number };
  crop?: { top: number; bottom: number; left: number; right: number };
}

// Structure d'un lien social (selon votre schéma Sanity probable)
interface SocialLink {
  _key: string;
  platform: string;
  url: string;
}

// ==============================================================================
// 2. DÉFINITIONS STRICTES (Architecture "Zero Trust")
// ==============================================================================

// Données brutes (Raw) venant de Sanity
interface SanityArticleRaw {
  title: string;
  slug: string;
  // ✅ CORRECTION : Typage strict de l'image
  mainImage: SanityImage | null;
  publishedAt: string;
  body: PortableTextBlock[]; 
  excerpt?: string;
  category?: string;
  categories?: { title: string }[];
  author?: {
    name: string;
    nameNko?: string;
    // ✅ CORRECTION : Typage strict de l'image auteur
    image?: SanityImage | null;
    bio?: PortableTextBlock[]; 
    role?: string;
    // ✅ CORRECTION : Typage strict des réseaux sociaux
    socials?: SocialLink[];
  };
}

// Données sécurisées (Safe) pour le Client
export interface SafeArticleData {
  title: string;
  slug: string;
  mainImageUrl: string | null;
  // ✅ CORRECTION : On garde la référence typée
  mainImageRaw: SanityImage | null; 
  publishedAt: string;
  body: PortableTextBlock[];
  excerpt: string;
  category: string;
  author: {
    name: string;
    nameNko: string | null;
    imageUrl: string | null;
    bio: PortableTextBlock[] | null;
    role: string;
    // ✅ CORRECTION : Tableau typé
    socials: SocialLink[];
  } | null; 
}

// ==============================================================================
// 3. FACTORY DE SÉCURITÉ (Le Sas de Décontamination)
// ==============================================================================
function transformSafeArticle(raw: SanityArticleRaw): SafeArticleData {
  if (!raw) throw new Error("Données article manquantes");

  // 🛡️ Logique Auteur
  let safeAuthor = null;
  if (raw.author && raw.author.name) {
    safeAuthor = {
      name: raw.author.name,
      nameNko: raw.author.nameNko || null,
      imageUrl: raw.author.image ? urlFor(raw.author.image)?.url() || null : null,
      bio: raw.author.bio || null,
      role: raw.author.role || "Contributeur",
      socials: raw.author.socials || []
    };
  }

  // Logique Catégorie
  const category = raw.category || (raw.categories && raw.categories[0]?.title) || "Savoir";

  return {
    title: raw.title || "Sans titre",
    slug: raw.slug, 
    mainImageUrl: raw.mainImage ? urlFor(raw.mainImage)?.url() || null : null,
    mainImageRaw: raw.mainImage || null,
    publishedAt: raw.publishedAt || new Date().toISOString(),
    body: raw.body || [],
    excerpt: raw.excerpt || "",
    category: category,
    author: safeAuthor
  };
}

// ==============================================================================
// 4. RÉCUPÉRATION (Fetching & Transformation)
// ==============================================================================
async function getArticle(slug: string): Promise<SafeArticleData | null> {
  const query = `*[_type == "article" && slug.current == $slug][0] {
    title,
    mainImage,
    publishedAt,
    body,
    excerpt,
    category,
    categories[]->{title},
    "slug": slug.current,
    author->{
      name,
      nameNko,
      image,
      bio,
      role,
      socials
    }
  }`;
  
  try {
    const rawArticle = await client.fetch<SanityArticleRaw>(query, { slug }, { next: { revalidate: 60 } });
    if (!rawArticle) return null;
    return transformSafeArticle(rawArticle);
  } catch (error) {
    console.error("Erreur Fetch Article:", error);
    return null;
  }
}

// ==============================================================================
// 5. MÉTADONNÉES (SEO World Class)
// ==============================================================================
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return { title: "Article introuvable | N'Ko ni Lonko" };
  }

  const ogImage = article.mainImageUrl || "https://nkonilonko.com/images/og-default.jpg";

  return {
    title: article.title,
    description: article.excerpt || "Une exploration scientifique et culturelle sur la plateforme N'Ko ni Lonko.",
    metadataBase: new URL('https://nkonilonko.com'), 
    alternates: {
      canonical: `/article/${slug}`, 
    },
    keywords: [
        "Science", "Afrique", "Mali", "N'Ko", "Technologie", "Culture", 
        "Savoir", "Innovation", "Éducation", article.category
    ], 
    openGraph: {
      title: article.title,
      description: article.excerpt || "Science et Savoir en N'Ko.",
      url: `/article/${slug}`,
      siteName: "N'Ko ni Lonko",
      images: [{ url: ogImage, width: 1200, height: 630, alt: article.title }],
      locale: "fr_FR",
      type: "article",
      publishedTime: article.publishedAt,
      authors: [article.author?.name || "N'Ko ni Lonko"],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: [ogImage],
    },
    robots: { index: true, follow: true, nocache: true },
  };
}

// ==============================================================================
// 6. LA PAGE (Point d'Entrée)
// ==============================================================================
export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return notFound(); 
  }

  // JSON-LD (Rich Snippets Google)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "image": article.mainImageUrl || "",
    "datePublished": article.publishedAt,
    "dateModified": article.publishedAt,
    "author": {
      "@type": "Person",
      "name": article.author?.name || "N'Ko ni Lonko",
      "jobTitle": article.author?.role
    },
    "publisher": {
      "@type": "Organization",
      "name": "N'Ko ni Lonko",
      "logo": {
        "@type": "ImageObject",
        "url": "https://nkonilonko.com/logo.png"
      }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LanguageProvider>
        <ArticleClient article={article} />
      </LanguageProvider>
    </>
  );
}