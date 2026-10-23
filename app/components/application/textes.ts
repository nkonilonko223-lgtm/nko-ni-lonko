// ============================================================================
// N'KO NI LONKO — Textes de l'application du site (installation, numéro téléchargé, hors ligne)
// ============================================================================
// Un seul fichier pour tous les textes de l'application (23 octobre 2026).
// N'Ko : fourni par la rédaction et copié tel quel par programme, jamais écrit par une IA.
// Champ « nko » vide = texte demandé à la rédaction (docs/TEXTES-NKO-A-DEMANDER.md, L21 à L34) :
// seul le français s'affiche en attendant. Fichier sans JSX : aussi lu par
// scripts/application/generer.mjs (manifestes de l'application).
// ============================================================================

export type Libelle = { nko: string; fr: string };

// --- Déjà fournis, repris tels quels ------------------------------------------------------
export const INSTALLER_APPLICATION: Libelle = { nko: "ߊ߬ ߟߊߖߌ߰ ߜߋߟߋ߲ߜߋߟߋ߲ ߞߣߐ߫", fr: "Installer l'application" }; // menu de l'accueil
export const INSTALLER: Libelle = { nko: "ߊ߬ ߟߊߖߌ߰", fr: "Installer" }; // bouton de l'accueil
export const FERMER: Libelle = { nko: "ߊ߬  ߘߊߕߎ߲߬", fr: "Fermer" }; // lexique
export const NUMEROS: Libelle = { nko: "ߝߙߍߕߍ ߟߎ߬", fr: "Numéros" }; // menu du site
export const LEXIQUE: Libelle = { nko: "ߞߎߡߊߘߋ߲ ߛߙߍߘߍ", fr: "Lexique" }; // lexique
export const MA_BIBLIOTHEQUE: Libelle = { nko: "ߒ ߠߊ߫ ߟߍߙߘߊ", fr: "Ma bibliothèque" }; // L14 b, L15 a, L16

// --- À fournir par la rédaction (L21 à L34) -------------------------------------------------
// Proposition d'installer l'application (à partir du 2ᵉ article lu)
export const INSTALLER_POURQUOI: Libelle = { nko: "", fr: "Lisez la revue en plein écran, même sans connexion." }; // L21
export const PLUS_TARD: Libelle = { nko: "", fr: "Plus tard" }; // L22

// Guide iPhone et iPad (l'iPhone n'a pas de bouton « Installer »). Les mots entre « » sont ceux
// de l'iPhone en français.
export const GUIDE_TITRE: Libelle = { nko: "", fr: "Ajouter N'Ko ni Lonko à l'écran d'accueil" }; // L23
export const GUIDE_ETAPES: readonly Libelle[] = [
  { nko: "", fr: "Touchez « Partager » (si vous ne le voyez pas : d'abord « ⋯ »)" }, // L24 a
  { nko: "", fr: "Choisissez « Sur l'écran d'accueil »" }, // L24 b
  { nko: "", fr: "Touchez « Ajouter »" }, // L24 c
];

// « Télécharger le numéro » (page d'un numéro)
export const TELECHARGER_NUMERO: Libelle = { nko: "", fr: "Télécharger le numéro" }; // L25
export const TELECHARGER_POURQUOI: Libelle = { nko: "", fr: "Tous ses articles et leurs images, lisibles sans connexion." }; // L26
export const TELECHARGEMENT: Libelle = { nko: "", fr: "Téléchargement…" }; // L27
export const DISPONIBLE: Libelle = { nko: "", fr: "Disponible sans connexion" }; // L28
export const RETIRER: Libelle = { nko: "", fr: "Retirer de l'appareil" }; // L29
export const REPRENDRE: Libelle = { nko: "", fr: "Reprendre le téléchargement" }; // L30
export const ERREUR_CONNEXION: Libelle = { nko: "", fr: "Pas de connexion : réessayez plus tard." }; // L31

// Page « pas de connexion » : ce que l'on peut lire sur cet appareil
export const DISPONIBLE_APPAREIL: Libelle = { nko: "", fr: "Disponible sur cet appareil" }; // L32
export const NUMEROS_TELECHARGES: Libelle = { nko: "", fr: "Numéros téléchargés" }; // L33
export const PAGES_RECENTES: Libelle = { nko: "", fr: "Pages lues récemment" }; // L34
