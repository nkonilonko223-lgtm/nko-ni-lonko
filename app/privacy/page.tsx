import { Metadata } from "next";
import PrivacyClient from "./PrivacyClient";

// 1. LE BOUCLIER SEO (Optimisation 1/1000 pour Google et Partage)
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nkonilonko.com";

export const metadata: Metadata = {
  title: "ߜߎ߲߬ߘߏ߬ߦߊ ߞߎ߬ߙߎ߲߬ߘߎ | Confidentialité | N'Ko ni Lonko",
  description: "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ ߟߊ߫ ߜߎ߲߬ߘߏ߬ߦߊ ߞߎ߬ߙߎ߲߬ߘߎ. Politique de confidentialité et protection des données de la plateforme N'Ko ni Lonko — vulgarisation scientifique bilingue N'Ko/Français. Collecte minimale, zéro publicité, sécurité maximale.",
  alternates: {
    canonical: `${SITE_URL}/privacy`,
  },
  openGraph: {
    title: "ߜߎ߲߬ߘߏ߬ߦߊ ߞߎ߬ߙߎ߲߬ߘߎ | Confidentialité N'Ko ni Lonko",
    description: "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ ߟߊ߫ ߜߎ߲߬ߘߏ߬ߦߊ ߞߎ߬ߙߎ߲߬ߘߎ. La protection de vos données est notre priorité absolue.",
    url: `${SITE_URL}/privacy`,
    siteName: "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ | N'Ko ni Lonko",
    images: [{
      url: `${SITE_URL}/og-accueil.jpg`,
      width: 1200,
      height: 630,
      alt: "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ — Confidentialité",
    }],
    locale: "nqo",
    alternateLocale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ߜߎ߲߬ߘߏ߬ߦߊ ߞߎ߬ߙߎ߲߬ߘߎ | N'Ko ni Lonko",
    description: "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ ߟߊ߫ ߜߎ߲߬ߘߏ߬ߦߊ ߞߎ߬ߙߎ߲߬ߘߎ.",
    images: [`${SITE_URL}/og-accueil.jpg`],
    creator: "@nkonilonko",
    site: "@nkonilonko",
  },
};

// 2. L'INJECTION DU VISUEL
// JSON-LD Privacy
const privacyJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/privacy`,
  "url": `${SITE_URL}/privacy`,
  "name": "ߜߎ߲߬ߘߏ߬ߦߊ ߞߎ߬ߙߎ߲߬ߘߎ | Confidentialité — N'Ko ni Lonko",
  "inLanguage": ["nqo", "fr"],
  "isPartOf": { "@id": `${SITE_URL}/#website` },
  "about": { "@id": `${SITE_URL}/#organization` },
};

