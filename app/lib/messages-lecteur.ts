import type { Libelle } from "../components/application/textes";

// ============================================================================
// N'KO NI LONKO — Messages au lecteur (formulaires, page d'erreur)
// ============================================================================
// Identifiants L38 et suivants : liste docs/TEXTES-NKO-A-DEMANDER.md. N'Ko : fourni par la rédaction
// et copié tel quel par programme, jamais écrit par une IA. Champ « nko » vide : seul le français
// s'affiche, marqué lang="fr" (TexteLangue, app/components/application/Libelle.tsx).
// ============================================================================

// La même phrase pour un nouvel abonné et pour une adresse déjà connue : le site ne révèle pas
// si une adresse est déjà abonnée
export const ABONNEMENT_A_CONFIRMER: Libelle = {
  nko: "ߘߐ߯ߣߍ߲߫ ߊ߬ ߘߌ߫ ߓߊ߲߫߹ ߊߟߎ߫ ߘߌߣߊ߬ ߗߋߛߓߍ ߡߍ߲ ߟߊߛߐ߬ߘߐ߲߬߸ ߊߟߎ߫ ߦߴߏ߬ ߟߊߞߊ߬߸ ߞߵߊߟߎ߫ ߟߊ߫ ߡߊߝߘߎ߬ߟߌ ߟߊߛߙߋߦߊ߫߹", // L38 : rédaction, validé par MckV le 31 octobre 2026
  fr: "Presque fini ! Ouvrez l'e-mail que vous allez recevoir et confirmez votre abonnement.",
};

// Texte d'exemple des champs e-mail (lettre, contact). Forme N'Ko choisie par MckV, le 31 octobre 2026
export const CHAMP_EMAIL: Libelle = { nko: "ߗߋߞߘߎ ߛߘߐ߬ߓߛߍ", fr: "Adresse e-mail" };

// Textes d'exemple des autres champs de la page de contact : le N'Ko et le français étaient sur la même
// ligne, coupés au « • » par programme (accord de MckV, 31 octobre 2026), la partie N'Ko sans changement
export const CHAMP_NOM: Libelle = { nko: "ߌ ߕߐ߮ ߘߝߊߣߍ߲", fr: "Votre nom complet" };
export const CHAMP_MESSAGE: Libelle = { nko: "ߌ ߟߊ߫ ߗߋߛߓߍ ߛߓߍ߫ ߦߊ߲߬...", fr: "Écrivez votre message ici..." };

// Pourquoi le bouton d'envoi reste gris (lettre, contact)
export const ADRESSE_A_REVOIR: Libelle = {
  nko: "ߗߋߞߘߎ ߛߘߐ߬ߓߛߍ ߣߌ߲߬ ߦߏ߫ ߊ߬ ߡߊ߫ ߘߝߊ߫߹", // L39 : rédaction, validé par MckV le 31 octobre 2026
  fr: "Cette adresse e-mail ne semble pas correcte.",
};
// Repris tel quel de la page de contact (texte existant)
export const VERIFICATION_EN_COURS: Libelle = { nko: "ߡߊ߬ߞߐ߬ߣߐ߲߬ߠߌ߲ ߞߍ߫ ߣߍ߲ߞߍ߫", fr: "Analyse de sécurité en cours..." };
export const VERIFICATION_ECHEC: Libelle = {
  nko: "ߕߎ߬ߢߊ߬ߦߊ߬ߟߌ ߡߊ߫ ߢߊ߬߹ ߊߟߎ߫ ߦߴߊߟߎ߫ ߟߊ߫ ߓߌ߬ߟߊ߬ߢߐ߲߰ߡߊ߬ߟߌ ߝߛߍ߬ߝߛߍ߬߸ ߞߵߊߟߎ߫ ߡߊߛߊ߬ߦߌ߲߬ ߞߵߊ߬ ߘߐߜߍ߫߹", // L40 : rédaction, validé par MckV le 31 octobre 2026
  fr: "La vérification n'a pas abouti. Vérifiez votre connexion, puis réessayez.",
};
// Repris tel quel de la page « Aucune connexion » (texte existant)
export const REESSAYER: Libelle = { nko: "ߊ߬ ߡߊߝߍߣߍ߲߫ ߕߎ߲߯", fr: "Réessayer" };

// Page d'erreur du site (app/components/PageErreur.tsx)
export const PAGE_ERREUR_TITRE: Libelle = {
  nko: "ߞߐߜߍ ߣߌ߲߬ ߡߊ߫ ߛߋ߫ ߟߊߢߎ߲߫ ߠߊ߫߹", // L41 : rédaction, validé par MckV le 31 octobre 2026
  fr: "Cette page n'a pas pu se charger.",
};
export const PAGE_ERREUR_TEXTE: Libelle = {
  nko: "ߊߟߎ߫ ߟߊ߫ ߓߌ߬ߟߊ߬ߢߐ߲߰ߡߊ߬ߟߌ ߘߌ߫ ߛߋ߫ ߘߐ߯ߦߊ߫ ߟߊ߫߹ ߊߟߎ߫ ߦߋ߫ ߛߊ߬ߦߌ߲߬ ߞߵߊ߬ ߘߐߜߍ߫߸ ߥߟߊ߫ ߞߊ߬ ߞߐߛߊ߬ߦߌ߲߬ ߟߊ߬ߓߍ߲߬ߠߌ ߡߊ߬߹", // L42 : rédaction, validé par MckV le 31 octobre 2026
  fr: "Votre connexion est peut-être faible. Réessayez, ou revenez à l'accueil.",
};
// Repris tel quel du menu du site (messages/nko.json, nav.home) : pas de fichier de messages entier ici
export const ACCUEIL: Libelle = { nko: "ߟߊ߬ߓߍ߲߬ߠߌ", fr: "Accueil" };
// Repris tel quel du nom du site (messages/nko.json, metadata.siteName)
export const NOM_REVUE: Libelle = { nko: "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ", fr: "N'Ko ni Lonko" };
