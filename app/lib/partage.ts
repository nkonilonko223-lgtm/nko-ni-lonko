// ============================================================================
// N'KO NI LONKO — Images de partage (WhatsApp, Facebook, X, LinkedIn…)
// ============================================================================
// Fichiers fixes fabriqués par scripts/images-partage/generer.mjs (rendu Chrome :
// lettres N'Ko liées ; next/og ne sait pas les lier). Changer le numéro (-v1) à
// chaque nouvelle image : les réseaux gardent l'ancienne en mémoire tant que
// l'adresse ne change pas.
// ============================================================================
import { TEXTES_LEXIQUE } from "../components/lexique/textes";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nkonilonko.com";

// Accueil et pages générales. Texte alternatif : nom et phrase d'accroche du site (copiés de app/page.tsx).
export const IMAGE_PARTAGE_ACCUEIL = {
  url: `${SITE_URL}/og/accueil-v1.jpg`,
  width: 1200,
  height: 630,
  type: "image/jpeg",
  alt: "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ · N'Ko ni Lonko — ߖߊ߯ߓߊ ߟߐ߲ߞߏ ߣߌ߫ ߟߐ߲ߠߌ߲ ߢߌߣߌ߲߫ ߒߞߏ ߘߐ߫ · Science et savoir pour tous",
};

// Dictionnaire et pages des termes
export const IMAGE_PARTAGE_LEXIQUE = {
  url: `${SITE_URL}/og/lexique-v1.jpg`,
  width: 1200,
  height: 630,
  type: "image/jpeg",
  alt: `${TEXTES_LEXIQUE.dictionnaire.nko} · ${TEXTES_LEXIQUE.dictionnaire.fr}`,
};

// Page « À propos » : la peinture du baobab
export const IMAGE_PARTAGE_A_PROPOS = {
  url: `${SITE_URL}/og/a-propos-v1.jpg`,
  width: 1200,
  height: 630,
  type: "image/jpeg",
  alt: "N'Ko ni Lonko — À propos : un baobab entre un astronome traditionnel et un scientifique en laboratoire",
};

// Compte X (Twitter) déclaré dans les partages et les liens du site.
// Compte du propriétaire en attendant la création de @nkonilonko : changer ICI seulement.
export const COMPTE_X = "@MckV2016";
export const URL_X = `https://x.com/${COMPTE_X.slice(1)}`;
