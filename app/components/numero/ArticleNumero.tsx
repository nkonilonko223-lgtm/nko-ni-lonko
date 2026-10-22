import LienLangue from "../LienLangue";
import type { LienDuSommaire, NumeroDeLArticle, RubriqueCourte } from "../../lib/numeros";
import { TEXTES_NUMEROS, numeroFr, paruDansFr, paruDansNko } from "./textes";
import { LibelleEnLigne, TitreArticle } from "./VueNumero";

// ============================================================================
// N'KO NI LONKO — Le numéro et la rubrique sur la page article (composants serveur)
// ============================================================================
// Rendus par app/article/[slug]/page.tsx et placés dans ArticleClient
// (emplacements « bandeau », « surtitre », « navigation »). Rien n'est affiché
// pour un article hors numéro ou sans rubrique.
// ============================================================================

// « Paru dans le N°003 », lien vers la page du numéro
export function BandeauNumero({ numero }: { numero: NumeroDeLArticle }) {
  return (
    <div className="mb-4 flex justify-center md:mb-6">
      <LienLangue
        href={`/numeros/${numero.slug}`}
        className="inline-flex min-h-11 flex-wrap items-center justify-center gap-x-2 rounded-full border border-[#fbbf24]/40 px-4 py-1 text-[#fbbf24] transition-colors hover:bg-[#fbbf24]/10 print:min-h-0 print:border-0 print:text-gray-600"
      >
        <span lang="nqo" dir="rtl" className="font-kigelia text-base">{paruDansNko(numero.numero)}</span>
        <span aria-hidden="true" className="text-white/30 print:text-gray-400">·</span>
        <span lang="fr" className="text-xs uppercase tracking-widest">{paruDansFr(numero.numero)}</span>
      </LienLangue>
    </div>
  );
}

// Rubrique de l'article, juste au-dessus du titre
export function SurtitreRubrique({ rubrique }: { rubrique: RubriqueCourte }) {
  if (!rubrique.titleNko && !rubrique.titleFr) return null;
  return (
    <p className="-mt-2 mb-6 flex flex-wrap items-baseline justify-center gap-x-3 md:-mt-3 md:mb-8">
      {rubrique.titleNko && <span lang="nqo" dir="rtl" className="font-kigelia text-lg text-white/80 print:text-gray-700">{rubrique.titleNko}</span>}
      {rubrique.titleFr && <span lang="fr" className="text-[11px] uppercase tracking-widest text-white/50 print:text-gray-600">{rubrique.titleFr}</span>}
    </p>
  );
}

function Voisin({ article, sens }: { article: LienDuSommaire; sens: "precedent" | "suivant" }) {
  const libelle = sens === "precedent" ? TEXTES_NUMEROS.articlePrecedent : TEXTES_NUMEROS.articleSuivant;
  return (
    <LienLangue
      href={`/article/${article.slug}`}
      rel={sens === "precedent" ? "prev" : "next"}
      className="group flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-center transition-colors hover:border-[#fbbf24]/50"
    >
      <span className="flex items-center gap-2 text-[#fbbf24]">
        {/* Flèches retournées quand la page est de droite à gauche (N'Ko) */}
        {sens === "precedent" && <i className="ph-bold ph-arrow-left rtl:-scale-x-100" aria-hidden="true" />}
        <LibelleEnLigne texte={libelle} />
        {sens === "suivant" && <i className="ph-bold ph-arrow-right rtl:-scale-x-100" aria-hidden="true" />}
      </span>
      <span className="block w-full">
        <TitreArticle titre={article.title} />
      </span>
    </LienLangue>
  );
}

// Article précédent / suivant, dans l'ordre du sommaire (articles publiés seulement)
export function NavigationNumero({ numero, slug }: { numero: NumeroDeLArticle; slug: string }) {
  const liens = numero.sommaire.filter((a): a is LienDuSommaire => !!a?.slug);
  const i = liens.findIndex((a) => a.slug === slug);
  const precedent = i > 0 ? liens[i - 1] : null;
  const suivant = i >= 0 ? liens[i + 1] : null;
  if (!precedent && !suivant) return null;

  // role="navigation" plutôt que <nav> : globals.css donne à toute balise <nav> le style de la barre du haut (collante)
  return (
    <div role="navigation" aria-label={numeroFr(numero.numero)} className="mx-auto mb-12 grid max-w-3xl gap-3 px-4 sm:grid-cols-2 md:px-6 print:hidden">
      {precedent ? <Voisin article={precedent} sens="precedent" /> : <span className="hidden sm:block" aria-hidden="true" />}
      {suivant && <Voisin article={suivant} sens="suivant" />}
    </div>
  );
}
