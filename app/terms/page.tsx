import { Metadata } from "next";
import TermsClient from "./TermsClient";

// 1. LE BOUCLIER SEO (Optimisation 1/1000 pour Google et Partage)
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.nkonilonko.com";

export const metadata: Metadata = {
  title: "ߟߊߓߊ߯ߙߊߟߌ ߛߙߊߕߌ ߟߎ߬ | Conditions d'utilisation | N'Ko ni Lonko",
  description: "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ ߟߊ߫ ߟߊߓߊ߯ߙߊߟߌ ߛߙߊߕߌ ߟߎ߬. Conditions générales d'utilisation de N'Ko ni Lonko — plateforme de vulgarisation scientifique bilingue N'Ko/Français. Propriété intellectuelle, charte éditoriale, droits des auteurs.",
  alternates: {
    canonical: `${SITE_URL}/terms`,
  },
  openGraph: {
    title: "ߟߊߓߊ߯ߙߊߟߌ ߛߙߊߕߌ ߟߎ߬ | Conditions N'Ko ni Lonko",
    description: "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ ߟߊ߫ ߟߊߓߊ߯ߙߊߟߌ ߛߙߊߕߌ ߟߎ߬. Le socle juridique et le pacte des auteurs.",
    url: `${SITE_URL}/terms`,
    siteName: "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ | N'Ko ni Lonko",
    images: [{
      url: `${SITE_URL}/og-accueil.jpg`,
      width: 1200,
      height: 630,
      alt: "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ — Conditions",
    }],
    locale: "nqo",
    alternateLocale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ߟߊߓߊ߯ߙߊߟߌ ߛߙߊߕߌ ߟߎ߬ | N'Ko ni Lonko",
    description: "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ ߟߊ߫ ߟߊߓߊ߯ߙߊߟߌ ߛߙߊߕߌ ߟߎ߬.",
    images: [`${SITE_URL}/og-accueil.jpg`],
    creator: "@nkonilonko",
    site: "@nkonilonko",
  },
};

// 2. L'INJECTION DU VISUEL
// JSON-LD Terms
const termsJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/terms`,
  "url": `${SITE_URL}/terms`,
  "name": "ߟߊߓߊ߯ߙߊߟߌ ߛߙߊߕߌ ߟߎ߬ | Conditions — N'Ko ni Lonko",
  "inLanguage": ["nqo", "fr"],
  "isPartOf": { "@id": `${SITE_URL}/#website` },
  "about": { "@id": `${SITE_URL}/#organization` },
};

