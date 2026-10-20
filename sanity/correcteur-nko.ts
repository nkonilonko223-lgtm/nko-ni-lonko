// ============================================================================
// N'KO NI LONKO — Correcteur N'Ko du Studio (idée 4 du Lot 2) : règles pures, sans IA
// ============================================================================
// Il SIGNALE, il ne corrige jamais (avertissements dans le Studio). La rédaction décide.
// 1. Marque doublée : la même marque deux fois de suite, ou deux marques de ton sur une lettre.
// 2. Écrit autrement ailleurs : un mot dont les lettres existent dans les articles publiés,
//    mais jamais avec ces marques (sans compter la marque de fin de mot, qui change avec la
//    phrase). Souvent une marque de ton oubliée ou en trop : à vérifier.
// Aucun caractère N'Ko écrit ici : les plages sont données par leur numéro Unicode.
// Mesuré le 20 octobre 2026 sur la sauvegarde du 18 (16 articles) : 1 marque doublée (réelle),
// 0 fausse alerte ; 0 à 12 mots « écrits autrement » par brouillon du N°003.
// ============================================================================

const code = (c: string) => c.codePointAt(0) ?? 0;
const estMarque = (k: number) => k >= 0x07eb && k <= 0x07f3; // tons, nasalisation, double point
const estTon = (k: number) => k >= 0x07eb && k <= 0x07f1;
const estLettre = (k: number) => k >= 0x07ca && k <= 0x07ea;
const estDansMot = (k: number) => estLettre(k) || estMarque(k) || k === 0x07f4 || k === 0x07f5; // + apostrophes N'Ko

// Tous les textes d'un champ ou d'un document (blocs, légendes, encadrés…), sans les clés techniques
export function textesDe(valeur: unknown): string[] {
  if (typeof valeur === "string") return [valeur];
  if (Array.isArray(valeur)) return valeur.flatMap(textesDe);
  if (valeur && typeof valeur === "object") {
    return Object.entries(valeur)
      .filter(([cle]) => !cle.startsWith("_") && cle !== "slug" && cle !== "asset")
      .flatMap(([, v]) => textesDe(v));
  }
  return [];
}

// Mots N'Ko d'un texte (en NFC), dans l'ordre
export function motsNko(texte: string): string[] {
  const mots: string[] = [];
  let mot = "";
  for (const c of texte.normalize("NFC")) {
    if (estDansMot(code(c))) mot += c;
    else if (mot) { mots.push(mot); mot = ""; }
  }
  if (mot) mots.push(mot);
  return mots.filter((m) => [...m].some((c) => estLettre(code(c))));
}

// Règle 1 : mots qui portent une marque doublée
export function marquesDoublees(texte: string): string[] {
  const fautifs = new Set<string>();
  for (const mot of motsNko(texte)) {
    const codes = [...mot].map(code);
    let tons = 0;
    for (let i = 0; i < codes.length; i++) {
      if (!estMarque(codes[i])) { tons = 0; continue; }
      if ((i > 0 && codes[i] === codes[i - 1]) || (estTon(codes[i]) && ++tons > 1)) fautifs.add(mot);
    }
  }
  return [...fautifs];
}

const FIN = "À vérifier par la rédaction (rien n'est corrigé automatiquement).";
const cite = (mots: string[]) => mots.map((m) => `« ${m} »`).join(", ");

// Règle 1 pour un document du Studio : désigne le premier champ concerné (avertissement)
export function verifierMarquesDoublees(doc: Record<string, unknown> | undefined): true | { message: string; path: string[] } {
  for (const [cle, valeur] of Object.entries(doc || {})) {
    if (cle.startsWith("_")) continue;
    const mots = [...new Set(textesDe(valeur).flatMap(marquesDoublees))];
    if (mots.length) {
      return { message: `Correcteur N'Ko : marque doublée (la même deux fois, ou deux marques de ton sur une lettre) dans ${cite(mots)}. ${FIN}`, path: [cle] };
    }
  }
  return true;
}

const squelette = (mot: string) => [...mot].filter((c) => !estMarque(code(c))).join("");
const sansMarqueFinale = (mot: string) => {
  const c = [...mot];
  while (c.length && estMarque(code(c[c.length - 1]))) c.pop();
  return c.join("");
};

// Vocabulaire de la revue : mots connus, rangés par squelette (lettres sans marques)
export type Vocabulaire = Map<string, Set<string>>;

export function construireVocabulaire(textes: string[]): Vocabulaire {
  const vocabulaire: Vocabulaire = new Map();
  for (const mot of textes.flatMap(motsNko)) {
    const s = squelette(mot);
    if (!vocabulaire.has(s)) vocabulaire.set(s, new Set());
    vocabulaire.get(s)?.add(mot);
  }
  return vocabulaire;
}

// Règle 2 : mots écrits autrement ailleurs dans la revue (avec les formes connues)
export function ecritsAutrement(texte: string, vocabulaire: Vocabulaire): { mot: string; ailleurs: string[] }[] {
  const resultats: { mot: string; ailleurs: string[] }[] = [];
  const vus = new Set<string>();
  for (const mot of motsNko(texte)) {
    if (vus.has(mot)) continue;
    vus.add(mot);
    const connus = vocabulaire.get(squelette(mot));
    if (!connus || connus.has(mot)) continue;
    const debut = sansMarqueFinale(mot);
    if ([...connus].some((k) => sansMarqueFinale(k) === debut)) continue; // seule la fin change : normal
    resultats.push({ mot, ailleurs: [...connus].slice(0, 3) });
  }
  return resultats;
}

// Message de la règle 2 (au plus 8 mots cités)
export function messageEcritsAutrement(liste: { mot: string; ailleurs: string[] }[]): string {
  const cites = liste.slice(0, 8).map(({ mot, ailleurs }) => `« ${mot} » (ailleurs : ${ailleurs.map((a) => `« ${a} »`).join(" / ")})`);
  const reste = liste.length > 8 ? ` ; et ${liste.length - 8} autre(s)` : "";
  return `Correcteur N'Ko : ${liste.length} mot(s) écrit(s) autrement dans les articles publiés (marque de ton oubliée ou en trop ?) : ${cites.join(" ; ")}${reste}. ${FIN}`;
}
