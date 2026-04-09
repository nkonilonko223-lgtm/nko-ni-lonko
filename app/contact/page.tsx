import { Metadata } from "next";
import ContactClient from "./ContactClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nkonilonko.com";

export const metadata: Metadata = {
  title: "ߊ߲ ߟߊߛߐ߬ߘߐ߲߬ | Contact | N'Ko ni Lonko",
  description: "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ ߟߊߛߐ߬ߘߐ߲߬. Contactez l'équipe N'Ko ni Lonko — plateforme de vulgarisation scientifique bilingue N'Ko/Français. Email : contact@nkonilonko.com. Siège : Bamako, Mali.",
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

      {/* ================================================================
          SEO — Contenu serveur visible au crawl HTML initial (noscript)
          ================================================================ */}
      <noscript>
        <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
          <h1>ߊ߲ ߟߊߛߐ߬ߘߐ߲߬ — Contactez N&apos;Ko ni Lonko</h1>

          <section dir="rtl" lang="nqo">
            <h2>ߊ߲ ߟߊߛߐ߬ߘߐ߲߬ ߢߊ ߟߎ߬</h2>
            <p><strong>ߊ߲ ߠߊ߫ ߡߊ߬ߞߍ߬ߦߙߐ :</strong> ߓߊ߬ߡߊ߬ߞߐ߬߸ ߡߊ߬ߟߌ — ߝߘߊ߬ߝߌ߲߬ߠߊ ߕߟߋ߬ߓߊ</p>
            <p>
              ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ ߦߋ߫ ߓߟߐߟߐ ߝߏߟߏ߲ߝߊߟߊ߲ ߝߟߐ߫ ߟߋ߬ ߘߌ߫ ߟߐ߲ߞߏ ߟߊߛߋߟߌ ߞߊߡߊ߬ ߝߘߊ߬ߝߌ߲߬ߠߊ.
            </p>
          </section>

          <section lang="fr">
            <h2>Informations de contact</h2>
            <address>
              <p><strong>Siège :</strong> Bamako, Mali — Afrique de l&apos;Ouest</p>
              <p>
                <strong>Email :</strong>{" "}
                <a href="mailto:contact@nkonilonko.com">contact@nkonilonko.com</a>
              </p>
            </address>
            <p>
              N&apos;Ko ni Lonko est la première plateforme de vulgarisation scientifique
              bilingue N&apos;Ko/Français. Contactez-nous pour toute question sur nos articles
              d&apos;astronomie, de physique, de biologie ou pour proposer une collaboration.
            </p>
          </section>

          {/* eslint-disable @next/next/no-html-link-for-pages */}
          <nav>
            <ul>
              <li><a href="/">Accueil — N&apos;Ko ni Lonko</a></li>
              <li><a href="/about">À Propos</a></li>
              <li><a href="/privacy">Politique de confidentialité</a></li>
              <li><a href="/terms">Conditions d&apos;utilisation</a></li>
            </ul>
          </nav>
          {/* eslint-enable @next/next/no-html-link-for-pages */}
        </div>
      </noscript>
      <ContactClient />
    </>
  );
}