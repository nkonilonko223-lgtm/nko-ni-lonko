// ============================================================================
// N'KO NI LONKO — Disciplines (catégories) des articles (23 octobre 2026)
// ============================================================================
// Une seule table pour tout le site (avant : deux copies, ArticleCard et HomeClient).
// La valeur enregistrée dans Sanity est le nom N'Ko de la discipline (liste du Studio,
// sanity/schemas/article.ts) ; le site la traduit en clé (« astronomy »), qui donne son nom dans
// chaque langue (app/messages/*.json → home.categories) et l'adresse de sa page
// (/categories/astronomie). Fichier partagé serveur / navigateur : ni données, ni secret.
// ============================================================================

// Valeur Sanity (nom N'Ko, ou « Science » par défaut) → clé de la discipline
export const CATEGORY_REVERSE_MAP: Record<string, string> = {
  'ߛߊ߲ߡߊߛߓߍߟߐ߲ߘߐߦߊ': 'astronomy',
  'ߘߐ߬ߞߏ': 'physics',
  'ߣߌߡߊߞߊߙߊ߲': 'biology',
  'ߘߡߊ߬ߟߐ߲': 'mathematics',
  'ߖߎ߯ߛߊߟߐ߲ߘߐߦߊ': 'chemistry',
  'ߘߎ߰ߘߐ߬ߟߐ߲ߘߐߦߊ': 'geology',
  'ߛߋߒߞߏߟߊߘߐߦߊ': 'technology',
  'ߘߐ߬ߝߐ': 'history',
  'ߞߍ߲ߘߍߦߊ': 'health',
  'ߝߐ߬ߓߍ߬ߝߐߓߍ ߞߊߙߏߟߞߊ': 'review',
  'Science': 'science',
  'ߟߐ߲ߞߏ': 'science'
};

// Disciplines qui ont une page (/categories/<slug>, /fr/categories/<slug>). « Revue Mensuelle »
// n'est pas une discipline : son étiquette mène à l'archive des numéros (décision du 23 octobre 2026).
// Icônes : celles déjà utilisées par le site (Phosphor, auto-hébergées).
export const DISCIPLINES = [
  { cle: "astronomy", slug: "astronomie", icone: "ph-star" },
  { cle: "physics", slug: "physique", icone: "ph-atom" },
  { cle: "chemistry", slug: "chimie", icone: "ph-flask" },
  { cle: "mathematics", slug: "mathematiques", icone: "ph-function" },
  { cle: "biology", slug: "biologie", icone: "ph-dna" },
  { cle: "health", slug: "sante", icone: "ph-heartbeat" },
  { cle: "geology", slug: "geologie", icone: "ph-mountains" },
  { cle: "technology", slug: "technologie", icone: "ph-robot" },
  { cle: "history", slug: "histoire", icone: "ph-scroll" },
] as const;

export type Discipline = (typeof DISCIPLINES)[number];

export const cleDeCategorie = (valeur?: string | null): string => {
  const v = (valeur ?? "").trim();
  return CATEGORY_REVERSE_MAP[v] || v.toLowerCase();
};

export const disciplineDeCle = (cle: string): Discipline | undefined => DISCIPLINES.find((d) => d.cle === cle);
export const disciplineDeSlug = (slug: string): Discipline | undefined => DISCIPLINES.find((d) => d.slug === slug);

// Valeurs Sanity d'une discipline (requête de sa page), tirées de la table : aucun N'Ko recopié
export const valeursDeCle = (cle: string): string[] =>
  Object.entries(CATEGORY_REVERSE_MAP).filter(([, c]) => c === cle).map(([valeur]) => valeur);

// Où mène l'étiquette d'une catégorie (adresse sans la langue) : la page de la discipline,
// l'archive des numéros pour « Revue Mensuelle », rien pour une valeur inconnue
export function cheminDeCle(cle: string): string | null {
  if (cle === "review") return "/numeros";
  const discipline = disciplineDeCle(cle);
  return discipline ? `/categories/${discipline.slug}` : null;
}
