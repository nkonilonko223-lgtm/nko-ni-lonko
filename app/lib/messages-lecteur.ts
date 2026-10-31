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
  nko: "", // L38 : demandé à la rédaction
  fr: "Presque fini ! Ouvrez l'e-mail que vous allez recevoir et confirmez votre abonnement.",
};

// Pourquoi le bouton d'envoi reste gris (lettre, contact)
export const ADRESSE_A_REVOIR: Libelle = {
  nko: "", // L39 : demandé à la rédaction
  fr: "Cette adresse e-mail ne semble pas correcte.",
};
// Repris tel quel de la page de contact (texte existant)
export const VERIFICATION_EN_COURS: Libelle = { nko: "ߡߊ߬ߞߐ߬ߣߐ߲߬ߠߌ߲ ߞߍ߫ ߣߍ߲ߞߍ߫", fr: "Analyse de sécurité en cours..." };
export const VERIFICATION_ECHEC: Libelle = {
  nko: "", // L40 : demandé à la rédaction
  fr: "La vérification n'a pas abouti. Vérifiez votre connexion, puis réessayez.",
};
// Repris tel quel de la page « Aucune connexion » (texte existant)
export const REESSAYER: Libelle = { nko: "ߊ߬ ߡߊߝߍߣߍ߲߫ ߕߎ߲߯", fr: "Réessayer" };
