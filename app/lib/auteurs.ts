// ============================================================================
// N'KO NI LONKO — Données des auteurs (pages /auteurs/[slug]), serveur uniquement
// ============================================================================
// Une seule requête par page. Seuls les articles PUBLIÉS sont renvoyés (le site lit sans clé).
// WhatsApp n'est JAMAIS renvoyé : ce serait un numéro de téléphone (règle du propriétaire).
// Cache : une heure, et l'étiquette « article » (vidée à chaque publication d'article).
// ============================================================================

import { client } from "../../sanity/client";

export type ArticleDeLAuteur = {
  title: string;
  slug: string;
  publishedAt?: string;
  image?: { alt?: string; altNko?: string; url?: string } | null;
};

export type Auteur = {
  _id: string;
  name: string;
  nameNko?: string | null;
  slug: string;
  role?: string | null;
  roleNko?: string | null;
  institution?: string | null;
  orcid?: string | null;
  expertise?: string[] | null;
  bio?: string | null;
  bioNko?: string | null;
  image?: { alt?: string; url?: string } | null;
  socials: { platform: string; url: string }[];
  articles: ArticleDeLAuteur[];
};

const REQUETE_AUTEUR = `*[_type == "author" && slug.current == $slug][0]{
  _id, name, nameNko, "slug": slug.current, role, roleNko, institution, orcid, expertise, bio, bioNko,
  "image": image{ alt, "url": asset->url },
  "socials": coalesce(socials[platform != "whatsapp" && defined(url)]{ platform, url }, []),
  "articles": *[_type == "article" && references(^._id) && defined(slug.current)] | order(publishedAt desc){
    title, "slug": slug.current, publishedAt, "image": mainImage{ alt, altNko, "url": asset->url }
  }
}`;

const CACHE = { next: { tags: ["article", "author"], revalidate: 3600 } };

export async function getAuteur(slug: string): Promise<Auteur | null> {
  try {
    return await client.fetch<Auteur | null>(REQUETE_AUTEUR, { slug }, CACHE);
  } catch (error) {
    console.error("Erreur Fetch Auteur:", error);
    return null;
  }
}

// Auteurs qui ont au moins un article publié (pages construites à l'avance et plan du site)
export async function getLiensAuteurs(): Promise<{ slug: string; modifie?: string }[]> {
  try {
    return await client.fetch<{ slug: string; modifie?: string }[]>(
      `*[_type == "author" && defined(slug.current) && count(*[_type == "article" && references(^._id)]) > 0]{
        "slug": slug.current, "modifie": _updatedAt
      }`,
      {},
      CACHE
    );
  } catch {
    return [];
  }
}
