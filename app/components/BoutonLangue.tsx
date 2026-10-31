"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "./LanguageProvider";
import { cheminLangue } from "../lib/langue";

// ============================================================================
// N'KO NI LONKO — Bouton de langue des pages sans menu (31 octobre 2026)
// ============================================================================
// Toujours en haut de l'écran, en face du bouton Retour, avec la même icône et le même libellé que
// sur l'accueil (textes repris tels quels de l'accueil). L'accueil et les articles ont déjà le leur ;
// la version à imprimer (PDF) n'en a pas. C'est un vrai lien : il marche avant même la fin du
// chargement, sur un réseau lent ; une fois la page prête, il garde aussi le choix du lecteur.
// Il n'apparaît qu'en haut de la page : posé sur le texte, il prendrait le doigt du lecteur qui vise
// un lien ou une lettre du Lexique, et changerait la langue par erreur.
// ============================================================================

const NOM_NKO = "ߒߞߏ";
const CHANGER = { versFr: "Changer la langue en Français", versNko: "ߞߊ߲ ߦߟߍ߬ߡߊ ߒߞߏ ߘߐ߫" };
const A_SON_BOUTON = /^\/$|^\/article\/|\/imprimer$/;

export default function BoutonLangue() {
  const { lang, toggleLanguage } = useLanguage();
  const [cache, setCache] = useState(false);
  useEffect(() => {
    const surDefilement = () => setCache(window.scrollY > 40);
    window.addEventListener("scroll", surDefilement, { passive: true });
    return () => window.removeEventListener("scroll", surDefilement);
  }, []);

  // Avant l'affichage, l'adresse interne de la version N'Ko commence par /nqo (proxy.ts)
  const chemin = usePathname().replace(/^\/(nqo|fr)(?=\/|$)/, "") || "/";
  if (A_SON_BOUTON.test(chemin)) return null;
  const nko = lang === "nko";

  return (
    <a
      href={cheminLangue(nko ? "fr" : "nqo", chemin)}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        toggleLanguage();
      }}
      aria-label={nko ? CHANGER.versFr : CHANGER.versNko}
      className={`btn-lang fixed top-6 z-[9999] min-h-11 !bg-void/70 backdrop-blur-md no-underline print:hidden focus-visible:translate-y-0 focus-visible:opacity-100 focus-visible:pointer-events-auto ${cache ? "-translate-y-24 opacity-0 pointer-events-none" : ""} ${nko ? "left-4 md:left-8" : "right-4 md:right-8"}`}
    >
      <i className="ph ph-translate text-or" aria-hidden="true"></i>
      {nko ? <span lang="nqo" className="font-kigelia font-bold text-or">{NOM_NKO}</span> : <span lang="fr" className="font-bold text-or">FR</span>}
    </a>
  );
}
