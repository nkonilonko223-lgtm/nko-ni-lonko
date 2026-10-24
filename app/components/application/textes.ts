// ============================================================================
// N'KO NI LONKO — Textes de l'application du site (installation, numéro téléchargé, hors ligne)
// ============================================================================
// Un seul fichier pour tous les textes de l'application (23 octobre 2026).
// N'Ko : fourni par la rédaction et copié tel quel par programme, jamais écrit par une IA.
// L21 à L34 : fournis par la rédaction (fichier textes-nko-L21-L37.txt validé par MckV le
// 24 octobre 2026), copiés par programme. Un champ « nko » vide : seul le français s'affiche.
// Fichier sans JSX : aussi lu par
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

// --- Fournis par la rédaction le 24 octobre 2026 (L21 à L34) -------------------------------
// Proposition d'installer l'application (à partir du 2ᵉ article lu)
export const INSTALLER_POURQUOI: Libelle = { nko: "ߊߟߎ߫ ߦߋ߫ ߝߐ߰ߓߍ ߞߊ߬ߙߊ߲߬ ߥߊ߲߬ߥߊ߲ ߞߊߕߌߡߊ ߞߊ߲߬߸ ߤߊߟߌ߬ ߓߟߐߟߐ ߞߐߞߊ߲߫߹", fr: "Lisez la revue en plein écran, même sans connexion." }; // L21
export const PLUS_TARD: Libelle = { nko: "ߞߐߝߍ߬", fr: "Plus tard" }; // L22

// Guide iPhone et iPad (l'iPhone n'a pas de bouton « Installer »). Les mots entre « » sont ceux
// de l'iPhone en français.
export const GUIDE_TITRE: Libelle = { nko: "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ ߟߊߡߙߊ߬ ߟߊ߬ߓߍ߲߬ߣߌ߲ ߥߊ߲߬ߥߊ߲ ߞߊ߲߬", fr: "Ajouter N'Ko ni Lonko à l'écran d'accueil" }; // L23
export const GUIDE_ETAPES: readonly Libelle[] = [
  { nko: "ߊߟߎ߫ ߦߋ߫ ߡߊ߰ «ߞߵߊ߬ ߘߐߕߟߊ߫» ߟߊ߫ (ߣߴߊߟߎ߫ ߡߊ߫ ߊ߬ ߦߋ߫߸ ߡߊ߰ ߞߌ߬ߛߍ ߛߊ߬ߓߊ ߟߊ߫ ߓߊ߫ «⋯» ߟߊ߫ ߝߟߐ߫)", fr: "Touchez « Partager » (si vous ne le voyez pas : d'abord « ⋯ »)" }, // L24 a
  { nko: "ߊߟߎ߫ ߦߋ߫ ߛߎߥߊ߲ߘߟߌ ߞߍ߫ «ߟߊ߬ߓߍ߲߬ߣߌ߲ ߥߊ߲߬ߥߊ߲ ߛߊ߲ߝߍ߬»", fr: "Choisissez « Sur l'écran d'accueil »" }, // L24 b
  { nko: "ߊߟߎ߫ ߦߋ߫ ߡߊ߰ ߟߊߝߙߊ߬ߟߌ «ߟߊߝߙߊ߬» ߟߊ߫", fr: "Touchez « Ajouter »" }, // L24 c
];

// « Télécharger le numéro » (page d'un numéro)
export const TELECHARGER_NUMERO: Libelle = { nko: "ߝߙߍߕߍ ߟߊߖߌ߰", fr: "Télécharger le numéro" }; // L25
export const TELECHARGER_POURQUOI: Libelle = { nko: "ߊ߬ ߞߎߡߘߊ ߟߎ߬ ߣߌ߫ ߊ߬ߟߎ߬ ߟߊ߫ ߖߌ߬ߦߊ߬ߓߍ ߟߎ߬߸ ߓߍ߯ ߘߌ߫ ߛߋ߫ ߞߊ߬ߙߊ߲߬ ߠߊ߫ ߓߟߐߟߐ ߞߐߞߊ߲߫߹", fr: "Tous ses articles et leurs images, lisibles sans connexion." }; // L26
export const TELECHARGEMENT: Libelle = { nko: "ߟߊߖߌ߰ߟߌ…", fr: "Téléchargement…" }; // L27
export const DISPONIBLE: Libelle = { nko: "ߊ߬ ߦߋ߫ ߛߐ߬ߘߐ߲߬ߕߊ ߘߌ߫ ߓߟߐߟߐ ߞߐߞߊ߲߫", fr: "Disponible sans connexion" }; // L28
export const RETIRER: Libelle = { nko: "ߊ߬ ߓߐ߫ ߞߍߟߊ߲ ߞߣߐ߫", fr: "Retirer de l'appareil" }; // L29
export const REPRENDRE: Libelle = { nko: "ߞߐߛߊ߬ߦߌ߲߬ ߟߊߖߌ߰ߟߌ ߡߊ߬", fr: "Reprendre le téléchargement" }; // L30
export const ERREUR_CONNEXION: Libelle = { nko: "ߓߌ߬ߟߊ߬ߢߐ߲߰ߡߊ߬ߟߌ ߕߍ߫ ߦߋ߲߬ : ߊߟߎ߫ ߦߋ߫ ߛߊ߬ߦߌ߲߬ ߞߵߊ߬ ߘߐߜߍ߫ ߛߐ߯ߣߌ߲߹", fr: "Pas de connexion : réessayez plus tard." }; // L31

// Page « pas de connexion » : ce que l'on peut lire sur cet appareil
export const DISPONIBLE_APPAREIL: Libelle = { nko: "ߛߐ߬ߘߐ߲߬ߕߊ ߟߎ߬ ߘߌ߫ ߣߌ߲߬ ߞߍߟߊ߲ ߞߣߐ߫", fr: "Disponible sur cet appareil" }; // L32
export const NUMEROS_TELECHARGES: Libelle = { nko: "ߝߙߍߕߍ ߟߊߖߌ߰ߣߍ߲ ߠߎ߬", fr: "Numéros téléchargés" }; // L33
export const PAGES_RECENTES: Libelle = { nko: "ߞߐߜߍ ߞߊ߬ߙߊ߲߬ߣߍ߲ ߟߊߓߊ߲ ߠߎ߬", fr: "Pages lues récemment" }; // L34
