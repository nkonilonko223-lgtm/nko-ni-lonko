// ============================================================================
// N'KO NI LONKO — Titre N'Ko et titre français d'un article
// ============================================================================
// Dans le N°003, le titre français est écrit entre parenthèses à la FIN du titre
// N'Ko : « … (Le Soleil s'éteindra-t-il un jour ?) ».
// Règle du propriétaire (15 octobre 2026) : on ne coupe QUE sur une parenthèse
// finale équilibrée qui contient des lettres latines ; sinon, le titre entier.
// Le texte n'est jamais modifié : on coupe, on ne réécrit rien.
// Test : node scripts/tester-titres.mts
// ============================================================================

export type TitreSepare = { nko: string; fr: string | null };

// Le texte contient-il du N'Ko (U+07C0 à U+07FF) ? Sert à choisir sens, langue et police.
export const contientNko = (texte = "") =>
  [...texte].some((c) => {
    const code = c.codePointAt(0) ?? 0;
    return code >= 0x07c0 && code <= 0x07ff;
  });
// Sens et langue d'un texte libre (titre, résumé) : N'Ko s'il contient du N'Ko
export const sensDe = (texte = "") => (contientNko(texte) ? ({ dir: "rtl", lang: "nqo" } as const) : ({ dir: "ltr", lang: "fr" } as const));

const contientLatin = (texte: string) => /[A-Za-zÀ-ÿ]/.test(texte);

export function separerTitre(titre: string): TitreSepare {
  const t = titre.trimEnd();
  if (!t.endsWith(')')) return { nko: titre, fr: null };
  // Remonte depuis la fin jusqu'à la parenthèse ouvrante qui équilibre la dernière fermante
  let profondeur = 0;
  for (let i = t.length - 1; i >= 0; i--) {
    if (t[i] === ')') profondeur++;
    else if (t[i] === '(') {
      profondeur--;
      if (profondeur === 0) {
        const fr = t.slice(i + 1, -1).trim();
        const nko = t.slice(0, i).trim();
        return nko && contientLatin(fr) ? { nko, fr } : { nko: titre, fr: null };
      }
    }
  }
  return { nko: titre, fr: null };
}
