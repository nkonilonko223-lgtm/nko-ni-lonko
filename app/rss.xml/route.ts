import { fluxRss } from "../lib/flux-rss";

// Flux RSS de la version N'Ko (app/lib/flux-rss.ts). Préparé à l'avance, refait toutes les heures
// au plus tard, et dès qu'un article est publié (étiquette « article » de la sonnette Sanity).
export const revalidate = 3600;

export function GET() {
  return fluxRss("nqo");
}
