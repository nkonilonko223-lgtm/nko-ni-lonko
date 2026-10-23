// ============================================================================
// N'KO NI LONKO — Rubriques de la revue (pages /rubriques/<slug>), serveur uniquement
// ============================================================================
// Une rubrique (Édito, Grand sujet, Le Ciel du mois…) regroupe ses articles numéro après numéro,
// du plus récent au plus ancien, chacun avec le numéro où il est paru. Une rubrique n'a de page
// que si elle a au moins un article publié. Le site lit sans clé : une rubrique ou un article
// encore en brouillon n'est jamais montré. Cache : étiquettes « numero » et « article », vidées
// par la sonnette Sanity (/api/revalidate) à chaque publication d'un article, d'un numéro ou
// d'une rubrique.
// ============================================================================

import { client } from "../../sanity/client";
import { getSanityClient } from "../../sanity/fetch";
import { CHAMPS_CARTE, transformSafeHomeArticle, type SafeHomeArticle, type SanityHomeArticleRaw } from "./cartes-articles";

export type NumeroDeRubrique = { numero: number; slug: string };
export type ArticleDeRubrique = SafeHomeArticle & { numero: NumeroDeRubrique | null };
export type Rubrique = {
  titleNko?: string;
  titleFr?: string;
  descriptionFr?: string;
  slug: string;
  articles: ArticleDeRubrique[];
};

const REQUETE_RUBRIQUE = `*[_type == "rubrique" && slug.current == $slug][0] {
  titleNko, titleFr, descriptionFr, "slug": slug.current,
  "articles": *[_type == "article" && rubrique._ref == ^._id] | order(publishedAt desc) {${CHAMPS_CARTE},
    "numero": *[_type == "numero" && references(^._id)] | order(numero desc)[0] { numero, "slug": slug.current }
  }
}`;

type RubriqueBrute = Omit<Rubrique, "articles"> & {
  articles?: (SanityHomeArticleRaw & { numero?: NumeroDeRubrique | null })[];
};

// Une rubrique et ses articles publiés ; null si absente ou sans article publié
export async function getRubrique(slug: string): Promise<Rubrique | null> {
  const { client: sanity, apercu } = await getSanityClient();
  try {
    const brut = await sanity.fetch<RubriqueBrute | null>(
      REQUETE_RUBRIQUE,
      { slug },
      apercu ? { cache: "no-store" } : { next: { tags: ["numero", "article"], revalidate: 3600 } }
    );
    if (!brut?.articles?.length) return null;
    return {
      ...brut,
      articles: brut.articles.map((a) => ({ ...transformSafeHomeArticle(a), numero: a.numero ?? null })),
    };
  } catch (error) {
    console.error("Erreur Fetch Rubrique:", error);
    return null;
  }
}

// Rubriques qui ont au moins un article publié (pages construites à l'avance et plan du site)
export async function getLiensRubriques(): Promise<{ slug: string }[]> {
  try {
    return await client.fetch<{ slug: string }[]>(
      `*[_type == "rubrique" && defined(slug.current) && count(*[_type == "article" && rubrique._ref == ^._id]) > 0]{ "slug": slug.current }`,
      {},
      { next: { tags: ["numero", "article"], revalidate: 3600 } }
    );
  } catch {
    return [];
  }
}
