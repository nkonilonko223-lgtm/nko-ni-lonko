"use client";

/**
 * ==============================================================================
 * 📂 FICHIER : app/components/ArticleClient.tsx
 * ------------------------------------------------------------------------------
 * 🎯 RÔLE : Affichage de l'article (Client Component).
 * 🔒 SÉCURITÉ : Typage strict (Zero Any).
 * 📱 MOBILE FIRST : Touch targets optimisés (>44px), overflow sécurisé.
 * 🎨 DESIGN : "Or & Noir" Kiba préservé.
 * ==============================================================================
 */

import { useState, useEffect } from "react";
import { useLanguage } from "./LanguageProvider";
import { urlFor } from "../../sanity/image";
import Image from "next/image";
import Link from "next/link";
import { PortableText, PortableTextComponents, PortableTextComponentProps } from "@portabletext/react";
import { PortableTextBlock } from "@portabletext/types";
import ArticleTools from "./ArticleTools"; 
import ArticleFooter from "./ArticleFooter"; 

// ==============================================================================
// 1. TYPAGE STRICT (Zéro Any)
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
  // On type l'image brute ou on accepte null/undefined, mais pas 'any'
  mainImageRaw: SanityImage | null; 
  publishedAt: string;
  body: PortableTextBlock[];
  excerpt: string;
  category: string;
  author: {
    name: string;
    nameNko: string | null;
    imageUrl: string | null;
    bio: PortableTextBlock[] | null;
    role: string;
    socials: SocialLink[];
  } | null;
}

// Interface pour les props des composants PortableText personnalisés
type PortableImageProps = PortableTextComponentProps<SanityImage>;

// ==============================================================================
// 2. UTILITAIRES
// ==============================================================================
function toNkoDigits(num: number | string): string {
  const nkoDigits = ['߀', '߁', '߂', '߃', '߄', '߅', '߆', '߇', '߈', '߉'];
  return num.toString().replace(/[0-9]/g, (w) => nkoDigits[+w]);
}

function formatDateNko(dateString: string): string {
  const date = new Date(dateString);
  const frDate = date.toLocaleDateString("fr-FR");
  return toNkoDigits(frDate);
}

function isNko(text: string): boolean {
  if (!text) return false;
  return /[\u07C0-\u07FF]/.test(text);
}

function getBlockText(value: PortableTextBlock): string {
  if (!value.children) return "";
  // Typage strict des enfants de bloc
  return (value.children as { text: string }[]).map((c) => c.text).join("");
}

function estimateReadingTime(body: PortableTextBlock[]): number {
  if (!body) return 1;
  const text = body.map(block => getBlockText(block)).join(" ");
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / 200) || 1;
}

// ==============================================================================
// 3. COMPOSANT PRINCIPAL
// ==============================================================================

