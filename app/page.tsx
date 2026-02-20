import { client } from "../sanity/client";
import { urlFor } from "../sanity/image";
import HomeClient from "./components/HomeClient";
import { LanguageProvider } from "./components/LanguageProvider";
import { PortableTextBlock } from "@portabletext/types";
import { Metadata } from "next";

// ==============================================================================
// 1. DÉFINITIONS STRICTES
// ==============================================================================

interface SanityImageRaw {
  asset: {
    _ref: string;
  };
}

// Ce que Sanity renvoie (Brut)
interface SanityHomeArticleRaw {
  title: string;
  slug: { current: string };
  mainImage: SanityImageRaw;
  publishedAt: string;
  excerpt?: string; 
  body?: PortableTextBlock[]; 
  // ✅ CORRECTION : Adapté au schéma 'string' (plus de tableau d'objets)
  category?: string; 
  author?: {
    name: string;
    image?: SanityImageRaw;
  };
}

// Ce que le Client reçoit (Propre)
export interface SafeHomeArticle {
  title: string;
  slug: string;
  mainImageUrl: string | null;
  publishedAt: string;
  excerpt: string;
  category: string;
  authorName: string;
  authorImageUrl: string | null;
  body: PortableTextBlock[]; 
}

// ==============================================================================
// 2. SEO (Le détail Master Class)
// ==============================================================================
export const metadata: Metadata = {
  title: "N'Ko ni Lonko | Science et Savoir pour tous",
  description: "La première plateforme scientifique bilingue (Français / N'Ko). Astronomie, Biologie, Physique et Technologie accessibles à tous.",
  alternates: {
    canonical: 'https://nkonilonko.com',
  }
};

// ==============================================================================
// 3. FACTORY DE SÉCURITÉ
// ==============================================================================
function transformSafeHomeArticle(raw: SanityHomeArticleRaw): SafeHomeArticle {
  
  // ✅ CORRECTION : Récupération directe de la String
  const category = raw.category || "Science";

  // Gestion de l'extrait (Fallback intelligent)
  let excerptText = raw.excerpt || "";
  if (!excerptText && raw.body) {
    const firstBlock = raw.body.find(b => b._type === 'block' && b.children);
    if (firstBlock && firstBlock.children) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      excerptText = (firstBlock.children as any[]).map(c => c.text).join(" ").substring(0, 150) + "...";
    }
  }

  return {
    title: raw.title || "Sans titre",
    slug: raw.slug.current,
    mainImageUrl: raw.mainImage ? urlFor(raw.mainImage)?.url() || null : null,
    publishedAt: raw.publishedAt || new Date().toISOString(),
    excerpt: excerptText,
    category: category,
    authorName: raw.author?.name || "N'Ko ni Lonko",
    authorImageUrl: raw.author?.image ? urlFor(raw.author.image)?.url() || null : null,
    body: raw.body || []
  };
}

// ==============================================================================
// 4. RÉCUPÉRATION (ISR)
// ==============================================================================
async function getArticles(): Promise<SafeHomeArticle[]> {
  // ✅ CORRECTION GROQ : On demande 'category' (string) au lieu de 'categories[]->'
  const query = `*[_type == "article"] | order(publishedAt desc) {
    title,
    slug,
    mainImage,
    publishedAt,
    excerpt, 
    body,
    category,
    author->{
      name,
      image
    }
  }`;
  
  try {
    // Revalidation toutes les 60 secondes (ISR)
    const rawArticles = await client.fetch<SanityHomeArticleRaw[]>(query, {}, { next: { revalidate: 60 } });
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
    <LanguageProvider>
      <HomeClient articles={articles} />
    </LanguageProvider>
  );
}