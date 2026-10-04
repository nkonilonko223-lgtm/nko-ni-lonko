import { defineCliConfig } from 'sanity/cli';

// Configuration de la commande Sanity (export, déploiement du schéma…).
// L'identifiant du projet est public : aucun secret ici.
export default defineCliConfig({
  api: {
    projectId: 'yfsyhc2p',
    dataset: 'production',
  },
});
