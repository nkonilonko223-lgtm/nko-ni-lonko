"use client";

import { useState, useEffect, useCallback } from "react";
// 🚀 ARME 1 : Import du routeur pour la téléportation
import { useRouter } from "next/navigation";

export default function NetworkBoundary({ children }: { children: React.ReactNode }) {
  const [showOverlay, setShowOverlay] = useState(false);
  // 🚀 ARME 1 : La Mémoire Fantôme (stocke l'URL voulue)
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  
  const router = useRouter();

  // 🚀 L'Haptique de Secours
  const triggerErrorVibration = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([100, 50, 100]); 
  }, []);

  const triggerCloseVibration = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50); 
  }, []);

  useEffect(() => {
    // 1. Retour du réseau (La Résurrection)
    const handleOnline = () => {
      setShowOverlay(false);
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
      
      // 🚀 Téléportation automatique si une URL était en attente
      if (pendingUrl) {
        // Optionnel : Légère vibration de succès
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([30, 50, 30]);
        router.push(pendingUrl);
        setPendingUrl(null); // On efface la mémoire
      }
    };
    window.addEventListener("online", handleOnline);

    // 2. Interception des clics (Le Bouclier)
    const handleLinkClick = (e: MouseEvent) => {
      if (navigator.onLine) return;

      const target = e.target as HTMLElement;
      const anchor = target.closest("a");

      if (anchor && anchor.href) {
        try {
          const url = new URL(anchor.href, window.location.origin);
          
          if (url.pathname === window.location.pathname && url.hash) return;
          if (url.protocol === 'mailto:' || url.protocol === 'tel:') return;

          e.preventDefault();
          e.stopPropagation();
          triggerErrorVibration();
          
          // 🚀 Mémoire Fantôme : On mémorise uniquement si c'est un lien interne au site (Sécurité Max)
          if (url.hostname === window.location.hostname) {
            setPendingUrl(url.pathname + url.search + url.hash);
          }
          
          setShowOverlay(true);
        } catch (err) {
          console.warn("URL invalide interceptée hors-ligne.", err);
        }
      }
    };

    document.addEventListener("click", handleLinkClick, { capture: true });

    return () => {
      window.removeEventListener("online", handleOnline);
      document.removeEventListener("click", handleLinkClick, { capture: true });
      document.body.style.overflow = "";
    };
  }, [pendingUrl, router, triggerErrorVibration]);

  // Verrouillage "App-Like"
  useEffect(() => {
    if (showOverlay) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
  }, [showOverlay]);

  const closeOverlay = () => {
    triggerCloseVibration();
    setShowOverlay(false);
    setPendingUrl(null); // Si l'utilisateur ferme, on annule l'intention
  };

  return (
    <>
      {children}
      
      {showOverlay && (
        <div 
          // 🚀 ARME 2 : backdrop-grayscale pour la Stase Temporelle
          className="fixed inset-0 z-[9999] bg-[#02040a]/80 backdrop-blur-xl backdrop-grayscale flex flex-col items-center justify-center px-6 text-center animate-in fade-in duration-300" 
          dir="ltr"
          role="alertdialog"
          aria-modal="true"
        >
          {/* Sceau d'Arrière-plan */}
          <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center opacity-[0.02]">
            <i className="ph-fill ph-wifi-slash text-[400px] text-[#fbbf24]"></i>
          </div>

          <div className="relative z-10 w-full max-w-lg flex flex-col items-center">
            
            {/* 🚀 ARME 3 : Le Radar Actif (Ondes concentriques) */}
            <div className="mb-8 relative flex items-center justify-center w-32 h-32 animate-in zoom-in duration-500 delay-100">
              {/* Onde Radar 1 (Grande et lente) */}
              <div className="absolute inset-0 border-2 border-[#fbbf24] rounded-full opacity-20 animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
              {/* Onde Radar 2 (Petite et rapide) */}
              <div className="absolute inset-4 border border-[#fbbf24] rounded-full opacity-40 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite_0.5s]"></div>
              {/* Cœur énergétique */}
              <div className="absolute inset-8 bg-[#fbbf24]/20 blur-md rounded-full"></div>
              
              <i className="ph-bold ph-wifi-slash text-6xl text-[#fbbf24] relative z-10"></i>
            </div>

            {/* Titres Bilingues (N'Ko is King) */}
            <h1 className="flex flex-col items-center gap-2 mb-6 animate-in slide-in-from-bottom-4 duration-500 delay-150">
              <span className="text-4xl md:text-5xl font-bold font-kigelia text-[#fbbf24] drop-shadow-[0_0_15px_rgba(251,191,36,0.4)]">
                ߓߌ߬ߟߊ߬ߢߐ߲߰ߡߊ ߕߍ߫ ߦߋ߲߬
              </span>
              <span className="text-2xl font-bold text-white opacity-90 tracking-wide">
                Aucune connexion internet
              </span>
            </h1>

            {/* Textes Bilingues */}
            <div className="max-w-md mb-12 flex flex-col gap-5 animate-in slide-in-from-bottom-4 duration-500 delay-200">
              <p className="font-kigelia text-xl leading-[1.6] text-slate-200 py-1 -my-1">
                ߌ ߟߊ߫ ߓߌ߬ߟߊ߬ߢߐ߲߰ߡߊ ߓߘߊ߫ ߕߍ߰߹ ߞߏ߬ߣߌ߲߬ ߌ ߘߌ߫ ߛߋ߫ ߞߐߛߊߦߌ߫ ߟߊ߫ ߝߙߍ ߞߣߐ߫߸ ߞߊ߬ ߞߎߡߘߊ߫ ߓߊߛߌ߰ߣߍ߲ ߠߎ߬ ߞߊ߬ߙߊ߲߬.
              </p>
              <div className="w-12 h-[1px] bg-white/20 mx-auto"></div>
              <p className="text-gray-400 text-sm leading-relaxed">
                {pendingUrl 
                  ? "Recherche du réseau en cours... Vous serez automatiquement redirigé vers l'article dès que la connexion sera rétablie." 
                  : "Impossible de charger cette page sans réseau. Fermez ce message pour continuer à lire la page actuelle hors-ligne."}
              </p>
            </div>

            {/* Bouton de Fermeture */}
            <button
              onClick={closeOverlay}
              className="group flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-[#fbbf24] text-black transition-all hover:bg-white hover:scale-105 shadow-[0_0_20px_rgba(251,191,36,0.3)] active:scale-95 touch-manipulation animate-in fade-in duration-500 delay-300"
            >
              <i className="ph-bold ph-x text-xl transition-transform group-hover:rotate-90"></i>
              <span className="font-kigelia text-lg font-bold">ߊ߬ ߘߊߕߎ߲߯</span>
              <span className="opacity-40 font-light text-xl">|</span>
              <span className="font-bold">Fermer</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}