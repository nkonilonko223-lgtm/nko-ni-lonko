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
import Link from "next/link";
import { useLanguage } from "./LanguageProvider";
import { separerTitre } from "./numero/titre";
import { TEXTES_LEXIQUE } from "./lexique/textes";
import { citationApa, citationBibtex, citationMla, citationRis, type DonneesCitation } from "../lib/citations";
import { isNko as contientDuNko } from "./texte/outils";
import { fabriquerImageCitation } from "./texte/imageCitation";
import messagesNko from "../messages/nko.json";

// Libellé N'Ko « Citer cet article » (repris tel quel du bouton, texte existant)
const CITER = { nko: "ߞߎߡߘߊ ߣߌ߲߬ ߞߏߝߐ߫", fr: "Citer cet article" };
const CITATION_COPIEE = { nko: "ߞߊ߲ߕߏ߲߫ ߘߐߡߌ߬ߣߊ", fr: "Citation copiée !" }; // repris tel quel de l'ancien bouton
// Libellé N'Ko « Signaler une erreur » à demander à la rédaction : vide pour l'instant (français seul)
const SIGNALER = { nko: "", fr: "Signaler une erreur" };
// Libellé N'Ko « Partager en image » à demander à la rédaction : vide pour l'instant (français seul)
const PARTAGER_IMAGE = { nko: "", fr: "Partager en image" };

interface ArticleToolsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  title: string;
  // Pour « Citer » : auteurs, date de publication, numéro de la revue
  citation?: { auteurs: string[]; datePublication: string; numero?: number | null };
  slug?: string; // pour « Signaler une erreur »
}

