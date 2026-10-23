import type { Libelle } from "./textes";

// ============================================================================
// N'KO NI LONKO — Affichage des textes de l'application (sans état : serveur ou navigateur)
// ============================================================================
// Chaque morceau porte lang ET dir. Un N'Ko vide (pas encore fourni par la rédaction) laisse
// la place au français, marqué lang="fr" (la version N'Ko a lang="nqo" sur toute la page).
// ============================================================================

// Dans la langue lue : N'Ko s'il est fourni (version N'Ko), sinon français
export function TexteLangue({ texte, nko, className = "" }: { texte: Libelle; nko: boolean; className?: string }) {
  return nko && texte.nko ? (
    <span lang="nqo" dir="rtl" className={`font-kigelia ${className}`}>{texte.nko}</span>
  ) : (
    <span lang="fr" dir="ltr" className={className}>{texte.fr}</span>
  );
}

// Texte brut dans la langue lue (étiquettes aria-label)
export const texteLangue = (texte: Libelle, nko: boolean) => (nko && texte.nko ? texte.nko : texte.fr);

// Les deux langues sur une ligne, N'Ko d'abord (pages bilingues : page d'un numéro).
// « suiteFr » : précision ajoutée au français seulement (ex. taille en Mo)
export function TexteBilingue({ texte, suiteFr = "" }: { texte: Libelle; suiteFr?: string }) {
  return (
    <span className="inline-flex flex-wrap items-baseline justify-center gap-x-2">
      {texte.nko && <span lang="nqo" dir="rtl" className="font-kigelia text-base">{texte.nko}</span>}
      {texte.nko && <span aria-hidden="true" className="text-white/30">·</span>}
      <span lang="fr" dir="ltr" className="text-sm">{texte.fr}{suiteFr}</span>
    </span>
  );
}
