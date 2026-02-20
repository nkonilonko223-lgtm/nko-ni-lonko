import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Montserrat } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
// ✅ IMPORT DU REGISTRY (Il est là, on le garde)
import StyledComponentsRegistry from './registry'

import { LanguageProvider } from "./components/LanguageProvider";

// =========================================================
// 1. CONFIGURATION DES POLICES (FONTS) - ON NE TOUCHE PAS
// =========================================================

const kigelia = localFont({
  src: [
    {
      path: "./fonts/Kigelia.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Kigelia1.otf",
      weight: "700",
      style: "normal",
    },
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

// =========================================================
// 2. VIEWPORT - ON NE TOUCHE PAS
// =========================================================
export const viewport: Viewport = {
  themeColor: "#02040a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// =========================================================
// 3. MÉTADONNÉES - ON NE TOUCHE PAS
// =========================================================
export const metadata: Metadata = {
  title: "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ | N'Ko ni Lonko",
  description: "ߖߊ߯ߓߊ ߟߐ߲ߠߌ߲ ߢߌߣߌ߲߫ ߒߞߏ ߘߐ߫. La plateforme de référence pour la science et le savoir en N'Ko.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "N'Ko ni Lonko",
  },
  openGraph: {
    title: "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ",
    description: "La Science à la portée de tous en N'Ko.",
    url: "https://nkonilonko.com",
    siteName: "N'Ko ni Lonko",
    locale: "nqo_GN",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

// =========================================================
// 4. STRUCTURE PRINCIPALE (LAYOUT) - C'EST ICI QU'ON ACTIVE
// =========================================================
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <body 
        className={`
          ${kigelia.variable} 
          ${montserrat.variable} 
          font-sans antialiased 
          bg-[#02040a] text-white
          selection:bg-[#fbbf24] selection:text-black
        `}
      >
        {/* 👇 DÉBUT DE LA PROTECTION (On active le Registry ici) 👇 */}
        <StyledComponentsRegistry>
            
            {/* On garde ton LanguageProvider à l'intérieur, intact */}
            <LanguageProvider>
               {children}
            </LanguageProvider>

        </StyledComponentsRegistry>
        {/* 👆 FIN DE LA PROTECTION 👆 */}

        <Analytics />

        <Script 
          src="https://unpkg.com/@phosphor-icons/web" 
          strategy="afterInteractive" 
        />
      </body>
    </html>
  );
}