import { createClient, type ClientConfig } from "next-sanity";

// ============================================================================
// MATRICE DES DONNÉES : N'KO NI LONKO - MOTEUR CLIENT SANITY
// ============================================================================
// Architecture stricte : Typage absolu, séparation des variables d'environnement,
// et anticipation du cache Next.js (App Router).
// ============================================================================

// ----------------------------------------------------------------------------
// 1. CONFIGURATION DE L'ENVIRONNEMENT (Infrastructure)
// ----------------------------------------------------------------------------
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "yfsyhc2p";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01";

// ----------------------------------------------------------------------------
// 2. TYPAGE ET PARAMÉTRAGE DU MOTEUR (Le Cerveau)
// ----------------------------------------------------------------------------
const config: ClientConfig = {
  projectId,
  dataset,
  apiVersion,
  
  // ✨ STRATÉGIE CDN HYBRIDE (Vitesse Fulgurante vs Temps Réel) :
  // En production : CDN activé pour des temps de réponse instantanés (Mobile First).
  // En développement : CDN désactivé pour voir les modifications en direct.
  useCdn: process.env.NODE_ENV === "production",

  // --------------------------------------------------------------------------
  // ANTICIPATION CACHE NEXT.JS (App Router)
  // Préparation de l'infrastructure pour la revalidation ISR (Incremental Static Regeneration).
  // À activer lorsque nous implémenterons les webhooks de mise à jour instantanée.
  // --------------------------------------------------------------------------
  // fetch: {
  //   next: {
  //     revalidate: 3600, // Revalidation toutes les heures par défaut (à affiner)
  //     tags: ['sanity-content'], // Pour une invalidation chirurgicale via API
  //   }
  // }
};

// ----------------------------------------------------------------------------
// 3. INSTANCIATION ET EXPORT (Prêt à l'emploi)
// ----------------------------------------------------------------------------
export const client = createClient(config);