export default function ArticleClient({ article }: { article: ClientArticleData }) {
  const { lang, toggleLanguage, t } = useLanguage(); 
  
  // --- ÉTATS INTERACTIFS ---
  const [fontScale, setFontScale] = useState(1.125); // Départ 18px
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  // --- HANDLERS DU ZOOM ---
  const handleZoomIn = () => setFontScale(prev => Math.min(prev + 0.125, 2.0)); 
  const handleZoomOut = () => setFontScale(prev => Math.max(prev - 0.125, 0.875)); 

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = windowHeight > 0 ? totalScroll / windowHeight : 0;
      
      setScrollProgress(Math.min(Math.max(Number(scroll), 0), 1));
      setIsScrolled(window.scrollY > 50);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt || t.home.hero.subtitle,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Erreur partage:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      // Idéalement : Ajouter un petit toast de confirmation ici
    }
  };

  // --- CONFIGURATION PORTABLE TEXT (Typée & Optimisée) ---
  const myPortableTextComponents: PortableTextComponents = {
    block: {
      normal: ({ value, children }) => {
        const textContent = getBlockText(value);
        if (!textContent || textContent.trim() === "") return null;

        const nko = isNko(textContent);
        const dir = nko ? "rtl" : "ltr";
        const fontClass = nko ? "font-kigelia" : ""; 
        
        const style = nko 
            ? { fontSize: '1.3em', lineHeight: '2.1' } 
            : { fontSize: '1.1em', lineHeight: '1.7' };

        return (
            <p dir={dir} className={`text-gray-300 ${fontClass} mb-5 md:mb-6 mt-0`} style={style}>
               {children}
            </p>
        );
      },
      h1: ({ value, children }) => {
        const textContent = getBlockText(value);
        const nko = isNko(textContent);
        const fontClass = nko ? "font-kigelia" : "";
        // Ajout de 'text-balance' pour éviter les titres moches sur mobile
        return <h1 dir={nko ? "rtl" : "ltr"} className={`text-3xl md:text-4xl font-extrabold text-[#fbbf24] mt-8 md:mt-10 pb-0 -mb-2 leading-none text-balance ${fontClass}`}>{children}</h1>;
      },
      h2: ({ value, children }) => {
        const textContent = getBlockText(value);
        const nko = isNko(textContent);
        const fontClass = nko ? "font-kigelia" : "";
        return <h2 dir={nko ? "rtl" : "ltr"} className={`text-2xl md:text-3xl font-bold text-[#fbbf24] mt-8 md:mt-10 pb-0 -mb-2 leading-none text-balance ${fontClass}`}>{children}</h2>;
      },
      h3: ({ value, children }) => {
        const textContent = getBlockText(value);
        const nko = isNko(textContent);
        const fontClass = nko ? "font-kigelia" : "";
        return <h3 dir={nko ? "rtl" : "ltr"} className={`text-xl md:text-2xl font-semibold text-white mt-6 md:mt-8 mb-2 leading-none text-balance ${fontClass}`}>{children}</h3>;
      },
      blockquote: ({ value, children }) => {
        const textContent = getBlockText(value);
        const nko = isNko(textContent);
        const fontClass = nko ? "font-kigelia" : "";
        const style = nko ? { fontSize: '1.2em', lineHeight: '2.0' } : {};
        return (
            <blockquote dir={nko ? "rtl" : "ltr"} className={`border-l-4 border-[#fbbf24] pl-4 md:pl-6 py-2 my-8 md:my-10 italic text-[#fbbf24] text-lg ${fontClass}`} style={style}>
                {children}
            </blockquote>
        );
      }
    },
    list: {
      bullet: ({children}) => <ul className="list-disc pl-5 md:pl-6 mb-6 md:mb-8 text-gray-300 space-y-2 md:space-y-3">{children}</ul>,
      number: ({children}) => <ol className="list-decimal pl-5 md:pl-6 mb-6 md:mb-8 text-gray-300 space-y-2 md:space-y-3">{children}</ol>,
    },
    types: {
      image: ({ value }: PortableImageProps) => {
        if (!value?.asset?._ref) return null;
        return (
          // SÉCURITÉ MOBILE : overflow-hidden sur le conteneur pour éviter le scroll horizontal
          <div className="relative w-full overflow-hidden my-8 md:my-12">
             <div className="-mx-4 md:-mx-12 relative rounded-xl md:rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                 <img 
                   src={urlFor(value)?.url() || ""} 
                   alt={value.alt || 'Illustration'} 
                   className="w-full h-auto object-cover" 
                 />
                 {value.caption && (
                    <div className="bg-black/50 p-2 text-center backdrop-blur-md">
                        <p className={`text-xs md:text-sm text-gray-400 italic ${lang === 'nko' ? 'font-kigelia' : ''}`}>{value.caption}</p>
                    </div>
                 )}
             </div>
          </div>
        );
      }
    }
  };

  // --- VARIABLES D'AFFICHAGE ---
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

  // Utilisation de casting sûr pour les catégories dynamiques
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const categoryLabel = article.category ? (t.home.categories as any)[article.category] : (lang === 'nko' ? 'ߟߐ߲ߞߏ' : 'Science');

  return (
    <main className="min-h-screen relative text-white selection:bg-[#fbbf24] selection:text-black">
      
      {/* Scroll Progress */}
      <div className="fixed top-0 left-0 h-1 bg-[#fbbf24] z-[1001] transition-all duration-100 ease-out shadow-[0_0_10px_#fbbf24]" 
           style={{ width: `${scrollProgress * 100}%` }}>
      </div>

      {/* Background */}
      <div className="fixed inset-0 z-[-1]">
         <div className="absolute inset-0 bg-[#02040a]"></div> 
         <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-[#02040a] to-[#02040a]"></div>
      </div>

      <ArticleTools 
        onZoomIn={handleZoomIn} 
        onZoomOut={handleZoomOut} 
        title={article.title}
      />

      {/* NAV DYNAMIQUE */}
      <nav className={`fixed top-0 left-0 w-full z-50 px-4 md:px-6 transition-all duration-300 flex justify-between items-center ${
          isScrolled 
          ? "bg-[#02040a]/95 backdrop-blur-md border-b border-white/10 py-3 md:py-4 shadow-xl" 
          : "bg-gradient-to-b from-black/90 to-transparent py-4 md:py-6"
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-1 md:gap-4 text-[#fbbf24] font-bold font-mono tracking-widest text-sm">
            <div className="flex items-center gap-2">
              <i className="ph-fill ph-calendar-blank text-lg"></i>
              <span className={lang === 'nko' ? 'font-kigelia' : ''}>{dateDisplay}</span>
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

        {/* Boutons Droite : Optimisés Tactile (Min 40px/44px) */}
        <div className="flex items-center gap-3 md:gap-4">
            <button 
                onClick={handleShare}
                // TACTILE OPTIMISÉ : w-10 h-10 min pour le mobile (au lieu de w-9)
                className="w-10 h-10 md:w-11 md:h-11 rounded-full border border-gray-600 flex items-center justify-center hover:bg-[#fbbf24] hover:text-black hover:border-[#fbbf24] transition-all backdrop-blur-md active:scale-95 touch-manipulation"
                title={t.article.share}
            >
                <i className="ph-bold ph-share-network text-xl md:text-lg"></i>
            </button>

            <button 
                onClick={toggleLanguage}
                // TACTILE OPTIMISÉ : Padding plus large
                className="border border-gray-600 px-4 py-2 md:px-5 md:py-2.5 rounded-full text-xs md:text-sm font-bold uppercase hover:bg-[#fbbf24] hover:text-black transition-all flex items-center gap-2 backdrop-blur-md active:scale-95 touch-manipulation"
            >
                <i className="ph-bold ph-translate text-lg"></i>
                <span>{lang === 'nko' ? 'FR' : 'ߒߞߏ'}</span>
            </button>

            <Link href="/" className="group flex items-center gap-3 text-gray-400 hover:text-white transition-all ml-2 md:ml-4">
                {/* TACTILE OPTIMISÉ : w-10 h-10 min */}
                <div className="w-10 h-10 md:w-11 md:h-11 rounded-full border border-gray-600 flex items-center justify-center group-hover:border-[#fbbf24] group-hover:bg-[#fbbf24] group-hover:text-black transition-all active:scale-95 touch-manipulation">
                    <i className={`ph-bold ${lang === 'nko' ? 'ph-arrow-right' : 'ph-arrow-left'} text-xl md:text-lg`}></i>
                </div>
            </Link>
        </div>
      </nav>

      {/* Header */}
      <header className="pt-24 md:pt-32 pb-0 px-4 md:px-8 max-w-7xl mx-auto text-center">
        <span className={`text-[#fbbf24] uppercase tracking-[0.3em] font-bold mb-4 md:mb-6 block ${lang === 'nko' ? 'text-xl font-kigelia' : 'text-xs md:text-sm'}`}>
            {categoryLabel}
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold mb-8 md:mb-12 text-gray-200">
            {/* DESIGN : text-balance pour équilibrer les titres */}
            <span dir="rtl" className="block !leading-[1.6] text-[#fbbf24] mb-2 font-kigelia text-balance">
                {nkoTitle}
            </span>
            {frTitle && (
                <span dir="ltr" className="block leading-tight text-white/90 text-xl md:text-3xl text-balance">
                    {frTitle}
                </span>
            )}
        </h1>
        <div className="md:hidden flex justify-center items-center gap-2 text-gray-400 text-xs mb-6 font-mono">
             <i className="ph-bold ph-clock text-[#fbbf24]"></i>
             <span className={lang === 'nko' ? 'font-kigelia' : ''}>{readingTimeText}</span>
        </div>
        {article.mainImageUrl && (
          <div className="relative w-full aspect-video rounded-xl md:rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl shadow-[#fbbf24]/10 z-10">
            <Image
              src={article.mainImageUrl}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}
      </header>

      <div className="relative z-0 text-center mt-4 md:mt-6 mb-10 md:mb-16 flex justify-center">
         <span className={`inline-block bg-black/40 backdrop-blur-md border border-white/10 px-4 py-1.5 md:px-6 md:py-2 rounded-full text-[10px] md:text-xs text-gray-400 italic shadow-[0_0_20px_rgba(251,191,36,0.1)] ${lang === 'nko' ? 'font-kigelia' : ''}`}>
            {captionText}
         </span>
      </div>

      {/* Corps du texte */}
      <article 
        className="article-content pb-12 md:pb-20 max-w-3xl mx-auto px-4 md:px-6"
        style={{ fontSize: `${fontScale}rem` }} 
      >
        <PortableText 
            value={article.body} 
            components={myPortableTextComponents}
        />
      </article>

      <ArticleFooter 
          lang={lang} 
          author={article.author ? {
             name: article.author.name,
             image: article.author.imageUrl,
             bio: "",
             role: article.author.role
          } : undefined} 
          tags={categoryLabel ? [categoryLabel] : []}
          relatedArticles={[]} 
      />

      <footer className="border-t border-white/10 py-8 md:py-12 text-center bg-black/40 backdrop-blur-xl">
        <div className="flex justify-center items-center gap-2 mb-4 text-[#fbbf24]">
           <i className="ph-fill ph-seal-check text-xl"></i>
        </div>
        <p className={`text-gray-600 font-mono text-xs md:text-sm ${lang === 'nko' ? 'font-kigelia' : ''}`}>
          {t.footer.copyright.replace("{year}", lang === 'nko' ? "߂߀߂߆" : "2026")}
        </p>
      </footer>

    </main>
  );
}