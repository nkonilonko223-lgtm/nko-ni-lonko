import { Metadata } from "next";
import ContactClient from "./ContactClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nkonilonko.com";

export const metadata: Metadata = {
  title: "ߊ߲ ߟߊߛߐ߬ߘߐ߲߬ | Contact | N'Ko ni Lonko",
  description: "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ ߟߊߛߐ߬ߘߐ߲߬. Contactez l'équipe N'Ko ni Lonko pour toute question scientifique.",
  alternates: {
    canonical: `${SITE_URL}/contact`,
  },
  openGraph: {
    title: "ߊ߲ ߟߊߛߐ߬ߘߐ߲߬ | N'Ko ni Lonko",
    description: "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ ߟߊߛߐ߬ߘߐ߲߬. Rejoignez la révolution scientifique en langue N'Ko.",
    url: `${SITE_URL}/contact`,
    siteName: "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ | N'Ko ni Lonko",
    images: [{
      url: `${SITE_URL}/og-accueil.jpg`,
      width: 1200,
      height: 630,
      alt: "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ — Contact",
    }],
    locale: "nqo",
    alternateLocale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ߊ߲ ߟߊߛߐ߬ߘߐ߲߬ | N'Ko ni Lonko",
    description: "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ ߟߊߛߐ߬ߘߐ߲߬.",
    images: [`${SITE_URL}/og-accueil.jpg`],
    creator: "@nkonilonko",
    site: "@nkonilonko",
  },
};

// JSON-LD Contact
const contactJsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "@id": `${SITE_URL}/contact`,
  "url": `${SITE_URL}/contact`,
  "name": "ߊ߲ ߟߊߛߐ߬ߘߐ߲߬ | Contact — N'Ko ni Lonko",
  "inLanguage": ["nqo", "fr"],
  "isPartOf": { "@id": `${SITE_URL}/#website` },
  "about": { "@id": `${SITE_URL}/#organization` },
  "mainEntity": {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    "name": "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ | N'Ko ni Lonko",
    "email": "contact@nkonilonko.com",
    "url": SITE_URL,
    "location": {
      "@type": "Place",
      "name": "Bamako, Mali"
    }
  }
};

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      <ContactClient />
    </>
  );
}