export default function ArticleTools({ onZoomIn, onZoomOut, title, citation, slug }: ArticleToolsProps) {
  const { lang } = useLanguage();
  const isNko = lang === 'nko';
  
  // États de l'Île Dynamique
  const [isExpanded, setIsExpanded] = useState(false);
  const [showToc, setShowToc] = useState(false);
  const [showCite, setShowCite] = useState(false); // panneau « Citer » (APA, MLA, BibTeX, RIS)
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
              setShowCite(false);
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
  const [formatCopie, setFormatCopie] = useState<string | null>(null);
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
      // Lien direct vers le chapitre dans la barre d'adresse (à copier ou partager), sans recharger
      window.history.replaceState(null, '', `#${id}`);
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

  // A6 — Le passage choisi devient une image (1080 × 1350, N'Ko lié par le navigateur), partagée par le
  // menu du téléphone ou enregistrée ; rien n'est envoyé au site
  const [imageEnCours, setImageEnCours] = useState(false);
  const partagerEnImage = async () => {
    triggerVibration();
    setImageEnCours(true);
    try {
      const { nko, fr } = separerTitre(title);
      const blob = await fabriquerImageCitation({ texte: selection.text, nko: contientDuNko(selection.text), titreNko: nko, titreFr: fr, nomNko: messagesNko.metadata.siteName });
      const fichier = new File([blob], "nko-ni-lonko-citation.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [fichier] })) {
        await navigator.share({ files: [fichier], text: getCanonicalUrl() }).catch(() => undefined);
      } else {
        const lien = document.createElement("a");
        lien.href = URL.createObjectURL(blob);
        lien.download = fichier.name;
        lien.click();
        setTimeout(() => URL.revokeObjectURL(lien.href), 1000);
      }
    } catch (err) {
      console.error("Image du passage impossible", err);
    } finally {
      setImageEnCours(false);
      setSelection((s) => ({ ...s, show: false }));
    }
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
    if (!showToc && !isExpanded && !showCite) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      // 🛡️ Ne ferme pas si on est dans l'aside OU dans un bouton OU dans le panneau TOC
      if (target.closest('aside')) return;
      if (target.closest('button')) return;
      if (target.closest('[class*="rounded-3xl"]')) return;
      setShowToc(false);
      setShowCite(false);
      setIsExpanded(false);
    };

    // 🛡️ Desktop uniquement — on retire touchstart qui cause le bug mobile
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 10);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showToc, isExpanded, showCite]);

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
    // Safari (Mac, iPhone) n'a que les versions préfixées « webkit » : on les décrit (zéro any)
    const docEl = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => void };
    const doc = document as Document & { webkitFullscreenElement?: Element | null; webkitExitFullscreen?: () => void };

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

  // « Citer » ouvre un panneau : APA, MLA, BibTeX (à copier) et RIS (fichier pour Zotero, Mendeley)
  const handleCite = () => {
    triggerVibration();
    setShowToc(false);
    setShowCite((v) => !v);
  };

  const donneesCitation = (): DonneesCitation => {
    const { nko, fr } = separerTitre(title);
    return {
      titreNko: nko, titreFr: fr, auteurs: citation?.auteurs || [],
      datePublication: citation?.datePublication || new Date().toISOString(),
      url: getCanonicalUrl(), numero: citation?.numero ?? null, dateConsultation: new Date(),
    };
  };

  const copierCitation = async (format: string, texte: string) => {
    triggerVibration();
    try {
      await navigator.clipboard.writeText(texte);
      setFormatCopie(format);
      setTimeout(() => setFormatCopie(null), 2000);
    } catch (err) {
      console.error("Erreur copie citation", err);
    }
  };

  const telechargerRis = () => {
    triggerVibration();
    const lien = document.createElement("a");
    lien.href = URL.createObjectURL(new Blob([citationRis(donneesCitation())], { type: "application/x-research-info-systems" }));
    lien.download = `nko-ni-lonko-${window.location.pathname.split("/").pop() || "article"}.ris`;
    lien.click();
    setTimeout(() => URL.revokeObjectURL(lien.href), 1000);
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
              {/* A6 — PARTAGER EN IMAGE */}
              <button
                onClick={partagerEnImage}
                disabled={imageEnCours}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white hover:text-[#fbbf24] transition-colors disabled:opacity-50"
                title={isNko && PARTAGER_IMAGE.nko ? PARTAGER_IMAGE.nko : PARTAGER_IMAGE.fr}
                aria-label={isNko && PARTAGER_IMAGE.nko ? PARTAGER_IMAGE.nko : PARTAGER_IMAGE.fr}
              >
                <i className="ph-bold ph-image text-sm"></i>
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
                  <li key={i} className="relative z-10">
                    {/* Un vrai bouton : utilisable au clavier et au lecteur d'écran */}
                    <button
                      type="button"
                      onClick={() => scrollToHeading(h.id)}
                      aria-current={activeHeadingId === h.id ? "location" : undefined}
                      className="group block w-full pl-6 text-start rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#fbbf24]"
                    >
                      <span aria-hidden="true" className={`absolute left-0 top-1.5 w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                        activeHeadingId === h.id ? 'bg-[#fbbf24] border-[#fbbf24] shadow-[0_0_10px_#fbbf24]' : 'bg-black border-white/30 group-hover:border-[#fbbf24]'
                      }`}></span>
                      <span className={`block transition-all duration-300 line-clamp-2 leading-tight ${
                        activeHeadingId === h.id ? 'text-[#fbbf24] font-bold' : 'text-gray-400 group-hover:text-white'
                      } ${isNko ? 'font-kigelia text-sm' : 'text-xs'} ${h.level === 'h3' ? 'opacity-80 text-[0.85em]' : ''}`}>
                        {h.text}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* LE PANNEAU « CITER » : formats internationaux, titre N'Ko d'abord (app/lib/citations.ts) */}
          {showCite && (
            <div role="dialog" aria-label={isNko ? CITER.nko : CITER.fr} className="w-[85vw] max-w-md max-h-[65vh] overflow-y-auto p-5 backdrop-blur-2xl bg-black/90 border border-[#fbbf24]/30 shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-3xl animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                <h4 lang={isNko ? "nqo" : "fr"} dir={isNko ? "rtl" : "ltr"} className={`text-[#fbbf24] font-bold ${isNko ? "font-kigelia tracking-wide" : "tracking-wider uppercase text-sm"}`}>
                  {isNko ? CITER.nko : CITER.fr}
                </h4>
                <button type="button" onClick={() => setShowCite(false)} className="text-gray-400 hover:text-white transition-colors" aria-label={isNko ? TEXTES_LEXIQUE.fermer.nko : TEXTES_LEXIQUE.fermer.fr}>
                  <i className="ph-bold ph-x" aria-hidden="true"></i>
                </button>
              </div>
              <ul className="space-y-4" dir="ltr">
                {([["APA", citationApa], ["MLA", citationMla], ["BibTeX", citationBibtex]] as const).map(([format, fabriquer]) => {
                  const texte = fabriquer(donneesCitation());
                  return (
                    <li key={format}>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-white/60">{format}</span>
                        <button
                          type="button"
                          onClick={() => copierCitation(format, texte)}
                          className="flex h-8 w-9 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20"
                          aria-label={`${isNko ? CITER.nko : CITER.fr} (${format})`}
                        >
                          <i className={`ph-bold ${formatCopie === format ? "ph-check text-green-400" : "ph-copy"}`} aria-hidden="true"></i>
                        </button>
                      </div>
                      <p className={`select-all break-words rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs leading-relaxed text-gray-300 ${format === "BibTeX" ? "whitespace-pre-wrap font-mono" : ""}`}>{texte}</p>
                    </li>
                  );
                })}
              </ul>
              <button type="button" onClick={telechargerRis} dir="ltr" className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#fbbf24]/40 px-4 py-2.5 text-sm text-[#fbbf24] transition-colors hover:bg-[#fbbf24]/10">
                <i className="ph-bold ph-download-simple" aria-hidden="true"></i>
                Zotero · Mendeley · EndNote (.ris)
              </button>
              <p role="status" className="mt-2 h-5 text-center text-xs text-green-400">
                {formatCopie && (
                  <span lang={isNko ? "nqo" : "fr"} className={isNko ? "font-kigelia" : ""}>{isNko ? CITATION_COPIEE.nko : CITATION_COPIEE.fr}</span>
                )}
              </p>
            </div>
          )}

         {/* LE COCKPIT D'OUTILS (Tiroir Horizontal Mobile / Vertical PC) */}
          <div className={`absolute bottom-0 md:relative flex flex-row-reverse md:flex-col items-center gap-1.5 md:gap-4 p-1.5 md:p-3 rounded-full md:rounded-[2rem] bg-black/85 backdrop-blur-2xl border border-white/15 shadow-[0_0_40px_rgba(0,0,0,0.8)] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
            isNko ? 'left-14 md:left-auto origin-left flex-row' : 'right-14 md:right-auto origin-right'
          } ${
            isExpanded ? 'scale-100 opacity-100 translate-x-0' : 'scale-50 opacity-0 pointer-events-none md:scale-100 md:opacity-100 md:pointer-events-auto'
          }`}>
            
            {/* BOUTON BOUSSOLE (SOMMAIRE) */}
            {headings.length > 0 && (
              <button 
                  onClick={() => { triggerVibration(); setShowCite(false); setShowToc(!showToc); }}
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

            {/* BOUTON CITER : ouvre le panneau des formats */}
            <button 
                onClick={handleCite} 
                className={`group relative w-10 h-10 rounded-full flex items-center justify-center transition-all touch-manipulation ${showCite ? 'bg-[#fbbf24]/20 text-[#fbbf24]' : 'text-gray-400 hover:text-[#fbbf24] hover:bg-white/5'}`}
                title={isNko ? CITER.nko : CITER.fr}
                aria-label={isNko ? CITER.nko : CITER.fr}
                aria-expanded={showCite}
            >
              <i className="ph-bold ph-quotes text-xl"></i>
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

            {/* A7 — SIGNALER UNE ERREUR : formulaire de contact prérempli avec l'adresse de l'article */}
            {slug && (
              <Link
                href={`/contact?article=${encodeURIComponent(slug)}`}
                onClick={triggerVibration}
                className="flex w-10 h-10 rounded-full items-center justify-center text-gray-400 hover:text-[#fbbf24] hover:bg-white/5 transition-all touch-manipulation"
                title={isNko && SIGNALER.nko ? SIGNALER.nko : SIGNALER.fr}
                aria-label={isNko && SIGNALER.nko ? SIGNALER.nko : SIGNALER.fr}
              >
                <i className="ph-bold ph-warning-circle text-xl" aria-hidden="true"></i>
              </Link>
            )}

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