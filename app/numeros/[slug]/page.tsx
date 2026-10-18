import type { Metadata } from "next";
import { notFound } from "next/navigation";
import VueNumero from "../../components/numero/VueNumero";
import { TEXTES_NUMEROS, numeroFr, numeroNko } from "../../components/numero/textes";
import { getLiensNumeros, getNumero, type Numero } from "../../lib/numeros";
import { COMPTE_X, IMAGE_PARTAGE_ACCUEIL } from "../../lib/partage";
import { jsonLd } from "../../lib/jsonld";

// ============================================================================
// N'KO NI LONKO — Page d'un numéro de la revue (ex. /numeros/003)
// ============================================================================
// Un numéro absent ou non publié → page 404. Données : app/lib/numeros.ts ;
// affichage : app/components/numero/VueNumero.tsx.
// ============================================================================

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nkonilonko.com";


const urlDe = (numero: Numero) => `${SITE_URL}/numeros/${numero.slug}`;
const titreDe = (numero: Numero) =>
  numero.seoTitle || `${numeroNko(numero.numero)} · ${numeroFr(numero.numero)}${numero.titleFr ? ` — ${numero.titleFr}` : ""}`;
// Résumé du numéro ; à défaut, celui de l'édito (décision du propriétaire)
const resumeDe = (numero: Numero) => numero.excerpt || numero.sommaire.find((a) => a._id === numero.editoRef)?.excerpt;
// Image de partage : la couverture recadrée en 1200×630 ; à défaut, l'image de l'accueil (jamais next/og)
const imagePartage = (numero: Numero) =>
  numero.couverture?.url
    ? { url: `${numero.couverture.url}?w=1200&h=630&fit=crop&fm=jpg&q=80`, width: 1200, height: 630, alt: numero.couverture.alt || numeroFr(numero.numero) }
    : IMAGE_PARTAGE_ACCUEIL;

export async function generateStaticParams() {
  return (await getLiensNumeros()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const numero = await getNumero(slug);
  if (!numero) return { title: TEXTES_NUMEROS.lesNumeros.fr };
  const url = urlDe(numero);
  const titre = titreDe(numero);
  const description = resumeDe(numero);
  const image = imagePartage(numero);
  return {
    title: titre,
    description,
    // « nqo » (N'Ko) n'est pas dans la liste de Next.js : même écriture que la page article
    alternates: { canonical: url, languages: { nqo: url, "fr-FR": url, "x-default": url } as Record<string, string> },
    openGraph: { title: titre, description, url, siteName: "N'Ko ni Lonko", locale: "nqo", alternateLocale: ["fr_FR"], type: "website", images: [image] },
    twitter: { card: "summary_large_image", title: titre, description, images: [image], creator: COMPTE_X, site: COMPTE_X },
  };
}

export default async function PageNumero({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const numero = await getNumero(slug);
  if (!numero) notFound();

  const url = urlDe(numero);
  const parution = {
    "@context": "https://schema.org",
    "@type": "PublicationIssue",
    "@id": url,
    url,
    issueNumber: String(numero.numero),
    datePublished: numero.publishedAt,
    name: `${numeroFr(numero.numero)}${numero.titleFr ? ` — ${numero.titleFr}` : ""}`,
    inLanguage: ["nqo", "fr"],
    ...(numero.couverture?.url ? { image: numero.couverture.url } : {}),
    ...(resumeDe(numero) ? { description: resumeDe(numero) } : {}),
    isPartOf: { "@type": "Periodical", name: "N'Ko ni Lonko", url: SITE_URL },
    hasPart: numero.sommaire.map((article) => ({
      "@type": "ScholarlyArticle",
      headline: article.title,
      url: `${SITE_URL}/article/${article.slug}`,
    })),
  };
  const filAriane = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "N'Ko ni Lonko", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: TEXTES_NUMEROS.lesNumeros.fr, item: `${SITE_URL}/numeros` },
      { "@type": "ListItem", position: 3, name: numeroFr(numero.numero), item: url },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(parution) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(filAriane) }} />
      <VueNumero numero={numero} />
    </>
  );
}
