// ============================================================================
// N'KO NI LONKO — Langue dans l'adresse (point B6 du Lot 2, 22 octobre 2026)
// ============================================================================
// Chaque page existe en deux versions préparées à l'avance (dossier app/[lang]/) :
//   N'Ko     : adresse sans préfixe (« N'Ko Is King »)  →  /article/<slug>
//   français : adresse en /fr                           →  /fr/article/<slug>
// Le filtre proxy.ts sert la version N'Ko (dossier interne « nqo ») aux adresses sans /fr :
// les adresses déjà partagées ne changent pas.
// L'interface appelle les langues « nko » et « fr » (LanguageProvider, fichiers de messages).
// ============================================================================

export type Langue = "nqo" | "fr";
export const LANGUES: readonly Langue[] = ["nqo", "fr"];

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nkonilonko.com";

export const estLangue = (v: unknown): v is Langue => v === "nqo" || v === "fr";
export const langueDe = (v: unknown): Langue => (v === "fr" ? "fr" : "nqo");
// Langue de l'interface (« nko » / « fr ») ↔ langue de l'adresse (« nqo » / « fr »)
export const langueInterface = (langue: Langue) => (langue === "fr" ? "fr" : "nko");
export const langueAdresse = (langue: "nko" | "fr"): Langue => (langue === "fr" ? "fr" : "nqo");

// Chemin d'une page dans une langue. « chemin » commence par « / » (« /about », « /?category=… »)
export function cheminLangue(langue: Langue, chemin: string): string {
  if (langue !== "fr") return chemin;
  if (chemin === "/") return "/fr";
  if (chemin.startsWith("/?") || chemin.startsWith("/#")) return `/fr${chemin.slice(1)}`;
  return `/fr${chemin}`;
}

// Chemin sans la langue (pour passer d'une version à l'autre de la même page)
export function cheminSansLangue(pathname: string): string {
  if (pathname === "/fr") return "/";
  return pathname.startsWith("/fr/") ? pathname.slice(3) : pathname;
}

// Adresse complète d'une page dans une langue (canonique, hreflang, plan du site, partage)
export const adresse = (langue: Langue, chemin: string) => `${SITE_URL}${cheminLangue(langue, chemin)}`;
