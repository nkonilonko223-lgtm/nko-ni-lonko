import { createClient } from "next-sanity";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "yfsyhc2p";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // ✨ MAGIE ICI :
  // Si on est en "production" (site en ligne), on active le CDN (Rapide).
  // Si on est en "développement" (sur ton ordi), on le désactive (Mise à jour instantanée).
  useCdn: process.env.NODE_ENV === "production", 
});