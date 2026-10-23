import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PiluleRetour from "../../../components/PiluleRetour";
import VueRubrique from "../../../components/numero/VueRubrique";
import { getLiensRubriques, getRubrique } from "../../../lib/rubriques";
import { versionLangue } from "../../../lib/carte-partage";
import { adresse, langueDe } from "../../../lib/langue";
import { jsonLd } from "../../../lib/jsonld";
import { COMPTE_X, IMAGE_PARTAGE_ACCUEIL } from "../../../lib/partage";
import messagesNko from "../../../messages/nko.json";

// ============================================================================
// N'KO NI LONKO — Page d'une rubrique (ex. /rubriques/le-ciel-du-mois), composant serveur
// ============================================================================
// La rubrique numéro après numéro (comme les chroniques des grands magazines). Absente, en
// brouillon ou sans article publié → 404. Données : app/lib/rubriques.ts ; affichage :
// app/components/numero/VueRubrique.tsx. Les rubriques du N°003 apparaîtront seules le jour de
// leur publication (sonnette Sanity).
// ============================================================================

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nkonilonko.com";

export async function generateStaticParams() {
  return (await getLiensRubriques()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  const rubrique = await getRubrique(slug);
  if (!rubrique) return { title: "404" };
  const titre = [rubrique.titleNko, rubrique.titleFr].filter(Boolean).join(" | ");
  const description = rubrique.descriptionFr?.trim()
    || `La rubrique « ${rubrique.titleFr || rubrique.titleNko} » de la revue N'Ko ni Lonko, numéro après numéro, en N'Ko et en français.`;
  const url = `${SITE_URL}/rubriques/${slug}`;
  return versionLangue({
    title: titre,
    description,
    alternates: { canonical: url },
    openGraph: { title: titre, description, url, siteName: "N'Ko ni Lonko", locale: "nqo", alternateLocale: ["fr_FR"], type: "website", images: [IMAGE_PARTAGE_ACCUEIL] },
    twitter: { card: "summary_large_image", title: titre, description, images: [IMAGE_PARTAGE_ACCUEIL], creator: COMPTE_X, site: COMPTE_X },
  }, langueDe(lang), { chemin: `/rubriques/${slug}` });
}

export default async function PageRubrique({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const langue = langueDe(lang);
  const rubrique = await getRubrique(slug);
  if (!rubrique) notFound();
  const fr = langue === "fr";
  const url = adresse(langue, `/rubriques/${slug}`);
  const nom = (fr ? rubrique.titleFr || rubrique.titleNko : rubrique.titleNko || rubrique.titleFr) ?? slug;

  // Données Google : une collection d'articles de la revue, et le fil d'Ariane
  const donneesGoogle = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#page`,
        "url": url,
        "name": nom,
        "inLanguage": fr ? "fr" : "nqo",
        "isPartOf": { "@id": `${SITE_URL}/#website` },
        "about": { "@id": `${SITE_URL}/#revue` },
        "mainEntity": {
          "@type": "ItemList",
          "numberOfItems": rubrique.articles.length,
          "itemListElement": rubrique.articles.map((a, i) => ({ "@type": "ListItem", "position": i + 1, "url": adresse(langue, `/article/${a.slug}`) })),
        },
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": fr ? "Accueil" : messagesNko.nav.home, "item": adresse(langue, "/") },
          { "@type": "ListItem", "position": 2, "name": fr ? "Numéros" : messagesNko.nav.numeros, "item": adresse(langue, "/numeros") },
          { "@type": "ListItem", "position": 3, "name": nom, "item": url },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#02040a] px-4 pb-20 pt-28 text-white md:pt-36">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(donneesGoogle) }} />
      <PiluleRetour />
      <VueRubrique rubrique={rubrique} langue={langue} />
    </main>
  );
}
