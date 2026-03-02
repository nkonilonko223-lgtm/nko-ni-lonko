import { createImageUrlBuilder } from '@sanity/image-url'
import { client } from './client';

// ============================================================================
// MATRICE DES DONNÉES : N'KO NI LONKO - MOTEUR DE RENDU VISUEL
// ============================================================================
// Architecture stricte : Typage auto-déduit, zéro 'any', sécurité anti-crash.
// ============================================================================

// ----------------------------------------------------------------------------
// 1. INSTANCIATION DU BUILDER (Le Moteur)
// ----------------------------------------------------------------------------
// Initialise le générateur d'URL avec la configuration sécurisée de notre client.
const builder = createImageUrlBuilder(client);

// ----------------------------------------------------------------------------
// 2. EXTRACTION DYNAMIQUE DES TYPES (L'Ingénierie Adaptative)
// ----------------------------------------------------------------------------
// Au lieu de forcer des chemins internes fragiles qui font rougir VS Code, 
// nous obligeons TypeScript à lire l'ADN de la fonction officielle de Sanity.
type ImageUrlBuilder = ReturnType<typeof createImageUrlBuilder>;
type SanityImageSource = Parameters<ImageUrlBuilder['image']>[0];

// ----------------------------------------------------------------------------
// 3. RÉSOLUTION D'URL (Le Filtre de Sécurité)
// ----------------------------------------------------------------------------
export function urlFor(source: SanityImageSource): ImageUrlBuilder | undefined {
  // ✅ SÉCURITÉ ABSOLUE (L'Airbag Intelligent) :
  // Si la source est vide ou corrompue, on stoppe l'exécution proprement
  // pour éviter un crash fatal (Écran blanc) sur l'interface utilisateur.
  if (!source) {
    return undefined;
  }
  
  // Retourne le builder parfaitement typé, prêt à être chaîné 
  // dans nos composants UI (ex: .width(800).format('webp'))
  return builder.image(source);
}