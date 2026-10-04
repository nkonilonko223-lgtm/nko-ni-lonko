"use client";

// ============================================================================
// N'KO NI LONKO — Bandeau du mode aperçu (visible seulement par la rédaction)
// ============================================================================
// Affiché uniquement en mode aperçu, et caché dans l'onglet « Presentation »
// du Studio (qui a déjà ses propres commandes).
// ============================================================================

import { useIsPresentationTool } from "next-sanity/hooks";

export default function BandeauApercu() {
  const dansLeStudio = useIsPresentationTool();
  if (dansLeStudio) return null;

  return (
    <div
      dir="ltr"
      lang="fr"
      role="status"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-lg print:hidden"
    >
      <span>Mode aperçu — brouillons visibles</span>
      <a
        href="/api/draft-mode/disable"
        className="rounded-full bg-white/20 px-3 py-1 hover:bg-white/30 transition-colors"
      >
        Quitter
      </a>
    </div>
  );
}
