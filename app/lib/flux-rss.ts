// ============================================================================
// N'KO NI LONKO — Flux RSS des articles, un par langue (22 octobre 2026)
// ============================================================================
// Standard des revues et des médias : lecteurs de flux (Feedly, Inoreader…), agrégateurs,
// envoi automatique d'une lettre. Langue dans l'adresse (B6) : un flux par version.
//   /rss.xml    : version N'Ko  (titre et résumé N'Ko, liens vers /article/…)
//   /rss-fr.xml : version française (titre et résumé français, liens vers /fr/article/…)
// Une seule langue par champ (separerLangues) ; le texte de la rédaction n'est jamais réécrit.
// Contenu PUBLIÉ seulement. Mis à jour par la « sonnette » Sanity (étiquette « article »).
// ============================================================================
import { client } from "../../sanity/client";
import { couperTexte, separerLangues } from "../components/numero/titre";
import { NOM_NKO, NOM_SITE_CARTE } from "./carte-partage";
import { adresse, type Langue } from "./langue";

type ArticleFlux = {
  slug: string;
  title?: string;
  excerpt?: string;
  excerptFr?: string;
  publishedAt?: string;
  _updatedAt?: string;
  auteur?: string;
  image?: string;
};

const REQUETE = `*[_type == "article" && defined(slug.current) && !(_id in path("drafts.**"))]
  | order(publishedAt desc)[0...50] {
  "slug": slug.current, title, excerpt, excerptFr, publishedAt, _updatedAt,
  "auteur": authors[0]->name,
  "image": mainImage.asset->url
}`;

// Caractères réservés du XML
const xml = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

export async function fluxRss(langue: Langue): Promise<Response> {
  const fr = langue === "fr";
  let articles: ArticleFlux[] = [];
  try {
    articles = await client.fetch<ArticleFlux[]>(REQUETE, {}, { next: { tags: ["article"], revalidate: 3600 } });
  } catch (error) {
    console.error("🚨 [RSS] Échec de la récupération des articles :", error);
  }

  const partie = (texte?: string) => {
    const p = separerLangues(texte);
    return fr ? (p.fr ?? p.nko) : (p.nko ?? p.fr);
  };
  const items = articles.map((a) => {
    const lien = adresse(langue, `/article/${a.slug}`);
    const titre = partie(a.title) ?? a.slug;
    const resume = fr ? a.excerptFr?.trim() || separerLangues(a.excerpt).fr : separerLangues(a.excerpt).nko;
    const date = a.publishedAt ? new Date(a.publishedAt).toUTCString() : null;
    return [
      "    <item>",
      `      <title>${xml(titre)}</title>`,
      `      <link>${xml(lien)}</link>`,
      `      <guid isPermaLink="true">${xml(lien)}</guid>`,
      date ? `      <pubDate>${date}</pubDate>` : "",
      resume ? `      <description>${xml(fr ? couperTexte(resume, 300) : resume)}</description>` : "",
      a.auteur ? `      <dc:creator>${xml(a.auteur)}</dc:creator>` : "",
      a.image ? `      <media:content url="${xml(`${a.image}?w=1200&fm=jpg&q=80`)}" medium="image" type="image/jpeg" />` : "",
      "    </item>",
    ].filter(Boolean).join("\n");
  });

  const fichier = fr ? "/rss-fr.xml" : "/rss.xml";
  const derniere = articles[0]?._updatedAt ?? articles[0]?.publishedAt;
  const corps = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/">`,
    "  <channel>",
    `    <title>${xml(fr ? "N'Ko ni Lonko — revue scientifique en N'Ko et en français" : NOM_NKO)}</title>`,
    `    <link>${xml(adresse(langue, "/"))}</link>`,
    `    <description>${xml(fr ? "Les articles de N'Ko ni Lonko, revue scientifique mensuelle en N'Ko et en français." : NOM_SITE_CARTE)}</description>`,
    `    <language>${fr ? "fr" : "nqo"}</language>`,
    derniere ? `    <lastBuildDate>${new Date(derniere).toUTCString()}</lastBuildDate>` : "",
    `    <atom:link href="${xml(adresse("nqo", fichier))}" rel="self" type="application/rss+xml" />`,
    "    <image>",
    `      <url>${xml(adresse("nqo", "/icon-512x512.png"))}</url>`,
    `      <title>${xml(fr ? "N'Ko ni Lonko" : NOM_NKO)}</title>`,
    `      <link>${xml(adresse(langue, "/"))}</link>`,
    "    </image>",
    ...items,
    "  </channel>",
    "</rss>",
  ].filter(Boolean).join("\n");

  return new Response(corps, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
