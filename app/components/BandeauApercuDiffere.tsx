"use client";

// ============================================================================
// N'KO NI LONKO — Bandeau du mode aperçu, chargé À LA DEMANDE (18 octobre 2026)
// ============================================================================
// Le bandeau (BandeauApercu) utilise les outils d'édition de Sanity (next-sanity/hooks).
// Importé directement par le gabarit (layout.tsx), il était téléchargé par TOUS les
// visiteurs, même hors aperçu. Ici, son code n'est chargé que s'il s'affiche,
// c'est-à-dire en mode aperçu (rédaction).
// ============================================================================

import dynamic from "next/dynamic";

const BandeauApercuDiffere = dynamic(() => import("./BandeauApercu"));

export default BandeauApercuDiffere;
