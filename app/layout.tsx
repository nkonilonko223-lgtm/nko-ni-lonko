import Script from "next/script";
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Montserrat } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

// ✅ IMPORT DES FOURNISSEURS (PROVIDERS)
import StyledComponentsRegistry from './registry';
import { LanguageProvider } from "./components/LanguageProvider";
import NetworkBoundary from "./components/NetworkBoundary"; 
import PredictiveProvider from "./components/PredictiveProvider"; 

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
    { path: "./fonts/Kigelia.otf", weight: "400", style: "normal" },
    { path: "./fonts/Kigelia1.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-kigelia",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-fr",
  display: "swap",
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
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  manifest: "/manifest.json",
  
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

  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "N'Ko ni Lonko",
  },

  openGraph: {
    title: "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ | N'Ko ni Lonko",
    description: "ߟߐ߲ߞߏ ߓߟߏߦߊ ߒߞߏ ߘߐ߫. La Science à la portée de tous en N'Ko.",
    url: SITE_URL,
    siteName: "N'Ko ni Lonko",
    locale: "nqo", 
    alternateLocale: ["fr_FR"],
    type: "website",
    images: [
      {
        url: "/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "Sceau Royal N'Ko ni Lonko",
      }
    ]
  },

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192x192.png" }
    ]
  },
  robots: { index: true, follow: true }
};

// ============================================================================
// 5. LE SCRIPT DE BLOCAGE ANTI-FLASH (OPTIMISÉ 1/1000)
// ============================================================================
// Exécution unique et ultra-légère avant le rendu React. Fini les ralentissements.
const themeInitScript = `
  (function() {
    try {
      var savedLang = localStorage.getItem('preferred-lang');
      var lang = (savedLang === 'fr' || savedLang === 'nko') ? savedLang : 'nko';
      var dir = lang === 'nko' ? 'rtl' : 'ltr';
      
      document.documentElement.setAttribute('lang', lang);
      document.documentElement.setAttribute('dir', dir);
      document.body.setAttribute('dir', dir);
    } catch (e) {}
  })();
`;

// ============================================================================
// 6. STRUCTURE PRINCIPALE (LAYOUT)
// ============================================================================
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

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
          "https://x.com/nkonilonko"
        ]
      }
    ]
  };

return (
    <html lang="nqo" dir="rtl" translate="no" suppressHydrationWarning data-scroll-behavior="smooth"> 
      <head>
        {/* Restauration de la connexion rapide au CDN */}
        <link rel="preconnect" href="https://unpkg.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://unpkg.com" />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      
      <body 
        suppressHydrationWarning
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(globalJsonLd) }}
        />

        <StyledComponentsRegistry>
            <LanguageProvider>
              <NetworkBoundary>
                {children}
              </NetworkBoundary>
            </LanguageProvider>
        </StyledComponentsRegistry>

        <Analytics />
        <PredictiveProvider />

        {/* Restauration du composant Script Next.js pour Phosphor */}
        <Script 
          src="https://unpkg.com/@phosphor-icons/web" 
          strategy="afterInteractive" 
        />
      </body>
    </html>
  );
}