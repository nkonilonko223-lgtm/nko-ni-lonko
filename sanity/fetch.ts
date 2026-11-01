import { draftMode } from "next/headers";
import { client } from "./client";

// ============================================================================
// N'KO NI LONKO — Choix du client Sanity selon le mode aperçu
// ============================================================================
// Mode aperçu (activé depuis le Studio) : lecture des brouillons avec la clé
// « Viewer » (SANITY_API_READ_TOKEN), côté serveur uniquement, sans cache.
// Sinon : le client public habituel (contenu publié, CDN), rien ne change.
//
// Panne de Sanity (1er novembre 2026) : les lectures du site n'attrapent PAS les erreurs. Une panne n'est
// pas une absence. Si l'erreur remonte, Next.js garde la dernière bonne page et réessaie à la visite suivante,
// et une construction échoue au lieu de mettre des pages fausses en ligne. Rendre null ou [] donnait des
// articles « introuvables » et un accueil vide. null ne veut dire qu'une chose : le document n'existe pas.
// ============================================================================

const READ_TOKEN = process.env.SANITY_API_READ_TOKEN;

export async function getSanityClient() {
  const { isEnabled } = await draftMode();

  if (isEnabled && READ_TOKEN) {
    return {
      apercu: true,
      client: client.withConfig({
        token: READ_TOKEN,
        useCdn: false,
        apiVersion: "2025-02-19", // version requise pour la perspective « drafts »
        perspective: "drafts",
        stega: false, // pas de caractères invisibles (édition visuelle : plus tard)
      }),
    };
  }

  return { apercu: false, client };
}