export default function PrivacyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(privacyJsonLd) }}
      />

      {/* eslint-disable @next/next/no-html-link-for-pages */}
      <noscript>
        <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
          <h1>ߜߎ߲߬ߘߏ߬ߦߊ ߞߎ߬ߙߎ߲߬ߘߎ — Politique de confidentialité</h1>

          <section dir="rtl" lang="nqo">
            <h2>ߘߎ߲߬ߘߎ߬ߡߊ߬ ߞߎ߲ߣߊߝߏߣߌ߲ ߠߎ߬ ߟߊߘߍ߭</h2>
            <p>ߊ߬ ߞߘߐ ߜߍߘߐߕߊ: ߊ߲ ߧߋ߫ ߞߎ߲߬ߣߊ߬ߝߏߣߌ߲ ߡߌ߬ߘߊ߬ ߟߊ߫ ߡߍ߲ ߡߊ߬ߞߏ߫ ߦߴߊ߲ ߠߊ߫ ߖߋ߬ߓߌ߬ߟߌ ߘߐߙߐ߲߫ ߠߋ߬ ߘߌ߫.</p>

            <h2>ߞߎ߲߬ߣߊ߬ߝߏߣߌ߲ ߠߎ߬ ߟߊߓߊ߯ߙߊߢߊ</h2>
            <p>ߊ߬ ߞߘߐ ߜߍߘߐߕߊ: ߊߟߎ߫ ߟߊ߫ ߞߎ߲߬ߣߊ߬ߝߏߣߌ߲ ߠߎ߬ ߦߋ߫ ߟߊߓߊ߯ߙߊ߫ ߟߊ߫ ߓߌ߬ߟߊ߬ߢߐ߲߰ߡߊ ߘߐߙߐ߲߫ ߠߋ߬ ߘߐ߫.</p>

            <h2>ߟߊ߬ߞߊ߲߬ߘߊ߬ߟߌ ߣߌ߫ ߞߣߐ߬ߜߍ߲߬ߠߌ߲</h2>
            <p>ߊ߬ ߞߘߐ ߜߍߘߐߕߊ: ߊ߲ ߧߋ߫ ߛߋߒߞߏߟߦߊ ߞߎ߲߬ߕߍߡߊ ߟߊߓߊ߯ߙߊ߫ ߟߊ߫ ߞߵߊߟߎ߫ ߟߊ߫ ߞߎ߲߬ߣߊ߬ߝߏ߬ߣߌ߬ߦߊ ߠߎ߬ ߟߊߞߊ߲ߘߊ߫.</p>

            <h2>ߟߊ߬ߖߍ߲߬ߛߍ߲߬ߓߊߟߌߦߊ ߣߌ߫ ߜߎ߲߬ߘߏ߬ߦߊ</h2>
            <p>ߊ߬ ߞߘߐ ߜߍߘߐߕߊ: ߊ߲ ߕߍߣߊ߬ ߊߟߎ߫ ߟߊ߫ ߞߎ߲߬ߣߊ߬ߝߏߣߌ߲ ߠߎ߬ ߝߙߋ߬ ߟߊ߫ ߥߟߴߊ߬ ߘߌ߫ ߟߊ߫ ߡߐ߰ ߜߘߍ߫ ߡߊ߬ ߡߎ߰ߡߍ߫.</p>

            <h2>ߟߊߓߊ߯ߙߊߟߊ ߟߊ߫ ߤߊߞߍ ߟߎ߬</h2>
            <p>ߊ߬ ߞߘߐ ߜߍߘߐߕߊ: ߊߟߎ߫ ߤߊߞߍ ߦߴߊߟߎ߫ ߓߟߏ߫ ߞߊ߬ ߢߌ߬ߣߌ߲߬ߞߊ߬ߟߌ ߞߍ߫ ߞߵߊߟߎ߫ ߟߊ߫ ߞߎ߲߬ߣߊ߬ߝߏߣߌ߲ ߖߐ߬ߛߌ߬.</p>
          </section>

          <section lang="fr">
            <h2>1. Collecte des Données</h2>
            <p>Nous limitons la collecte de données au strict minimum : nom, email et message via le formulaire de contact.</p>

            <h2>2. Utilisation des Informations</h2>
            <p>Vos informations ne servent qu&apos;à la communication directe. Pas de publicité, pas de ciblage marketing.</p>

            <h2>3. Sécurité de l&apos;Architecture</h2>
            <p>Cryptage de haut niveau pour sécuriser tous les échanges entre votre navigateur et nos serveurs.</p>

            <h2>4. Confidentialité Absolue</h2>
            <p>N&apos;Ko ni Lonko ne vendra et ne cédera jamais vos données à des tiers.</p>

            <h2>5. Droits Numériques</h2>
            <p>Vous conservez le contrôle total sur vos informations : accès, modification, suppression sur demande.</p>
          </section>

          <nav>
            <ul>
              <li><a href="/">Accueil — N&apos;Ko ni Lonko</a></li>
              <li><a href="/about">À Propos</a></li>
              <li><a href="/contact">Contactez-nous</a></li>
              <li><a href="/terms">Conditions d&apos;utilisation</a></li>
            </ul>
          </nav>
        </div>
      </noscript>
      {/* eslint-enable @next/next/no-html-link-for-pages */}

      <PrivacyClient />
    </>
  );
}