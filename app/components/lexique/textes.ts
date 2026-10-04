// ============================================================================
// N'KO NI LONKO — Textes de l'interface du lexique
// ============================================================================
// N'Ko fourni par la rédaction (4 octobre 2026), copié sans modification.
// Texte 5 : « ߞߎߡߘߊ » corrigé par la rédaction (ߊ ajouté).
// ============================================================================

export const TEXTES_LEXIQUE = {
  lexique: { nko: "ߞߎߡߊߘߋ߲߫ ߛߙߍߘߍ", fr: "Lexique" },
  fermer: { nko: "ߊ߬  ߘߊߕߎ߲߬", fr: "Fermer" },
  voirDansLeLexique: { nko: "ߞߎߡߊߘߋ߲߫ ߛߙߍߘߍ ߝߟߍ߫ ", fr: "Voir dans le lexique" },
  dictionnaire: { nko: "ߟߐ߲ߞߏ ߞߘߐߝߐߟߊ߲ ߝߊ߬ߙߊ߲߬ߛߌ߬-ߒߞߏ", fr: "Dictionnaire scientifique N'Ko – français" },
  articlesQuiUtilisent: { nko: "ߞߎߡߘߊ ߡߍ߲ ߠߎ߬ ߦߋ߫ ߞߎߡߊߘߋ߲ ߣߌ߲߬ ߟߊߓߊ߯ߙߊ߫ ߟߊ߫", fr: "Articles qui utilisent ce terme" },
  domaine: { nko: "ߡߊ߬ߘߎ߮", fr: "Domaine" },
  // Textes 7 à 11 : fournis par la rédaction (5 octobre 2026), copiés sans modification.
  // Texte 10 : 1re proposition retenue (variante proposée : ߞߏߝߐߟߌ).
  rechercher: { nko: "ߞߎߡߊߘߋ߲ ߘߏ߫ ߢߌߣߌ߲߫...", fr: "Rechercher un terme" },
  aucunResultat: { nko: "ߞߎߡߊߘߋ߲߫ ߛߌ߫ ߡߊ߫ ߛߐ߬ߘߐ߲߬߹", fr: "Aucun terme trouvé" },
  memeDomaine: { nko: "ߘߊߞߎ߲߫ ߞߋߟߋ߲߫ ߞߎߡߊߘߋ߲ ߠߎ߬", fr: "Termes du même domaine" },
  citer: { nko: "ߞߎߡߊߘߋ߲ ߣߌ߲߬ ߞߏߝߐ߫", fr: "Citer ce terme" },
  copie: { nko: "ߟߊ߬ߓߌ߬ߟߊ߬ߣߍ߲߫߹", fr: "Copié" },
} as const;

// Texte d'aide du champ de recherche (N'Ko · français). Le champ vide s'affiche de gauche à droite :
// le N'Ko est donc « isolé » (U+2067 … U+2069) pour que sa ponctuation finale reste à la fin
// de la lecture N'Ko, à gauche (mesuré dans le navigateur le 5 octobre 2026).
export const AIDE_RECHERCHE = TEXTES_LEXIQUE.rechercher.nko
  ? `${String.fromCodePoint(0x2067)}${TEXTES_LEXIQUE.rechercher.nko}${String.fromCodePoint(0x2069)} · ${TEXTES_LEXIQUE.rechercher.fr}`
  : TEXTES_LEXIQUE.rechercher.fr;
