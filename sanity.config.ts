import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision'; // Optionnel mais utile pour tester

// 👇 OPTIMISATION : On importe le tableau complet depuis l'index
import { schemaTypes } from './sanity/schemas';

export default defineConfig({
  name: 'default',
  title: 'NKo Ni Lonko Blog',

  projectId: 'yfsyhc2p',
  dataset: 'production',
  basePath: '/studio',

  plugins: [
    structureTool(),
    visionTool(), // Ajoute un onglet "Vision" pour tester tes requêtes (très utile !)
  ],

  schema: {
    // 👇 C'est ici que la magie opère. Tout est connecté.
    types: schemaTypes,
  },
});