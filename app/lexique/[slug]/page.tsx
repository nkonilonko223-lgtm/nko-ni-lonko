import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { client } from "../../../sanity/client";
import { getSanityClient } from "../../../sanity/fetch";
import { TEXTES_LEXIQUE } from "../../components/lexique/textes";

// ============================================================================
// N'KO NI LONKO — Page d'un terme du lexique (+ articles qui l'utilisent)
// ============================================================================

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nkonilonko.com";

interface TermeComplet {
  termeNko?: string;
  termeFr?: string;
  definitionNko?: string;
  definitionFr?: string;
  domaine?: string;
  slug: string;
  articles: { title: string; slug: string }[];
}

const QUERY = `*[_type == "terme" && slug.current == $slug][0] {
  termeNko, termeFr, definitionNko, definitionFr, domaine, "slug": slug.current,
  "articles": *[_type == "article" && references(^._id) && defined(slug.current)] | order(publishedAt desc) {
    title, "slug": slug.current
  }
}`;

const jsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

async function getTerme(slug: string): Promise<TermeComplet | null> {
  const { client: sanity, apercu } = await getSanityClient();
  try {
    return await sanity.fetch<TermeComplet | null>(
      QUERY,
      { slug },
      apercu ? { cache: "no-store" } : { next: { tags: ["terme", "article"], revalidate: 3600 } }
    );
  } catch (error) {
    console.error("Erreur Fetch Terme:", error);
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const slugs = await client.fetch<{ slug: string }[]>(`*[_type == "terme" && defined(slug.current)]{ "slug": slug.current }`);
    return slugs.map(({ slug }) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const terme = await getTerme(slug);
  if (!terme) return { title: TEXTES_LEXIQUE.lexique.fr };
  return {
    title: `${terme.termeNko || ""} · ${terme.termeFr || ""} | ${TEXTES_LEXIQUE.dictionnaire.fr}`,
    description: terme.definitionFr,
    alternates: { canonical: `${SITE_URL}/lexique/${terme.slug}` },
  };
}

export default async function PageTerme({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const terme = await getTerme(slug);
  if (!terme) notFound();

  const donneesStructurees = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "@id": `${SITE_URL}/lexique/${terme.slug}`,
    name: terme.termeFr,
    alternateName: terme.termeNko,
    description: terme.definitionFr,
    inDefinedTermSet: `${SITE_URL}/lexique`,
    url: `${SITE_URL}/lexique/${terme.slug}`,
  };

  return (
    <main className="min-h-screen bg-[#02040a] text-white px-4 py-16 md:py-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(donneesStructurees) }} />
      <article className="max-w-2xl mx-auto">
        <p className="text-center mb-8">
          <Link href="/lexique" className="inline-flex flex-col items-center text-blue-300 hover:text-white">
            <span lang="nqo" dir="rtl" className="font-kigelia text-base">{TEXTES_LEXIQUE.dictionnaire.nko}</span>
            <span lang="fr" className="font-sans text-[11px] uppercase tracking-widest text-white/50">{TEXTES_LEXIQUE.dictionnaire.fr}</span>
          </Link>
        </p>

        <div lang="nqo" dir="rtl" className="mb-8">
          <h1 className="font-kigelia text-3xl md:text-4xl font-bold text-blue-300 mb-3">{terme.termeNko}</h1>
          <p className="font-kigelia text-lg leading-[1.9] text-gray-200">{terme.definitionNko}</p>
        </div>

        <div lang="fr" dir="ltr" className="mb-8 border-t border-white/10 pt-6">
          <p className="font-sans text-2xl font-bold text-blue-300 mb-2">{terme.termeFr}</p>
          <p className="font-sans text-base leading-relaxed text-gray-300">{terme.definitionFr}</p>
        </div>

        {terme.domaine && (
          <p className="mb-8 flex flex-wrap items-center gap-2 text-sm">
            <span lang="nqo" className="font-kigelia text-white/60">{TEXTES_LEXIQUE.domaine.nko}</span>
            <span className="text-white/30">/</span>
            <span lang="fr" className="text-white/60">{TEXTES_LEXIQUE.domaine.fr} :</span>
            <span lang="nqo" dir="rtl" className="font-kigelia text-[#fbbf24]">{terme.domaine}</span>
          </p>
        )}

        {terme.articles.length > 0 && (
          <section className="border-t border-white/10 pt-6">
            <h2 className="mb-4 flex flex-col gap-1">
              <span lang="nqo" dir="rtl" className="font-kigelia text-lg font-bold text-white">{TEXTES_LEXIQUE.articlesQuiUtilisent.nko}</span>
              <span lang="fr" className="font-sans text-xs uppercase tracking-widest text-white/50">{TEXTES_LEXIQUE.articlesQuiUtilisent.fr}</span>
            </h2>
            <ul className="space-y-2">
              {terme.articles.map((a) => (
                <li key={a.slug}>
                  <Link href={`/article/${a.slug}#lexique`} dir="auto" className="text-[#fbbf24] underline underline-offset-4 hover:text-white">
                    {a.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </main>
  );
}
