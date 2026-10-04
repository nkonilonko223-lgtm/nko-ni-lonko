import type { Metadata } from "next";
import Link from "next/link";
import { getSanityClient } from "../../sanity/fetch";
import { TEXTES_LEXIQUE } from "../components/lexique/textes";

// ============================================================================
// N'KO NI LONKO — Dictionnaire scientifique N'Ko – français (tous les termes)
// ============================================================================

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nkonilonko.com";

interface TermeListe {
  termeNko?: string;
  termeFr?: string;
  definitionFr?: string;
  domaine?: string;
  slug: string;
}

export const metadata: Metadata = {
  title: `${TEXTES_LEXIQUE.dictionnaire.nko} | ${TEXTES_LEXIQUE.dictionnaire.fr}`,
  description: "Dictionnaire scientifique N'Ko – français de la revue N'Ko ni Lonko : chaque terme défini en N'Ko et en français.",
  alternates: { canonical: `${SITE_URL}/lexique` },
};

const QUERY = `*[_type == "terme" && defined(slug.current)] | order(termeFr asc) {
  termeNko, termeFr, definitionFr, domaine, "slug": slug.current
}`;

// Évite que du texte saisi ferme la balise <script> des données structurées
const jsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

export default async function PageLexique() {
  const { client: sanity, apercu } = await getSanityClient();
  let termes: TermeListe[] = [];
  try {
    termes = await sanity.fetch<TermeListe[]>(QUERY, {}, apercu ? { cache: "no-store" } : { next: { tags: ["terme"], revalidate: 3600 } });
  } catch (error) {
    console.error("Erreur Fetch Lexique:", error);
  }

  // Regroupement par domaine (les termes sans domaine sont regroupés à la fin)
  const groupes = new Map<string, TermeListe[]>();
  for (const terme of termes) {
    const cle = terme.domaine || "";
    groupes.set(cle, [...(groupes.get(cle) || []), terme]);
  }
  const domaines = [...groupes.keys()].sort((a, b) => (a === "" ? 1 : b === "" ? -1 : 0));

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
    <main className="min-h-screen bg-[#02040a] text-white px-4 py-16 md:py-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(donneesStructurees) }} />
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-12">
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
          <p className="text-center text-white/50" lang="fr">Le lexique est en cours de préparation.</p>
        ) : (
          domaines.map((domaine) => (
            <section key={domaine || "sans-domaine"} className="mb-10">
              {domaine && (
                <h2 lang="nqo" dir="rtl" className="font-kigelia text-xl font-bold text-[#fbbf24] mb-4 border-b border-white/10 pb-2">
                  {domaine}
                </h2>
              )}
              <ul className="grid gap-3 sm:grid-cols-2">
                {(groupes.get(domaine) || []).map((t) => (
                  <li key={t.slug}>
                    <Link
                      href={`/lexique/${t.slug}`}
                      className="block rounded-xl border border-white/10 bg-white/[0.02] p-4 hover:border-blue-400/50 hover:bg-blue-400/5 transition-colors"
                    >
                      <span lang="nqo" dir="rtl" className="block font-kigelia text-lg font-bold text-blue-300">{t.termeNko}</span>
                      <span lang="fr" dir="ltr" className="block font-sans text-sm text-white/80">{t.termeFr}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}

        <p className="text-center mt-12">
          <Link href="/" className="text-[#fbbf24] underline underline-offset-4" lang="fr">Retour à l&apos;accueil</Link>
        </p>
      </div>
    </main>
  );
}
