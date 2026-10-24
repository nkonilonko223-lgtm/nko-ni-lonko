"use client";

// ============================================================================
// N'KO NI LONKO — Visionneuse des images du texte (îlot client, 18 octobre 2026)
// ============================================================================
// Le texte de l'article est préparé par le serveur (CustomPortableText). Seule la visionneuse
// reste dans le navigateur : un clic sur une image l'ouvre en grand, Échap ou un clic la referme.
// Elle est placée APRÈS le texte, comme avant (et non dans l'image) : un parent animé
// (classe « apparition ») fausserait sa position plein écran.
// ============================================================================

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import { useLanguage } from "../LanguageProvider";
import { langueTexte } from "../numero/titre";

interface LightboxState {
  url: string;
  alt: string;
  captionNko?: string; // 🚀 Transport de la Légende N'Ko vers le plein écran
  caption?: string;    // 🚀 Transport de la Légende Française
}

const OuvrirImage = createContext<(image: LightboxState) => void>(() => {});

export default function Visionneuse({ children }: { children: ReactNode }) {
  const { lang } = useLanguage();
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
    };
    if (lightbox) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightbox]);

  return (
    <OuvrirImage.Provider value={setLightbox}>
      {children}

      {/* 🚀 LA LOUPE CINÉMATIQUE (Plein écran scrolable) */}
      {lightbox && (
        <div 
          className="ambiance-nuit fixed inset-0 z-[999999] flex flex-col bg-black/98 backdrop-blur-2xl transition-all duration-300 print:hidden"
        >
          <div className="absolute top-0 w-full h-20 bg-gradient-to-b from-black/80 to-transparent z-50 flex items-center justify-end px-6 pointer-events-none">
            <button 
              className="w-12 h-12 rounded-full bg-white/10 hover:bg-[#fbbf24] text-white hover:text-black flex items-center justify-center transition-all cursor-pointer backdrop-blur-md border border-white/20 hover:border-or pointer-events-auto"
              onClick={(e) => { e.stopPropagation(); setLightbox(null); }}
              aria-label={lang === 'nko' ? "ߊ߬ ߘߊߕߎ߲߯" : "Fermer l'image"}
            >
              <i className="ph-bold ph-x text-2xl"></i>
            </button>
          </div>

          <div 
            className="flex-1 w-full flex items-center justify-center p-4 md:p-8 min-h-[50vh]"
            onClick={() => setLightbox(null)}
          >
            <div className="relative w-full h-full max-w-7xl max-h-[75vh] flex items-center justify-center cursor-zoom-out">
              <Image 
                src={lightbox.url} 
                alt={lightbox.alt} lang={langueTexte(lightbox.alt)} 
                fill
                className="object-contain drop-shadow-[0_0_50px_rgba(251,191,36,0.15)]"
                sizes="100vw"
              />
            </div>
          </div>

          {/* 🚀 LÉGENDE SCROLLABLE "DUAL-STACK" POUR LE LIGHTBOX */}
          {(lightbox.captionNko || lightbox.caption) && (
            <div className="w-full max-h-[40vh] overflow-y-auto bg-black/90 backdrop-blur-xl border-t border-white/10 px-4 py-6 md:px-8 md:py-8 overscroll-contain shadow-[0_-20px_50px_rgba(0,0,0,0.8)]" onClick={(e) => e.stopPropagation()}>
              <div className="max-w-4xl mx-auto flex flex-col gap-4 md:gap-5">
                
                {/* 1. N'Ko en Plein Écran : 17px/19px */}
                {lightbox.captionNko && (
                  <div dir="rtl" lang="nqo" className="text-or font-kigelia text-right text-[17px] md:text-[19px] leading-relaxed drop-shadow-md">
                    {lightbox.captionNko}
                  </div>
                )}
                
                {/* 2. Ligne de Lumière (Plus large en plein écran) */}
                {lightbox.captionNko && lightbox.caption && (
                  <div className="w-32 h-[1.5px] bg-gradient-to-r from-transparent via-or/50 to-transparent mx-auto rounded-full my-2"></div>
                )}

                {/* 3. Français en Support : 14px/15px */}
                {lightbox.caption && (
                  <div dir="ltr" lang="fr" className="text-white/70 font-sans text-left text-[14px] md:text-[15px] italic leading-relaxed">
                    {lightbox.caption}
                  </div>
                )}

              </div>
            </div>
          )}
        </div>
      )}
    </OuvrirImage.Provider>
  );
}

// Cadre cliquable d'une image du texte : l'image et ses légendes restent préparées par le serveur
export function ZoneAgrandissable({ image, children }: { image: LightboxState; children: ReactNode }) {
  const ouvrir = useContext(OuvrirImage);
  return (
    <div
      className="relative w-full overflow-hidden group cursor-zoom-in rounded-xl md:rounded-2xl border border-white/10 print:border-gray-300 shadow-2xl bg-void print:bg-transparent"
      onClick={() => ouvrir(image)}
    >
      {children}
    </div>
  );
}
