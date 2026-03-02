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

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "./LanguageProvider";
import Image from "next/image";
import Link from "next/link";
import ArticleTools from "./ArticleTools"; 
import ArticleFooter from "./ArticleFooter"; 
import { PortableTextBlock } from "@portabletext/types";
import CustomPortableText, { estimateReadingTime, formatDateNko, toNkoDigits } from "./CustomPortableText";

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
  caption?: string;
}

interface ClientArticleData {
  title: string;
  slug: string;
  mainImageUrl: string | null; 
  mainImageRaw: SanityImage | null; 
  publishedAt: string;
  body: PortableTextBlock[];
  excerpt: string;
  category: string;
  // 🚀 SYNCHRONISATION 1/1000 : Le tableau d'auteurs et le profil académique
  authors: Array<{
    name: string;
    nameNko: string | null;
    imageUrl: string | null;
    bio: PortableTextBlock[] | null;
    role: string;
    institution: string | null;
    orcid: string | null;
    expertise: string[];
    socials: SocialLink[];
  }>;
}

// 🚀 ARME ANTI-CRASH : Typage strict pour les catégories traduites
interface TranslationHome {
  categories?: Record<string, string>;
}
// ==============================================================================
// 2. COMPOSANT PRINCIPAL
// ==============================================================================

