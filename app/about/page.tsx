import { Metadata } from "next";
import AboutClient from "./AboutClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nkonilonko.com";

// ==============================================================================
// SEO — Métadonnées enrichies 1/10000
// ==============================================================================
export const metadata: Metadata = {
  // 👑 N'Ko is King
  title: "ߞߊ߲߬ߞߎߡߊ | À Propos | N'Ko ni Lonko",
  description: "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ ߦߋ߫ ߓߟߐߟߐ ߝߏߟߏ߲ߝߊߟߊ߲ ߝߟߐ߫ ߟߋ߬ ߘߌ߫. Notre mission : vulgariser la science en langue N'Ko pour le partage du savoir universel.",
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
  openGraph: {
    title: "ߞߊ߲߬ߞߎߡߊ | À Propos — ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ",
    description: "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ ߦߋ߫ ߓߟߐߟߐ ߝߏߟߏ߲ߝߊߟߊ߲ ߝߟߐ߫ ߟߋ߬ ߘߌ߫. Science et Savoir pour tous, sans frontières linguistiques.",
    url: `${SITE_URL}/about`,
    siteName: "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ | N'Ko ni Lonko",
    images: [{
      url: `${SITE_URL}/og-accueil.jpg`,
      width: 1200,
      height: 630,
      alt: "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ — À Propos",
    }],
    locale: "nqo",
    alternateLocale: "fr_FR",
    type: "profile",
  },
  twitter: {
    card: "summary_large_image",
    title: "ߞߊ߲߬ߞߎߡߊ | N'Ko ni Lonko",
    description: "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ ߦߋ߫ ߓߟߐߟߐ ߝߏߟߏ߲ߝߊߟߊ߲ ߝߟߐ߫ ߟߋ߬ ߘߌ߫.",
    images: [`${SITE_URL}/og-accueil.jpg`],
    creator: "@nkonilonko",
    site: "@nkonilonko",
  },
};

// ==============================================================================
// JSON-LD — Fondateur + Organisation + Page
// ==============================================================================
const aboutJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    // 👑 N'Ko is King : Moustapha CAMARA — Fondateur officiel Google
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#founder`,
      "name": "Moustapha CAMARA",
      // 👑 Nom N'Ko en alternateName prioritaire
      "alternateName": "ߡߎ߬ߛߊߝߊ߬ ߞߊ߬ߡߙߊ߬",
      "jobTitle": "Fondateur & Architecte",
      "description": "Fondateur de N'Ko ni Lonko, auteur d'un ouvrage scientifique en N'Ko couvrant l'astronomie, la physique, la géologie et l'écologie.",
      "url": `${SITE_URL}/about`,
      "knowsLanguage": ["nqo", "fr"],
      "nationality": {
        "@type": "Country",
        "name": "Mali"
      },
      "sameAs": [
        "https://www.youtube.com/@nkonilonko",
        "https://www.tiktok.com/@nkonilonko223",
        "https://x.com/nkonilonko",
        "https://www.facebook.com/nkonilonko",
        "https://www.instagram.com/nkonilonko",
        "https://t.me/nkonilonko"
      ],
      "founder": {
        "@id": `${SITE_URL}/#organization`
      }
    },
    // 👑 Organisation officielle
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      "name": "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ",
      "alternateName": "N'Ko ni Lonko",
      "url": SITE_URL,
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/icon-512x512.png`,
        "width": 512,
        "height": 512
      },
      "description": "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ ߦߋ߫ ߓߟߐߟߐ ߝߏߟߏ߲ߝߊߟߊ߲ ߝߟߐ߫ ߟߋ߬ ߘߌ߫ ߟߐ߲ߞߏ ߟߊߛߋߟߌ ߞߊߡߊ߬ ߝߘߊ߬ߝߌ߲߬ߠߊ. La première plateforme de vulgarisation scientifique en langue N'Ko.",
      "inLanguage": ["nqo", "fr"],
      "founder": {
        "@id": `${SITE_URL}/#founder`
      },
      "foundingDate": "2026-01",
      "areaServed": [
        { "@type": "Country", "name": "Mali" },
        { "@type": "Country", "name": "Guinea" },
        { "@type": "Country", "name": "Senegal" },
        { "@type": "Country", "name": "Ivory Coast" },
        { "@type": "Country", "name": "Burkina Faso" }
      ],
      "sameAs": [
        "https://www.youtube.com/@nkonilonko",
        "https://www.tiktok.com/@nkonilonko223",
        "https://x.com/nkonilonko"
      ]
    },
    // Page About
    {
      "@type": "AboutPage",
      "@id": `${SITE_URL}/about`,
      "url": `${SITE_URL}/about`,
      "name": "ߞߊ߲߬ߞߎߡߊ | À Propos — N'Ko ni Lonko",
      "inLanguage": ["nqo", "fr"],
      "isPartOf": { "@id": `${SITE_URL}/#website` },
      "about": { "@id": `${SITE_URL}/#organization` },
      "author": { "@id": `${SITE_URL}/#founder` }
    }
  ]
};

// ==============================================================================
// PAGE
// ==============================================================================
export default function About() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />
      <AboutClient />
    </>
  );
}