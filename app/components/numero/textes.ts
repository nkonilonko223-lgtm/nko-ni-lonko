// ============================================================================
// N'KO NI LONKO — Textes de l'interface des numéros
// ============================================================================
// N'Ko fourni par la rédaction le 16 octobre 2026, copié sans modification
// (source : C:\Dev\archives\traductions\libelles-redaction-2026-10-16.json).
// Décisions du propriétaire (16 octobre 2026) :
// - le mot « article » s'écrit comme dans « Article suivant » (I8 et I10 alignés) ;
// - le numéro s'affiche avec l'abréviation de la rédaction et des chiffres N'Ko ;
// - « Paru dans le N°… » : la nasalisation se colle au dernier chiffre et le mot
//   suivant change, TOUJOURS (règle de la rédaction).
// ============================================================================

export const TEXTES_NUMEROS = {
  saison: { nko: "ߘߐ߬ߝߊߟߋ߲", fr: "Saison" },
  lesNumeros: { nko: "ߝߙߍߕߍ ߟߎ߬", fr: "Les numéros" },
  sommaire: { nko: "ߟߊߘߛߍߣߍ߲", fr: "Sommaire" },
  edito: { nko: "ߟߍߙߊߛߋ߲", fr: "Édito" },
  aLaUne: { nko: "ߦߋߦߊ ߔߊ߲ߔߊ߲ߘߊ߲ ߞߊ߲߬", fr: "À la une" },
  articlePrecedent: { nko: "ߞߎߡߘߊ ߢߍߕߊ", fr: "Article précédent" },
  articleSuivant: { nko: "ߞߎߡߘߊ ߞߐߕߊ", fr: "Article suivant" },
  lireArticle: { nko: "ߞߊ߬ ߞߎߡߘߊ ߞߊ߬ߙߊ߲߫", fr: "Lire l'article" },
  tousLesNumeros: { nko: "ߝߙߍߕߍ ߕߐ߭ ߟߎ߬ ߓߍ߯", fr: "Tous les numéros" },
  aucunNumero: { nko: "ߝߙߍߕߍ ߛߌ߫ ߡߊ߫ ߟߊߖߍ߲ߛߍ߲߫ ߝߐߟߐ߲߫", fr: "Aucun numéro publié pour l'instant" },
} as const;

// Abréviation « N° » et modèle « Paru dans le N°… » (texte de la rédaction, découpé autour du numéro)
const ABREVIATION_NKO = "ߝߕ°";
const PARU_AVANT_NKO = "ߊ߬ ߓߐ߫ ߘߊ߫ ";
const PARU_APRES_NKO = "߲ ߠߋ߬ ߞߣߐ߫"; // commence par la nasalisation, collée au dernier chiffre

// Chiffres N'Ko : U+07C0 (0) à U+07C9 (9)
export const chiffresNko = (texte: string) => texte.replace(/[0-9]/g, (c) => String.fromCodePoint(0x07c0 + Number(c)));
export const numeroSur3 = (n: number) => String(n).padStart(3, "0");

export const numeroNko = (n: number) => `${ABREVIATION_NKO} ${chiffresNko(numeroSur3(n))}`;
export const numeroFr = (n: number) => `N°${numeroSur3(n)}`;
export const saisonNko = (s: number) => `${TEXTES_NUMEROS.saison.nko} ${chiffresNko(String(s))}`;
export const saisonFr = (s: number) => `Saison ${s}`;
export const paruDansNko = (n: number) => `${PARU_AVANT_NKO}${numeroNko(n)}${PARU_APRES_NKO}`;
export const paruDansFr = (n: number) => `Paru dans le ${numeroFr(n)}`;
