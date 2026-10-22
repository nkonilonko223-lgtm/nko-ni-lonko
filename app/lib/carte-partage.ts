// ============================================================================
// N'KO NI LONKO — Métadonnées de chaque version d'une page (langue dans l'adresse, B6)
// ============================================================================
// Chaque page a une version N'Ko (/…) et une version française (/fr/…). Les métadonnées
// écrites dans les pages mêlent souvent les deux langues (« N'Ko | français »,
// « N'Ko (français) ») : versionLangue n'en garde que la langue de la version.
// - Onglet et Google : titre et description dans la langue de la version.
// - Carte de partage (WhatsApp, Telegram, X) : une seule langue par ligne (sinon les
//   applications déplacent mots et parenthèses : « du) … (Niger ») ; le nom du site reste
//   dans les deux langues (NOM_SITE_CARTE, décision de MckV du 22 octobre 2026).
// - Adresse canonique, hreflang (nqo, fr, x-default = N'Ko), og:locale de la version.
// - Version N'Ko : le navigateur ne propose pas de traduire (balise Google « notranslate »).
// Le texte n'est jamais réécrit : on le coupe (separerLangues).
// ============================================================================
import type { Metadata } from "next";
import { couperTexte, memeTexte, separerLangues } from "../components/numero/titre";
import { adresse, type Langue } from "./langue";

// Nom du site sur les cartes, dans les deux langues (N'Ko d'abord) : court et sans parenthèses,
// il s'affiche proprement (Telegram, captures du 22 octobre 2026). Texte recopié de la page
// article (app/article/[slug]/page.tsx), jamais tapé.
export const NOM_SITE_CARTE = "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ | N'Ko ni Lonko";

// Nom de la revue dans chaque langue, tiré du nom bilingue ci-dessus (jamais tapé)
export const NOM_NKO = separerLangues(NOM_SITE_CARTE).nko ?? "";
export const NOM_FR = "N'Ko ni Lonko";

const texte = (v: unknown) => (typeof v === "string" ? v : undefined);

// Titre de l'onglet sans le nom de la revue : le gabarit l'ajoute déjà (« %s | nom »)
function sansNomRevue(titre: string | null): string | null {
  if (!titre) return null;
  const reste = titre
    .split(" | ")
    .map((m) => m.trim())
    .filter((m) => m !== NOM_NKO && m.toLocaleLowerCase("fr") !== NOM_FR.toLocaleLowerCase("fr"))
    .join(" | ");
  return reste || null;
}

type OptionsLangue = {
  chemin: string; // chemin de la page SANS la langue : « / », « /about », « /article/<slug> »
  titre?: string | null; // titre bilingue (article, numéro, terme) ; sinon celui des métadonnées
  resume?: string | null; // résumé bilingue ; sinon la description des métadonnées
  resumeNko?: string | null; // résumé N'Ko fourni à part (définition N'Ko d'un terme)
  resumeFr?: string | null; // résumé français fourni à part (excerptFr, définition française)
  descriptionFrParDefaut?: string; // description française si la page n'en a pas
};

export function versionLangue(metadonnees: Metadata, langue: Langue, o: OptionsLangue): Metadata {
  const fr = langue === "fr";
  // Le titre bilingue d'origine est remplacé ci-dessous ; sans titre propre (accueil), la page
  // n'en donne AUCUN et reprend le titre par défaut du gabarit (une valeur vide l'effacerait)
  const { title: titreBilingue, ...m } = metadonnees;
  const og = m.openGraph;
  // Partie de la langue de la version ; à défaut, l'autre (un texte d'une seule langue)
  const partie = (v: string | null | undefined) => {
    const p = separerLangues(v);
    return fr ? (p.fr ?? p.nko) : (p.nko ?? p.fr);
  };
  const resumeDe = (source: string | null | undefined) => {
    const p = separerLangues(source);
    return fr ? o.resumeFr?.trim() || p.fr : o.resumeNko?.trim() || p.nko;
  };

  const titreOnglet = sansNomRevue(partie(o.titre ?? texte(titreBilingue)));
  const titreCarte = partie(o.titre ?? texte(og?.title) ?? texte(titreBilingue));
  const resumeMeta = resumeDe(o.resume ?? texte(m.description) ?? texte(og?.description));
  const resumeCarte = resumeDe(o.resume ?? texte(og?.description) ?? texte(m.description));
  // Le résumé de la carte ne répète jamais le titre ; le français est coupé vers 155 caractères
  const descriptionCarte =
    resumeCarte && !(titreCarte && memeTexte(resumeCarte, titreCarte))
      ? fr ? couperTexte(resumeCarte) : resumeCarte
      : fr ? o.descriptionFrParDefaut : undefined;

  const url = adresse(langue, o.chemin);
  const carte = { title: titreCarte ?? undefined, description: descriptionCarte };
  return {
    ...m,
    // Sans titre propre (accueil) : titre par défaut du gabarit, dans la langue de la version
    ...(titreOnglet ? { title: titreOnglet } : {}),
    description: resumeMeta ?? (fr ? o.descriptionFrParDefaut : undefined),
    alternates: {
      ...m.alternates,
      canonical: url,
      languages: { nqo: adresse("nqo", o.chemin), fr: adresse("fr", o.chemin), "x-default": adresse("nqo", o.chemin) } as Record<string, string>,
      // Flux RSS de la version (app/lib/flux-rss.ts) : trouvé tout seul par les lecteurs de flux
      types: { "application/rss+xml": [{ url: fr ? "/rss-fr.xml" : "/rss.xml", title: fr ? "N'Ko ni Lonko (français)" : NOM_NKO }] },
    },
    ...(og
      ? { openGraph: { ...og, ...carte, url, siteName: NOM_SITE_CARTE, locale: fr ? "fr_FR" : "nqo", alternateLocale: [fr ? "nqo" : "fr_FR"] } }
      : {}),
    ...(m.twitter ? { twitter: { ...m.twitter, ...carte } } : {}),
    // Version N'Ko : le navigateur ne propose pas de traduire (avec <html translate="no">)
    ...(fr ? {} : { other: { ...m.other, google: "notranslate" } }),
  };
}
