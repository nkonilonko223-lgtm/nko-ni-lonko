"use client";

import { useEffect } from "react";

// ============================================================================
// N'KO NI LONKO — Installe la lecture hors ligne (public/sw.js), en production seulement
// ============================================================================
// Après le chargement complet de la page, pour ne jamais ralentir le premier affichage.
// Rien n'est affiché. Fonctionnement et arrêt d'urgence : docs/HORS-LIGNE.md.
// ============================================================================

export default function LectureHorsLigne() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    const installer = () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => undefined);
    };
    if (document.readyState === "complete") installer();
    else window.addEventListener("load", installer, { once: true });
    return () => window.removeEventListener("load", installer);
  }, []);
  return null;
}
