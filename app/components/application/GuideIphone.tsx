"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { useLanguage } from "../LanguageProvider";
import { abonnerInstallation, fermerGuide, guideEstOuvert, guideFermeServeur } from "../../lib/installation";
import { TexteLangue } from "./Libelle";
import { FERMER, GUIDE_ETAPES, GUIDE_TITRE } from "./textes";

// ============================================================================
// N'KO NI LONKO — Guide « Ajouter à l'écran d'accueil » (iPhone, iPad)
// ============================================================================
// L'iPhone n'a pas de fenêtre d'installation : l'application s'ajoute par « Partager → Sur
// l'écran d'accueil → Ajouter ». Ouvert par un bouton « Installer » (lib/installation.ts).
// Fenêtre native <dialog> : touche Échap, clic à côté ou « Fermer » pour sortir ; le focus reste
// dans la fenêtre tant qu'elle est ouverte.
// ============================================================================

// Icônes des étapes : bouton Partager de l'iPhone (carré et flèche), « Sur l'écran d'accueil »
// (carré et plus), « Ajouter »
const ICONES = ["ph-export", "ph-plus-square", "ph-check-circle"];

export default function GuideIphone() {
  const ouvert = useSyncExternalStore(abonnerInstallation, guideEstOuvert, guideFermeServeur);
  const { lang } = useLanguage();
  const nko = lang === "nko";
  const fenetre = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = fenetre.current;
    if (!d) return;
    if (ouvert && !d.open) d.showModal();
    if (!ouvert && d.open) d.close();
  }, [ouvert]);

  return (
    <dialog
      ref={fenetre}
      aria-labelledby="guide-iphone-titre"
      onClose={fermerGuide}
      onClick={(e) => { if (e.target === e.currentTarget) fermerGuide(); }}
      className="mx-auto mb-0 mt-auto w-full max-w-lg rounded-t-3xl border border-white/10 bg-surface p-0 text-white shadow-[0_-20px_50px_rgba(0,0,0,0.6)] backdrop:bg-black/70 print:hidden"
    >
      <div className="px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <h2 id="guide-iphone-titre" className="text-start text-lg font-bold">
          <TexteLangue texte={GUIDE_TITRE} nko={nko} />
        </h2>
        <ol className="mt-5 space-y-4">
          {GUIDE_ETAPES.map((etape, i) => (
            <li key={etape.fr} className="flex items-center gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-2xl text-or">
                <i className={`ph-bold ${ICONES[i]}`} aria-hidden="true"></i>
              </span>
              <TexteLangue texte={etape} nko={nko} className="text-start text-base text-white/90" />
            </li>
          ))}
        </ol>
        <button
          type="button"
          onClick={fermerGuide}
          className="mt-6 flex min-h-11 w-full items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-or hover:text-or"
        >
          <TexteLangue texte={FERMER} nko={nko} />
        </button>
      </div>
    </dialog>
  );
}
