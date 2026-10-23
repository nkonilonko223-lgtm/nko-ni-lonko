import ArticleCard from "../ArticleCard";
import LienLangue from "../LienLangue";
import { toNkoDigits } from "../texte/outils";
import { numeroFr, numeroNko } from "./textes";
import type { Rubrique } from "../../lib/rubriques";
import type { Langue } from "../../lib/langue";
import messagesNko from "../../messages/nko.json";

// ============================================================================
// N'KO NI LONKO — Affichage d'une rubrique de la revue (composant serveur)
// ============================================================================
// Fil d'Ariane (Accueil › Numéros › rubrique), nom N'Ko puis français, description française
// (rédaction), nombre d'articles, puis les cartes, chacune avec le numéro où l'article est paru.
// Séparé de la page (app/[lang]/rubriques/[slug]/page.tsx) pour pouvoir être essayé avec les
// brouillons du N°003. N'Ko de l'interface repris du dictionnaire du site : aucun texte nouveau.
// ============================================================================

const ACCUEIL = { nko: messagesNko.nav.home, fr: "Accueil" };
const NUMEROS = { nko: messagesNko.nav.numeros, fr: "Numéros" };
const ARTICLES = { nko: messagesNko.nav.articles, fr: "Articles" };

// Colonnes de largeur fixe : avec peu d'articles, les cartes ne s'étirent pas sur toute la page
export const GRILLE_FIXE = { gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))" };

const Libelle = ({ texte, fr }: { texte: { nko: string; fr: string }; fr: boolean }) =>
  fr ? <span lang="fr">{texte.fr}</span> : <span lang="nqo" dir="rtl" className="font-kigelia">{texte.nko}</span>;

export default function VueRubrique({ rubrique, langue }: { rubrique: Rubrique; langue: Langue }) {
  const fr = langue === "fr";
  const nombre = rubrique.articles.length;
  const nom = fr ? rubrique.titleFr || rubrique.titleNko : rubrique.titleNko || rubrique.titleFr;
  return (
    <>
      <header className="mx-auto mb-12 max-w-5xl text-center">
        {/* Fil d'Ariane : le chevron se retourne tout seul en N'Ko */}
        <div role="navigation" aria-label="Fil d'Ariane" className="mb-6">
          <ol className="flex flex-wrap items-center justify-center gap-2 text-sm text-white/60">
            <li>
              <LienLangue href="/" className="transition-colors hover:text-[#fbbf24]"><Libelle texte={ACCUEIL} fr={fr} /></LienLangue>
            </li>
            <li aria-hidden="true">›</li>
            <li>
              <LienLangue href="/numeros" className="transition-colors hover:text-[#fbbf24]"><Libelle texte={NUMEROS} fr={fr} /></LienLangue>
            </li>
            <li aria-hidden="true">›</li>
            <li aria-current="page" className="text-white/80">
              <span lang={nom === rubrique.titleNko ? "nqo" : "fr"} dir={nom === rubrique.titleNko ? "rtl" : "ltr"} className={nom === rubrique.titleNko ? "font-kigelia" : ""}>{nom}</span>
            </li>
          </ol>
        </div>
        <h1 className="flex flex-col items-center gap-1">
          {rubrique.titleNko && <span lang="nqo" dir="rtl" className="font-kigelia text-4xl font-bold text-[#fbbf24] md:text-5xl">{rubrique.titleNko}</span>}
          {rubrique.titleFr && (
            <span lang="fr" className={rubrique.titleNko ? "text-xs uppercase tracking-widest text-white/60" : "text-3xl font-bold text-[#fbbf24] md:text-4xl"}>{rubrique.titleFr}</span>
          )}
        </h1>
        {rubrique.descriptionFr && <p lang="fr" dir="ltr" className="mx-auto mt-4 max-w-2xl text-sm text-white/70">{rubrique.descriptionFr}</p>}
        <p className="mt-4 flex items-center justify-center gap-2 text-sm text-white/60">
          <span lang="nqo" dir="rtl" className="font-kigelia text-base">{ARTICLES.nko} · {toNkoDigits(nombre)}</span>
          <span aria-hidden="true">·</span>
          <span lang="fr" dir="ltr">{nombre} {nombre > 1 ? "articles" : "article"}</span>
        </p>
      </header>

      {/* Titre de niveau 2 (lecteurs d'écran) : les titres des cartes sont de niveau 3 */}
      <h2 className="sr-only">{fr ? <span lang="fr">{ARTICLES.fr}</span> : <span lang="nqo" dir="rtl">{ARTICLES.nko}</span>}</h2>
      <div className="grid-container mx-auto max-w-6xl" style={GRILLE_FIXE}>
        {rubrique.articles.map((article, i) => (
          <div key={article.slug} className="flex flex-col gap-3">
            <ArticleCard article={article} isPriority={i < 3} />
            {/* Le numéro où l'article est paru (N'Ko d'abord) */}
            {article.numero && (
              <LienLangue href={`/numeros/${article.numero.slug}`} className="self-center text-xs text-white/60 transition-colors hover:text-[#fbbf24]">
                <span lang="nqo" dir="rtl" className="font-kigelia text-sm">{numeroNko(article.numero.numero)}</span>
                <span aria-hidden="true"> · </span>
                <span lang="fr" dir="ltr">{numeroFr(article.numero.numero)}</span>
              </LienLangue>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
