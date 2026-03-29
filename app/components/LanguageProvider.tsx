"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import Image from "next/image";
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
  // 🚀 LE BOUCLIER ANTI-CLONE (Ingénierie Extrême)
  // Vérifie si un LanguageProvider Maître existe déjà au-dessus de lui.
  const existingContext = useContext(LanguageContext);

  const [lang, setLang] = useState<Language>("nko");
  const [isMounted, setIsMounted] = useState(false);
  const [showPortal, setShowPortal] = useState(false);

  const triggerRoyalVibration = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([50, 30, 50]);
  }, []);

  const triggerLightVibration = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(30);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
      const rawLang = localStorage.getItem("preferred-lang");
      const savedLang: Language | null = (rawLang === "fr" || rawLang === "nko") ? rawLang : null;
      if (savedLang) {
        setLang(savedLang);
      } else {
        setShowPortal(true);
        document.body.style.overflow = "hidden";
        document.body.style.touchAction = "none";
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isMounted || existingContext) return;
    const direction = lang === "nko" ? "rtl" : "ltr";
    document.body.setAttribute("dir", direction);
    document.documentElement.setAttribute("lang", lang);
    localStorage.setItem("preferred-lang", lang);
  }, [lang, isMounted, existingContext]);

  const toggleLanguage = useCallback(() => {
    const nextLang = lang === "fr" ? "nko" : "fr";
    if (nextLang === "nko") triggerRoyalVibration();
    else triggerLightVibration();
    setLang(nextLang);
  }, [lang, triggerRoyalVibration, triggerLightVibration]);

  const handleChooseLanguage = (selectedLang: Language) => {
    if (selectedLang === "nko") triggerRoyalVibration();
    else triggerLightVibration();
    setLang(selectedLang);
    setShowPortal(false);
    document.body.style.overflow = "";
    document.body.style.touchAction = "";
  };

  const t = lang === "fr" ? fr : nko;

  // 🚀 AUTO-DESTRUCTION DU CLONE
  // S'il y a déjà un portail Maître au-dessus, le clone devient transparent et laisse passer le code.
  if (existingContext) {
    return <>{children}</>;
  }

  // LE PORTAIL MAÎTRE (Le Design World Class est de retour)
  return (
    <LanguageContext.Provider value={{ lang, t, toggleLanguage }}>
      
      {isMounted && showPortal && (
        <div 
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#02040a]/95 backdrop-blur-3xl animate-in fade-in duration-1000"
          dir="ltr" 
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#fbbf24]/5 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="relative z-10 flex flex-col items-center animate-in zoom-in-95 duration-700 delay-100 fill-mode-forwards px-6 w-full max-w-2xl">
            
            <div className="w-32 h-32 mb-10 relative group flex items-center justify-center p-4 backdrop-blur-xl bg-white/5 border border-white/10 rounded-[2rem] shadow-[inset_0_0_20px_rgba(251,191,36,0.05)]">
                <div className="absolute inset-0 bg-[#fbbf24] blur-2xl opacity-20 rounded-full animate-pulse duration-[3000ms]"></div>
                <Image 
                    src="/icon-192x192.png" 
                    alt="Sceau N'Ko ni Lonko" 
                    width={128} 
                    height={128} 
                    className="relative z-10 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)] pointer-events-none"
                    priority
                />
            </div>

            <h1 className="text-center flex flex-col gap-4 mb-16">
                <span className="font-kigelia text-4xl md:text-5xl text-[#fbbf24] drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]">ߌ ߟߊ߫ ߞߊ߲ ߛߎߥߊ߲ߘߌ߫</span>
                <span className="text-white/50 text-xs md:text-sm uppercase tracking-[0.4em] border-t border-white/10 pt-4">
                  Choisissez votre langue
                </span>
            </h1>

            <div className="flex flex-col sm:flex-row gap-6 w-full justify-center">
              
              {/* BOUTON N'KO */}
              <button 
                type="button"
                onClick={() => handleChooseLanguage("nko")}
                className="group relative px-10 py-6 w-full sm:w-64 rounded-2xl bg-[#fbbf24]/10 border border-[#fbbf24]/30 hover:bg-[#fbbf24] transition-colors duration-300 shadow-[0_0_30px_rgba(251,191,36,0.1)] flex flex-col items-center overflow-hidden touch-manipulation cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none"></div>
                <span className="font-kigelia text-4xl text-[#fbbf24] group-hover:text-black mb-1 transition-colors relative z-10 pointer-events-none">ߒߞߏ</span>
                <span className="text-[14px] text-[#fbbf24]/70 group-hover:text-black/70 tracking-widest uppercase transition-colors relative z-10 pointer-events-none"> ߒߞߏ ߕߊ߬</span>
              </button>

              {/* BOUTON FRANÇAIS */}
              <button 
                type="button"
                onClick={() => handleChooseLanguage("fr")}
                className="group relative px-10 py-6 w-full sm:w-64 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 transition-colors duration-300 flex flex-col items-center touch-manipulation cursor-pointer"
              >
                <span className="text-2xl text-white/80 group-hover:text-white font-light mb-2 tracking-wider transition-colors pointer-events-none">Français</span>
                <span className="text-[10px] text-gray-500 group-hover:text-gray-300 tracking-widest uppercase transition-colors pointer-events-none">Entrer en Français</span>
              </button>

            </div>

            <p className="mt-16 text-[11px] text-white/20 uppercase tracking-widest font-kigelia opacity-70 cursor-default pointer-events-none">
               ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ ߞߊ߲ߞߋߦߊ ߓߐߘߊ ߂.߀
            </p>

          </div>
        </div>
      )}

      {children}
      
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage doit être utilisé dans LanguageProvider");
  return context;
}