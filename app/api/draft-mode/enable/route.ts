// ============================================================================
// N'KO NI LONKO — Activer le mode aperçu (appelé par l'onglet « Presentation » du Studio)
// ============================================================================
// L'outil officiel vérifie que la demande vient d'un Studio connecté (secret
// à usage unique), puis active le mode aperçu pour ce navigateur seulement.
// ============================================================================

import { defineEnableDraftMode } from "next-sanity/draft-mode";
import { client } from "../../../../sanity/client";

export const { GET } = defineEnableDraftMode({
  client: client.withConfig({ token: process.env.SANITY_API_READ_TOKEN }),
});
