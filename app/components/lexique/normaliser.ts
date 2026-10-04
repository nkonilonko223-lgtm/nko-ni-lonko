// ============================================================================
// N'KO NI LONKO — Normalisation pour la recherche et le tri du lexique
// ============================================================================
// Retire les marques de ton N'Ko (U+07EB à U+07F3, et U+07FD) et les accents
// latins, puis met en minuscules. « ߞߎߡߊߘߋ߲߫ » = « ߞߎߡߊߘߋ߲ », « Éruption » = « eruption ».
// Sert UNIQUEMENT à comparer : le texte affiché n'est jamais modifié.
// ============================================================================

export function normaliser(texte = ""): string {
  return [...texte.normalize("NFD")]
    .filter((c) => {
      const code = c.codePointAt(0) ?? 0;
      const accentLatin = code >= 0x0300 && code <= 0x036f;
      const tonNko = (code >= 0x07eb && code <= 0x07f3) || code === 0x07fd;
      return !accentLatin && !tonNko;
    })
    .join("")
    .toLowerCase()
    .trim();
}

// Ordre alphabétique N'Ko : l'ordre des lettres dans Unicode suit l'alphabet N'Ko
export function comparerNko(a = "", b = ""): number {
  const x = normaliser(a);
  const y = normaliser(b);
  return x < y ? -1 : x > y ? 1 : 0;
}
