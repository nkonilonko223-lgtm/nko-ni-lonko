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

// Partie N'Ko et partie française d'un texte bilingue, pour les cartes de partage (WhatsApp,
// Telegram, X…) : ces applications coupent les lignes, et sur une ligne qui mélange le N'Ko
// (droite à gauche) et le français (gauche à droite) elles déplacent parenthèses et mots
// (« du) … (Niger »). Formes reconnues : « N'Ko (français) » (règle de separerTitre),
// « (français) N'Ko » (anciens articles), puis des morceaux séparés par « | », « · », « — »
// ou une fin de phrase. Les morceaux voisins de
// même écriture restent ensemble, avec leur séparateur d'origine : on coupe, on ne réécrit rien.
// Test : node scripts/tester-cartes.mts
const SEPARATEURS = /(\s+[|·—]\s+|(?<=\.)\s+)/;

export function separerLangues(texte?: string | null): { nko: string | null; fr: string | null } {
  const t = (texte ?? "").trim();
  if (!t) return { nko: null, fr: null };
  const parentheses = separerTitre(t);
  if (parentheses.fr !== null && contientNko(parentheses.nko)) return parentheses;
  // « (français) N'Ko » : parenthèse ouvrante au début, équilibrée, sans N'Ko dedans
  if (t.startsWith("(")) {
    const fin = t.indexOf(")");
    const fr = t.slice(1, fin).trim();
    const nko = t.slice(fin + 1).trim();
    if (fin > 0 && !fr.includes("(") && contientLatin(fr) && !contientNko(fr) && contientNko(nko)) return { nko, fr };
  }
  const morceaux = t.split(SEPARATEURS);
  const groupes: { nko: boolean; texte: string }[] = [];
  // Indices pairs : les morceaux ; indices impairs : le séparateur qui les précède
  for (let i = 0; i < morceaux.length; i += 2) {
    const morceau = morceaux[i] ?? "";
    if (!morceau.trim()) continue;
    const nko = contientNko(morceau);
    const dernier = groupes[groupes.length - 1];
    if (dernier && dernier.nko === nko) dernier.texte += (morceaux[i - 1] ?? " ") + morceau;
    else groupes.push({ nko, texte: morceau });
  }
  const partie = (nko: boolean) => groupes.filter((g) => g.nko === nko).map((g) => g.texte.trim()).join(" | ") || null;
  return { nko: partie(true), fr: partie(false) };
}

// Texte du bouton de partage : une ligne par langue (N'Ko d'abord) ; le saut de ligne final
// met le lien, ajouté par le téléphone, sur sa propre ligne
export function texteDePartage(titre: string): string {
  const { nko, fr } = separerLangues(titre);
  return `${[nko, fr].filter(Boolean).join("\n")}\n`;
}

// Description d'une carte de partage (article, numéro) : « titre français — résumé français »,
// comme les grands médias (un titre, puis une ou deux phrases), coupée sur un espace vers
// 155 caractères. Sans résumé, ou si le résumé répète le titre : le titre seul.
const memeTexte = (a: string, b: string) => {
  const simple = (t: string) => t.toLocaleLowerCase("fr").replace(/\s+/g, " ").trim();
  return simple(a) === simple(b);
};

export function descriptionDeCarte(titreFr: string, resumeFr?: string | null, max = 155): string {
  const resume = resumeFr?.trim();
  const texte = resume && !memeTexte(titreFr, resume) ? `${titreFr} — ${resume}` : titreFr;
  const lettres = [...texte];
  if (lettres.length <= max) return texte;
  const debut = lettres.slice(0, max - 1).join("");
  const espace = debut.lastIndexOf(" ");
  return `${(espace > max / 2 ? debut.slice(0, espace) : debut).replace(/[\s,;:—–-]+$/, "")}…`;
}
