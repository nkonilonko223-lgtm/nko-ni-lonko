"use client";

/**
 * ==============================================================================
 * 📂 FICHIER : app/components/ArticleTools.tsx
 * ------------------------------------------------------------------------------
 * 🎯 RÔLE : Cockpit de lecture interactif (Dynamic Island & Sommaire).
 * ⚡ INTELLIGENCE : Surlignage Cognitif (Popup au surlignage) & Boussole (Scroll Spy).
 * 📳 SENSORIEL : Retour haptique natif sur chaque interaction.
 * 🛡️ INGÉNIERIE : MutationObserver, URL Canoniques, Z-Index Masterclass, Polyfill Safari.
 * ==============================================================================
 */

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "./LanguageProvider";

interface ArticleToolsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  title: string;
}

export default function ArticleTools({ onZoomIn, onZoomOut, title }: ArticleToolsProps) {
  const { lang } = useLanguage();
  const isNko = lang === 'nko';
  
  // États de l'Île Dynamique
  const [isExpanded, setIsExpanded] = useState(false);
  const [showToc, setShowToc] = useState(false);
  const [isVisible, setIsVisible] = useState(true); // 🚀 Détecteur d'intention

  // 🚀 ALGORITHME D'ÉCLIPSE (Smart Auto-Hide) 1/1000
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScrollVisibility = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          // Disparition douce si on scrolle vers le bas (lecture)
          if (currentScrollY > lastScrollY && currentScrollY > 100) {
            setIsVisible(false);
            if (window.innerWidth < 768) {
              setIsExpanded(false); // Auto-fermeture
              setShowToc(false);
            }
          } else {
            setIsVisible(true); // Réapparition au moindre scroll vers le haut
          }
          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScrollVisibility, { passive: true });
    return () => window.removeEventListener('scroll', handleScrollVisibility);
  }, []);

  // États de Fonctionnalités
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCite, setCopiedCite] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // États de la Boussole (Sommaire)
  const [headings, setHeadings] = useState<{id: string, text: string, level: string}[]>([]);
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');

  // États du Surlignage Cognitif
  const [selection, setSelection] = useState({ show: false, text: '', x: 0, y: 0 });
  const [copiedSelection, setCopiedSelection] = useState(false);

  // 🚀 L'Illusion Physique (Haptique)
  const triggerVibration = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }
  }, []);

  // 🚀 UTILITAIRE 1/1000 : URL Canonique absolue
  const getCanonicalUrl = useCallback(() => {
    if (typeof window === 'undefined') return '';
    return window.location.origin + window.location.pathname;
  }, []);

  // ==============================================================================
  // 🧠 ALGORITHME 1 : LA BOUSSOLE SCIENTIFIQUE (MutationObserver & Scroll Spy)
  // ==============================================================================
  useEffect(() => {
    const generateHeadings = () => {
      const elements = Array.from(document.querySelectorAll('.article-content h2, .article-content h3'));
      const hData = elements.map((el, i) => {
        if (!el.id) el.id = `heading-autogen-${i}`; // Injection d'ID si manquant
        return { id: el.id, text: el.textContent || '', level: el.tagName.toLowerCase() };
      });
      setHeadings(hData);
    };

    generateHeadings();

    const targetNode = document.querySelector('.article-content');
    let observer: MutationObserver | null = null;
    if (targetNode) {
      observer = new MutationObserver(() => generateHeadings());
      observer.observe(targetNode, { childList: true, subtree: true });
    }

    const handleScroll = () => {
      const elements = Array.from(document.querySelectorAll('.article-content h2, .article-content h3'));
      let current = '';
      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 150) {
          current = el.id;
        }
      }
      if (current) setActiveHeadingId(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToHeading = (id: string) => {
    triggerVibration();
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    if (window.innerWidth < 768) setShowToc(false);
  };

  // ==============================================================================
  // 🧠 ALGORITHME 2 : LE SURLIGNAGE COGNITIF (Menu Magnétique Bilingue)
  // ==============================================================================
  useEffect(() => {
    const handleSelection = () => {
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed && sel.toString().trim().length > 10) {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        setSelection({
          show: true,
          text: sel.toString().trim(),
          x: rect.left + rect.width / 2,
          y: rect.top,
        });
      } else {
        if (selection.show) setSelection(s => ({ ...s, show: false }));
      }
    };

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('touchend', handleSelection);
    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('touchend', handleSelection);
    };
  }, [selection.show]);

  // 🚀 L'ARME SÉMANTIQUE : Partage 100% N'Ko quand la langue est N'Ko
  const shareSelectionOnX = () => {
    triggerVibration();
    const textToShare = isNko 
      ? `"${selection.text}" — ߊ߬ ߘߐߞߊ߬ߙߊ߲߬ ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ ߞߊ߲߬\n\n${getCanonicalUrl()}`
      : `"${selection.text}" — lu sur N'Ko ni Lonko\n\n${getCanonicalUrl()}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(textToShare)}`, '_blank');
    setSelection(s => ({ ...s, show: false }));
  };

  const shareSelectionOnWhatsApp = () => {
    triggerVibration();
    const textToShare = isNko 
      ? `"${selection.text}" — ߊ߬ ߘߐߞߊ߬ߙߊ߲߬ ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ ߞߊ߲߬\n\n${getCanonicalUrl()}`
      : `"${selection.text}" — lu sur N'Ko ni Lonko\n\n${getCanonicalUrl()}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(textToShare)}`, '_blank');
    setSelection(s => ({ ...s, show: false }));
  };

  const copySelection = async () => {
    triggerVibration();
    try {
      await navigator.clipboard.writeText(`"${selection.text}" - ${title} (${getCanonicalUrl()})`);
      setCopiedSelection(true);
      setTimeout(() => {
        setCopiedSelection(false);
        setSelection(s => ({ ...s, show: false }));
      }, 1500);
    } catch (err) {
      console.error(err);
    }
  };

  // ==============================================================================
  // INIT & OUTILS CLASSIQUES
  // ==============================================================================
  
  // 🚀 SÉCURITÉ HYDRATATION & LINTER : Décalage asynchrone (0ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      const slug = window.location.pathname;
      const bookmarks = JSON.parse(localStorage.getItem('nko_bookmarks') || '[]');
      setIsBookmarked(bookmarks.includes(slug));
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    // 🚀 Support Safari/iOS
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  // 🛡️ FERMETURE AU CLIC EXTÉRIEUR (Cockpit + Sommaire)
  useEffect(() => {
    if (!showToc && !isExpanded) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('aside')) return;
      setShowToc(false);
      setIsExpanded(false);
    };

    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }, 10);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showToc, isExpanded]);

  const toggleBookmark = () => {
    triggerVibration();
    const slug = window.location.pathname;
    let bookmarks = JSON.parse(localStorage.getItem('nko_bookmarks') || '[]');
    if (bookmarks.includes(slug)) {
      bookmarks = bookmarks.filter((b: string) => b !== slug);
      setIsBookmarked(false);
    } else {
      bookmarks.push(slug);
      setIsBookmarked(true);
    }
    localStorage.setItem('nko_bookmarks', JSON.stringify(bookmarks));
  };

  // 🚀 L'ARME SAFARI : Polyfill pour que le Plein Écran marche sur Mac et iPhone
  const toggleZenMode = () => {
    triggerVibration();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const docEl = document.documentElement as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doc = document as any;

    if (!doc.fullscreenElement && !doc.webkitFullscreenElement) {
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(() => {});
      } else if (docEl.webkitRequestFullscreen) { 
        docEl.webkitRequestFullscreen(); 
      }
    } else {
      if (doc.exitFullscreen) {
        doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) { 
        doc.webkitExitFullscreen(); 
      }
    }
  };

  const handleShare = async () => {
    triggerVibration();
    setIsExpanded(false); // 🛡️ Ferme le cockpit mobile
    const cleanUrl = getCanonicalUrl();
    if (navigator.share) {
      navigator.share({ title, url: cleanUrl }).catch(() => {});
    } else {
      navigator.clipboard.writeText(cleanUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCite = async () => {
    triggerVibration();
    if (typeof window === 'undefined') return;

    const year = new Date().getFullYear();
    const cleanUrl = getCanonicalUrl();
    const citation = isNko
        ? `"${title}". ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ, ${year}. ߓߟߐߟߐ. ${cleanUrl}`
        : `"${title}". N'Ko ni Lonko, ${year}. Web. ${cleanUrl}`;

    try {
      await navigator.clipboard.writeText(citation);
      setCopiedCite(true);
      setTimeout(() => setCopiedCite(false), 2000);
    } catch (err) {
      console.error("Erreur copie citation", err);
    }
  };

  const handlePrint = () => {
    triggerVibration();
    setIsExpanded(false); // 🛡️ Ferme le cockpit mobile
    if (typeof window !== 'undefined') window.print();
  };
  const wrapZoomIn = () => { triggerVibration(); onZoomIn(); };
  const wrapZoomOut = () => { triggerVibration(); onZoomOut(); };

  return (
    <>
      {/* 🚀 ARME 2 (UI) : LA PILULE MAGNÉTIQUE DE SÉLECTION */}
      {selection.show && (
        <div 
          className="fixed z-[9990] flex items-center gap-1 p-1 bg-black/90 backdrop-blur-xl border border-white/20 shadow-[0_10px_40px_rgba(251,191,36,0.3)] rounded-full animate-in fade-in zoom-in duration-200"
          style={{ 
            // 👑 Blindage mobile : clamp empêche la pilule de sortir de l'écran
            left: `clamp(60px, ${selection.x}px, calc(100vw - 60px))`,
            top: `clamp(80px, ${selection.y}px, calc(100vh - 80px))`,
            transform: 'translate(-50%, -120%)'
          }}
        >
          {copiedSelection ? (
            <div className="flex items-center gap-2 px-3 py-1.5 text-green-400">
              <i className="ph-bold ph-check"></i>
              <span className={`text-xs font-bold ${isNko ? 'font-kigelia' : ''}`}>{isNko ? 'ߊ߬ ߓߘߊ߫ ߡߌ߬ߣߊ߬' : 'Copié !'}</span>
            </div>
          ) : (
            <>
              {/* 🚀 TRADUCTIONS ET ACCESSIBILITÉ IMPLÉMENTÉES */}
              <button 
                onClick={shareSelectionOnX} 
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white hover:text-[#fbbf24] transition-colors" 
                title={isNko ? "ߞߎߡߦߊ ߣߌ߲߬ ߟߊߦߟߍ߬ ߕߎ߳ߌߕߍߙ ߞߊ߲߬" : "Tweeter cette phrase"}
                aria-label={isNko ? "ߞߎߡߦߊ ߣߌ߲߬ ߟߊߦߟߍ߬ ߕߎ߳ߌߕߍߙ ߞߊ߲߬" : "Tweeter cette phrase"}
              >
                <i className="ph-fill ph-x-logo text-sm"></i>
              </button>
              <button 
                onClick={shareSelectionOnWhatsApp} 
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white hover:text-[#25D366] transition-colors" 
                title={isNko ? "ߊ߬ ߟߊߖߍ߲ߛߍ߲ ߥߊߕߑߛߊߔ ߞߊ߲߬" : "Partager sur WhatsApp"}
                aria-label={isNko ? "ߊ߬ ߟߊߖߍ߲ߛߍ߲ ߥߊߕߑߛߊߔ ߞߊ߲߬" : "Partager sur WhatsApp"}
              >
                <i className="ph-fill ph-whatsapp-logo text-sm"></i>
              </button>
              <div className="w-[1px] h-4 bg-white/20 mx-1"></div>
              <button 
                onClick={copySelection} 
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white hover:text-[#fbbf24] transition-colors" 
                title={isNko ? "ߞߊ߲ߕߏ߲ ߡߌ߬ߣߊ߬" : "Copier la citation"}
                aria-label={isNko ? "ߞߊ߲ߕߏ߲ ߡߌ߬ߣߊ߬" : "Copier la citation"}
              >
                <i className="ph-bold ph-quotes text-sm"></i>
              </button>
            </>
          )}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-black/90"></div>
        </div>
      )}

     {/* 🚀 L'ÎLE DYNAMIQUE (Cockpit + Sommaire) */}
      <aside className={`fixed z-[9995] print:hidden flex flex-col items-end md:items-center gap-3 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none md:translate-y-0 md:opacity-100 md:pointer-events-auto'
      } ${
        isNko ? 'left-4 md:left-8 items-start md:items-center' : 'right-4 md:right-8 items-end md:items-center'
      } bottom-4 md:bottom-auto md:top-1/4 pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]`}>
        
        {/* BOUTON TOGGLE MOBILE (Ancré et Dynamique) */}
        <button 
          onClick={() => { triggerVibration(); setIsExpanded(!isExpanded); setShowToc(false); }}
          className={`md:hidden flex items-center justify-center w-12 h-12 rounded-full backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] border transition-all duration-300 z-50 ${
            isExpanded ? 'bg-[#fbbf24] text-black border-[#fbbf24] rotate-90 scale-95' : 'bg-black/85 text-[#fbbf24] border-white/20 rotate-0 scale-100'
          }`}
          aria-label={isNko ? "ߢߍߥߟߊ ߟߊߞߊ߬" : "Ouvrir le menu"}
        >
          <i className={`ph-bold ${isExpanded ? 'ph-x' : 'ph-dots-three-outline-vertical'} text-2xl`}></i>
        </button>

        <div className={`flex flex-col-reverse md:flex-col gap-4 ${isNko ? 'items-start md:items-center' : 'items-end md:items-center'}`}>
          
          {/* LE PANNEAU DE SOMMAIRE (Radar) */}
         <div className={`overflow-hidden origin-bottom-right md:origin-top-right backdrop-blur-2xl bg-black/85 border border-[#fbbf24]/30 shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-3xl transition-[opacity,transform] duration-300 ease-in-out ${
            showToc ? 'w-[85vw] max-w-sm max-h-[60vh] opacity-100 scale-100 p-5 overflow-y-auto' : 'w-0 max-h-0 opacity-0 scale-75 p-0 pointer-events-none'
          }`}>
            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
              <h4 className={`text-[#fbbf24] font-bold ${isNko ? 'font-kigelia tracking-widest' : 'tracking-wider uppercase text-sm'}`}>
                {isNko ? 'ߞߎߡߘߊ ߢߍߛߓߍ' : 'Sommaire'}
              </h4>
              <button onClick={() => setShowToc(false)} className="text-gray-400 hover:text-white transition-colors" aria-label="Fermer le sommaire">
                <i className="ph-bold ph-x"></i>
              </button>
            </div>
            {headings.length === 0 ? (
              <p className="text-gray-500 text-sm italic text-center py-4">Aucun chapitre</p>
            ) : (
              <ul className="space-y-3 relative before:absolute before:inset-y-0 before:left-1.5 before:w-[2px] before:bg-white/10">
                {headings.map((h, i) => (
                  <li key={i} className="relative z-10 pl-6 cursor-pointer group" onClick={() => scrollToHeading(h.id)}>
                    <div className={`absolute left-0 top-1.5 w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                      activeHeadingId === h.id ? 'bg-[#fbbf24] border-[#fbbf24] shadow-[0_0_10px_#fbbf24]' : 'bg-black border-white/30 group-hover:border-[#fbbf24]'
                    }`}></div>
                    
                    <span className={`block transition-all duration-300 line-clamp-2 leading-tight ${
                      activeHeadingId === h.id ? 'text-[#fbbf24] font-bold' : 'text-gray-400 group-hover:text-white'
                    } ${isNko ? 'font-kigelia text-sm' : 'text-xs'} ${h.level === 'h3' ? 'opacity-80 text-[0.85em]' : ''}`}>
                      {h.text}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

         {/* LE COCKPIT D'OUTILS (Tiroir Horizontal Mobile / Vertical PC) */}
          <div className={`absolute bottom-0 md:relative flex flex-row-reverse md:flex-col items-center gap-1.5 md:gap-4 p-1.5 md:p-3 rounded-full md:rounded-[2rem] bg-black/85 backdrop-blur-2xl border border-white/15 shadow-[0_0_40px_rgba(0,0,0,0.8)] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
            isNko ? 'left-14 md:left-auto origin-left flex-row' : 'right-14 md:right-auto origin-right'
          } ${
            isExpanded ? 'scale-100 opacity-100 translate-x-0' : 'scale-50 opacity-0 pointer-events-none md:scale-100 md:opacity-100 md:pointer-events-auto'
          }`}>
            
            {/* BOUTON BOUSSOLE (SOMMAIRE) */}
            {headings.length > 0 && (
              <button 
                  onClick={() => { triggerVibration(); setShowToc(!showToc); }} 
                  className={`group relative w-10 h-10 rounded-full flex items-center justify-center transition-all touch-manipulation ${showToc ? 'bg-[#fbbf24]/20 text-[#fbbf24]' : 'text-gray-400 hover:text-[#fbbf24] hover:bg-white/5'}`}
                  title={isNko ? "ߢߍߛߓߍ ߦߌ߬ߘߊ߬" : "Afficher le sommaire"}
                  aria-label={isNko ? "ߢߍߛߓߍ ߦߌ߬ߘߊ߬" : "Afficher le sommaire"}
              >
                <i className="ph-bold ph-list-dashes text-xl"></i>
              </button>
            )}

            {/* BOUTON SIGNET */}
            <button 
                onClick={toggleBookmark} 
                className="group relative w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-[#fbbf24] hover:bg-white/5 transition-all touch-manipulation"
                title={isNko ? "ߊ߬ ߟߊߡߙߊ߬" : "Sauvegarder l'article"}
                aria-label={isNko ? "ߊ߬ ߟߊߡߙߊ߬" : "Sauvegarder l'article"}
            >
              <i className={`${isBookmarked ? 'ph-fill text-[#fbbf24] drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'ph-bold text-gray-400'} ph-bookmark-simple text-xl transition-all duration-300`}></i>
            </button>

            {/* BOUTON MODE ZEN */}
            <button 
                onClick={toggleZenMode} 
                className="hidden md:flex group relative w-10 h-10 rounded-full items-center justify-center text-gray-400 hover:text-[#fbbf24] hover:bg-white/5 transition-all"
                title={isNko ? "ߘߊ߬ߣߊ߲߬ߥߟߊ ߟߝߊ" : "Mode Zen (Plein Écran)"}
                aria-label={isNko ? "ߘߊ߬ߣߊ߲߬ߥߟߊ ߟߝߊ" : "Mode Zen (Plein Écran)"}
            >
              <i className={`ph-bold ${isFullscreen ? 'ph-corners-in text-[#fbbf24]' : 'ph-corners-out'} text-xl transition-all duration-300`}></i>
            </button>

            {/* SÉPARATEUR ADAPTATIF */}
            <div className="w-[1px] h-6 md:w-6 md:h-[1px] bg-white/15 mx-0.5 md:mx-auto"></div>

            {/* BOUTON PARTAGER */}
            <button 
                onClick={handleShare} 
                className="group relative w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-[#fbbf24] hover:bg-white/5 transition-all touch-manipulation"
                title={isNko ? "ߞߵߊ߬ ߟߊߖߍ߲ߛߍ߲߫" : "Partager"}
                aria-label={isNko ? "ߞߵߊ߬ ߟߊߖߍ߲ߛߍ߲߫" : "Partager"}
            >
              {copiedLink ? <i className="ph-bold ph-check text-green-400 text-xl"></i> : <i className="ph-bold ph-share-network text-xl"></i>}
            </button>

            {/* BOUTON CITER */}
            <button 
                onClick={handleCite} 
                className="group relative w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-[#fbbf24] hover:bg-white/5 transition-all touch-manipulation"
                title={isNko ? "ߞߎߡߘߊ ߣߌ߲߬ ߞߏߝߐ߫" : "Citer cet article"}
                aria-label={isNko ? "ߞߎߡߘߊ ߣߌ߲߬ ߞߏߝߐ߫" : "Citer cet article"}
            >
              {copiedCite ? <i className="ph-bold ph-check text-green-400 text-xl"></i> : <i className="ph-bold ph-quotes text-xl"></i>}
              {copiedCite && (
                <span className={`absolute bottom-full mb-3 md:bottom-auto md:mb-0 md:right-14 bg-green-500 text-black text-xs font-bold px-2 py-1 rounded whitespace-nowrap animate-in fade-in zoom-in shadow-lg ${isNko ? 'font-kigelia' : ''}`}>
                    {isNko ? "ߞߊ߲ߕߏ߲߫ ߘߐߡߌ߬ߣߊ" : "Citation copiée !"}
                </span>
              )}
            </button>

            {/* BOUTON IMPRIMER (Caché sur mobile) */}
            <button 
                onClick={handlePrint} 
                className="hidden md:flex w-10 h-10 rounded-full items-center justify-center text-gray-400 hover:text-[#fbbf24] hover:bg-white/5 transition-all"
                title={isNko ? "ߞߵߊ߬ ߜߌ߬ߙߌ߲߬ߘߌ߬" : "Imprimer"}
                aria-label={isNko ? "ߞߵߊ߬ ߜߌ߬ߙߌ߲߬ߘߌ߬" : "Imprimer"}
            >
              <i className="ph-bold ph-printer text-xl"></i>
            </button>

            {/* SÉPARATEUR ADAPTATIF */}
            <div className="w-[1px] h-6 md:w-6 md:h-[1px] bg-white/15 mx-0.5 md:mx-auto"></div>

            {/* ZOOM + */}
            <button 
                onClick={wrapZoomIn} 
                className="w-10 h-10 rounded-full flex flex-col items-center justify-center text-gray-300 hover:text-[#fbbf24] hover:bg-white/5 transition-all active:scale-90 touch-manipulation"
                title={isNko ? " + ߜߋ߲߭ ߡߊߜߙߍ߬" : "Agrandir le texte"}
                aria-label={isNko ? " + ߜߋ߲߭ ߡߊߜߙߍ߬" : "Agrandir le texte"}
            >
              <span className="text-sm font-bold leading-none mb-[1px]">A</span>
              <i className="ph-bold ph-caret-up text-[10px] text-[#fbbf24]"></i>
            </button>

            {/* ZOOM - */}
            <button 
                onClick={wrapZoomOut} 
                className="w-10 h-10 rounded-full flex flex-col items-center justify-center text-gray-300 hover:text-[#fbbf24] hover:bg-white/5 transition-all active:scale-90 touch-manipulation"
                title={isNko ? " - ߜߋ߲߭ ߡߊ߬ߓߐ߫" : "Réduire le texte"}
                aria-label={isNko ? " - ߜߋ߲߭ ߡߊ߬ߓߐ߫" : "Réduire le texte"}
            >
              <span className="text-xs font-bold leading-none mb-[1px]">A</span>
              <i className="ph-bold ph-caret-down text-[10px] text-gray-500"></i>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}