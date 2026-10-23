import type { Metadata, Viewport } from "next";
import { NOM_FR, NOM_NKO, versionLangue } from "../lib/carte-partage";
import { LANGUES, langueDe, langueInterface } from "../lib/langue";
import { separerLangues } from "../components/numero/titre";
import localFont from "next/font/local";
import { Montserrat } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "../globals.css";
// Icônes Phosphor AUTO-HÉBERGÉES, seulement celles du site (18 octobre 2026) : plus de script
// ni de fichiers tiers (unpkg, jsdelivr). Fichier généré : scripts/icones/generer-icones.mjs
import "../icones-phosphor.css";

// ✅ IMPORT DES FOURNISSEURS (PROVIDERS)
// (Plus de registre styled-components : le Studio Sanity ne s'affiche que dans le navigateur,
// le registre ne servait à rien et envoyait styled-components à chaque visiteur — 19 octobre 2026)
import { LanguageProvider } from "../components/LanguageProvider";
import NetworkBoundary from "../components/NetworkBoundary"; 
import PredictiveProvider from "../components/PredictiveProvider";
import BandeauApercu from "../components/BandeauApercuDiffere"; // chargé seulement en mode aperçu
import LectureHorsLigne from "../components/LectureHorsLigne"; // service worker public/sw.js (production)
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { COMPTE_X, IMAGE_PARTAGE_ACCUEIL, URL_X } from "../lib/partage";
import { jsonLd } from "../lib/jsonld";
import ECRANS_DEMARRAGE from "../lib/ecrans-demarrage.json"; // scripts/application/generer.mjs

// ============================================================================
// 1. CONSTANTES GLOBALES (SÉCURITÉ ET CENTRALISATION)
// ============================================================================
// Centraliser l'URL protège le SEO contre les fautes de frappe.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nkonilonko.com";

