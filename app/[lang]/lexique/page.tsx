import type { Metadata } from "next";
import { versionLangue } from "../../lib/carte-partage";
import { langueDe } from "../../lib/langue";
import LienLangue from "../../components/LienLangue";
import { getSanityClient } from "../../../sanity/fetch";
import { TEXTES_LEXIQUE } from "../../components/lexique/textes";
import DictionnaireInteractif, { type TermeDictionnaire } from "../../components/lexique/DictionnaireInteractif";
import { comparerNko } from "../../components/lexique/normaliser";
import { COMPTE_X, IMAGE_PARTAGE_LEXIQUE } from "../../lib/partage";
import { jsonLd } from "../../lib/jsonld";
import TermeDuJour from "../../components/lexique/TermeDuJour";

// ============================================================================
// N'KO NI LONKO — Dictionnaire scientifique N'Ko – français (tous les termes)
// ============================================================================
// Ordre alphabétique N'Ko, recherche instantanée, index des lettres.
// Aucune statistique éditoriale n'est affichée (ni nombre de termes, ni articles).
// ============================================================================

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nkonilonko.com";

const TITRE = `${TEXTES_LEXIQUE.dictionnaire.nko} | ${TEXTES_LEXIQUE.dictionnaire.fr}`;
const DESCRIPTION = "Dictionnaire scientifique N'Ko – français de la revue N'Ko ni Lonko : chaque terme défini en N'Ko et en français.";

const METADONNEES: Metadata = {
  title: TITRE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/lexique` },
  // Image de partage du dictionnaire (scripts/images-partage/generer.mjs)
  openGraph: {
    title: TITRE,
    description: DESCRIPTION,
    url: `${SITE_URL}/lexique`,
    siteName: "N'Ko ni Lonko",
    locale: "nqo",
    alternateLocale: ["fr_FR"],
    type: "website",
    images: [IMAGE_PARTAGE_LEXIQUE],
  },
  twitter: { card: "summary_large_image", title: TITRE, description: DESCRIPTION, images: [IMAGE_PARTAGE_LEXIQUE], creator: COMPTE_X, site: COMPTE_X },
};

// Deux versions (N'Ko : adresse sans préfixe ; français : /fr) : titre, description, carte de
// partage et adresses dans la langue de l'adresse (app/lib/carte-partage.ts, versionLangue)
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  return versionLangue(METADONNEES, langueDe((await params).lang), { chemin: "/lexique" });
}

const QUERY = `*[_type == "terme" && defined(slug.current)] {
  termeNko, termeFr, definitionNko, definitionFr, domaine, "slug": slug.current
}`;


export default async function PageLexique() {
  const { client: sanity, apercu } = await getSanityClient();
  let termes: TermeDictionnaire[] = [];
  try {
    termes = await sanity.fetch<TermeDictionnaire[]>(QUERY, {}, apercu ? { cache: "no-store" } : { next: { tags: ["terme"], revalidate: 3600 } });
  } catch (error) {
    console.error("Erreur Fetch Lexique:", error);
  }
  termes.sort((a, b) => comparerNko(a.termeNko, b.termeNko));

  const donneesStructurees = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "@id": `${SITE_URL}/lexique`,
    name: TEXTES_LEXIQUE.dictionnaire.fr,
    alternateName: TEXTES_LEXIQUE.dictionnaire.nko,
    inLanguage: ["nqo", "fr"],
    hasDefinedTerm: termes.map((t) => ({
      "@type": "DefinedTerm",
      name: t.termeFr,
      alternateName: t.termeNko,
      description: t.definitionFr,
      url: `${SITE_URL}/lexique/${t.slug}`,
    })),
  };

  return (
    <main className="min-h-screen bg-void text-white px-4 py-16 md:py-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(donneesStructurees) }} />
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="flex flex-col items-center gap-2">
            <span lang="nqo" dir="rtl" className="font-kigelia text-3xl md:text-4xl font-bold text-blue-300">
              {TEXTES_LEXIQUE.dictionnaire.nko}
            </span>
            <span lang="fr" dir="ltr" className="font-sans text-sm md:text-base uppercase tracking-[0.25em] text-white/60">
              {TEXTES_LEXIQUE.dictionnaire.fr}
            </span>
          </h1>
          <div className="w-16 h-1 bg-blue-400/60 mx-auto mt-6 rounded-full" />
        </header>

        {termes.length === 0 ? (
          <p className="text-center text-gray-500" lang="fr" dir="ltr">Le lexique est en cours de préparation.</p>
        ) : (
          <>
            <TermeDuJour termes={termes} />
            <DictionnaireInteractif termes={termes} />
          </>
        )}

        <p className="text-center mt-12">
          <LienLangue href="/" className="text-or underline underline-offset-4" lang="fr">Retour à l&apos;accueil</LienLangue>
        </p>
      </div>
    </main>
  );
}
