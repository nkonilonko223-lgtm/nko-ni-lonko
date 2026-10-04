"use client";

// ============================================================================
// N'KO NI LONKO — « Citer ce terme » (référence prête à copier)
// ============================================================================
// La date de consultation est celle de l'appareil du lecteur (calculée chez lui).
// ============================================================================

import { useState, useSyncExternalStore } from "react";
import { TEXTES_LEXIQUE } from "./textes";

const aujourdHui = () =>
  new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

export default function CiterTerme({ termeNko, termeFr, url }: { termeNko?: string; termeFr?: string; url: string }) {
  const date = useSyncExternalStore(() => () => {}, aujourdHui, () => "");
  const [copie, setCopie] = useState(false);

  const citation =
    `N'Ko ni Lonko. « ${termeFr || ""} » (${termeNko || ""}). ${TEXTES_LEXIQUE.dictionnaire.fr}. ${url}` +
    (date ? `. Consulté le ${date}.` : ".");

  const copier = async () => {
    try {
      await navigator.clipboard.writeText(citation);
      setCopie(true);
      setTimeout(() => setCopie(false), 2500);
    } catch {
      setCopie(false);
    }
  };

  return (
    <section className="border-t border-white/10 pt-6 mb-8">
      <h2 className="mb-3 flex flex-col gap-1">
        {TEXTES_LEXIQUE.citer.nko && (
          <span lang="nqo" dir="rtl" className="font-kigelia text-lg font-bold text-white">{TEXTES_LEXIQUE.citer.nko}</span>
        )}
        <span lang="fr" className="font-sans text-xs uppercase tracking-widest text-white/50">{TEXTES_LEXIQUE.citer.fr}</span>
      </h2>
      <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <p dir="ltr" lang="fr" className="flex-1 font-mono text-xs leading-relaxed text-gray-300 select-all break-words">
          {citation}
        </p>
        <button
          type="button"
          onClick={copier}
          aria-label="Copier la référence"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          <i className={`ph-bold ${copie ? "ph-check" : "ph-copy"}`} aria-hidden="true"></i>
        </button>
      </div>
      <p role="status" className="mt-2 h-5 text-xs text-blue-300">
        {copie && (
          <>
            {TEXTES_LEXIQUE.copie.nko && <span lang="nqo" className="font-kigelia me-2">{TEXTES_LEXIQUE.copie.nko}</span>}
            <span lang="fr">{TEXTES_LEXIQUE.copie.fr}</span>
          </>
        )}
      </p>
    </section>
  );
}
