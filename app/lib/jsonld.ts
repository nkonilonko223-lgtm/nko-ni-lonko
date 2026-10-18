// ============================================================================
// N'KO NI LONKO — Données structurées pour Google (JSON-LD)
// ============================================================================
// Dans une balise <script>, « < » est remplacé par son code Unicode : aucun texte
// saisi (titre, résumé, nom…) ne peut alors fermer la balise et injecter du code.
// Une seule fonction pour tout le site (18 octobre 2026).
// ============================================================================

export const jsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, String.fromCharCode(92) + "u003c");
