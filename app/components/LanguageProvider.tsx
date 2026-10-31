"use client";

import React, { createContext, useContext, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import fr from "../messages/fr.json";
import nko from "../messages/nko.json";
import { cheminLangue, cheminSansLangue, langueAdresse } from "../lib/langue";

type Dictionary = typeof fr;
type Language = "fr" | "nko";

type LanguageContextType = {
  lang: Language;
  t: Dictionary;
  toggleLanguage: () => void;
  // Lien interne dans la langue de la page : lien("/about") → « /about » (N'Ko) ou « /fr/about »
  lien: (chemin: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Langue dans l'adresse (B6, 22 octobre 2026) : la langue vient de l'adresse de la page
// (prop « langue », donnée par app/[lang]/layout.tsx) et non plus du navigateur. Le choix
// gardé (« preferred-lang ») ne sert plus qu'à l'accueil (script du gabarit) et à la
// fenêtre de choix de la première visite.
export function LanguageProvider({ children, langue }: { children: React.ReactNode; langue: Language }) {
  // 🚀 LE BOUCLIER ANTI-CLONE (Ingénierie Extrême)
  // Vérifie si un LanguageProvider Maître existe déjà au-dessus de lui.
  const existingContext = useContext(LanguageContext);
  const router = useRouter();

  const lang = langue;

  const triggerRoyalVibration = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([50, 30, 50]);
  }, []);

  const triggerLightVibration = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(30);
  }, []);

  useEffect(() => {
    if (existingContext) return;
    document.documentElement.setAttribute("data-site-vivant", ""); // le code est arrivé : app/lib/fichier-perdu.ts
  }, [existingContext]);

  // Garde le choix du lecteur, puis ouvre la même page dans cette langue
  const allerVers = useCallback((choix: Language) => {
    try { localStorage.setItem("preferred-lang", choix); } catch { /* stockage bloqué */ }
    if (choix === lang) return;
    const { pathname, search, hash } = window.location;
    router.push(cheminLangue(langueAdresse(choix), cheminSansLangue(pathname)) + search + hash);
  }, [lang, router]);

  const toggleLanguage = useCallback(() => {
    const nextLang = lang === "fr" ? "nko" : "fr";
    if (nextLang === "nko") triggerRoyalVibration();
    else triggerLightVibration();
    allerVers(nextLang);
  }, [lang, allerVers, triggerRoyalVibration, triggerLightVibration]);

  const lien = useCallback((chemin: string) => cheminLangue(langueAdresse(lang), chemin), [lang]);

  const t = lang === "fr" ? fr : nko;

  // 🚀 AUTO-DESTRUCTION DU CLONE
  // S'il y a déjà un portail Maître au-dessus, le clone devient transparent et laisse passer le code.
  if (existingContext) {
    return <>{children}</>;
  }

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLanguage, lien }}>
      
      {children}
      
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage doit être utilisé dans LanguageProvider");
  return context;
}