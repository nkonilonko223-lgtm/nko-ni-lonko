import type { Metadata } from "next";
import { client } from "../../../sanity/client";
import PiluleRetour from "../../components/PiluleRetour";
import MaBibliotheque, { type ArticleSauvegardable } from "../../components/bibliotheque/MaBibliotheque";

// ============================================================================
// N'KO NI LONKO — « Ma bibliothèque » (/bibliotheque) : les articles sauvegardés par le lecteur
// ============================================================================
// La liste des signets est dans le navigateur du lecteur (app/lib/bibliotheque.ts) : la page
// donne la fiche courte de chaque article publié, l'îlot client ne montre que les sauvegardés.
// Page personnelle : non indexée par les moteurs de recherche.
// ============================================================================

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nkonilonko.com";

export const metadata: Metadata = {
  title: "Ma bibliothèque",
  description: "Les articles de N'Ko ni Lonko que vous avez sauvegardés sur cet appareil.",
  alternates: { canonical: `${SITE_URL}/bibliotheque` },
  robots: { index: false, follow: true },
};

async function getArticles(): Promise<ArticleSauvegardable[]> {
  try {
    return await client.fetch<ArticleSauvegardable[]>(
      `*[_type == "article" && defined(slug.current)] | order(publishedAt desc) {
        title, "slug": slug.current, publishedAt, category, "image": mainImage{ alt, "url": asset->url }
      }`,
      {},
      { next: { tags: ["article"], revalidate: 3600 } }
    );
  } catch (error) {
    console.error("Erreur Fetch Bibliothèque:", error);
    return [];
  }
}

export default async function PageBibliotheque() {
  const articles = await getArticles();
  return (
    <main className="min-h-screen bg-[#02040a] px-4 pb-20 pt-28 text-white md:pt-36">
      <PiluleRetour />
      <MaBibliotheque articles={articles} />
    </main>
  );
}
