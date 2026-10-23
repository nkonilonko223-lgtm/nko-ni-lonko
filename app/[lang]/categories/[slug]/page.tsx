import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleCard from "../../../components/ArticleCard";
import LienLangue from "../../../components/LienLangue";
import PiluleRetour from "../../../components/PiluleRetour";
import { GRILLE_FIXE } from "../../../components/numero/VueRubrique";
import { toNkoDigits } from "../../../components/texte/outils";
import { DISCIPLINES, cleDeCategorie, disciplineDeSlug, valeursDeCle } from "../../../lib/categories";
import { getArticlesCartes, getValeursCategories } from "../../../lib/cartes-articles";
import { versionLangue } from "../../../lib/carte-partage";
import { adresse, langueDe } from "../../../lib/langue";
import { jsonLd } from "../../../lib/jsonld";
import { COMPTE_X, IMAGE_PARTAGE_ACCUEIL } from "../../../lib/partage";
import messagesNko from "../../../messages/nko.json";
import messagesFr from "../../../messages/fr.json";

// ============================================================================
// N'KO NI LONKO — Page d'une discipline (ex. /categories/astronomie), composant serveur
// ============================================================================
// Tous les articles publiés de la discipline, du plus récent au plus ancien. Une discipline sans
// article n'a pas de page (404). Mise à jour à chaque publication (étiquette « article »).
// N'Ko de l'interface : le nom de la discipline, « Accueil » et « Articles », repris du dictionnaire
// du site (app/messages/nko.json) — aucun texte N'Ko nouveau.
// ============================================================================

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nkonilonko.com";
const NOMS_NKO: Record<string, string> = messagesNko.home.categories;
const NOMS_FR: Record<string, string> = messagesFr.home.categories;
const ACCUEIL = { nko: messagesNko.nav.home, fr: "Accueil" };
const ARTICLES = { nko: messagesNko.nav.articles, fr: "Articles" };

async function donnees(slug: string) {
  const discipline = disciplineDeSlug(slug);
  if (!discipline) return null;
  const articles = await getArticlesCartes(valeursDeCle(discipline.cle));
  if (articles.length === 0) return null;
  return { discipline, articles, nko: NOMS_NKO[discipline.cle], fr: NOMS_FR[discipline.cle] };
}

// Pages construites à l'avance : les disciplines qui ont au moins un article publié
export async function generateStaticParams() {
  const cles = new Set((await getValeursCategories()).map(cleDeCategorie));
  return DISCIPLINES.filter((d) => cles.has(d.cle)).map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  const d = await donnees(slug);
  if (!d) return { title: "404" };
  const titre = `${d.nko} | ${d.fr}`;
  const description = `Les articles de la revue N'Ko ni Lonko en ${d.fr.toLocaleLowerCase("fr")}, en N'Ko et en français.`;
  const url = `${SITE_URL}/categories/${slug}`;
  // Deux versions (B6) : nom N'Ko / nom français de la discipline
  return versionLangue({
    title: titre,
    description,
    alternates: { canonical: url },
    openGraph: { title: titre, description, url, siteName: "N'Ko ni Lonko", locale: "nqo", alternateLocale: ["fr_FR"], type: "website", images: [IMAGE_PARTAGE_ACCUEIL] },
    twitter: { card: "summary_large_image", title: titre, description, images: [IMAGE_PARTAGE_ACCUEIL], creator: COMPTE_X, site: COMPTE_X },
  }, langueDe(lang), { chemin: `/categories/${slug}` });
}

export default async function PageDiscipline({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const langue = langueDe(lang);
  const d = await donnees(slug);
  if (!d) notFound();
  const fr = langue === "fr";
  const nombre = d.articles.length;
  const url = adresse(langue, `/categories/${slug}`);

  // Données Google : une collection d'articles de la revue, et le fil d'Ariane
  const donneesGoogle = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#page`,
        "url": url,
        "name": fr ? d.fr : d.nko,
        "inLanguage": fr ? "fr" : "nqo",
        "isPartOf": { "@id": `${SITE_URL}/#website` },
        "about": { "@id": `${SITE_URL}/#revue` },
        "mainEntity": {
          "@type": "ItemList",
          "numberOfItems": nombre,
          "itemListElement": d.articles.map((a, i) => ({ "@type": "ListItem", "position": i + 1, "url": adresse(langue, `/article/${a.slug}`) })),
        },
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": fr ? ACCUEIL.fr : ACCUEIL.nko, "item": adresse(langue, "/") },
          { "@type": "ListItem", "position": 2, "name": fr ? d.fr : d.nko, "item": url },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#02040a] px-4 pb-20 pt-28 text-white md:pt-36">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(donneesGoogle) }} />
      <PiluleRetour />
      <header className="mx-auto mb-12 max-w-5xl text-center">
        {/* Fil d'Ariane : Accueil › discipline (le chevron se retourne tout seul en N'Ko) */}
        <nav aria-label={fr ? "Fil d'Ariane" : undefined} className="mb-6">
          <ol className="flex items-center justify-center gap-2 text-sm text-white/60">
            <li>
              <LienLangue href="/" className="transition-colors hover:text-[#fbbf24]">
                {fr ? <span lang="fr">{ACCUEIL.fr}</span> : <span lang="nqo" dir="rtl" className="font-kigelia">{ACCUEIL.nko}</span>}
              </LienLangue>
            </li>
            <li aria-hidden="true">›</li>
            <li aria-current="page" className="text-white/80">
              {fr ? <span lang="fr">{d.fr}</span> : <span lang="nqo" dir="rtl" className="font-kigelia">{d.nko}</span>}
            </li>
          </ol>
        </nav>
        <i className={`ph-bold ${d.discipline.icone} text-4xl text-[#fbbf24]`} aria-hidden="true"></i>
        <h1 className="mt-3 flex flex-col items-center gap-1">
          <span lang="nqo" dir="rtl" className="font-kigelia text-4xl font-bold text-[#fbbf24] md:text-5xl">{d.nko}</span>
          <span lang="fr" className="text-xs uppercase tracking-widest text-white/60">{d.fr}</span>
        </h1>
        <p className="mt-4 flex items-center justify-center gap-2 text-sm text-white/60">
          <span lang="nqo" dir="rtl" className="font-kigelia text-base">{ARTICLES.nko} · {toNkoDigits(nombre)}</span>
          <span aria-hidden="true">·</span>
          <span lang="fr">{nombre} {nombre > 1 ? "articles" : "article"}</span>
        </p>
      </header>

      <div className="grid-container mx-auto max-w-6xl" style={GRILLE_FIXE}>
        {d.articles.map((article, i) => (
          <ArticleCard key={article.slug} article={article} isPriority={i < 3} />
        ))}
      </div>
    </main>
  );
}
