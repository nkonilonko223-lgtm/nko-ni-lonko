import { latexInput } from 'sanity-plugin-latex-input';
import { codeInput } from '@sanity/code-input';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';

// 🚀 LE COURT-CIRCUIT 1/1000 : On importe directement les fichiers à la source !
import author from './sanity/schemas/author';
import article from './sanity/schemas/article';
import subscriber from './sanity/schemas/subscriber';
// 👻 Le schéma 'message' a été purifié pour l'architecture Fantôme

export default defineConfig({
  name: 'default',
  title: 'NKo Ni Lonko Blog',

  projectId: 'yfsyhc2p',
  dataset: 'production',
  basePath: '/studio',

  plugins: [
    structureTool(), // Mode automatique pour l'instant, on veut juste voir l'onglet !
    visionTool(),
    latexInput(),
    codeInput(),
  ],

  schema: {
    // 🚀 L'INJECTION DIRECTE : On force le compilateur à lire les 3 fichiers restants
    types: [author, article, subscriber],
  },
});