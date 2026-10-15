import { defineCliConfig } from 'sanity/cli';

// Configuration de la commande Sanity (export, déploiement du schéma…).
// L'identifiant du projet est public : aucun secret ici.
export default defineCliConfig({
  api: {
    projectId: 'yfsyhc2p',
    dataset: 'production',
  },
  // Le Studio enregistré chez Sanity : celui de https://www.nkonilonko.com/studio (depuis mars 2026).
  // Fixé ici pour que les commandes Sanity n'enregistrent jamais un nouveau Studio.
  // Ne pas ouvrir le Studio sur une adresse d'aperçu Vercel : il s'y enregistrerait tout seul.
  deployment: {
    appId: 'sofo4rzn3y9lp9608748cxio',
  },
});
