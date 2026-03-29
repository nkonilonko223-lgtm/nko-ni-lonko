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
  wordCount?: number;
  excerpt?: string;
  category?: string;
  categories?: { title: string }[];
  
 tags: string[];
  references: Array<{ title: string; url: string }>;
  authors?: Array<{
    name: string;
    nameNko?: string;
    image?: SanityImage | null;
    bio?: PortableTextBlock[] | string; 
    bioNko?: PortableTextBlock[] | string; // 🚀 FIX : Déclaration officielle de la Bio N'Ko
    role?: string;
    roleNko?: string;                      // 🚀 FIX : Déclaration officielle du Rôle N'Ko
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
  wordCount?: number;
  excerpt: string;
  category: string;
  readingTime: number; 
  tags: string[];
  references: Array<{ title: string; url: string }>;
 authors: Array<{
    name: string;
    nameNko: string | null;
    imageUrl: string | null;
    bio: PortableTextBlock[] | string | null;    // 🚀 FIX : La douane accepte désormais le texte simple (string)
    bioNko: PortableTextBlock[] | string | null; // 🚀 FIX : Idem pour le N'Ko
    role: string | null; 
    roleNko: string | null;
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


function transformSafeArticle(raw: SanityArticleRaw): SafeArticleData {
  if (!raw) throw new Error("Données article manquantes");

  const safeAuthors = (raw.authors || []).map(author => ({
    name: author.name || "N'Ko ni Lonko",
    nameNko: author.nameNko || null,
    imageUrl: safeUrlFor(author.image),
    bio: author.bio || null,
    bioNko: author.bioNko || null,     // 🚀 NOUVEAU : Transmission
    role: author.role || null, 
    roleNko: author.roleNko || null,   // 🚀 NOUVEAU : Transmission // 🚀 DESTRUCTION DU MOT "Chercheur" CODÉ EN DUR
    institution: author.institution || null,
    orcid: author.orcid || null,
    expertise: author.expertise || [],
    socials: author.socials || []
  }));

  const category = raw.category || (raw.categories && raw.categories[0]?.title) || "ߟߐ߲ߞߏ | Science";
 const groqWordCount = raw.wordCount || 0;
  const readingTime = Math.max(1, Math.ceil(groqWordCount / 200));

  return {
    title: raw.title || "ߛߊ߲߬ߕߊ߫ ߕߍ߫ | Sans titre",
    slug: raw.slug, 
    mainImageUrl: safeUrlFor(raw.mainImage),
    mainImageRaw: raw.mainImage || null,
    publishedAt: raw.publishedAt || new Date().toISOString(),
    body: raw.body || [],
    excerpt: raw.excerpt || "",
    category: category,
    readingTime: readingTime,
    wordCount: groqWordCount,
    tags: raw.tags || [],
    references: raw.references || [],
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
  // 🚀 REQUÊTE 1/1000 : Branchement du tuyau pour les references
 const query = `*[_type == "article" && slug.current == $slug][0] {
    title,
    mainImage,
    publishedAt,
    body,
    excerpt,
    category,
    tags,
    categories[]->{title},
    references[]{title, url},
    "wordCount": length(string::split(pt::text(body), " ")),
    "slug": slug.current,
    authors[]->{
      name, nameNko, image, bio, bioNko, role, roleNko, institution, orcid, expertise, socials
    }
  }`;
  try {
    const rawArticle = await client.fetch<SanityArticleRaw>(
      query, 
      { slug }, 
      // 🚀 DESTRUCTION DU CACHE : On force la lecture en temps réel (0 seconde)
      { next: { tags: ["article", `article-${slug}`], revalidate: 0 } }
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

  // 🚀 CORRECTION CRITIQUE : "let" au lieu de "const"
  let ogImage = article.mainImageUrl || `${SITE_URL}/og-accueil.jpg`;

  // 🛡️ LE BOUCLIER ANTI-TIMEOUT (Ingénierie 1/10000)
  if (ogImage.includes('cdn.sanity.io')) {
    ogImage = `${ogImage}?w=1200&h=630&fit=crop&fm=jpg&q=80`;
  }

  const articleUrl = `${SITE_URL}/article/${slug}`;

  const dynamicKeywords = [
    "ߒߞߏ", "N'Ko", "ߟߐ߲ߞߏ", "Science", "Afrique", "Mali", "Recherche",
    article.category,
    ...(article.title ? article.title.split(' ').filter(w => w.length > 4) : []),
    ...(article.authors.flatMap(a => a.expertise))
  ];

  // 👑 BILINGUISME ABSOLU : Si pas de résumé, N'Ko d'abord, Français ensuite.
  const metaDescription = article.excerpt || "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ ߦߋ߫ ߓߟߐߟߐ ߝߏߟߏ߲ߝߊߟߊ߲ ߝߟߐ߫ ߟߋ߬ ߘߌ߫. Découvrez cet article scientifique exclusif sur N'Ko ni Lonko.";

  return {
    // 👑 N'Ko is King : Titre SEO optionnel ou titre principal
    title: `${article.title} | ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ`,
    description: metaDescription,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: articleUrl,
      // 👑 hreflang complet avec x-default
      languages: {
        'nqo': articleUrl,
        'fr-FR': articleUrl,
        'x-default': articleUrl,
      } as Record<string, string>,
    },
    keywords: dynamicKeywords,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    // 👑 Google Scholar — N'Ko is King : langue nqo déclarée en priorité
    other: {
      "citation_title": article.title,
      "citation_publication_date": new Date(article.publishedAt).getFullYear().toString(),
      "citation_journal_title": "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ | N'Ko ni Lonko",
      "citation_language": "nqo",
      "citation_fulltext_world_readable": "",
      "citation_keywords": [
        ...article.tags,
        article.category,
      ].join("; "),
      // Un tag par auteur (standard Google Scholar multi-auteurs)
      ...Object.fromEntries(
        article.authors.map((a, i) => [`citation_author_${i}`, a.name])
      ),
      ...Object.fromEntries(
        article.authors
          .filter(a => a.orcid)
          .map((a, i) => [`citation_author_orcid_${i}`, `https://orcid.org/${a.orcid}`])
      ),
    },
    // 👑 Open Graph enrichi — N'Ko is King
    openGraph: {
      title: article.title,
      description: metaDescription,
      url: articleUrl,
      siteName: "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ | N'Ko ni Lonko",
      images: [{
        url: ogImage,
        width: 1200,
        height: 630,
        alt: article.title,
        type: "image/jpeg",
      }],
      // 👑 N'Ko is King : locale nqo en premier
      locale: "nqo",
      alternateLocale: "fr_FR",
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.publishedAt,
      authors: article.authors.map(a => a.name),
      // Section et tags pour Facebook/LinkedIn
      section: article.category,
      tags: article.tags,
    },
    // 👑 Twitter/X Cards enrichies
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: metaDescription,
      images: [{
        url: ogImage,
        alt: article.title,
      }],
      creator: "@nkonilonko",
      site: "@nkonilonko",
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

  // 👑 JSON-LD 1 : L'Article Scientifique (ScholarlyArticle)
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    "@id": `${SITE_URL}/article/${slug}#article`,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${SITE_URL}/article/${slug}`
    },
    // 👑 N'Ko is King : Bilingue, N'Ko d'abord
    "inLanguage": ["nqo", "fr"],
    "headline": article.title,
    "description": article.excerpt || "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ ߦߋ߫ ߓߟߐߟߐ ߝߏߟߏ߲ߝߊߟߊ߲ ߝߟߐ߫ ߟߋ߬ ߘߌ߫",
    "keywords": [
      // 👑 N'Ko is King : Mots-clés N'Ko en premier
      "ߒߞߏ", "ߟߐ߲ߞߏ", "ߝߘߊ߬ߝߌ߲߬ߠߊ",
      article.category,
      ...article.tags,
      ...article.authors.flatMap(a => a.expertise)
    ].filter(Boolean),
    "articleSection": article.category,
    "wordCount": article.wordCount,
    "timeRequired": `PT${article.readingTime}M`,
    "isAccessibleForFree": true,
    "image": {
      "@type": "ImageObject",
      "url": article.mainImageUrl || `${SITE_URL}/og-accueil.jpg`,
      "width": 1200,
      "height": 630,
      "representativeOfPage": true,
      "caption": article.title
    },
    "datePublished": article.publishedAt,
    "dateModified": article.publishedAt,
    // 👑 Auteurs avec réseaux sociaux — Google connaît chaque auteur
    "author": article.authors.map(author => ({
      "@type": "Person",
      // 👑 N'Ko is King : Nom N'Ko en alternateName prioritaire
      "name": author.name,
      "alternateName": author.nameNko || undefined,
      // 👑 N'Ko is King : Rôle N'Ko d'abord
      "jobTitle": author.roleNko || author.role || undefined,
      "affiliation": author.institution ? {
        "@type": "Organization",
        "name": author.institution
      } : undefined,
      "url": author.orcid 
        ? `https://orcid.org/${author.orcid}` 
        : `${SITE_URL}/about`,
      "identifier": author.orcid ? {
        "@type": "PropertyValue",
        "propertyID": "ORCID",
        "value": `https://orcid.org/${author.orcid}`
      } : undefined,
      // 👑 Réseaux sociaux auteur injectés dans Google
      "sameAs": author.socials
        .map(s => s.url)
        .filter(Boolean)
    })),
    "publisher": {
      "@type": "Organization",
      // 👑 N'Ko is King : Nom N'Ko d'abord
      "name": "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ | N'Ko ni Lonko",
      "@id": `${SITE_URL}/#organization`,
      "url": SITE_URL,
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/icon-512x512.png`,
        "width": 512,
        "height": 512
      },
      // 👑 Fondateur — Google fait le lien entre Moustapha et la plateforme
      "founder": {
        "@type": "Person",
        "name": "Moustapha CAMARA",
        "alternateName": "ߡߎ߬ߛߊߝߊ߬ ߞߊ߬ߡߙߊ߬",
        "url": SITE_URL,
        "sameAs": [
          "https://www.youtube.com/@nkonilonko",
          "https://www.tiktok.com/@nkonilonko223",
          "https://x.com/nkonilonko"
        ]
      }
    }
  };

  // 👑 JSON-LD 2 : Fil d'Ariane (BreadcrumbList) — Meilleur affichage Google
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        // 👑 N'Ko is King
        "name": "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ",
        "item": SITE_URL
      },
      {
        "@type": "ListItem",
        "position": 2,
        // 👑 Catégorie N'Ko
        "name": article.category,
        "item": `${SITE_URL}/?category=${encodeURIComponent(article.category)}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": article.title,
        "item": `${SITE_URL}/article/${slug}`
      }
    ]
  };
// 🚀 RADAR 1 : Vérifie si le serveur a bien la donnée avant de l'envoyer
  return (
    <>
     <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      
      {/* Transmission du nouvel objet robuste vers le composant d'affichage */}
      <ArticleClient article={article} />
    </>
  );
}