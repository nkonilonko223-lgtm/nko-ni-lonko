// ============================================================================
// N'KO NI LONKO — Carte de partage sans mélange des deux sens d'écriture
// ============================================================================
// WhatsApp, Telegram, X… affichent og:title, og:description et og:site_name sur des
// lignes qu'ils coupent eux-mêmes : une ligne qui mêle le N'Ko (droite à gauche) et le
// français (gauche à droite) s'y affiche en désordre (« du) … (Niger »).
// Règle (22 octobre 2026, demande de MckV) : titre de la carte = partie N'Ko ;
// description = partie française ; nom du site dans les deux langues (NOM_SITE_CARTE,
// décision du 22 octobre 2026). Le <title> de la page (onglet, Google) ne change pas.
// Le texte n'est jamais réécrit : voir separerLangues.
// ============================================================================
import type { Metadata } from "next";
import { descriptionDeCarte, separerLangues } from "../components/numero/titre";

// Nom du site sur les cartes, dans les deux langues (N'Ko d'abord) : court et sans parenthèses,
// il s'affiche proprement (Telegram, captures du 22 octobre 2026). Texte recopié de la page
// article (app/article/[slug]/page.tsx), jamais tapé.
export const NOM_SITE_CARTE = "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ | N'Ko ni Lonko";

const texte = (v: unknown) => (typeof v === "string" ? v : undefined);

// descriptionDuTitre (article, numéro) : la description est « titre français — résumé
// français » (descriptionDeCarte), pour que la carte nomme la page dans les deux langues.
// resumeFr : résumé français fourni à part ; sinon, la partie française du résumé de la page.
type Options = { descriptionDuTitre?: boolean; resumeFr?: string | null };

export function carteSansMelange(m: Metadata, { descriptionDuTitre = false, resumeFr }: Options = {}): Metadata {
  const og = m.openGraph;
  const titre = texte(og?.title) ?? texte(m.title);
  const description = texte(og?.description) ?? texte(m.description);
  const t = separerLangues(titre);
  const d = separerLangues(description);
  const titreFr = descriptionDuTitre && t.nko ? t.fr : null;
  const carte = {
    title: t.nko ?? t.fr ?? titre,
    description: titreFr ? descriptionDeCarte(titreFr, resumeFr || d.fr) : d.fr || d.nko || description,
  };
  return {
    ...m,
    ...(og ? { openGraph: { ...og, ...carte, siteName: NOM_SITE_CARTE } } : {}),
    ...(m.twitter ? { twitter: { ...m.twitter, ...carte } } : {}),
  };
}
