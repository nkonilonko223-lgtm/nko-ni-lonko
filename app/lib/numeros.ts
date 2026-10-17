// ============================================================================
// N'KO NI LONKO — Données des numéros de la revue (serveur uniquement)
// ============================================================================
// Une seule requête GROQ par page, avec projections. Le numéro POINTE vers ses
// articles (sommaire) ; un article non publié n'est jamais renvoyé au public
// (le site lit sans clé). Mode aperçu (Studio → Presentation) : brouillons, sans cache.
// Cache : étiquettes « numero » et « article », vidées par /api/revalidate.
// ============================================================================

import { client } from "../../sanity/client";
import { getSanityClient } from "../../sanity/fetch";

export type ImageNumero = {
  alt?: string;
  captionNko?: string;
  caption?: string;
  source?: string; // crédit (ex. NASA/SDO)
  url?: string;
  largeur?: number;
  hauteur?: number;
  lqip?: string;
};

export type RubriqueCourte = { titleNko?: string; titleFr?: string; slug?: string };

export type ArticleDuSommaire = {
  _id: string;
  title: string;
  excerpt?: string;
  slug: string;
  image?: ImageNumero | null;
  rubrique?: RubriqueCourte | null;
};

export type Numero = {
  numero: number;
  saison?: number;
  titleNko?: string;
  titleFr?: string;
  publishedAt: string;
  seoTitle?: string;
  excerpt?: string;
  slug: string;
  couverture?: ImageNumero | null;
  editoRef?: string;
  aLaUneRef?: string;
  sommaire: ArticleDuSommaire[];
};

export type NumeroCourt = Pick<Numero, "numero" | "saison" | "titleNko" | "titleFr" | "publishedAt" | "slug" | "couverture">;

// Numéro d'un article (page article) : un article non publié du sommaire est renvoyé vide (null)
export type LienDuSommaire = { title: string; slug: string };
export type NumeroDeLArticle = { numero: number; slug: string; sommaire: (LienDuSommaire | null)[] };

// À placer dans la requête de l'article : le numéro le plus récent qui le cite
export const PROJECTION_NUMERO_DE_L_ARTICLE = `*[_type == "numero" && references(^._id)] | order(numero desc)[0] {
  numero, "slug": slug.current, "sommaire": sommaire[]->{ title, "slug": slug.current }
}`;

const IMAGE = `{ alt, captionNko, caption, source, "url": asset->url, "largeur": asset->metadata.dimensions.width, "hauteur": asset->metadata.dimensions.height, "lqip": asset->metadata.lqip }`;

const REQUETE_NUMERO = `*[_type == "numero" && slug.current == $slug][0] {
  numero, saison, titleNko, titleFr, publishedAt, seoTitle, excerpt, "slug": slug.current,
  "couverture": couverture${IMAGE},
  "editoRef": edito._ref, "aLaUneRef": aLaUne._ref,
  "sommaire": sommaire[]->{
    _id, title, excerpt, "slug": slug.current,
    "image": mainImage${IMAGE},
    "rubrique": rubrique->{ titleNko, titleFr, "slug": slug.current }
  }
}`;

const REQUETE_NUMEROS = `*[_type == "numero" && defined(slug.current)] | order(numero desc) {
  numero, saison, titleNko, titleFr, publishedAt, "slug": slug.current, "couverture": couverture${IMAGE}
}`;

// Un numéro complet (page /numeros/[slug]). null si absent ou non publié.
export async function getNumero(slug: string): Promise<Numero | null> {
  const { client: sanity, apercu } = await getSanityClient();
  try {
    const brut = await sanity.fetch<(Omit<Numero, "sommaire"> & { sommaire?: (ArticleDuSommaire | null)[] }) | null>(
      REQUETE_NUMERO,
      { slug },
      apercu ? { cache: "no-store" } : { next: { tags: ["numero", "article"], revalidate: 3600 } }
    );
    if (!brut) return null;
    // Un article du sommaire pas encore publié est renvoyé vide : on l'écarte
    return { ...brut, sommaire: (brut.sommaire || []).filter((a): a is ArticleDuSommaire => !!a?.slug) };
  } catch (error) {
    console.error("Erreur Fetch Numéro:", error);
    return null;
  }
}

// Tous les numéros publiés, du plus récent au plus ancien (page /numeros)
export async function getNumeros(): Promise<NumeroCourt[]> {
  const { client: sanity, apercu } = await getSanityClient();
  try {
    return await sanity.fetch<NumeroCourt[]>(
      REQUETE_NUMEROS,
      {},
      apercu ? { cache: "no-store" } : { next: { tags: ["numero"], revalidate: 3600 } }
    );
  } catch (error) {
    console.error("Erreur Fetch Numéros:", error);
    return [];
  }
}

// Liens des numéros publiés (pages construites à l'avance et plan du site)
export async function getLiensNumeros(): Promise<{ slug: string; publishedAt?: string }[]> {
  try {
    return await client.fetch<{ slug: string; publishedAt?: string }[]>(
      `*[_type == "numero" && defined(slug.current)]{ "slug": slug.current, publishedAt }`,
      {},
      { next: { tags: ["numero"], revalidate: 3600 } }
    );
  } catch {
    return [];
  }
}
