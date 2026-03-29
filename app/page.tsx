import { client } from "../sanity/client";
import { urlFor } from "../sanity/image";
import HomeClient from "./components/HomeClient";
import { Metadata } from "next";

// ==============================================================================
// CONSTANTE GLOBALE (Sécurité SEO)
// ==============================================================================
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nkonilonko.com";

// ==============================================================================
// 1. DÉFINITIONS STRICTES (Zéro "any")
// ==============================================================================
interface SanityImageRaw {
  asset: {
    _ref: string;
  };
}

interface SanityHomeArticleRaw {
  title: string;
  slug: { current: string };
  mainImage: SanityImageRaw;
  publishedAt: string;
  excerpt: string; 
  wordCount?: number;
  category?: string; 
  // 🚀 SYNCHRONISATION 1/1000 : On attend un tableau d'auteurs (Multi-Paternité)
  authors?: Array<{
    name: string;
    nameNko?: string;
    image?: SanityImageRaw;
  }>;
}

export interface SafeHomeArticle {
  title: string;
  slug: string;
  mainImageUrl: string | null;
  publishedAt: string;
  excerpt: string;
  category: string;
  authorName: string;
  authorNameNko: string | null;
  authorImageUrl: string | null;
  readingTime: number; 
  // 🚀 OPTIMISATION : Propriété 'body' supprimée car inutile pour la page d'accueil (gain de RAM)
}

// ==============================================================================
// 2. SEO (Armure Globale de la Page d'Accueil - MISE À JOUR 1/1000)
// ==============================================================================
export const metadata: Metadata = {
  // Titre Hybride : N'Ko souverain
  title: "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ | N'Ko ni Lonko",
  
  // Description Hybride : N'Ko + Français pour Google
  description: "ߓߟߐߟߐ ߝߏߟߏ߲ߝߊߟߊ߲ ߝߟߐߘߎߢߊ ߘߎߢߊ ߟߐߞߏ ߞߊ߲ ߝߌߟߡߊ ߟߊߛߋߟߌ ߞߊߡߊ߬. La première plateforme scientifique mondiale bilingue (N'Ko / Français).",
  
  alternates: {
    canonical: SITE_URL,
    // 🚀 FIX VS CODE : On force TypeScript à accepter 'nqo'
    languages: {
      'nqo': SITE_URL,
      'fr': SITE_URL,
      'x-default': SITE_URL,
    } as Record<string, string>,
  },

  // 🚀 AJOUT WORLD CLASS : Open Graph pour des partages WhatsApp/Twitter parfaits
  openGraph: {
    title: "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ | N'Ko ni Lonko",
    description: "ߖߊ߯ߓߊ ߟߐ߲ߞߏ ߣߌ߫ ߟߐ߲ߠߌ߲ ߢߌߣߌ߲߫ ߒߞߏ ߘߐ߫. Science et Savoir pour tous.",
    url: SITE_URL,
    siteName: "N'Ko ni Lonko",
    locale: "nqo",
    alternateLocale: ["fr_FR"],
    images: [
      {
        url: "/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "Sceau N'Ko ni Lonko",
      },
    ],
    type: "website",
  },
};

// ==============================================================================
// 3. FACTORY DE SÉCURITÉ (Bouclier Anti-Crash)
// ==============================================================================
function transformSafeHomeArticle(raw: SanityHomeArticleRaw): SafeHomeArticle {
  
  const category = raw.category || "ߟߐ߲ߞߏ | Science";
  
  // 👑 Vrais mots — méthode identique à article/[slug]/page.tsx
  const calculatedReadingTime = Math.max(1, Math.ceil((raw.wordCount || 0) / 200));

  // 🚀 LOGIQUE MULTI-AUTEURS : On cible le premier auteur pour l'affichage de la carte
  const primaryAuthor = raw.authors?.[0];

  return {
    title: raw.title || "ߛߊ߲߬ߕߊ߫ ߕߍ߫ | Sans titre",
    slug: raw.slug.current,
    mainImageUrl: raw.mainImage ? urlFor(raw.mainImage)?.url() || null : null,
    publishedAt: raw.publishedAt || new Date().toISOString(),
    excerpt: raw.excerpt || "", 
    category: category,
    authorName: primaryAuthor?.name || "N'Ko ni Lonko",
    authorNameNko: primaryAuthor?.nameNko || "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ",
    authorImageUrl: primaryAuthor?.image ? urlFor(primaryAuthor.image)?.url() || null : null,
    readingTime: calculatedReadingTime,
  };
}

// ==============================================================================
// 4. RÉCUPÉRATION (Edge Computing & Hybrid Cache)
// ==============================================================================
async function getArticles(): Promise<SafeHomeArticle[]> {
  // 🚀 REQUÊTE GROQ 1/1000 : Extraction optimisée avec "authors[]->"
  const query = `*[_type == "article"] | order(publishedAt desc) {
    title,
    slug,
    mainImage,
    publishedAt,
    "excerpt": coalesce(excerpt, pt::text(body)[0..150] + "..."), 
    "wordCount": length(string::split(pt::text(body), " ")),
    category,
    authors[]->{
      name,
      nameNko,
      image
    }
  }`;
  
  try {
    const rawArticles = await client.fetch<SanityHomeArticleRaw[]>(
      query, 
      {}, 
      { next: { tags: ["article", "home-articles"], revalidate: 3600 } }
    );
    return rawArticles.map(transformSafeHomeArticle);
  } catch (error) {
    console.error("Erreur Fetch Home:", error);
    return [];
  }
}

// ==============================================================================
// 5. LA PAGE (Server Component)
// ==============================================================================
export default async function Home() {
  const articles = await getArticles();

  return (
    <HomeClient articles={articles} />
  );
}
