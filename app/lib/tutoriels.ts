// ============================================================================
// N'KO NI LONKO — Tutoriels vidéo « Bien utiliser N'Ko ni Lonko » (page /tutoriels), serveur uniquement
// ============================================================================
// Le site lit sans clé : un tutoriel encore en brouillon n'est jamais montré. Mode aperçu (Studio →
// Presentation) : brouillons, sans cache. Cache : étiquette « tutoriel », vidée par /api/revalidate.
// ============================================================================

import { client } from "../../sanity/client";
import { getSanityClient } from "../../sanity/fetch";

export type TexteBilingue = { nko?: string | null; fr?: string | null };
export type ImageTutoriel = { url?: string | null; largeur?: number | null; hauteur?: number | null; lqip?: string | null; hotspot?: { x?: number; y?: number } | null };
export type Diapo = { _key: string; legende?: TexteBilingue | null; image?: { url?: string | null } | null };
export type Tutoriel = {
  _id: string;
  numero: number;
  titre?: TexteBilingue | null;
  resume?: TexteBilingue | null;
  youtubeId?: string | null;
  duree?: string | null;
  publishedAt?: string | null;
  miniature?: ImageTutoriel | null;
  diapos?: Diapo[] | null;
};

const REQUETE_TUTORIELS = `*[_type == "tutoriel" && defined(numero)] | order(numero asc) {
  _id, numero, titre, resume, youtubeId, duree, publishedAt,
  "miniature": miniature{ "url": asset->url, "largeur": asset->metadata.dimensions.width, "hauteur": asset->metadata.dimensions.height, "lqip": asset->metadata.lqip, "hotspot": hotspot{ x, y } },
  "diapos": diapos[]{ _key, legende, "image": image{ "url": asset->url } }
}`;

// Tous les tutoriels publiés, dans l'ordre des vidéos
export async function getTutoriels(): Promise<Tutoriel[]> {
  const { client: sanity, apercu } = await getSanityClient();
  return sanity.fetch<Tutoriel[]>(
    REQUETE_TUTORIELS,
    {},
    apercu ? { cache: "no-store" } : { next: { tags: ["tutoriel"], revalidate: 3600 } }
  );
}

// Y a-t-il au moins un tutoriel publié ? Sinon, ni lien dans le menu, ni entrée dans le plan du site :
// le lecteur ne tombe pas sur une page vide entre la mise en ligne du code et celle des vidéos.
export async function aDesTutoriels(): Promise<boolean> {
  return client.fetch<boolean>(
    `count(*[_type == "tutoriel" && defined(numero)]) > 0`,
    {},
    { next: { tags: ["tutoriel"], revalidate: 3600 } }
  );
}

// Image d'une diapositive en WebP, par le service d'images de Sanity. Grande taille : le fichier d'origine, déjà un
// WebP de 1080 px (une taille ou une qualité demandée le réencoderait, parfois plus lourd : mesuré le 1er novembre 2026).
// Petite taille : réduite, jamais agrandie.
export const adresseDiapo = (url: string, largeur: 540 | 1080) =>
  largeur === 1080 ? `${url}?fm=webp` : `${url}?w=${largeur}&fit=max&fm=webp&q=80`;

// « 3:50 » → « PT3M50S » (durée demandée par Google)
export function dureeIso(duree: string): string {
  const [minutes, secondes] = duree.split(":");
  return `PT${Number(minutes)}M${Number(secondes)}S`;
}
