"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "./LanguageProvider";

// ============================================================================
// N'KO NI LONKO — Bouton « Retour » des pages sans barre de navigation (numéros, auteurs, bibliothèque)
// ============================================================================
// Même pilule que les pages Conditions, Confidentialité, Contact, À propos. Si le lecteur arrive
// d'un autre site (WhatsApp, Google…) et n'a pas encore changé de page, le bouton l'emmène à l'ACCUEIL
// au lieu de quitter le site ; sinon il revient à la page précédente.
// Libellé N'Ko repris tel quel de ces pages.
// ============================================================================

const RETOUR = { nko: "ߛߊ߬ߦߌ߲߬", fr: "Retour" };

export default function PiluleRetour() {
  const router = useRouter();
  const { lang, lien } = useLanguage();
  const isNko = lang === "nko";

  const retour = () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(50);
    // Déjà venu d'une autre page du site ? Soit cette page n'est pas la page d'arrivée (navigation
    // interne de Next.js, sans rechargement), soit la page précédente était sur le même site.
    let depuisLeSite = false;
    try {
      const arrivee = performance.getEntriesByType("navigation")[0];
      const pageDArrivee = !arrivee || new URL(arrivee.name).pathname === window.location.pathname;
      depuisLeSite = !pageDArrivee || (!!document.referrer && new URL(document.referrer).origin === window.location.origin);
    } catch {
      depuisLeSite = false;
    }
    if (depuisLeSite && window.history.length > 1) router.back();
    else router.push(lien("/"));
  };

  return (
    <button
      type="button"
      onClick={retour}
      className={`group fixed top-6 z-[9999] flex items-center gap-2 rounded-full border border-white/10 bg-void/40 p-1 shadow-lg backdrop-blur-md transition-all duration-500 hover:border-or/50 hover:bg-void/80 touch-manipulation print:hidden md:px-3 md:py-1.5 ${
        isNko ? "right-4 md:right-8" : "left-4 md:left-8"
      }`}
      aria-label={isNko ? RETOUR.nko : RETOUR.fr}
      dir={isNko ? "rtl" : "ltr"}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-inner transition-colors duration-300 group-hover:bg-[#fbbf24]">
        <i className={`ph-bold ${isNko ? "ph-arrow-right" : "ph-arrow-left"} text-base text-gray-300 transition-colors group-hover:text-black`} aria-hidden="true"></i>
      </span>
      <span lang={isNko ? "nqo" : "fr"} className={`hidden text-xs font-bold leading-none text-or md:inline md:text-sm ${isNko ? "font-kigelia" : "font-fr"}`}>
        {isNko ? RETOUR.nko : RETOUR.fr}
      </span>
    </button>
  );
}