// ============================================================================
// 2. CONFIGURATION DES POLICES (FONTS - DOGME 1)
// ============================================================================
const kigelia = localFont({
  src: [
    // WOFF2 (18 octobre 2026) : même police compressée sans perte (−45 %), tables de dessin et de
    // liaison identiques, rendu Chrome identique au pixel près. Les OTF restent dans public/fonts
    // (e-mails, images de partage).
    { path: "../fonts/Kigelia.woff2", weight: "400", style: "normal" },
    { path: "../fonts/Kigelia1.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-kigelia",
  display: "swap",
  fallback: ["system-ui", "sans-serif"], // 🚀 ARMURE 1/1000 : Sécurité anti-blocage
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-fr",
  display: "swap",
  fallback: ["system-ui", "sans-serif"], // 🚀 ARMURE 1/1000 : Sécurité anti-blocage
});

// ============================================================================
// 3. VIEWPORT 1/1000 (PWA NATIVE LOCK - DOGME 3)
// ============================================================================
export const viewport: Viewport = {
  themeColor: "#02040a",
  width: "device-width",
  initialScale: 1,
  // 🚀 CORRECTION : On supprime 'maximumScale' et 'userScalable' 
  // pour débloquer le 100/100 en Best Practices et Accessibilité.
};

// ============================================================================
// 4. MÉTADONNÉES GLOBALES (L'ARMURE SEO IMPÉRIALE - HYBRIDE)
// ============================================================================
const METADONNEES: Metadata = {
  metadataBase: new URL(SITE_URL),
  manifest: "/manifest.json",
  verification: {
    google: '843ZK_DeoFe9h5mvxGW3kSNz-dHT0_RMxbb4cS7_Kao',
  },
  
  applicationName: "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ System",
  generator: "N'Ko ni Lonko Engine v2.0",
  authors: [{ name: "Moustapha CAMARA", url: SITE_URL }, { name: "ߡߎ߬ߛߊߝߊ߬ ߞߊ߬ߡߙߊ߬" }],
  
  formatDetection: {
    telephone: false,
    date: false,
    email: false,
    address: false,
  },

  // 🚀 STRATÉGIE HYBRIDE : N'Ko d'abord, Français ensuite.
  title: {
    default: "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ | N'Ko ni Lonko - Science & Savoir",
    template: "%s | ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ",
  },
  // 🚀 DESCRIPTION HYBRIDE : Pour que Google serve les deux audiences.
  description: "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ ߦߋ߫ ߓߟߐߟߐ ߝߏߟߏ߲ߝߊߟߊ߲ ߝߟߐ߫ ߟߋ߬ ߘߌ߫ ߟߐ߲ߞߏ ߣߌ߫ ߟߐ߲ߠߌ߲ ߟߊߛߋߟߌ ߞߊߡߊ߬ ߝߘߊ߬ߝߌ߲߬ߠߊ. N'Ko ni Lonko est la plateforme de référence pour la science et le savoir en Afrique.",
  
  keywords: ["ߒߞߏ", "N'Ko", "ߛߊ߲ߡߊߛߓߍ","ߛߋߞߏߟߦߊ","ߟߐ߲ߞߏ","ߘߎ߰ߘߐ߬ߛߓߍ","ߊ߲ ߠߊ߫ ߖߊ߯ߓߊߟߌ", "Science", "Savoir", "Afrique", "Mali", "Moustapha Camara", "Education", "astronomie", "kanté solomana", "Notre planète" , "physique" , "mathematiques"],

  alternates: {
    canonical: SITE_URL,
    // 🚀 ACTION : On force TypeScript à accepter le code 'nqo' via un casting explicite
    languages: {
      'nqo': SITE_URL,
      'fr': SITE_URL,
      'x-default': SITE_URL
    } as Record<string, string>,
  },

  // Application ajoutée à l'écran d'accueil de l'iPhone / iPad (23 octobre 2026) :
  // - barre d'état NOIRE opaque : avec « black-translucent », le haut du site passait sous l'heure
  //   et la batterie (rien n'est prévu pour cet espace) ; le fond du site est presque noir ;
  // - écrans de démarrage (sinon : écran blanc à l'ouverture), fabriqués par
  //   scripts/application/generer.mjs pour chaque taille d'écran.
  appleWebApp: {
    capable: true,
    statusBarStyle: "black",
    title: "N'Ko ni Lonko",
    startupImage: ECRANS_DEMARRAGE.map(({ url, media }) => ({ url, media })),
  },

  // 🚀 L'ARMURE SOCIALE 1/10000 (WhatsApp, X, LinkedIn, Telegram)
  openGraph: {
    title: "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ | N'Ko ni Lonko",
    // 👑 N'Ko is King : Le texte N'Ko apparaît en premier dans l'aperçu du message, suivi du Français.
    description: "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ ߦߋ߫ ߓߟߐߟߐ ߝߏߟߏ߲ߝߊߟߊ߲ ߝߟߐ߫ ߟߋ߬ ߘߌ߫ ߟߐ߲ߞߏ ߟߊߛߋߟߌ ߞߊߡߊ߬. Plateforme de référence pour la science et le savoir.",
    url: SITE_URL,
    siteName: "N'Ko ni Lonko",
    locale: "nqo", 
    alternateLocale: ["fr_FR"],
    type: "website",
    // Une seule image, fabriquée par scripts/images-partage/generer.mjs (N'Ko lié)
    images: [IMAGE_PARTAGE_ACCUEIL],
  },

  // 🚀 LE BOUCLIER TWITTER CARDS (X et Telegram)
  twitter: {
    card: "summary_large_image",
    title: "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ | N'Ko ni Lonko",
    description: "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ ߦߋ߫ ߓߟߐߟߐ ߝߏߟߏ߲ߝߊߟߊ߲ ߝߟߐ߫ ߟߋ߬ ߘߌ߫. La plateforme scientifique de référence.",
    images: [IMAGE_PARTAGE_ACCUEIL],
    creator: COMPTE_X,
    site: COMPTE_X,
  },

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    // Icône de l'iPhone : 180 px, cadrée sur le logo (scripts/icones/favicon.mjs)
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ]
  },
  robots: { index: true, follow: true }
};

// Deux versions préparées à l'avance : N'Ko (adresses sans préfixe) et français (/fr)
export function generateStaticParams() {
  return LANGUES.map((lang) => ({ lang }));
}

// Titre par défaut et modèle « %s | nom de la revue » dans la langue de la version
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const langue = langueDe((await params).lang);
  // Titre par défaut bilingue écrit plus haut (METADONNEES.title.default), coupé par langue
  const titre = METADONNEES.title;
  const parDefaut = separerLangues(typeof titre === "object" && titre && "default" in titre ? titre.default : "");
  return {
    ...versionLangue(METADONNEES, langue, { chemin: "/" }),
    // Application du site : une par langue (nom, raccourcis, ouverture sur /fr pour le français)
    manifest: langue === "fr" ? "/manifest-fr.json" : "/manifest.json",
    title: langue === "fr"
      ? { default: parDefaut.fr ?? NOM_FR, template: `%s | ${NOM_FR}` }
      : { default: parDefaut.nko ?? NOM_NKO, template: `%s | ${NOM_NKO}` },
  };
}

