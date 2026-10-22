import { Metadata } from "next";
import LienLangue from "../../components/LienLangue";
import { versionLangue } from "../../lib/carte-partage";
import { langueDe } from "../../lib/langue";
import { COMPTE_X, IMAGE_PARTAGE_ACCUEIL } from "../../lib/partage";
import { SIEGE, TELEPHONES } from "../../lib/coordonnees";
import { jsonLd } from "../../lib/jsonld";
import ContactClient from "./ContactClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nkonilonko.com";

const METADONNEES: Metadata = {
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
    images: [IMAGE_PARTAGE_ACCUEIL],
    locale: "nqo",
    alternateLocale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ߊ߲ ߟߊߛߐ߬ߘߐ߲߬ | N'Ko ni Lonko",
    description: "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ ߟߊߛߐ߬ߘߐ߲߬.",
    images: [IMAGE_PARTAGE_ACCUEIL],
    creator: COMPTE_X,
    site: COMPTE_X,
  },
};

// Deux versions (N'Ko : adresse sans préfixe ; français : /fr) : titre, description, carte de
// partage et adresses dans la langue de l'adresse (app/lib/carte-partage.ts, versionLangue)
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  return versionLangue(METADONNEES, langueDe((await params).lang), { chemin: "/contact" });
}

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
    // Téléphones (Mali, France) : une seule source, app/lib/coordonnees.ts
    "contactPoint": TELEPHONES.map((t) => ({
      "@type": "ContactPoint",
      "telephone": t.e164,
      "contactType": "customer service",
      "areaServed": t.codePays,
      "availableLanguage": ["nqo", "fr"],
    })),
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
        dangerouslySetInnerHTML={{ __html: jsonLd(contactJsonLd) }}
      />

      {/* ================================================================
          SEO — Contenu serveur visible au crawl HTML initial (noscript)
          ================================================================ */}
      <noscript>
        <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
          <h2>ߊ߲ ߟߊߛߐ߬ߘߐ߲߬ — Contactez N&apos;Ko ni Lonko</h2>

          <section dir="rtl" lang="nqo">
            <h2>ߊ߲ ߟߊߛߐ߬ߘߐ߲߬ ߢߊ ߟߎ߬</h2>
            <p><strong>ߊ߲ ߠߊ߫ ߡߊ߬ߞߍ߬ߦߙߐ :</strong> ߓߡߊ߬ߞߐ߫߸ ߡߊߟߌ߫ — ߝߘߊ߬ߝߌ߲߬ߠߊ ߕߟߋ߬ߓߊ</p>
            <p>
              ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ ߦߋ߫ ߓߟߐߟߐ ߝߏߟߏ߲ߝߊߟߊ߲ ߝߟߐ߫ ߟߋ߬ ߘߌ߫ ߟߐ߲ߞߏ ߟߊߛߋߟߌ ߞߊߡߊ߬ ߝߘߊ߬ߝߌ߲߬ߠߊ.
            </p>
          </section>

          <section lang="fr">
            <h2>Informations de contact</h2>
            <address>
              <p><strong>Siège :</strong> {SIEGE.quartier.fr}, {SIEGE.ville.fr}</p>
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

          <nav>
            <ul>
              <li><LienLangue href="/">Accueil — N&apos;Ko ni Lonko</LienLangue></li>
              <li><LienLangue href="/about">À Propos</LienLangue></li>
              <li><LienLangue href="/privacy">Politique de confidentialité</LienLangue></li>
              <li><LienLangue href="/terms">Conditions d&apos;utilisation</LienLangue></li>
            </ul>
          </nav>
        </div>
      </noscript>
      <ContactClient />
    </>
  );
}