import createImageUrlBuilder from '@sanity/image-url'
import { client } from './client'

// ✅ CORRECTION 1 : On utilise 'any' ici pour arrêter de se battre avec les versions de types.
// En production, c'est acceptable pour ce petit utilitaire car Sanity gère déjà la complexité.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SanityImageSource = any; 

const builder = createImageUrlBuilder(client)

export function urlFor(source: SanityImageSource) {
  // ✅ SECURITÉ (L'Airbag) :
  // Si on nous donne "rien" (null/undefined), on renvoie le builder tel quel
  // ou undefined pour éviter que la fonction .image() ne plante violemment.
  if (!source) {
    return undefined;
  }
  
  return builder.image(source)
}