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
  
  // SANS le cache de Sanity (CDN), même en production (23 octobre 2026). Ce client ne sert QUE côté
  // serveur : les visiteurs reçoivent des pages déjà faites, gardées par Next.js et vidées par la
  // sonnette Sanity (/api/revalidate). Avec le CDN, la page reconstruite juste après la sonnette
  // pouvait recevoir l'ANCIENNE version du document et la garder une heure (constat : article
  // reclassé, accueil et page de l'article restés anciens). C'est la recommandation de next-sanity
  // pour la mise à jour par étiquettes ; Sanity n'est interrogé qu'à la fabrication des pages.
  useCdn: false,

  // Sanity très lent ou muet (1er novembre 2026) : sans cette ligne, une page sans copie attendrait 5 minutes,
  // puis Vercel couperait la fonction avec son propre message, en anglais. Ici, l'erreur arrive en 15 s : le
  // lecteur voit la page de secours de la revue, et une page déjà faite reste en place. Un délai dépassé n'est
  // jamais réessayé. Les réessais (coupures du réseau, réponses 429, 502 et 503) n'atteignent Sanity que hors du
  // rendu d'une page (flux RSS, plan du site, generateStaticParams) : dans le rendu, Next.js rend le résultat du
  // premier appel, gardé en mémoire. Pas à la construction : personne n'attend, et une réponse lente ne doit
  // pas faire échouer un déploiement. Les routes /api n'utilisent pas ce client : elles ont leur propre délai.
  ...(process.env.NEXT_PHASE === "phase-production-build" ? {} : { timeout: 15_000, maxRetries: 2 }),

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