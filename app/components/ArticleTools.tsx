"use client";

import { useState } from "react";
import { useLanguage } from "./LanguageProvider";

interface ArticleToolsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  title: string;
}

export default function ArticleTools({ onZoomIn, onZoomOut, title }: ArticleToolsProps) {
  const { lang } = useLanguage();
  const isNko = lang === 'nko';
  
  // États pour le feedback visuel (succès de copie)
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCite, setCopiedCite] = useState(false);

  // --- 1. PARTAGE INTELLIGENT ---
  const handleShare = async () => {
    if (typeof window === 'undefined') return;

    const shareData = {
      title: title,
      text: isNko 
        ? `ߞߎߡߘߊ ߣߌ߲߬ ߘߐߜߍ߫ N'Ko ni Lonko ߞߊ߲߬: ${title}` 
        : `Découvrez cet article sur N'Ko ni Lonko : ${title}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.warn("Partage annulé", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } catch (err) {
        console.error("Erreur copie", err);
      }
    }
  };

  // --- 2. CITATION ACADÉMIQUE ---
  const handleCite = async () => {
    if (typeof window === 'undefined') return;

    const year = new Date().getFullYear();
    const citation = isNko
        ? `"${title}". ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ, ${year}. ߓߟߐߟߐ. ${window.location.href}`
        : `"${title}". N'Ko ni Lonko, ${year}. Web. ${window.location.href}`;

    try {
      await navigator.clipboard.writeText(citation);
      setCopiedCite(true);
      setTimeout(() => setCopiedCite(false), 2000);
    } catch (err) {
      console.error("Erreur copie citation", err);
    }
  };

  // --- 3. IMPRESSION ---
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    // 'print:hidden' cache la barre sur papier
    // Animation d'entrée : fade-in + slide-up pour un effet 'World Class'
    <aside className="fixed bottom-6 right-6 md:bottom-auto md:top-1/3 md:right-8 z-40 print:hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col gap-4 p-3 rounded-full bg-[#02040a]/80 backdrop-blur-md border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-transform hover:scale-105">
        
        {/* BOUTON PARTAGER */}
        <button 
            onClick={handleShare} 
            // MOBILE : w-11 h-11 (44px) pour l'accessibilité tactile
            // DESKTOP : w-10 h-10 (40px) pour la finesse
            className="group relative w-11 h-11 md:w-10 md:h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-[#fbbf24] hover:bg-white/5 transition-all touch-manipulation"
            title={isNko ? "ߞߵߊ߬ ߟߊߖߍ߲ߛߍ߲߫" : "Partager"}
            aria-label="Share"
        >
          {copiedLink ? (
             <i className="ph-bold ph-check text-green-400 text-xl"></i>
          ) : (
             <i className="ph-bold ph-share-network text-xl"></i>
          )}
          
          {/* Tooltip */}
          {copiedLink && (
            <span className="absolute right-14 md:right-12 bg-green-500 text-black text-xs font-bold px-2 py-1 rounded whitespace-nowrap animate-in fade-in slide-in-from-right-2 shadow-lg">
                {isNko ? "ߛߌ߬ߘߌ߬ߜߋ߲ ߓߘߊ߫ ߡߌ߬ߣߊ߬" : "Lien copié !"}
            </span>
          )}
        </button>

        {/* BOUTON CITER */}
        <button 
            onClick={handleCite} 
            className="group relative w-11 h-11 md:w-10 md:h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-[#fbbf24] hover:bg-white/5 transition-all touch-manipulation"
            title={isNko ? "ߞߎߡߘߊ ߣߌ߲߬ ߞߏߝߐ߫" : "Citer cet article"}
            aria-label="Cite"
        >
          {copiedCite ? <i className="ph-bold ph-check text-green-400 text-xl"></i> : <i className="ph-bold ph-quotes text-xl"></i>}
          
          {copiedCite && (
            <span className="absolute right-14 md:right-12 bg-green-500 text-black text-xs font-bold px-2 py-1 rounded whitespace-nowrap animate-in fade-in slide-in-from-right-2 shadow-lg">
                {isNko ? "ߞߊ߲ߕߏ߲߫ ߘߐߡߌ߬ߣߊ" : "Citation copiée !"}
            </span>
          )}
        </button>

        {/* BOUTON IMPRIMER (Caché sur mobile car souvent inutile) */}
        <button 
            onClick={handlePrint} 
            className="hidden md:flex w-10 h-10 rounded-full items-center justify-center text-gray-400 hover:text-[#fbbf24] hover:bg-white/5 transition-all"
            title={isNko ? "ߞߵߊ߬ ߜߌ߬ߙߌ߲߬ߘߌ߬" : "Imprimer"}
            aria-label="Print"
        >
          <i className="ph-bold ph-printer text-xl"></i>
        </button>

        {/* SÉPARATEUR */}
        <div className="w-6 h-[1px] bg-white/10 mx-auto"></div>

        {/* ZOOM + */}
        <button 
            onClick={onZoomIn} 
            className="w-11 h-11 md:w-10 md:h-10 rounded-full flex flex-col items-center justify-center text-gray-300 hover:text-white hover:bg-white/5 transition-all active:scale-90 touch-manipulation"
            title={isNko ? " + ߜߋ߲߭ ߡߊߜߙߍ߬" : "Agrandir le texte"}
            aria-label="Zoom In"
        >
          <span className="text-sm font-bold leading-none mb-[2px]">A</span>
          <i className="ph-bold ph-caret-up text-[10px] text-[#fbbf24]"></i>
        </button>

        {/* ZOOM - */}
        <button 
            onClick={onZoomOut} 
            className="w-11 h-11 md:w-10 md:h-10 rounded-full flex flex-col items-center justify-center text-gray-300 hover:text-white hover:bg-white/5 transition-all active:scale-90 touch-manipulation"
            title={isNko ? " - ߜߋ߲߭ ߡߊ߬ߓߐ߫" : "Réduire le texte"}
            aria-label="Zoom Out"
        >
          <span className="text-xs font-bold leading-none mb-[2px]">A</span>
          <i className="ph-bold ph-caret-down text-[10px] text-gray-500"></i>
        </button>
      </div>
    </aside>
  );
}