export default function ArticleClient({ article }: { article: ClientArticleData }) {
  const { lang, toggleLanguage, t } = useLanguage(); 
  
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

  const handleShare = async () => {
    triggerVibration();
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt || "Découvrez cet article scientifique.",
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

  const parts = article.title.split('(');
  const nkoTitle = parts[0].trim(); 
  const frTitle = parts.length > 1 ? `(${parts[1]}` : "";

  const readingTime = estimateReadingTime(article.body);
  const readingTimeText = lang === 'nko' 
    ? `${toNkoDigits(readingTime)} ${t.article.minutes}` 
    : `${readingTime} min de lecture`;

  // 🚀 SÉCURITÉ ABSOLUE : Zéro "any"
  const tHome = t.home as TranslationHome;
  const categoriesMap = tHome?.categories || {};
  const categoryLabel = article.category ? categoriesMap[article.category] : (lang === 'nko' ? 'ߟߐ߲ߞߏ' : 'Science');

  return (
    <main className="min-h-screen relative text-white selection:bg-[#fbbf24] selection:text-black print:bg-white print:text-black">
      
      {/* 🖨️ LE SECRET 1/1000 : Contrôle absolu des marges de l'imprimante et encres forcées */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: auto; margin: 2cm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
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

      <div className="fixed top-0 left-0 h-1 bg-[#fbbf24] z-[1001] transition-transform duration-75 ease-out shadow-[0_0_10px_#fbbf24] origin-left print:hidden" 
           style={{ transform: `scaleX(${scrollProgress})`, width: '100%' }}>
      </div>

      <div className="fixed inset-0 z-[-1] print:hidden">
         <div className="absolute inset-0 bg-[#02040a]"></div> 
         <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-[#02040a] to-[#02040a]"></div>
      </div>

      <div className="print:hidden">
        <ArticleTools onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} title={article.title} />
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
            <Link href="/" className="group flex items-center gap-3 text-gray-400 hover:text-white transition-all ml-2 md:ml-4">
                <div className="w-10 h-10 md:w-11 md:h-11 rounded-full border border-gray-600 flex items-center justify-center group-hover:border-[#fbbf24] group-hover:bg-[#fbbf24] group-hover:text-black transition-all active:scale-95 touch-manipulation">
                    <i className={`ph-bold ${lang === 'nko' ? 'ph-arrow-right' : 'ph-arrow-left'} text-xl md:text-lg`}></i>
                </div>
            </Link>
        </div>
      </nav>

      <header className="pt-24 md:pt-32 print:pt-0 pb-0 px-4 md:px-8 max-w-7xl mx-auto text-center">
        <span className={`text-[#fbbf24] print:text-gray-600 uppercase tracking-[0.3em] font-bold mb-4 md:mb-6 block ${lang === 'nko' ? 'text-xl font-kigelia' : 'text-xs md:text-sm'}`}>
            {categoryLabel}
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold mb-8 md:mb-12 text-gray-200 print:text-black">
            <span dir="rtl" className="block !leading-[1.6] text-[#fbbf24] print:text-black mb-2 font-kigelia text-balance">
                {nkoTitle}
            </span>
            {frTitle && (
                <span dir="ltr" className="block leading-tight text-white/90 print:text-gray-800 text-xl md:text-3xl text-balance">
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
            className="relative w-full aspect-video rounded-xl md:rounded-[2rem] overflow-hidden border border-white/10 print:border-none shadow-2xl shadow-[#fbbf24]/10 z-10 print:shadow-none cursor-zoom-in group"
            onClick={() => setCoverLightbox(true)}
          >
            <Image
              src={article.mainImageUrl}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105 print:scale-100"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center print:hidden">
              <i className="ph-bold ph-arrows-out text-white text-5xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-xl"></i>
            </div>
          </div>
        )}
      </header>

      <div className="relative z-0 text-center mt-4 md:mt-6 mb-10 md:mb-16 flex justify-center print:mb-8">
         <span className={`inline-block bg-black/40 print:bg-transparent backdrop-blur-md border border-white/10 print:border-none px-4 py-1.5 md:px-6 md:py-2 rounded-full text-[10px] md:text-xs text-gray-400 print:text-gray-600 italic shadow-[0_0_20px_rgba(251,191,36,0.1)] print:shadow-none ${lang === 'nko' ? 'font-kigelia' : ''}`}>
            {captionText}
         </span>
      </div>

      <article 
        className="article-content pb-12 md:pb-20 max-w-3xl mx-auto px-4 md:px-6 transition-all duration-300 print:pb-0"
        style={{ fontSize: `${fontScale}rem` }} 
      >
        <CustomPortableText value={article.body} lang={lang} />
      </article>

{/* 🖨️ PIED DE PAGE D'IMPRESSION INVISIBLE SUR ÉCRAN */}
      <div className="hidden print:block max-w-3xl mx-auto border-t-2 border-black pt-4 mt-8 text-center px-4">
        <p className="text-sm font-bold text-black font-kigelia mb-1">ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ - N&apos;Ko ni Lonko</p>
        <p className="text-xs text-gray-600 italic">Document imprimé depuis le site officiel : https://nkonilonko.com/article/{article.slug}</p>
        {/* 🚀 SÉCURITÉ : Ciblage du 1er auteur pour le Copyright */}
        <p suppressHydrationWarning className="text-[10px] text-gray-500 mt-2">© {new Date().getFullYear()} {article.authors?.[0]?.name || 'Moustapha CAMARA'}. Tous droits réservés.</p>
      </div>
<div className="print:hidden">
        {/* 🚀 SÉCURITÉ 1/1000 : Transmission intégrale du Dossier Académique */}
        <ArticleFooter 
            lang={lang} 
            author={article.authors && article.authors.length > 0 ? {
                name: article.authors[0].name,
                nameNko: article.authors[0].nameNko,
                image: article.authors[0].imageUrl,
                bio: article.authors[0].bio,
                role: article.authors[0].role,
                institution: article.authors[0].institution,
                orcid: article.authors[0].orcid,
                expertise: article.authors[0].expertise,
                socials: article.authors[0].socials
            } : undefined} 
            tags={categoryLabel ? [categoryLabel] : []}
            relatedArticles={[]} 
        />
      </div>

      <footer className="border-t border-white/10 print:hidden py-12 md:py-16 text-center bg-black/60 backdrop-blur-2xl mt-8 relative overflow-hidden flex flex-col items-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-60 h-60 bg-[#fbbf24]/5 blur-[80px] rounded-full pointer-events-none"></div>
        
        <div className="w-24 h-24 md:w-28 md:h-28 mb-8 relative group flex items-center justify-center p-4 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl md:rounded-[2rem] shadow-[inset_0_0_20px_rgba(251,191,36,0.05)] overflow-hidden transition-all duration-500 hover:border-[#fbbf24]/40 hover:shadow-[0_0_50px_rgba(251,191,36,0.25)] hover:scale-[1.02] z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-[#fbbf24]/30 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <Image 
                src="/icon-512x512.png" 
                alt="Sceau N'Ko ni Lonko" 
                width={512}
                height={512}
                className="w-full h-full object-contain relative z-10 drop-shadow-xl"
            />
        </div>
        
        <p className={`text-[#fbbf24] font-mono text-xs md:text-sm max-w-md mx-auto relative z-10 drop-shadow-sm opacity-90 ${lang === 'nko' ? 'font-kigelia tracking-wider' : 'tracking-widest uppercase'}`}>
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
              alt={article.title} 
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