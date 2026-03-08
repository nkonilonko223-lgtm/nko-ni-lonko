import { type SchemaTypeDefinition } from 'sanity';

import article from './article';
import author from './author';
import subscriber from './subscriber';

// ============================================================================
// MATRICE DES DONNÉES : N'KO NI LONKO
// ============================================================================
// Architecture stricte : Tous les schémas doivent être typés et compartimentés.
// ============================================================================

export const schemaTypes: SchemaTypeDefinition[] = [
  // --------------------------------------------------------------------------
  // 1. ENTITÉS FONDAMENTALES (Core)
  // --------------------------------------------------------------------------
  author,

  // --------------------------------------------------------------------------
  // 2. CONTENU ÉDITORIAL & PUBLICATIONS
  // --------------------------------------------------------------------------
  article,

  // --------------------------------------------------------------------------
  // 3. INFRASTRUCTURE & EXTENSIONS FUTURES (API Newsletter)
  // --------------------------------------------------------------------------
  subscriber,

  // --------------------------------------------------------------------------
  // 4. COMMUNICATIONS & INTERACTIONS (Contact)
  // --------------------------------------------------------------------------
];