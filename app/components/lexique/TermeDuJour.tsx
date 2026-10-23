import LienLangue from "../LienLangue";
import type { TermeDictionnaire } from "./DictionnaireInteractif";
import { TEXTES_LEXIQUE } from "./textes";

// ============================================================================
// N'KO NI LONKO — Terme du jour (composant serveur, page /lexique)
// ============================================================================
// Un terme différent chaque jour, le même pour tout le monde ce jour-là (jour UTC). La page est
// préparée à l'avance et remise à jour au plus tard une heure après minuit.
// Libellé N'Ko « Terme du jour » : L2 (rédaction, 23 octobre 2026 ; copié tel quel par programme).
// ============================================================================

const TERME_DU_JOUR = { nko: "ߓߌ߬ ߞߎߡߊߘߋ߲", fr: "Terme du jour" };

export function termeDuJour(termes: TermeDictionnaire[], date = new Date()) {
  if (!termes.length) return null;
  const tries = [...termes].sort((a, b) => a.slug.localeCompare(b.slug));
  return tries[Math.floor(date.getTime() / 86_400_000) % tries.length];
}

export default function TermeDuJour({ termes }: { termes: TermeDictionnaire[] }) {
  const t = termeDuJour(termes);
  if (!t) return null;
  return (
    <section aria-labelledby="terme-du-jour" className="mb-10 rounded-2xl border border-blue-400/30 bg-blue-500/[0.06] p-6 text-center">
      <h2 id="terme-du-jour" className="mb-3 flex flex-col items-center gap-0.5">
        {TERME_DU_JOUR.nko && <span lang="nqo" dir="rtl" className="font-kigelia text-lg text-blue-300">{TERME_DU_JOUR.nko}</span>}
        <span lang="fr" className="text-[11px] uppercase tracking-widest text-blue-200/70">{TERME_DU_JOUR.fr}</span>
      </h2>
      {t.termeNko && <p lang="nqo" dir="rtl" className="font-kigelia text-3xl font-bold text-white">{t.termeNko}</p>}
      {t.termeFr && <p lang="fr" dir="ltr" className="mt-1 text-lg text-blue-200">{t.termeFr}</p>}
      {t.definitionNko && <p lang="nqo" dir="rtl" className="mt-4 line-clamp-3 font-kigelia text-lg leading-loose text-white/85">{t.definitionNko}</p>}
      {t.definitionFr && <p lang="fr" dir="ltr" className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/65">{t.definitionFr}</p>}
      <LienLangue
        href={`/lexique/${t.slug}`}
        className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-blue-400/50 px-5 text-blue-200 transition-colors hover:bg-blue-400/10"
      >
        <span lang="nqo" dir="rtl" className="font-kigelia">{TEXTES_LEXIQUE.voirDansLeLexique.nko}</span>
        <span aria-hidden="true" className="text-white/30">·</span>
        <span lang="fr" className="text-sm">{TEXTES_LEXIQUE.voirDansLeLexique.fr}</span>
      </LienLangue>
    </section>
  );
}
