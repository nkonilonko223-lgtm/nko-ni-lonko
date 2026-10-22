"use client";

/**
 * ==============================================================================
 * 📂 FICHIER : app/components/ArticleClient.tsx
 * ------------------------------------------------------------------------------
 * 🎯 RÔLE : Chef d'Orchestre de l'interface de lecture (Client Component).
 * ⚡ PERFORMANCE : Scroll optimisé à 60 FPS via requestAnimationFrame.
 * 📳 SENSORIEL : Retour haptique natif, Lightbox de couverture.
 * 🖨️ IMPRESSION 1/1000 : Sceau officiel, Logo caché, Format "Revue Scientifique".
 * ==============================================================================
 */

import { useState, useEffect, useCallback, type ReactNode } from "react";
import { useLanguage } from "./LanguageProvider";
import Image from "next/image";
import Link from "next/link";
import ArticleTools from "./ArticleTools"; 
import ArticleFooter from "./ArticleFooter"; 
import { PortableTextBlock } from "@portabletext/types";
import { CLE_LANGUE_LECTURE, formatDateNko, toNkoDigits } from "./texte/outils";
import LexiqueArticle from "./lexique/LexiqueArticle";
import { TEXTES_LEXIQUE } from "./lexique/textes";
import { CATEGORY_REVERSE_MAP } from "./ArticleCard";
import { contientNko, sensDe, separerLangues, separerTitre, texteDePartage } from "./numero/titre";
import type { TermeLexiqueData } from "./lexique/TermeLexique";
import { positionDuCadrage } from "../lib/point-interet";
import { adresse, langueAdresse } from "../lib/langue";
import messagesNko from "../messages/nko.json"; // « Accueil » en N'Ko (nom du lien flèche, lecteurs d'écran)

// ==============================================================================
// 1. TYPAGE STRICT (Zéro Any - Dogme 2)
// ==============================================================================

interface SocialLink {
  _key: string;
  platform: string;
  url: string;
}

interface SanityImage {
  asset: {
    _ref: string;
  };
  alt?: string;
  captionNko?: string; // légende N'Ko de la couverture (rédaction)
  caption?: string;
  source?: string; // crédit de la couverture (ex. NASA/SDO)
  hotspot?: { x?: number; y?: number }; // point d'intérêt du Studio (cadrage)
  sourceNko?: string; // crédit en N'Ko (rédaction), affiché avant le français
}

interface ClientArticleData {
  title: string;
  slug: string;
  mainImageUrl: string | null; 
  mainImageRaw: SanityImage | null; 
  publishedAt: string;
 excerpt: string;
  category: string;
  readingTime: number;
  references: Array<{ title: string; url: string }>;
  lexique?: TermeLexiqueData[]; // termes du lexique utilisés dans l'article
  numeroRevue?: number | null; // numéro de la revue (pour « Citer »)
  deuxLangues?: boolean; // le texte contient du N'Ko ET du français (choix de la langue de lecture)
  authors: Array<{
    name: string;
    nameNko: string | null;
    imageUrl: string | null;
    bio: PortableTextBlock[] | string | null;    // 🚀 FIX : Accepte le texte simple
    bioNko: PortableTextBlock[] | string | null; // 🚀 NOUVEAU : Réception de la Bio N'Ko
    role: string | null; 
    roleNko: string | null;                      // 🚀 NOUVEAU : Réception du Rôle N'Ko
    institution: string | null;
    orcid: string | null;
    expertise: string[];
    socials: SocialLink[];
    slug?: string | null; // page /auteurs/<slug>
  }>;
}

// Réglages gardés sur l'appareil du lecteur (A2, A5). Libellé N'Ko « Reprendre la lecture » à
// demander à la rédaction : vide pour l'instant (le français s'affiche seul)
const CLE_TAILLE = "nko_taille_texte";
const REPRENDRE = { nko: "", fr: "Reprendre la lecture" };
// A4 — Langue de lecture. Le nom « N'Ko » en N'Ko est repris tel quel du bouton de langue (texte existant)
const NOM_NKO = "ߒߞߏ";
type ModeLecture = "deux" | "nko" | "fr";
const MODES_LECTURE: { id: ModeLecture; libelle: string; lang: string }[] = [
  { id: "deux", libelle: `${NOM_NKO} + FR`, lang: "nqo" },
  { id: "nko", libelle: NOM_NKO, lang: "nqo" },
  { id: "fr", libelle: "FR", lang: "fr" },
];
const LANGUE_LECTURE = { nko: "", fr: "Langue de lecture" }; // libellé N'Ko à demander à la rédaction

