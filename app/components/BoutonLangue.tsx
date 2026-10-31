"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "./LanguageProvider";
import { cheminLangue } from "../lib/langue";
import { noterPlaceLangue } from "../lib/place-langue";

// ============================================================================
// N'KO NI LONKO — Bouton de langue (31 octobre 2026)
// ============================================================================
// Le même bouton, au même endroit de l'écran, sur toutes les pages, en N'Ko et en français : au milieu
// du haut. Le reste de l'interface passe en miroir d'une langue à l'autre (droite à gauche, le standard) ;
// le centre est le seul point qu'un miroir ne déplace pas. Le lecteur le retrouve donc sans le chercher,
// même s'il ne lit pas la langue affichée. Textes repris tels quels de l'accueil. C'est un vrai lien : il
// marche avant même la fin du chargement. Sur les pages sans barre fixe, il n'apparaît qu'en haut de la
// page : posé sur le texte, il prendrait le doigt du lecteur et changerait la langue par erreur.
// ============================================================================

const NOM_NKO = "ߒߞߏ";
const CHANGER = { versFr: "Changer la langue en Français", versNko: "ߞߊ߲ ߦߟߍ߬ߡߊ ߒߞߏ ߘߐ߫" };
const ARTICLE = /^\/article\/([^/]+)/;

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
  if (chemin.endsWith("/imprimer")) return null; // jamais dans le PDF
  const article = ARTICLE.exec(chemin)?.[1];
  // L'accueil et les articles ont une barre fixe en haut : le bouton y reste, sans rien recouvrir
  const avecBarre = chemin === "/" || !!article;
  const nko = lang === "nko";

  return (
    <a
      href={cheminLangue(nko ? "fr" : "nqo", chemin)}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        if (article) noterPlaceLangue(article);
        toggleLanguage();
      }}
      aria-label={nko ? CHANGER.versFr : CHANGER.versNko}
      className={`btn-lang fixed left-1/2 top-3 z-[9000] h-11 w-[88px] -translate-x-1/2 justify-center !p-0 !bg-void/70 backdrop-blur-md no-underline print:hidden focus-visible:translate-y-0 focus-visible:opacity-100 focus-visible:pointer-events-auto ${cache && !avecBarre ? "-translate-y-24 opacity-0 pointer-events-none" : ""}`}
    >
      <i className="ph ph-translate text-or" aria-hidden="true"></i>
      {nko ? <span lang="nqo" className="font-kigelia font-bold text-or">{NOM_NKO}</span> : <span lang="fr" className="font-bold text-or">FR</span>}
    </a>
  );
}
