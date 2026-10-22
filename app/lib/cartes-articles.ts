// ============================================================================
// N'KO NI LONKO — Cartes d'articles (accueil, pages des disciplines et des rubriques)
// ============================================================================
// Déplacé de app/[lang]/page.tsx le 23 octobre 2026 (mêmes lignes) pour servir à plusieurs
// pages. Serveur uniquement : lit Sanity (version publiée, ou brouillons en mode aperçu).
// ============================================================================

import { client } from "../../sanity/client";
import { getSanityClient } from "../../sanity/fetch";
import { urlFor } from "../../sanity/image";
import { positionDuCadrage } from "./point-interet";

// ==============================================================================
// 1. DÉFINITIONS STRICTES (Zéro "any")
// ==============================================================================
interface SanityImageRaw {
  asset: {
    _ref: string;
  };
  alt?: string; // texte alternatif de la couverture (Studio)
  hotspot?: { x?: number; y?: number }; // point d'intérêt du Studio (cadrage)
}

export interface SanityHomeArticleRaw {
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
  mainImageAlt: string | null; // texte alternatif de la couverture (sinon le titre)
  mainImagePosition: string | null; // cadrage sur le point d'intérêt du Studio
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
// 3. FACTORY DE SÉCURITÉ (Bouclier Anti-Crash)
// ==============================================================================
export function transformSafeHomeArticle(raw: SanityHomeArticleRaw): SafeHomeArticle {
  
  const category = raw.category || "ߟߐ߲ߞߏ | Science";
  
  // 👑 Vrais mots — méthode identique à article/[slug]/page.tsx
  const calculatedReadingTime = Math.max(1, Math.ceil((raw.wordCount || 0) / 200));

  // 🚀 LOGIQUE MULTI-AUTEURS : On cible le premier auteur pour l'affichage de la carte
  const primaryAuthor = raw.authors?.[0];

  return {
    title: raw.title || "ߛߊ߲߬ߕߊ߫ ߕߍ߫ | Sans titre",
    slug: raw.slug.current,
    mainImageUrl: raw.mainImage ? urlFor(raw.mainImage)?.url() || null : null,
    mainImageAlt: raw.mainImage?.alt?.trim() || null,
    mainImagePosition: positionDuCadrage(raw.mainImage?.hotspot) || null,
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
// Champs d'une carte (aussi pour les articles d'une rubrique, app/lib/rubriques.ts)
export const PROJECTION_CARTE = `{
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

// Tous les articles (accueil) ou ceux d'une discipline (valeurs Sanity : app/lib/categories.ts)
export async function getArticlesCartes(valeursCategorie?: string[]): Promise<SafeHomeArticle[]> {
  // 🚀 REQUÊTE GROQ 1/1000 : Extraction optimisée avec "authors[]->"
  const filtre = valeursCategorie ? " && category in $valeurs" : "";
  const query = `*[_type == "article"${filtre}] | order(publishedAt desc) ${PROJECTION_CARTE}`;

  try {
    // Mode aperçu (Studio) : brouillons inclus, sans cache ; sinon : version publiée
    const { client: sanity, apercu } = await getSanityClient();
    const rawArticles = await sanity.fetch<SanityHomeArticleRaw[]>(
      query,
      { valeurs: valeursCategorie ?? [] },
      apercu ? { cache: "no-store" } : { next: { tags: ["article", "home-articles"], revalidate: 3600 } }
    );
    return rawArticles.map(transformSafeHomeArticle);
  } catch (error) {
    console.error("Erreur Fetch Home:", error);
    return [];
  }
}

// Valeurs de catégorie des articles publiés : une discipline n'a de page que si elle a des articles
// (pages construites à l'avance et plan du site ; étiquette « article », vidée par la sonnette)
export async function getValeursCategories(): Promise<string[]> {
  try {
    return await client.fetch<string[]>(
      `array::unique(*[_type == "article" && defined(category)].category)`,
      {},
      { next: { tags: ["article"], revalidate: 3600 } }
    );
  } catch {
    return [];
  }
}