export default function TermsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(termsJsonLd) }}
      />

      {/* eslint-disable @next/next/no-html-link-for-pages */}
      <noscript>
        <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
          <h1>ߟߊߓߊ߯ߙߊߟߌ ߛߙߊߕߌ ߟߎ߬ — Conditions d&apos;utilisation</h1>

          <section dir="rtl" lang="nqo">
            <h2>߁. ߛߙߊߕߌ ߟߎ߬ ߟߊߡߌ߬ߘߊ߬ߟߌ</h2>
            <p>ߊ߬ ߞߘߐ ߜߍߘߐߕߊ: ߞߊ߬ ߘߏ߲߬ ߦߊ߲߬ ߦߴߌ ߛߐ߲߭ ߠߋ߬ ߘߌ߫ ߛߙߊߕߌ ߟߎ߬ ߡߊ߬ ߞߐߘߏ߲ߓߊߟߌߦߊ ߘߐ߫.</p>

            <h2>߂. ߣߊ߬ߞߊ߲ ߣߌ߫ ߗߋߦߊ</h2>
            <p>ߊ߬ ߞߘߐ ߜߍߘߐߕߊ: ߊ߲ ߠߊ߫ ߟߊ߬ߢߌߣߌ߲ ߠߋ߬ ߟߐ߲ߞߏ ߟߊߖߍ߲ߛߍ߲ ߘߌ߫ ߒߞߏ ߘߐ߫.</p>

            <h2>߃. ߦߟߌߡߦߊ ߤߊߞߍ</h2>
            <p>ߊ߬ ߞߘߐ ߜߍߘߐߕߊ: ߓߟߐߟߐ ߣߌ߲߬ ߝߋ߲ ߓߍ߯ ߦߋ߫ ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ ߟߋ߬ ߕߊ ߘߌ߫߸ ߊ߬ ߕߍ߫ ߛߏ߲߬ߧߊ߬ ߟߊ߫.</p>

            <h2>߄. ߟߊߓߊ߯ߙߊߟߊ ߟߊ߫ ߘߐ߬ߕߙߐ߬ߛߌ߬ߕߊ ߟߎ߬</h2>
            <p>ߊ߬ ߞߘߐ ߜߍߘߐߕߊ: ߌ ߖߏ߯ߦߊ ߓߘߍ߬ ߞߍ߫. ߘߞߏ߬ߕߋ߯ߙߋߦߊ ߟߊߓߊ߲ ߦߋ߫ ߜߍ߲ߠߌ߲ ߠߋ߬ ߘߌ߫.</p>

            <h2>߅. ߖߋ߬ߓߌ߬ߦߊ߬ߟߌ ߡߊߓߌߟߊ ߖߊ߰ߛߙߋ</h2>
            <p>ߊ߬ ߞߘߐ ߜߍߘߐߕߊ: ߊ߲ ߕߍ߫ ߡߌ߬ߣߊ߬ ߟߊ߫ ߟߊߓߊ߯ߙߊߟߌ ߟߊ߫ ߟߎ߬ ߞߊ߫ ߝߊ߬ߡߎ߲߬ߠߌ߲ ߖߎ߯ ߛߌ߫ ߡߊ߬.</p>

            <h2>߆. ߛߙߊߕߌߦߊ ߣߌ߫ ߞߎ߬ߙߎ߲߬ߘߎ ߟߊߓߊ߯ߙߊߕߊ</h2>
            <p>ߊ߬ ߞߘߐ ߜߍߘߐߕߊ: ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ ߟߊߞߊ߲ߘߊ ߟߋ߬ ߓߍ߫ ߞߍ߫ ߢߍߓߊ߮ ߘߌ߫ ߜߐ߬ߛߐ߲߬ߞߐ ߕߎ߬ߡߊ.</p>

            <h2>߇. ߛߓߍߟߌ ߓߐߖߎ߲ ߣߌ߫ ߟߐ߲ߞߏ ߕߎ߬ߢߊ߬ߦߊ</h2>
            <p>ߊ߬ ߞߘߐ ߜߍߘߐߕߊ: ߛߓߍߟߌ ߓߍ߯ ߦߋ߫ ߞߍ߫ ߞߎߘߊ߫ ߘߌ߫߸ ߞߊ߬ ߓߐ߫ ߦߙߐ߫ ߟߊߒߡߊ߫ ߘߐ߫.</p>

            <h2>߈. ߟߊ߬ߖߍ߲߬ߛߍ߲߬ߠߌ߲ ߟߊߛߙߋߦߊ ߣߌ߫ ߤߊߞߍ</h2>
            <p>ߊ߬ ߞߘߐ ߜߍߘߐߕߊ: ߌߟߋ ߟߋ߬ ߦߴߌ ߟߊ߫ ߛߓߍߟߌ ߕߌ߱ ߘߌ߫߸ ߞߏ߬ߣߌ߲߬ ߌ ߓߘߴߊ߲ ߛߙߋߦߊ ߊ߬ ߟߊߖߍ߲ߛߍ߲ ߘߐ߫.</p>

            <h2>߉. ߛߓߍߟߌ ߘߐߜߍߘߍ߲ ߣߴߊ߬ ߡߊߝߟߍ</h2>
            <p>ߊ߬ ߞߘߐ ߜߍߘߐߕߊ: ߊ߲ ߧߋ߫ ߛߓߍߟߌ ߓߍ߯ ߡߊߝߟߍ߫ ߟߊ߫ ߞߵߊ߬ ߘߐߓߍ߲߬ ߞߊ߬ ߣߊ߬ ߕߏ߫ ߊ߬ ߟߊߖߍ߲ߛߍ߲߫ ߠߊ߫.</p>
          </section>

          <section lang="fr">
            <h2>1. Acceptation des conditions</h2>
            <p>Utiliser ce site signifie accepter ses règles sans réserve.</p>

            <h2>2. Mission et Vocation</h2>
            <p>Notre seul but est l&apos;éducation et la diffusion des sciences exactes en N&apos;Ko.</p>

            <h2>3. Propriété Intellectuelle</h2>
            <p>Le code, le design et les traductions appartiennent à N&apos;Ko ni Lonko. Copie interdite.</p>

            <h2>4. Comportement de l&apos;Utilisateur</h2>
            <p>Respectez la science et les autres. Piratage et fausses infos entraînent un bannissement.</p>

            <h2>5. Limitation de Responsabilité</h2>
            <p>Nous visons l&apos;exactitude scientifique mais ne sommes pas responsables des erreurs d&apos;interprétation.</p>

            <h2>6. Juridiction</h2>
            <p>L&apos;éthique scientifique et la protection de la langue N&apos;Ko priment en cas de litige.</p>

            <h2>7. Originalité et Intégrité</h2>
            <p>Tout article soumis doit être 100% original, sourcé et scientifiquement exact.</p>

            <h2>8. Licence de Publication</h2>
            <p>L&apos;auteur reste propriétaire mais autorise N&apos;Ko ni Lonko à publier sur la plateforme.</p>

            <h2>9. Rigueur Éditoriale</h2>
            <p>Chaque article est relu, corrigé et validé avant publication.</p>
          </section>

          <nav>
            <ul>
              <li><a href="/">Accueil — N&apos;Ko ni Lonko</a></li>
              <li><a href="/about">À Propos</a></li>
              <li><a href="/contact">Contactez-nous</a></li>
              <li><a href="/privacy">Politique de confidentialité</a></li>
            </ul>
          </nav>
        </div>
      </noscript>
      {/* eslint-enable @next/next/no-html-link-for-pages */}

      <TermsClient />
    </>
  );
}