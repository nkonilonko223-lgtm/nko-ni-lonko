// ============================================================================
// N'KO NI LONKO — Choix des articles « À lire aussi » (fin de la page article)
// ============================================================================
// Les plus proches d'abord : termes du lexique en commun (3 points chacun), même rubrique
// (2 points), même catégorie (1 point) ; à égalité, le plus récent. Jusqu'à 3 articles.
// Fonction pure : la page article lui donne les autres articles publiés (une seule requête).
// ============================================================================

export type Voisin = {
  title: string;
  slug: string;
  category?: string;
  rubrique?: string | null; // référence de la rubrique
  termes?: string[] | null; // références des termes du lexique reliés dans le texte
  publishedAt?: string;
  image?: { url?: string; alt?: string; altNko?: string } | null;
};

type Courant = { category?: string; rubrique?: string | null; termes?: string[] | null };

export function choisirVoirAussi(courant: Courant, voisins: Voisin[], combien = 3): Voisin[] {
  const mesTermes = new Set(courant.termes || []);
  const note = (v: Voisin) =>
    3 * new Set((v.termes || []).filter((t) => mesTermes.has(t))).size +
    (courant.rubrique && v.rubrique === courant.rubrique ? 2 : 0) +
    (courant.category && v.category?.trim() === courant.category.trim() ? 1 : 0);
  return voisins
    .filter((v) => v.slug && v.title)
    .map((v) => ({ v, n: note(v) }))
    .sort((a, b) => b.n - a.n || (b.v.publishedAt || "").localeCompare(a.v.publishedAt || ""))
    .slice(0, combien)
    .map(({ v }) => v);
}
