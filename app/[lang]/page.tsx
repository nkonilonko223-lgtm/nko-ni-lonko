import HomeClient from "../components/HomeClient";
import FenetreLangue from "../components/FenetreLangue";
import { Metadata } from "next";
import { versionLangue } from "../lib/carte-partage";
import { langueDe } from "../lib/langue";
import { IMAGE_PARTAGE_ACCUEIL } from "../lib/partage";
import { getArticlesCartes } from "../lib/cartes-articles";

// ==============================================================================
// CONSTANTE GLOBALE (Sécurité SEO)
// ==============================================================================
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nkonilonko.com";

// ==============================================================================
// 2. SEO (Armure Globale de la Page d'Accueil - MISE À JOUR 1/1000)
// ==============================================================================
const METADONNEES: Metadata = {
  // Titre Hybride : N'Ko souverain
  title: "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ | N'Ko ni Lonko",
  
  // Description Hybride : N'Ko + Français pour Google
  description: "ߓߟߐߟߐ ߝߏߟߏ߲ߝߊߟߊ߲ ߝߟߐߘߎߢߊ ߘߎߢߊ ߟߐߞߏ ߞߊ߲ ߝߌߟߡߊ ߟߊߛߋߟߌ ߞߊߡߊ߬. La première plateforme scientifique mondiale bilingue (N'Ko / Français).",
  
  alternates: {
    canonical: SITE_URL,
    // 🚀 FIX VS CODE : On force TypeScript à accepter 'nqo'
    languages: {
      'nqo': SITE_URL,
      'fr': SITE_URL,
      'x-default': SITE_URL,
    } as Record<string, string>,
  },

  // 🚀 AJOUT WORLD CLASS : Open Graph pour des partages WhatsApp/Twitter parfaits
  openGraph: {
    title: "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ | N'Ko ni Lonko",
    description: "ߖߊ߯ߓߊ ߟߐ߲ߞߏ ߣߌ߫ ߟߐ߲ߠߌ߲ ߢߌߣߌ߲߫ ߒߞߏ ߘߐ߫. Science et Savoir pour tous.",
    url: SITE_URL,
    siteName: "N'Ko ni Lonko",
    locale: "nqo",
    alternateLocale: ["fr_FR"],
    images: [IMAGE_PARTAGE_ACCUEIL],
    type: "website",
  },
};

// Deux versions (N'Ko : adresse sans préfixe ; français : /fr) : titre, description, carte de
// partage et adresses dans la langue de l'adresse (app/lib/carte-partage.ts, versionLangue)
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  return versionLangue(METADONNEES, langueDe((await params).lang), { chemin: "/" });
}

// ==============================================================================
// LA PAGE (Server Component) — cartes des articles : app/lib/cartes-articles.ts
// ==============================================================================
export default async function Home() {
  const articles = await getArticlesCartes();

  return (
    <>
      <FenetreLangue />
      <HomeClient articles={articles} />
    </>
  );
}
