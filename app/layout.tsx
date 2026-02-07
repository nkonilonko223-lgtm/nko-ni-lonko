import type { Metadata } from "next";
import localFont from "next/font/local";
import { Montserrat } from "next/font/google"; // On ajoute une belle police Google pour le Français
import "./globals.css";

// 1. CHARGEMENT DE LA POLICE N'KO (KIGELIA)
// Assure-toi que tes fichiers sont bien dans le dossier public/fonts ou app/fonts
const kigelia = localFont({
  src: [
    {
      path: "./fonts/Kigelia.otf", // Le fichier normal
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Kigelia1.otf", // Le fichier gras (si tu l'as renommé ainsi)
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-kigelia", // La variable qu'on utilise dans globals.css
  display: "swap",
});

// 2. CHARGEMENT DE LA POLICE FRANÇAISE (MONTSERRAT)
// C'est plus propre d'avoir une police dédiée pour les textes latins
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-fr",
  display: "swap",
});

// 3. MÉTADONNÉES POUR LES RÉSEAUX SOCIAUX (SEO)
export const metadata: Metadata = {
  // Le titre qui apparait dans l'onglet et sur WhatsApp
  title: "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ | N'Ko ni Lonko",
  
  // La description sous le lien
  description: "ߖߊ߯ߓߊ ߟߐ߲ߠߌ߲ ߢߌߣߌ߲߫ ߒߞߏ ߘߐ߫. La plateforme de référence pour la science et le savoir en N'Ko.",
  
  // Configuration pour le partage (Open Graph)
  openGraph: {
    title: "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ",
    description: "La Science à la portée de tous en N'Ko.",
    url: "https://nkonilonko.com", // Mettra ton vrai lien plus tard
    siteName: "N'Ko ni Lonko",
    locale: "nqo_GN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // On injecte les DEUX variables de police (N'Ko + FR)
    <html lang="nqo" dir="rtl" className={`${kigelia.variable} ${montserrat.variable}`}>
      <head>
        {/* 🔥 TRÈS IMPORTANT : Le script pour afficher tes icônes Phosphor */}
        <script src="https://unpkg.com/@phosphor-icons/web" async></script>
      </head>
      
      <body className="font-sans antialiased bg-[#02040a] text-white">
        {children}
      </body>
    </html>
  );
}