// 🚀 ARME ANTI-CRASH : Typage strict pour les catégories traduites
interface TranslationHome {
  categories?: Record<string, string>;
}
// ==============================================================================
// 2. COMPOSANT PRINCIPAL
// ==============================================================================

// Emplacements remplis par la page (composants serveur) : numéro, rubrique, précédent / suivant,
// et le texte de l'article (CustomPortableText, préparé par le serveur)
interface Emplacements {
  bandeau?: ReactNode;
  surtitre?: ReactNode;
  navigation?: ReactNode;
  texte?: ReactNode;
}

export default function ArticleClient({ article, bandeau, surtitre, navigation, texte }: { article: ClientArticleData } & Emplacements) {
  const { lang, toggleLanguage, t, lien } = useLanguage(); 
  // 🚀 RADAR 2 : Vérifie si la page Client a bien reçu la donnée
  const [fontScale, setFontScale] = useState(1.125); 
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [coverLightbox, setCoverLightbox] = useState(false); 

  const triggerVibration = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50); 
    }
  }, []);

  const handleZoomIn = useCallback(() => {
    triggerVibration();
    setFontScale(prev => Math.min(prev + 0.125, 2.0));
  }, [triggerVibration]); 

  const handleZoomOut = useCallback(() => {
    triggerVibration();
    setFontScale(prev => Math.max(prev - 0.125, 0.875));
  }, [triggerVibration]); 

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const totalScroll = document.documentElement.scrollTop;
          const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
          const scroll = windowHeight > 0 ? totalScroll / windowHeight : 0;
          
          setScrollProgress(Math.min(Math.max(Number(scroll), 0), 1));
          setIsScrolled(window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // A2 — Taille du texte mémorisée d'un article à l'autre (sur cet appareil seulement)
  const [tailleChargee, setTailleChargee] = useState(false);
  useEffect(() => {
    const minuteur = setTimeout(() => {
      try {
        const v = Number(localStorage.getItem(CLE_TAILLE));
        if (v >= 0.875 && v <= 2) setFontScale(v);
      } catch { /* stockage indisponible (navigation privée) */ }
      setTailleChargee(true);
    }, 0);
    return () => clearTimeout(minuteur);
  }, []);
  useEffect(() => {
    if (!tailleChargee) return;
    try { localStorage.setItem(CLE_TAILLE, String(fontScale)); } catch { /* stockage indisponible */ }
  }, [fontScale, tailleChargee]);

  // A5 — Reprendre ma lecture : le PARAGRAPHE en haut de l'écran est gardé quand le lecteur quitte
  // la page (exact, même si la hauteur de la page change avec les images) ; à son retour, un bouton
  // (jamais un défilement imposé) propose de reprendre au même endroit
  const cleLecture = `nko_lecture:${article.slug}`;
  const [reprise, setReprise] = useState<number | null>(null);
  useEffect(() => {
    const blocs = () => Array.from(document.querySelectorAll<HTMLElement>("article.article-content .apparition"));
    const minuteur = setTimeout(() => {
      try {
        const i = Number(localStorage.getItem(cleLecture));
        if (Number.isInteger(i) && i >= 2 && i < blocs().length - 2) setReprise(i);
      } catch { /* stockage indisponible */ }
    }, 0);
    const garder = () => {
      const liste = blocs();
      const i = liste.findIndex((b) => b.getBoundingClientRect().bottom > 120); // premier bloc sous la barre du haut
      try {
        if (i < 0 || i >= liste.length - 2) localStorage.removeItem(cleLecture); // article terminé
        else if (i >= 2) localStorage.setItem(cleLecture, String(i));
      } catch { /* stockage indisponible */ }
    };
    const siCachee = () => { if (document.visibilityState === 'hidden') garder(); };
    window.addEventListener('pagehide', garder);
    document.addEventListener('visibilitychange', siCachee);
    return () => {
      clearTimeout(minuteur);
      window.removeEventListener('pagehide', garder);
      document.removeEventListener('visibilitychange', siCachee);
    };
  }, [cleLecture]);
  useEffect(() => {
    if (reprise === null) return;
    const minuteur = setTimeout(() => setReprise(null), 12000); // le bouton disparaît seul
    return () => clearTimeout(minuteur);
  }, [reprise]);
  // A4 — Langue de lecture : le choix vit sur <html data-lecture> (posé avant l'affichage par le
  // petit script ci-dessous) ; l'état React ne sert qu'à marquer le bouton choisi
  const [modeLecture, setModeLecture] = useState<ModeLecture>("deux");
  useEffect(() => {
    if (!article.deuxLangues) return;
    const minuteur = setTimeout(() => {
      let m = document.documentElement.getAttribute("data-lecture");
      if (!m) {
        // Arrivée par un lien interne (le petit script ne s'exécute qu'au premier chargement)
        try { m = localStorage.getItem(CLE_LANGUE_LECTURE); } catch { m = null; }
        if (m === "nko" || m === "fr") document.documentElement.setAttribute("data-lecture", m);
      }
      if (m === "nko" || m === "fr") setModeLecture(m);
    }, 0);
    return () => clearTimeout(minuteur);
  }, [article.deuxLangues]);
  const choisirModeLecture = (m: ModeLecture) => {
    triggerVibration();
    setModeLecture(m);
    if (m === "deux") document.documentElement.removeAttribute("data-lecture");
    else document.documentElement.setAttribute("data-lecture", m);
    try { localStorage.setItem(CLE_LANGUE_LECTURE, m); } catch { /* stockage indisponible */ }
  };

  const reprendreLecture = () => {
    if (reprise === null) return;
    triggerVibration();
    const bloc = document.querySelectorAll<HTMLElement>("article.article-content .apparition")[reprise];
    if (bloc) window.scrollTo({ top: bloc.getBoundingClientRect().top + window.scrollY - 110, behavior: 'smooth' });
    setReprise(null);
  };

  const handleShare = async () => {
    triggerVibration();
    if (navigator.share) {
      try {
        // Une ligne par langue, jamais les deux sens d'écriture sur une ligne (sinon WhatsApp
        // mélange les mots) ; le lien, ajouté par le téléphone, va sur sa propre ligne
        await navigator.share({
          title: separerLangues(article.title).nko ?? article.title,
          text: texteDePartage(article.title),
          url: window.location.href,
        });
      } catch (error) {
        console.error('Erreur partage:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleToggleLanguage = () => {
    triggerVibration();
    toggleLanguage();
  };

  const dateDisplay = lang === 'nko' 
    ? formatDateNko(article.publishedAt) 
    : new Date(article.publishedAt).toLocaleDateString("fr-FR");
  
  const captionText = lang === 'nko' 
    ? "ߖߌ߬ߦߊ߬ߓߍ ߣߌ߲߬ ߦߋ߫ ߞߎߡߘߊ ߢߍߛߓߍ ߟߋ߬ ߘߌ߫" 
    : "Image d'illustration de l'article";

  // Titre « N'Ko (français) » : même séparation que les cartes et les numéros (parenthèse
  // FINALE contenant du latin), le français sans parenthèses. Tailles identiques dans les deux
  // modes (N'Ko en grand) : le serveur dessine en N'Ko, une inversion ferait sauter la page.
  const titre = separerTitre(article.title);
  const nkoTitle = titre.nko;
  const frTitle = titre.fr ?? "";

  const readingTime = article.readingTime;
  const readingTimeText = lang === 'nko' 
   ? `${t.article.minutes} ${toNkoDigits(readingTime)}` 
    : `${readingTime} min de lecture`;

  // 🚀 SÉCURITÉ ABSOLUE : Zéro "any"
  const tHome = t.home as TranslationHome;
  const categoriesMap = tHome?.categories || {};
  // La catégorie arrive en N'Ko brut depuis Sanity : on la convertit en clé (ex. « astronomy »),
  // comme les cartes de l'accueil, puis on prend le mot du dictionnaire de la langue active
  const categoryKey = article.category ? (CATEGORY_REVERSE_MAP[article.category.trim()] || article.category.toLowerCase()) : "";
  const categoryLabel = article.category ? (categoriesMap[categoryKey] || article.category) : (lang === 'nko' ? 'ߟߐ߲ߞߏ' : 'Science');

  return (
    <main className="min-h-screen relative text-white selection:bg-[#fbbf24] selection:text-black print:bg-white print:text-black">
      
      {/* 🖨️ LE SECRET 1/1000 : Contrôle absolu des marges de l'imprimante et encres forcées */}
     <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: auto; margin: 2cm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          
          /* 🖨️ FIX IMAGE COUVERTURE : Force l'affichage de l'image fill */
          .print-cover-wrapper {
            position: relative !important;
            height: 400px !important;
            width: 100% !important;
            overflow: hidden !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          .print-cover-wrapper img {
            position: absolute !important;
            inset: 0 !important;
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
          }
        }
      `}} />

      {/* 🖨️ ARME 2 : LE SCEAU SCIENTIFIQUE (Visible UNIQUEMENT à l'impression) */}
      <div className="hidden print:flex items-center justify-between border-b-2 border-black pb-4 mb-8 pt-4 px-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 relative grayscale contrast-200">
            <Image src="/icon-512x512.png" alt="Logo" fill className="object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="font-kigelia text-2xl font-bold text-black tracking-widest">ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ</span>
            <span className="font-sans text-xs text-gray-500 uppercase tracking-widest">N&apos;Ko ni Lonko - Revue Scientifique</span>
          </div>
        </div>
        <div className="text-right">
          {/* 🚀 BOUCLIER HYDRATATION */}
          <p suppressHydrationWarning className="font-mono text-xs text-gray-500">{new Date().toLocaleDateString('fr-FR')}</p>
          <p className="font-mono text-[10px] text-gray-400">nkonilonko.com</p>
        </div>
      </div>

      {/* TOAST DE NOTIFICATION */}
      <div className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-[9999] transition-all duration-500 ease-out print:hidden ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
        <div className="bg-black/80 backdrop-blur-xl border border-[#fbbf24]/50 text-[#fbbf24] px-6 py-3 rounded-full shadow-[0_10px_40px_rgba(251,191,36,0.2)] flex items-center gap-3">
          <i className="ph-fill ph-check-circle text-xl"></i>
          <span className={`text-sm font-bold ${lang === 'nko' ? 'font-kigelia' : ''}`}>
            {lang === 'nko' ? 'ߛߘߌ߬ߜߋ߲ ߓߘߊ߫ ߓߌ߬ߟߊ߬ ߟߊ߬ߡߙߊ߬ߟߌ ߘߐ߫' : 'Lien copié dans le presse-papiers'}
          </span>
        </div>
      </div>

      {/* A5 — REPRENDRE MA LECTURE (proposé, jamais imposé ; disparaît seul) */}
      {reprise !== null && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[9999] print:hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-1 rounded-full border border-[#fbbf24]/50 bg-black/85 p-1 shadow-[0_10px_40px_rgba(251,191,36,0.2)] backdrop-blur-xl">
            <button type="button" onClick={reprendreLecture} className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-[#fbbf24] transition-colors hover:bg-[#fbbf24]/10">
              <i className="ph-fill ph-play" aria-hidden="true"></i>
              {lang === 'nko' && REPRENDRE.nko
                ? <span lang="nqo" dir="rtl" className="font-kigelia">{REPRENDRE.nko}</span>
                : <span lang="fr" dir="ltr" className="font-fr">{REPRENDRE.fr}</span>}
            </button>
            <button
              type="button"
              onClick={() => setReprise(null)}
              aria-label={lang === 'nko' ? TEXTES_LEXIQUE.fermer.nko : TEXTES_LEXIQUE.fermer.fr}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/50 transition-colors hover:text-white"
            >
              <i className="ph-bold ph-x" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      )}

      <div className="fixed top-0 left-0 h-1 bg-[#fbbf24] z-[1001] transition-transform duration-75 ease-out shadow-[0_0_10px_#fbbf24] origin-left print:hidden"
           style={{ transform: `scaleX(${scrollProgress})`, width: '100%' }}>
      </div>

      <div className="fixed inset-0 z-[-1] print:hidden">
         <div className="absolute inset-0 bg-[#02040a]"></div> 
         <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-[#02040a] to-[#02040a]"></div>
      </div>

      <div className="print:hidden">
        <ArticleTools
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          title={article.title}
          citation={{ auteurs: article.authors.map((a) => a.name), datePublication: article.publishedAt, numero: article.numeroRevue }}
          slug={article.slug}
        />
      </div>

      <nav className={`fixed top-0 left-0 w-full z-50 px-4 md:px-6 transition-all duration-300 flex justify-between items-center print:hidden ${
          isScrolled 
          ? "bg-[#02040a]/95 backdrop-blur-md border-b border-white/10 py-3 md:py-4 shadow-xl" 
          : "bg-gradient-to-b from-black/90 to-transparent py-4 md:py-6"
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-1 md:gap-4 text-[#fbbf24] font-bold font-mono tracking-widest text-sm">
            <div className="flex items-center gap-2">
              <i className="ph-fill ph-calendar-blank text-lg"></i>
              {/* 🚀 BOUCLIER HYDRATATION */}
              <span suppressHydrationWarning className={lang === 'nko' ? 'font-kigelia' : ''}>{dateDisplay}</span>
            </div>
            
            <div className="hidden md:flex items-center gap-2 text-gray-400 text-xs">
              <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
              <i className="ph-bold ph-clock"></i>
              <span className={lang === 'nko' ? 'font-kigelia' : ''}>{readingTimeText}</span>
            </div>

            {categoryLabel && (
              <div className="hidden md:flex items-center gap-2 text-[#fbbf24]/80 text-xs border border-[#fbbf24]/30 px-2 py-0.5 rounded-full uppercase">
                 <span className={lang === 'nko' ? 'font-kigelia' : ''}>{categoryLabel}</span>
              </div>
            )}
        </div>

        <div className="flex items-center gap-3 md:gap-4">
            <button onClick={handleShare} className="w-10 h-10 md:w-11 md:h-11 rounded-full border border-gray-600 flex items-center justify-center hover:bg-[#fbbf24] hover:text-black hover:border-[#fbbf24] transition-all backdrop-blur-md active:scale-95 touch-manipulation" title={lang === 'nko' ? 'ߊ߬ ߟߊߖߍ߲ߛߍ߲߫' : 'Partager'}>
                <i className="ph-bold ph-share-network text-xl md:text-lg"></i>
            </button>
            <button onClick={handleToggleLanguage} className="border border-gray-600 px-4 py-2 md:px-5 md:py-2.5 rounded-full text-xs md:text-sm font-bold uppercase hover:bg-[#fbbf24] hover:text-black transition-all flex items-center gap-2 backdrop-blur-md active:scale-95 touch-manipulation">
                <i className="ph-bold ph-translate text-lg"></i>
                <span>{lang === 'nko' ? 'FR' : 'ߒߞߏ'}</span>
            </button>
            <Link href={lien("/")} aria-label={lang === 'nko' ? messagesNko.nav.home : 'Accueil'} className="group flex items-center gap-3 text-gray-400 hover:text-white transition-all ml-2 md:ml-4">
                <div className="w-10 h-10 md:w-11 md:h-11 rounded-full border border-gray-600 flex items-center justify-center group-hover:border-[#fbbf24] group-hover:bg-[#fbbf24] group-hover:text-black transition-all active:scale-95 touch-manipulation">
                    <i className={`ph-bold ${lang === 'nko' ? 'ph-arrow-right' : 'ph-arrow-left'} text-xl md:text-lg`}></i>
                </div>
            </Link>
        </div>
      </nav>

      <header className="pt-24 md:pt-32 print:pt-0 pb-0 px-4 md:px-8 max-w-7xl mx-auto text-center">
        {bandeau}
        <span className={`text-[#fbbf24] print:text-gray-600 uppercase tracking-[0.3em] font-bold mb-4 md:mb-6 block ${lang === 'nko' ? 'text-xl font-kigelia' : 'text-xs md:text-sm'}`}>
            {categoryLabel}
        </span>
        {surtitre}
        <h1 className="text-3xl md:text-5xl font-extrabold mb-8 md:mb-12 text-gray-200 print:text-black">
            <span {...sensDe(nkoTitle)} className={`block !leading-[1.6] text-[#fbbf24] print:text-black mb-2 text-balance ${contientNko(nkoTitle) ? 'font-kigelia' : ''}`}>
                {nkoTitle}
            </span>
            {frTitle && (
                <span lang="fr" dir="ltr" className="block leading-tight text-white/90 print:text-gray-800 text-xl md:text-3xl text-balance">
                    {frTitle}
                </span>
            )}
        </h1>
        
        <div className="hidden print:flex justify-center items-center gap-4 text-gray-600 text-sm mb-6 font-mono border-b border-gray-300 pb-4">
            <span suppressHydrationWarning className={lang === 'nko' ? 'font-kigelia' : ''}>{dateDisplay}</span>
            <span>•</span>
            <span className={lang === 'nko' ? 'font-kigelia' : ''}>{readingTimeText}</span>
        </div>

        <div className="md:hidden flex justify-center items-center gap-2 text-gray-400 text-xs mb-6 font-mono print:hidden">
             <i className="ph-bold ph-clock text-[#fbbf24]"></i>
             <span className={lang === 'nko' ? 'font-kigelia' : ''}>{readingTimeText}</span>
        </div>
        
        {article.mainImageUrl && (
          <div 
            className="print-cover-wrapper relative w-full aspect-video rounded-xl md:rounded-[2rem] overflow-hidden border border-white/10 print:border-none shadow-2xl shadow-[#fbbf24]/10 z-10 print:shadow-none cursor-zoom-in group"
            onClick={() => setCoverLightbox(true)}
          >
            <Image
              src={article.mainImageUrl}
              alt={article.mainImageRaw?.alt?.trim() || article.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105 print:scale-100"
              style={{ objectPosition: positionDuCadrage(article.mainImageRaw?.hotspot) }}
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center print:hidden">
              <i className="ph-bold ph-arrows-out text-white text-5xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-xl"></i>
            </div>
          </div>
        )}
        {/* Crédit de la couverture, en petit : N'Ko d'abord (si la rédaction l'a fourni), puis français */}
        {article.mainImageUrl && (article.mainImageRaw?.sourceNko || article.mainImageRaw?.source) && (
          <p dir="rtl" className="mt-2 flex flex-wrap items-baseline justify-start gap-x-2 text-[10px] md:text-xs text-gray-400 print:text-gray-600">
            {article.mainImageRaw.sourceNko && <span lang="nqo" className="font-kigelia text-xs md:text-sm">{article.mainImageRaw.sourceNko}</span>}
            {article.mainImageRaw.source && <span lang="fr" dir="ltr" translate="no">{article.mainImageRaw.source}</span>}
          </p>
        )}
      </header>

      <div className="relative z-0 text-center mt-4 md:mt-6 mb-10 md:mb-16 flex justify-center print:mb-8">
        {/* Légendes de la couverture (rédaction) : N'Ko puis français, comme sous les images du
            texte. Sans légende : l'étiquette générale « Image d'illustration de l'article ». */}
        {article.mainImageUrl && (article.mainImageRaw?.captionNko || article.mainImageRaw?.caption) ? (
          <div className="max-w-3xl w-full px-4 flex flex-col gap-3">
            {article.mainImageRaw.captionNko && (
              <p dir="rtl" lang="nqo" className="leading-relaxed text-[#fbbf24] print:text-black font-kigelia text-[15px] md:text-[16px]">
                {article.mainImageRaw.captionNko}
              </p>
            )}
            {article.mainImageRaw.captionNko && article.mainImageRaw.caption && (
              <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#fbbf24]/50 to-transparent mx-auto my-1 rounded-full print:hidden"></div>
            )}
            {article.mainImageRaw.caption && (
              <p dir="ltr" lang="fr" className="leading-relaxed text-white/70 print:text-gray-700 font-sans text-[13px] md:text-[14px] italic">
                {article.mainImageRaw.caption}
              </p>
            )}
          </div>
        ) : (
         <span className={`inline-block bg-black/40 print:bg-transparent backdrop-blur-md border border-white/10 print:border-none px-4 py-1.5 md:px-6 md:py-2 rounded-full text-[10px] md:text-xs text-gray-400 print:text-gray-600 italic shadow-[0_0_20px_rgba(251,191,36,0.1)] print:shadow-none ${lang === 'nko' ? 'font-kigelia' : ''}`}>
            {captionText}
         </span>
        )}
      </div>

      {/* A4 — LANGUE DE LECTURE : N'Ko d'abord (de droite à gauche), les deux langues par défaut.
          23 octobre 2026 : trop discret (contour presque invisible, 36 px de haut, rien n'expliquait
          son rôle) → un seul bloc avec son nom au-dessus, contour net, cibles de 44 px. Nom N'Ko à
          demander à la rédaction : le français s'affiche en attendant. */}
      {article.deuxLangues && (
        <div className="mx-auto mb-6 md:mb-8 flex max-w-3xl flex-col items-center gap-2.5 px-4 print:hidden">
          <p id="langue-lecture" className="flex items-center gap-2 text-white/70">
            <i className="ph-bold ph-translate text-lg text-[#fbbf24]" aria-hidden="true"></i>
            {/* Version N'Ko sans texte N'Ko de la rédaction : l'icône seule (pas de français affiché),
                le nom reste lu par les lecteurs d'écran */}
            {lang === 'nko' && LANGUE_LECTURE.nko
              ? <span lang="nqo" dir="rtl" className="font-kigelia text-base">{LANGUE_LECTURE.nko}</span>
              : <span lang="fr" dir="ltr" className={`font-fr text-xs font-semibold uppercase tracking-[0.2em] ${lang === 'nko' ? 'sr-only' : ''}`}>{LANGUE_LECTURE.fr}</span>}
          </p>
          <div
            role="radiogroup"
            aria-labelledby="langue-lecture"
            dir="rtl"
            className="inline-flex gap-1 rounded-full border border-white/40 bg-white/[0.06] p-1 shadow-[0_0_30px_rgba(251,191,36,0.08)]"
          >
            {MODES_LECTURE.map((m) => (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={modeLecture === m.id}
                onClick={() => choisirModeLecture(m.id)}
                className={`min-h-[2.75rem] rounded-full px-4 md:px-5 text-[15px] transition-colors touch-manipulation focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fbbf24] ${modeLecture === m.id ? 'bg-[#fbbf24] font-bold text-black shadow-[0_2px_12px_rgba(251,191,36,0.35)]' : 'text-white/90 hover:bg-white/10 hover:text-white'}`}
              >
                <bdi lang={m.lang} className={m.lang === 'nqo' ? 'font-kigelia text-base' : 'font-fr'}>{m.libelle}</bdi>
              </button>
            ))}
          </div>
        </div>
      )}

      <article
        /* 🚀 L'ARME SECRÈTE (flow-root) : Restaure la cage BFC pour maintenir la lettrine en or parfaitement à sa place ! */
        className="article-content flow-root pb-12 md:pb-20 max-w-3xl mx-auto px-4 md:px-6 transition-all duration-300 print:pb-0"
        style={{ fontSize: `${fontScale}rem` }}
        data-deux-langues={article.deuxLangues ? "" : undefined}
      >
        {texte}
      </article>

      {/* 📖 Lexique de fin d'article (seulement si l'article utilise des termes) */}
      <LexiqueArticle termes={article.lexique || []} />

      {navigation}

{/* 🖨️ PIED DE PAGE D'IMPRESSION INVISIBLE SUR ÉCRAN */}
      <div className="hidden print:block max-w-3xl mx-auto border-t-2 border-black pt-4 mt-8 text-center px-4">
        <p className="text-sm font-bold text-black font-kigelia mb-1">ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ - N&apos;Ko ni Lonko</p>
        {/* Adresse exacte de la version lue (N'Ko sans préfixe, français en /fr) */}
        <p lang="fr" dir="ltr" className="text-xs text-gray-600 italic">Document imprimé depuis le site officiel : {adresse(langueAdresse(lang), `/article/${article.slug}`)}</p>
        {/* 🚀 SÉCURITÉ : Ciblage du 1er auteur pour le Copyright */}
        <p suppressHydrationWarning lang="fr" dir="ltr" className="text-[10px] text-gray-500 mt-2">© {new Date().getFullYear()} {article.authors?.[0]?.name || 'Moustapha CAMARA'}. Tous droits réservés.</p>
      </div>
<div className="print:hidden">
        {/* 🚀 SÉCURITÉ 1/1000 : Transmission intégrale du Dossier Académique ET DES references */}
        <ArticleFooter 
            lang={lang} 
           author={article.authors && article.authors.length > 0 ? {
                name: article.authors[0].name,
                nameNko: article.authors[0].nameNko,
                image: article.authors[0].imageUrl,
                bio: article.authors[0].bio,
                bioNko: article.authors[0].bioNko, // 🚀 NOUVEAU : Branchement de la Bio N'Ko
                role: article.authors[0].role || undefined,
                roleNko: article.authors[0].roleNko || undefined, // 🚀 NOUVEAU : Branchement du Rôle N'Ko
                institution: article.authors[0].institution,
                orcid: article.authors[0].orcid,
                expertise: article.authors[0].expertise,
                socials: article.authors[0].socials,
                slug: article.authors[0].slug
            } : undefined}
            tags={categoryLabel ? [categoryLabel] : []}
            relatedArticles={[]} 
            references={article.references} // 🚀 LE TUYAU EST CONNECTÉ ! Les references vont s'afficher.
        />
      </div>
{/* 🚀 1/1000 : LE SCEAU DE FIN DE LECTURE */}
      <footer className="border-t border-white/5 print:hidden py-16 md:py-24 text-center bg-gradient-to-b from-[#02040a] to-black backdrop-blur-3xl mt-12 relative overflow-hidden flex flex-col items-center">
        {/* 🌌 Lueur abyssale arrière */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#fbbf24]/5 blur-[100px] rounded-full pointer-events-none"></div>

       {/* 🛡️ LE SCEAU HOLOGRAPHIQUE (Navigation Intuitive & Poids Optimisé) */}
        <Link 
            href={lien("/")}
            onClick={triggerVibration}
            className="w-24 h-24 md:w-28 md:h-28 mb-8 relative group flex items-center justify-center p-5 backdrop-blur-2xl bg-[#0b0f19]/80 border border-white/10 rounded-[2rem] shadow-[inset_0_0_30px_rgba(251,191,36,0.03)] overflow-hidden transition-all duration-700 hover:border-[#fbbf24]/50 hover:shadow-[0_20px_60px_-10px_rgba(251,191,36,0.25)] hover:-translate-y-2 z-10 touch-manipulation"
            title={lang === 'nko' ? 'ߞߐߛߊߦߌ߫ ߢߍߝߍ߬' : 'Retour à l\'accueil'}
        >
            {/* Reflet dynamique au survol */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#fbbf24]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            
            <Image 
                src="/icon-512x512.png" 
                alt="Sceau N'Ko ni Lonko" 
                width={512}
                height={512}
                quality={90} // 🚀 OPTIMISATION : Qualité visuelle parfaite mais fichier allégé pour les forfaits mobiles
                className="w-full h-full object-contain relative z-10 drop-shadow-2xl transition-transform duration-700 group-hover:scale-110"
            />
        </Link>

        {/* ➖ Ligne d'ancrage */}
        <div className="w-12 h-[2px] bg-gradient-to-r from-transparent via-[#fbbf24]/30 to-transparent mb-6"></div>

        {/* 📜 LE COPYRIGHT IMPÉRIAL (Alignement & Typographie Parfaits) */}
        <p 
          className={`text-[#fbbf24]/70 hover:text-[#fbbf24] transition-colors duration-300 relative z-10 drop-shadow-sm px-4 ${
            lang === 'nko' 
            ? 'font-kigelia text-sm md:text-base tracking-wide' 
            : 'font-mono text-xs md:text-sm tracking-widest uppercase'
          }`}
          dir={lang === 'nko' ? 'rtl' : 'ltr'}
        >
          {t.footer.copyright.replace("{year}", lang === 'nko' ? "߂߀߂߆" : "2026")}
        </p>
      </footer>

      {coverLightbox && article.mainImageUrl && (
        <div 
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl transition-all duration-300 p-4 md:p-8 print:hidden"
          onClick={() => setCoverLightbox(false)}
        >
          <button 
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-[#fbbf24] text-white hover:text-black flex items-center justify-center transition-all cursor-pointer z-50 backdrop-blur-md border border-white/20 hover:border-[#fbbf24]"
            onClick={(e) => { e.stopPropagation(); setCoverLightbox(false); }}
          >
            <i className="ph-bold ph-x text-2xl"></i>
          </button>
          <div className="relative w-full max-w-7xl h-full max-h-[85vh] rounded-lg overflow-hidden flex items-center justify-center">
            <Image 
              src={article.mainImageUrl} 
              alt={article.mainImageRaw?.alt?.trim() || article.title} 
              fill
              className="object-contain drop-shadow-[0_0_50px_rgba(251,191,36,0.15)]"
              sizes="100vw"
            />
          </div>
        </div>
      )}

    </main>
  );
}