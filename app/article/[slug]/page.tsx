import { client } from "../../../sanity/client";
import { getSanityClient } from "../../../sanity/fetch";
import type { TermeLexiqueData } from "../../components/lexique/TermeLexique";
import { urlFor } from "../../../sanity/image";
import ArticleClient from "../../components/ArticleClient";
import CustomPortableText from "../../components/CustomPortableText";
import { Metadata } from "next";
import { carteSansMelange } from "../../lib/carte-partage";
import { notFound } from "next/navigation";
import { PortableTextBlock } from "@portabletext/types";
import { COMPTE_X, IMAGE_PARTAGE_ACCUEIL, URL_X } from "../../lib/partage";
import IMAGES_PARTAGE_ARTICLES from "../../lib/images-partage-articles.json";
import { PROJECTION_NUMERO_DE_L_ARTICLE, type NumeroDeLArticle, type RubriqueCourte } from "../../lib/numeros";
import { BandeauNumero, NavigationNumero, SurtitreRubrique } from "../../components/numero/ArticleNumero";
import { jsonLd } from "../../lib/jsonld";

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
  captionNko?: string; // légendes de la couverture (affichées sous l'image)
  caption?: string;
  source?: string; // crédit de la couverture (ex. NASA/SDO)
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
  updatedAt?: string; // dernière modification dans Sanity (_updatedAt)
  body: PortableTextBlock[];
  wordCount?: number;
  excerpt?: string;
  excerptFr?: string; // résumé français des cartes de partage (facultatif)
  category?: string;
  categories?: { title: string }[];
  
 tags: string[];
  references: Array<{ title: string; url: string }>;
  lexique?: TermeLexiqueData[];
  rubrique?: RubriqueCourte | null;
  numero?: NumeroDeLArticle | null;
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
  updatedAt: string; // date de dernière modification (Google : dateModified)
  body: PortableTextBlock[];
  wordCount?: number;
  excerpt: string;
  excerptFr: string | null;
  category: string;
  readingTime: number; 
  tags: string[];
  references: Array<{ title: string; url: string }>;
  lexique: TermeLexiqueData[];
  rubrique: RubriqueCourte | null;
  numero: NumeroDeLArticle | null;
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
    // Jamais avant la publication (un brouillon modifié avant sa date de publication)
    updatedAt: raw.updatedAt && raw.publishedAt && raw.updatedAt > raw.publishedAt ? raw.updatedAt : raw.publishedAt || new Date().toISOString(),
    body: raw.body || [],
    excerpt: raw.excerpt || "",
    excerptFr: raw.excerptFr?.trim() || null,
    category: category,
    readingTime: readingTime,
    wordCount: groqWordCount,
    tags: raw.tags || [],
    references: raw.references || [],
    lexique: raw.lexique || [],
    rubrique: raw.rubrique || null,
    numero: raw.numero || null,
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
    "updatedAt": _updatedAt,
    "body": body[]{
      ...,
      markDefs[]{
        ...,
        _type == "termeLexique" => { "terme": terme->{ termeNko, termeFr, definitionNko, definitionFr, "slug": slug.current } }
      }
    },
    "lexique": *[_type == "terme" && _id in array::compact(^.body[].markDefs[].terme._ref)] | order(termeFr asc) {
      termeNko, termeFr, definitionNko, definitionFr, "slug": slug.current
    },
    excerpt,
    excerptFr,
    category,
    "rubrique": rubrique->{ titleNko, titleFr, "slug": slug.current },
    "numero": ${PROJECTION_NUMERO_DE_L_ARTICLE},
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
    // Mode aperçu (Studio) : brouillon ; sinon : version publiée
    const { client: sanity, apercu } = await getSanityClient();
    const rawArticle = await sanity.fetch<SanityArticleRaw>(
      query,
      { slug },
      // Cache d'une heure, vidé tout de suite par la sonnette Sanity (/api/revalidate) à chaque
      // publication d'un article, d'un terme du lexique, d'un numéro ou d'une rubrique (18 octobre 2026)
      apercu ? { cache: "no-store" } : { next: { tags: ["article", `article-${slug}`, "numero", "terme"], revalidate: 3600 } }
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

  // Image de partage de l'article (titre N'Ko lié, numéro, catégorie) fabriquée par
  // scripts/images-partage/articles.mjs ; sinon la couverture recadrée ; sinon l'image de l'accueil
  const imagePartage = (IMAGES_PARTAGE_ARTICLES as Record<string, string>)[slug];
  // 🚀 CORRECTION CRITIQUE : "let" au lieu de "const"
  let ogImage = imagePartage ? `${SITE_URL}/og/articles/${imagePartage}` : article.mainImageUrl || IMAGE_PARTAGE_ACCUEIL.url;
  // L'image fabriquée montre le titre : son texte alternatif est le titre
  const ogAlt = imagePartage ? article.title : article.mainImageRaw?.alt?.trim() || article.title;

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

  return carteSansMelange({
    // 👑 N'Ko is King : titre de l'article ; le nom de la revue est ajouté UNE fois par le modèle
    // général (app/layout.tsx, « %s | … ») — l'ajouter ici le doublait dans l'onglet et sur Google
    title: article.title,
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
    // Règles de Scholar : UNE balise « citation_author » par auteur (même nom, répété, dans l'ordre),
    // date complète AAAA/MM/JJ, adresse du texte intégral.
    other: {
      "citation_title": article.title,
      "citation_publication_date": new Date(article.publishedAt).toISOString().slice(0, 10).replace(/-/g, "/"),
      "citation_journal_title": "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ | N'Ko ni Lonko",
      "citation_publisher": "N'Ko ni Lonko",
      "citation_language": "nqo",
      "citation_fulltext_html_url": articleUrl,
      "citation_fulltext_world_readable": "",
      // Numéro de la revue (seulement si l'article est dans un numéro publié)
      ...(article.numero ? { "citation_issue": String(article.numero.numero) } : {}),
      "citation_keywords": [
        ...article.tags,
        article.category,
      ].join("; "),
      // Une balise par auteur (Next.js répète la balise pour chaque élément de la liste)
      ...(article.authors.length ? { "citation_author": article.authors.map((a) => a.name) } : {}),
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
        alt: ogAlt,
        type: "image/jpeg",
      }],
      // 👑 N'Ko is King : locale nqo en premier
      locale: "nqo",
      alternateLocale: "fr_FR",
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
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
        alt: ogAlt,
      }],
      creator: COMPTE_X,
      site: COMPTE_X,
    },
  }, { descriptionDuTitre: true, resumeFr: article.excerptFr });
}

