import { entreesPlanDuSite } from "../lib/plan-du-site";

// Plan du site, en route ordinaire (31 octobre 2026), comme les flux RSS. Avec app/sitemap.ts, Next.js
// écrit une fiche sans durée ; Vercel gardait alors la même copie jusqu'à la mise en ligne suivante,
// et un numéro publié n'y entrait pas (constat C-01). Ici : une heure au plus, et la sonnette Sanity
// (app/api/revalidate) le refait dès une publication.
export const revalidate = 3600;

const xml = (texte: string) => texte.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

export async function GET() {
  const entrees = await entreesPlanDuSite();
  const corps = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
    ...entrees.map((e) => [
      `<url>`,
      `<loc>${xml(e.url)}</loc>`,
      ...Object.entries(e.alternates?.languages ?? {}).map(([langue, adresse]) => `<xhtml:link rel="alternate" hreflang="${langue}" href="${xml(String(adresse))}" />`),
      ...(e.images ?? []).map((image) => `<image:image><image:loc>${xml(image)}</image:loc></image:image>`),
      e.lastModified ? `<lastmod>${new Date(e.lastModified).toISOString()}</lastmod>` : "",
      e.changeFrequency ? `<changefreq>${e.changeFrequency}</changefreq>` : "",
      e.priority !== undefined ? `<priority>${e.priority}</priority>` : "",
      `</url>`,
    ].filter(Boolean).join("")),
    `</urlset>`,
  ].join("\n");

  return new Response(corps, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
