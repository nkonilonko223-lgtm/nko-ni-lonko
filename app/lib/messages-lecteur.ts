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
  fr: "Presque fini ! Ouvrez le courriel que vous allez recevoir et confirmez votre abonnement.",
};
