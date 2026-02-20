"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import fr from "../messages/fr.json"; 
import nko from "../messages/nko.json";

type Dictionary = typeof fr;
type Language = "fr" | "nko";

type LanguageContextType = {
  lang: Language;
  t: Dictionary;
  toggleLanguage: () => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // On commence par 'fr' par défaut
  const [lang, setLang] = useState<Language>("fr");

  // 1. INTELLIGENCE AU DÉMARRAGE
  useEffect(() => {
    // 💡 ASTUCE : On met la logique dans un petit délai (0ms)
    // Cela calme VS Code qui n'aime pas les mises à jour instantanées
    const timer = setTimeout(() => {
        const savedLang = localStorage.getItem("preferred-lang") as Language;
        
        // A. Priorité à la mémoire (si l'utilisateur a déjà choisi)
        if (savedLang && (savedLang === "fr" || savedLang === "nko")) {
            setLang(savedLang);
        } else {
            // B. Sinon, détection automatique du navigateur
            const browserLang = navigator.language?.toLowerCase();
            if (browserLang && (browserLang.includes('nqo') || browserLang.includes('nko'))) {
                setLang("nko");
            }
        }
    }, 0);

    return () => clearTimeout(timer); // Nettoyage propre
  }, []);

  // 2. EFFET SECONDAIRE (Mise à jour du DOM + Sauvegarde)
  useEffect(() => {
    const direction = lang === "nko" ? "rtl" : "ltr";
    document.body.setAttribute("dir", direction);
    document.documentElement.setAttribute("lang", lang);
    localStorage.setItem("preferred-lang", lang);
  }, [lang]);

  const toggleLanguage = () => {
    setLang((prev) => (prev === "fr" ? "nko" : "fr"));
  };

  const t = lang === "fr" ? fr : nko;

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage doit être utilisé dans LanguageProvider");
  return context;
}