// ============================================================================
// 5. ACCUEIL N'KO D'UN LECTEUR QUI A CHOISI LE FRANÇAIS (langue dans l'adresse, B6)
// ============================================================================
// La langue vient maintenant de l'adresse : le serveur prépare la page directement en N'Ko
// ou en français (plus de script qui change la langue après coup). Seule exception, sur
// l'ACCUEIL N'Ko : un lecteur qui a choisi le français (bouton FR ou fenêtre de choix) part
// tout de suite vers /fr, avant l'affichage. Un lien partagé (article…) n'est jamais redirigé.
const accueilFrancais = `
  (function() {
    try {
      if (location.pathname === '/' && localStorage.getItem('preferred-lang') === 'fr') {
        location.replace('/fr' + location.search + location.hash);
      }
    } catch (e) {}
  })();
`;

// ============================================================================
// 6. STRUCTURE PRINCIPALE (LAYOUT)
// ============================================================================
export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const langue = langueDe((await params).lang);
  const nko = langue === "nqo";
  // Mode aperçu (activé depuis le Studio) : affiche le bandeau « brouillons visibles »
  const { isEnabled: apercu } = await draftMode();

  const globalJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        "url": SITE_URL,
        "name": "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ", // Nom N'Ko en priorité absolue
        "alternateName": ["N'Ko ni Lonko", "N'Ko Science"],
        "inLanguage": ["nqo", "fr"], // 🚀 DÉCLARATION BILINGUE OFFICIELLE
        "description": "ߓߟߐߟߐ ߞߣߍ ߦߌߟߡߊߛߙߋߡߊ ߡߍ߲ ߖߊ߯ߓߊ ߟߐ߲ߞߏ ߟߎ߬ ߟߊߛߋߟߊ߫ ߒߞߏ ߘߐ߫ . La plateforme de référence pour la science et le savoir en N'Ko.",
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${SITE_URL}/search?q={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        "name": "N'Ko ni Lonko",
        "alternateName": "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ",
        "url": SITE_URL,
        "logo": {
          "@type": "ImageObject",
          "url": `${SITE_URL}/icon-512x512.png`,
          "width": 512,
          "height": 512
        },
        "founder": {
          "@type": "Person",
          "name": "Moustapha CAMARA",
          "alternateName": "ߡߎ߬ߛߊߝߊ߬ ߞߊ߬ߡߙߊ߬"
        },
        "sameAs": [
          "https://www.youtube.com/@nkonilonko",
          "https://www.tiktok.com/@nkonilonko223",
          URL_X
        ]
      },
      // La revue elle-même (22 octobre 2026) : Google et les annuaires scientifiques la
      // reconnaissent comme une publication périodique ; les numéros (PublicationIssue) et les
      // articles s'y rattachent par son identifiant « #revue ». ISSN à ajouter quand il existera.
      {
        "@type": "Periodical",
        "@id": `${SITE_URL}/#revue`,
        "name": "N'Ko ni Lonko",
        "alternateName": NOM_NKO,
        "url": SITE_URL,
        "inLanguage": ["nqo", "fr"],
        "publisher": { "@id": `${SITE_URL}/#organization` },
        "isAccessibleForFree": true
      }
    ]
  };

return (
    // Langue, sens d'écriture et traduction fixés par le serveur selon l'adresse :
    // N'Ko → lang="nqo", droite à gauche, pas de proposition de traduction ; français → l'inverse
    <html lang={nko ? "nqo" : "fr"} dir={nko ? "rtl" : "ltr"} translate={nko ? "no" : undefined} suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        {nko && <script dangerouslySetInnerHTML={{ __html: accueilFrancais }} />}
        {/* 👑 Google Search Console — Vérification propriété */}
        <meta name="google-site-verification" content="843ZK_DeoFe9h5mvxGW3kSNz-dHT0_RMxbb4cS7_Kao" />
      </head>
      
      <body
        suppressHydrationWarning
        dir={nko ? "rtl" : "ltr"}
        className={`
          ${kigelia.variable} 
          ${montserrat.variable} 
          font-sans antialiased 
          bg-[#02040a] text-white
          selection:bg-[#fbbf24] selection:text-black
        `}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(globalJsonLd) }}
        />

        <LanguageProvider langue={langueInterface(langue)}>
          <NetworkBoundary>
            {children}
          </NetworkBoundary>
        </LanguageProvider>

        <Analytics />
        <PredictiveProvider />
        <LectureHorsLigne />
        {/* Mode aperçu seulement : bandeau + connecteur avec l'onglet « Presentation » du Studio */}
        {apercu && (
          <>
            <BandeauApercu />
            <VisualEditing />
          </>
        )}

      </body>
    </html>
  );
}