// ==============================================================================
// 6. LA PAGE (Point d'Entrée Serveur)
// ==============================================================================
export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) return notFound();
  // Le numéro, la rubrique et le texte brut ne sont pas envoyés au navigateur avec l'article :
  // ils sont rendus ici, côté serveur (le texte : CustomPortableText, 18 octobre 2026)
  const { numero, rubrique, body, ...donnees } = article;

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
      "url": article.mainImageUrl || IMAGE_PARTAGE_ACCUEIL.url,
      "width": 1200,
      "height": 630,
      "representativeOfPage": true,
      "caption": article.title
    },
    "datePublished": article.publishedAt,
    "dateModified": article.updatedAt,
    // Numéro de la revue (même « @id » que la page /numeros/<slug>)
    ...(article.numero ? {
      "isPartOf": {
        "@type": "PublicationIssue",
        "@id": `${SITE_URL}/numeros/${article.numero.slug}`,
        "issueNumber": String(article.numero.numero),
        "isPartOf": { "@type": "Periodical", "name": "N'Ko ni Lonko", "url": SITE_URL }
      }
    } : {}),
    // 👑 Auteurs avec réseaux sociaux — Google connaît chaque auteur
    "author": article.authors.map(author => ({
      "@type": "Person",
      "name": author.name,
      "alternateName": author.nameNko || undefined,
      "jobTitle": author.roleNko || author.role || undefined,
      // 🚀 NOUVEAU : Photo auteur — Google byline
      "image": author.imageUrl || undefined,
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
      "sameAs": author.socials
        .map(s => s.url)
        .filter(Boolean)
    })),
    "publisher": {
      "@type": "Organization",
      "name": "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ | N'Ko ni Lonko",
      "@id": `${SITE_URL}/#organization`,
      "url": SITE_URL,
      // 🚀 NOUVEAU : Réseaux sociaux de l'organisation
      "sameAs": [
        "https://www.youtube.com/@nkonilonko",
        "https://www.tiktok.com/@nkonilonko223",
        URL_X
      ],
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/icon-512x512.png`,
        "width": 512,
        "height": 512
      },
      "founder": {
        "@type": "Person",
        "name": "Moustapha CAMARA",
        "alternateName": "ߡߎ߬ߛߊߝߊ߬ ߞߊ߬ߡߙߊ߬",
        // 🚀 FIX : Page dédiée au lieu de la racine
        "url": `${SITE_URL}/about`,
        // 🚀 NOUVEAU : Photo fondateur
        "image": `${SITE_URL}/fondateur.png`,
        "sameAs": [
          "https://www.youtube.com/@nkonilonko",
          "https://www.tiktok.com/@nkonilonko223",
          URL_X
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
        dangerouslySetInnerHTML={{ __html: jsonLd(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbJsonLd) }}
      />
      
      {/* Transmission du nouvel objet robuste vers le composant d'affichage.
          Numéro et rubrique : rendus ici, côté serveur, et placés dans les emplacements */}
      <ArticleClient
        article={donnees}
        bandeau={numero ? <BandeauNumero numero={numero} /> : undefined}
        surtitre={rubrique ? <SurtitreRubrique rubrique={rubrique} /> : undefined}
        navigation={numero ? <NavigationNumero numero={numero} slug={article.slug} /> : undefined}
        texte={<CustomPortableText value={body} />}
      />
    </>
  );
}