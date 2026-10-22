import { fluxRss } from "../lib/flux-rss";

// Flux RSS de la version française (app/lib/flux-rss.ts), comme /rss.xml pour le N'Ko.
export const revalidate = 3600;

export function GET() {
  return fluxRss("fr");
}
