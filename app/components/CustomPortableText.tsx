"use client";

/**
 * ==============================================================================
 * 📂 FICHIER : app/components/CustomPortableText.tsx
 * ------------------------------------------------------------------------------
 * 🎯 RÔLE : Moteur de rendu "World Class" pour le contenu Sanity (PortableText).
 * ⚡ MAGIE VISUELLE : Lettrine Impériale ajustée, Lightbox, Fade-in.
 * 🔬 SCIENCE 1/1000 : Rendu Mathématique LaTeX, Vidéos YouTube, Glossaire Interactif.
 * 🖨️ MOTEUR D'IMPRESSION : Forçage des couleurs et visibilité pour le papier.
 * 🛡️ INGÉNIERIE 0.1/1000 : Singleton Observer, UTC Absolu, Typographie ciblée.
 * ==============================================================================
 */

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { PortableText, PortableTextComponents, PortableTextComponentProps } from "@portabletext/react";
import { PortableTextBlock } from "@portabletext/types";
import { urlFor } from "../../sanity/image";

// 🚀 IMPORTATION DU STANDARD MATHÉMATIQUE MONDIAL
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

// ==============================================================================
// 1. TYPAGES STRICTS & INTERFACES (Zéro 'any')
// ==============================================================================
export interface SanityImage {
  asset: {
    _ref: string;
  };
  alt?: string;
  captionNko?: string; // 🚀 DOGME 1 : Légende N'Ko
  caption?: string;    // 🚀 Légende Française
}

interface YouTubeBlock {
  url: string;
}

interface MathBlock {
  latex: string;
}

interface CalloutBlock {
  text: string;
  titleNko?: string;
  titleFr?: string;
  source?: string;
  intent?: 'definition' | 'stat' | 'question' | 'warning' | 'amazing' | 'quote' | 'info';
}
type PortableImageProps = PortableTextComponentProps<SanityImage>;
type PortableYouTubeProps = PortableTextComponentProps<YouTubeBlock>;
type PortableMathProps = PortableTextComponentProps<MathBlock>;
type PortableCalloutProps = PortableTextComponentProps<CalloutBlock>;

interface SectionHeaderBlock {
  titleNko?: string;
  titleFr?: string;
  icon?: string;
}

interface CodeBlock {
  code: string;
  language?: string;
  filename?: string;
}

type PortableSectionHeaderProps = PortableTextComponentProps<SectionHeaderBlock>;
type PortableCodeProps = PortableTextComponentProps<CodeBlock>;

interface LightboxState {
  url: string;
  alt: string;
  captionNko?: string; // 🚀 Transport de la Légende N'Ko vers le plein écran
  caption?: string;    // 🚀 Transport de la Légende Française
}

// ==============================================================================
// 2. UTILITAIRES EXPORTÉS (Sécurité Hydratation)
// ==============================================================================

export function toNkoDigits(num: number | string): string {
  const nkoDigits = ['߀', '߁', '߂', '߃', '߄', '߅', '߆', '߇', '߈', '߉'];
  return num.toString().replace(/[0-9]/g, (w) => nkoDigits[+w]);
}

export function formatDateNko(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  const frDate = `${day}/${month}/${year}`;
  return toNkoDigits(frDate);
}

export function isNko(text: string): boolean {
  if (!text) return false;
  return /[\u07C0-\u07FF]/.test(text);
}

export function getBlockText(value: PortableTextBlock): string {
  if (!value.children) return "";
  return (value.children as { text: string }[]).map((c) => c.text).join("");
}

export function estimateReadingTime(body: PortableTextBlock[]): number {
  if (!body) return 1;
  const text = body.map(block => getBlockText(block)).join(" ");
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / 200) || 1;
}

// ==============================================================================
// 3. SOUS-COMPOSANTS (Observer & YouTube Facade)
// ==============================================================================

type ObserverCallback = () => void;
let globalObserver: IntersectionObserver | null = null;
const observerCallbacks = new Map<Element, ObserverCallback>();

function getGlobalObserver() {
  if (typeof window === 'undefined') return null;
  if (!globalObserver) {
    globalObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const callback = observerCallbacks.get(entry.target);
          if (callback) {
            callback();
            observerCallbacks.delete(entry.target);
            globalObserver!.unobserve(entry.target);
          }
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
  }
  return globalObserver;
}

function observeElement(element: Element, callback: ObserverCallback) {
  const observer = getGlobalObserver();
  if (observer) {
    observerCallbacks.set(element, callback);
    observer.observe(element);
  }
}

function unobserveElement(element: Element) {
  observerCallbacks.delete(element);
  if (globalObserver) globalObserver.unobserve(element);
}

const FadeInBlock = ({ children }: { children: React.ReactNode }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = domRef.current;
    if (el) observeElement(el, () => setIsVisible(true));
    return () => {
      if (el) unobserveElement(el);
    };
  }, []);

  return (
    <div 
      ref={domRef} 
      className={`transition-all duration-1000 ease-out transform print:opacity-100 print:translate-y-0 print:break-inside-avoid ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {children}
    </div>
  );
};

// 🚀 LE MASQUE YOUTUBE (Facade Pattern pour 100% de perf)
const YouTubeFacade = ({ videoId }: { videoId: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  return (
    <FadeInBlock>
      <div 
        className="my-8 md:my-12 relative w-full aspect-video rounded-xl md:rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#02040a] print:hidden group cursor-pointer" 
        onClick={() => setIsPlaying(true)}
        role="button"
        aria-label="Lire la vidéo scientifique"
      >
        {!isPlaying ? (
          <>
            <Image 
              src={thumbnailUrl} 
              alt="Miniature de la vidéo" 
              fill 
              className="object-cover opacity-60 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" 
              sizes="(max-width: 768px) 100vw, 800px" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-[#fbbf24] rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(251,191,36,0.6)] group-hover:scale-110 transition-transform duration-300">
                <i className="ph-fill ph-play text-black text-3xl md:text-4xl translate-x-1"></i>
              </div>
            </div>
          </>
        ) : (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            title="Lecteur Vidéo Scientifique"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0 animate-in fade-in duration-500"
          />
        )}
      </div>
    </FadeInBlock>
  );
};

// ==============================================================================
// 4. LE COMPOSANT DE RENDU PRINCIPAL
// ==============================================================================

interface CustomPortableTextProps {
  value: PortableTextBlock[];
  lang: string;
}

export default function CustomPortableText({ value, lang }: CustomPortableTextProps) {
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

  const firstTextBlockKey = useMemo(() => {
    return value?.find(b => 
      b._type === 'block' && 
      (!b.style || b.style === 'normal') && 
      getBlockText(b as PortableTextBlock).trim().length > 0 // 🚀 IGNORER LES LIGNES VIDES
    )?._key;
  }, [value]);

  const components: PortableTextComponents = useMemo(() => ({
    marks: {
      link: ({ value: markValue, children }) => {
        const target = (markValue?.href || '').startsWith('http') ? '_blank' : undefined;
        return (
          <a 
            href={markValue?.href} 
            target={target} 
            rel={target === '_blank' ? 'noopener noreferrer' : undefined}
            className="text-[#fbbf24] hover:text-white underline decoration-[#fbbf24]/30 hover:decoration-[#fbbf24] underline-offset-4 transition-colors duration-300"
          >
            {children}
          </a>
        );
      },
      // 🚀 LE GLOSSAIRE (Divulgation Progressive 1/1000)
      definition: ({ value: defValue, children }) => {
        const tooltipText = defValue?.text || defValue?.description || '';
        const isTooltipNko = isNko(tooltipText);
        
        return (
          <span className="group relative inline-block cursor-help border-b-2 border-dashed border-[#fbbf24]/60 text-[#fbbf24] hover:bg-[#fbbf24]/10 transition-colors duration-300">
            {children}
            <span 
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 md:w-72 p-4 bg-[#02040a]/95 backdrop-blur-xl border border-white/20 rounded-xl text-sm text-gray-200 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-[100] shadow-[0_10px_40px_rgba(0,0,0,0.8)] translate-y-2 group-hover:translate-y-0" 
              dir={isTooltipNko ? 'rtl' : 'ltr'}
            >
              <span className="block font-bold text-[#fbbf24] mb-2 text-xs uppercase tracking-widest border-b border-white/10 pb-1">
                {isTooltipNko ? 'ߞߘߐߦߌߘߊ' : 'Définition'}
              </span>
              <span className={`${isTooltipNko ? 'font-kigelia text-base leading-relaxed' : 'font-sans leading-snug'}`}>
                {tooltipText || 'Définition non disponible.'}
              </span>
            </span>
          </span>
        );
      }
    },
    block: {
      normal: ({ value: blockValue, children }) => {
        const textContent = getBlockText(blockValue);
        if (!textContent || textContent.trim() === "") return null;

        const nko = isNko(textContent);
        const dir = nko ? "rtl" : "ltr";
        const fontClass = nko ? "font-kigelia" : "font-sans"; 
        
        const isFirst = blockValue._key === firstTextBlockKey;
        
        const dropCapNko = isFirst && nko 
          /* 🚀 MODIF : first-letter:text-[4em] (mobile) et md:first-letter:text-[5em] (PC) */
          ? "first-letter:text-[4em] md:first-letter:text-[5em] first-letter:text-[#fbbf24] first-letter:float-right first-letter:ml-3 md:first-letter:ml-4 first-letter:-mt-4 md:first-letter:-mt-6 first-letter:-mb-3 md:first-letter:-mb-5 first-letter:leading-[0.5] first-letter:drop-shadow-[0_0_15px_rgba(251,191,36,0.4)] print:first-letter:text-black" 
          : "";
        const dropCapFr = isFirst && !nko 
          /* 🚀 MODIF : first-letter:text-[4em] (mobile) et md:first-letter:text-[5em] (PC) */
          ? "first-letter:text-[4em] md:first-letter:text-[5em] first-letter:text-[#fbbf24] first-letter:float-left first-letter:mr-3 md:first-letter:mr-4 first-letter:-mt-2 md:first-letter:-mt-10 first-letter:-mb-3 md:first-letter:-mb-5 first-letter:leading-[0.5] first-letter:drop-shadow-[0_0_15px_rgba(251,191,36,0.4)] print:first-letter:text-black" 
          : "";

        const style = nko 
          ? { fontSize: '1.3em', lineHeight: '2.1' } 
          : { fontSize: '1.1em', lineHeight: '1.7' };

        return (
          <FadeInBlock>
            <p dir={dir} className={`text-gray-300 print:text-black ${fontClass} ${dropCapNko} ${dropCapFr} mb-5 md:mb-6 mt-0`} style={style}>
               {children}
            </p>
          </FadeInBlock>
        );
      },
      h1: ({ value: blockValue, children }) => {
        const nko = isNko(getBlockText(blockValue));
        if (nko) {
          return (
            <FadeInBlock>
              <h1 dir="rtl" className="text-4xl md:text-5xl font-extrabold text-[#fbbf24] print:text-black mt-14 md:mt-20 mb-6 md:mb-8 py-3 pr-8 md:pr-12 bg-gradient-to-r from-[#fbbf24]/15 to-transparent border-r-4 border-[#fbbf24] leading-tight text-balance font-kigelia drop-shadow-[0_0_20px_rgba(251,191,36,0.2)]">
                {children}
              </h1>
            </FadeInBlock>
          );
        } else {
          return (
            <FadeInBlock>
              <h1 dir="ltr" className="text-2xl md:text-3xl font-extrabold text-[#fbbf24] print:text-black mt-14 md:mt-20 mb-6 md:mb-8 py-3 pl-8 md:pl-12 bg-gradient-to-r from-[#fbbf24]/10 to-transparent border-l-4 border-[#fbbf24] leading-tight text-balance font-sans">
                {children}
              </h1>
            </FadeInBlock>
          );
        }
      },
    h2: ({ value: blockValue, children }) => {
        const nko = isNko(getBlockText(blockValue));
        if (nko) {
          return (
            <FadeInBlock>
              <h2 dir="rtl" className="text-3xl md:text-4xl font-bold text-[#fbbf24] print:text-black mt-14 md:mt-18 mb-5 md:mb-7 py-2 pr-8 md:pr-12 bg-gradient-to-r from-[#fbbf24]/15 to-transparent border-r-4 border-[#fbbf24] leading-tight text-balance font-kigelia">
                {children}
              </h2>
            </FadeInBlock>
          );
        } else {
          return (
            <FadeInBlock>
              <h2 dir="ltr" className="text-xl md:text-2xl font-bold text-white print:text-black mt-14 md:mt-18 mb-5 md:mb-7 py-2 pl-8 md:pl-12 bg-gradient-to-r from-white/5 to-transparent border-l-2 border-white/40 leading-tight text-balance font-sans">
                {children}
              </h2>
            </FadeInBlock>
          );
        }
      },
      h3: ({ value: blockValue, children }) => {
        const nko = isNko(getBlockText(blockValue));
        if (nko) {
          return (
            <FadeInBlock>
              <h3 dir="rtl" className="text-2xl md:text-3xl font-semibold text-[#fbbf24] print:text-black mt-10 md:mt-14 mb-4 md:mb-5 pr-6 md:pr-10 border-r-2 border-[#fbbf24]/50 leading-snug text-balance font-kigelia">
                {children}
              </h3>
            </FadeInBlock>
          );
        } else {
          return (
            <FadeInBlock>
              <h3 dir="ltr" className="text-lg md:text-xl font-semibold text-white print:text-black mt-10 md:mt-14 mb-4 md:mb-5 pl-6 md:pl-10 border-l-2 border-white/30 leading-snug text-balance font-sans">
                {children}
              </h3>
            </FadeInBlock>
          );
        }
      },
      h4: ({ value: blockValue, children }) => {
        const nko = isNko(getBlockText(blockValue));
        if (nko) {
          return (
            <FadeInBlock>
              <h4 dir="rtl" className="text-xl md:text-2xl font-medium text-[#fbbf24]/90 print:text-black mt-8 md:mt-10 mb-3 md:mb-4 leading-snug text-balance font-kigelia">
                {children}
              </h4>
            </FadeInBlock>
          );
        } else {
          return (
            <FadeInBlock>
              <h4 dir="ltr" className="text-base md:text-lg font-medium text-white/90 print:text-black mt-8 md:mt-10 mb-3 md:mb-4 leading-snug text-balance font-sans">
                {children}
              </h4>
            </FadeInBlock>
          );
        }
      },
     blockquote: ({ value: blockValue, children }) => {
        const nko = isNko(getBlockText(blockValue));
        if (nko) {
          return (
            <FadeInBlock>
              <blockquote dir="rtl" className="relative border-r-4 border-[#fbbf24] print:border-black pr-6 md:pr-8 py-5 my-10 md:my-14 italic text-[#fbbf24] print:text-black bg-gradient-to-l from-[#fbbf24]/10 to-transparent print:bg-transparent rounded-l-xl font-kigelia" style={{ fontSize: '1.3em', lineHeight: '2.0' }}>
                <i className="ph-fill ph-quotes absolute top-3 right-3 text-[#fbbf24]/20 text-3xl print:hidden"></i>
                {children}
              </blockquote>
            </FadeInBlock>
          );
        } else {
          return (
            <FadeInBlock>
              <blockquote dir="ltr" className="relative border-l-4 border-[#fbbf24] print:border-black pl-6 md:pl-8 py-5 my-10 md:my-14 italic text-[#fbbf24]/90 print:text-black bg-gradient-to-r from-[#fbbf24]/10 to-transparent print:bg-transparent rounded-r-xl font-sans" style={{ fontSize: '1.1em', lineHeight: '1.8' }}>
                <i className="ph-fill ph-quotes absolute top-3 left-3 text-[#fbbf24]/20 text-3xl print:hidden"></i>
                {children}
              </blockquote>
            </FadeInBlock>
          );
        }
      }
    },
    list: {
      bullet: ({children}) => <FadeInBlock><ul className="list-disc pl-5 md:pl-6 mb-6 md:mb-8 text-gray-300 print:text-black space-y-2 md:space-y-3 marker:text-[#fbbf24] print:marker:text-black">{children}</ul></FadeInBlock>,
      number: ({children}) => <FadeInBlock><ol className="list-decimal pl-5 md:pl-6 mb-6 md:mb-8 text-gray-300 print:text-black space-y-2 md:space-y-3 marker:text-[#fbbf24] print:marker:text-black marker:font-bold">{children}</ol></FadeInBlock>,
    },
    types: {
      image: ({ value: imageValue }: PortableImageProps) => {
        if (!imageValue?.asset?._ref) return null;
        const imageUrl = urlFor(imageValue)?.url();
        if (!imageUrl) return null;

        return (
          <FadeInBlock>
            <figure className="my-10 md:my-14 print:block print:opacity-100">
              <div 
                className="relative w-full overflow-hidden group cursor-zoom-in rounded-xl md:rounded-2xl border border-white/10 print:border-gray-300 shadow-2xl bg-[#02040a] print:bg-transparent"
                onClick={() => setLightbox({ url: imageUrl, alt: imageValue.alt || '', captionNko: imageValue.captionNko, caption: imageValue.caption })}
              >
                 <Image 
                   src={imageUrl} 
                   alt={imageValue.alt || 'Illustration scientifique'} 
                   width={1200} 
                   height={800} 
                   className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.02] print:scale-100" 
                   sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                 />
                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center print:hidden pointer-events-none">
                    <i className="ph-bold ph-arrows-out text-white text-4xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg"></i>
                 </div>
              </div>

              {/* 🚀 LÉGENDE "WORLD CLASS 1/10000" (Dual-Stack & Ratio de Taille) */}
              {(imageValue.captionNko || imageValue.caption) && (
                <figcaption className="mt-5 px-2 md:px-4 flex flex-col gap-3">
                  
                  {/* 1. N'Ko en Majesté : 15px/16px (Dominant & Doré) */}
                  {imageValue.captionNko && (
                    <p dir="rtl" className="leading-relaxed text-[#fbbf24] font-kigelia text-right text-[15px] md:text-[16px] drop-shadow-sm">
                      {imageValue.captionNko}
                    </p>
                  )}
                  
                  {/* 2. Le Séparateur Nette et Fluide */}
                  {imageValue.captionNko && imageValue.caption && (
                    <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#fbbf24]/50 to-transparent mx-auto my-1 rounded-full"></div>
                  )}

                  {/* 3. Français Subordonné : 13px/14px (Discret, Blanc/Gris & Italique) */}
                  {imageValue.caption && (
                    <p dir="ltr" className="leading-relaxed text-white/70 font-sans text-left text-[13px] md:text-[14px] italic">
                      {imageValue.caption}
                    </p>
                  )}
                  
                </figcaption>
              )}
            </figure>
          </FadeInBlock>
        );
      },
      
      youtube: ({ value: youtubeValue }: PortableYouTubeProps) => {
        if (!youtubeValue?.url) return null;
        let videoId = "";
        try {
          const url = new URL(youtubeValue.url);
          videoId = url.searchParams.get("v") || url.pathname.split("/").pop() || "";
        } catch {
          return null; 
        }
        
        if (!videoId) return null;

        return <YouTubeFacade videoId={videoId} />;
      },

      math: ({ value: mathValue }: PortableMathProps) => {
        if (!mathValue?.latex) return null;
        return (
          <FadeInBlock>
            <div className="my-6 md:my-8 overflow-x-auto text-center py-6 px-4 bg-white/5 rounded-xl border border-white/10 text-xl print:text-black print:bg-transparent shadow-inner" dir="ltr">
              <BlockMath math={mathValue.latex} />
            </div>
          </FadeInBlock>
        );
      },

      callout: ({ value: calloutValue }: PortableCalloutProps) => {
        if (!calloutValue?.text) return null;
        
        const nkoText = isNko(calloutValue.text) || isNko(calloutValue.titleNko || '');
        const fontClass = nkoText ? "font-kigelia text-lg leading-[1.8]" : "font-sans text-base leading-relaxed";

        // 👑 CONFIG PAR TYPE — N'Ko is King
        const intentConfig: Record<string, {
          icon: string;
          colorClass: string;
          borderClass: string;
          bgClass: string;
          labelNko: string;
          labelFr: string;
        }> = {
          definition: {
            icon: 'ph-book-open',
            colorClass: 'text-blue-300',
            borderClass: 'border-blue-400/50',
            bgClass: 'from-blue-500/10',
            labelNko: 'ߞߘߐߦߌߘߊ',
            labelFr: 'Définition'
          },
          stat: {
            icon: 'ph-chart-bar',
            colorClass: 'text-emerald-300',
            borderClass: 'border-emerald-400/50',
            bgClass: 'from-emerald-500/10',
            labelNko: 'ߝߐ߬ߓߍ ߜߋ߲',
            labelFr: 'Chiffre du mois'
          },
          question: {
            icon: 'ph-question',
            colorClass: 'text-purple-300',
            borderClass: 'border-purple-400/50',
            bgClass: 'from-purple-500/10',
            labelNko: 'ߢߍߥߟߊ ߓߏߟߏ߲',
            labelFr: 'Grande Question'
          },
          warning: {
            icon: 'ph-warning-circle',
            colorClass: 'text-red-400',
            borderClass: 'border-red-500/50',
            bgClass: 'from-red-500/10',
            labelNko: 'ߟߊ߬ߕߍ߲',
            labelFr: 'Attention'
          },
          amazing: {
            icon: 'ph-sparkle',
            colorClass: 'text-[#fbbf24]',
            borderClass: 'border-[#fbbf24]/50',
            bgClass: 'from-[#fbbf24]/10',
            labelNko: 'ߕߏ߬ߟߏ߲ ߞߏ',
            labelFr: 'Le saviez-vous ?'
          },
          quote: {
            icon: 'ph-quotes',
            colorClass: 'text-rose-300',
            borderClass: 'border-rose-400/50',
            bgClass: 'from-rose-500/10',
            labelNko: 'ߞߊ߲ߕߏ߲',
            labelFr: 'Citation'
          },
          info: {
            icon: 'ph-info',
            colorClass: 'text-[#fbbf24]',
            borderClass: 'border-[#fbbf24]/50',
            bgClass: 'from-[#fbbf24]/10',
            labelNko: 'ߟߐ߲ߞߏ',
            labelFr: 'Information'
          },
        };

        const config = intentConfig[calloutValue.intent || 'info'] || intentConfig.info;
        const titleNko = calloutValue.titleNko || config.labelNko;
        const titleFr = calloutValue.titleFr || config.labelFr;

        return (
          <FadeInBlock>
            <div
              dir={nkoText ? "rtl" : "ltr"}
              className={`my-8 md:my-12 rounded-2xl bg-gradient-to-br ${config.bgClass} to-transparent border ${config.borderClass} border-y border-white/5 print:border-black print:bg-transparent overflow-hidden shadow-lg`}
            >
              {/* 👑 EN-TÊTE BILINGUE */}
              <div className={`flex items-center gap-3 px-6 py-3 border-b ${config.borderClass} border-opacity-30 ${nkoText ? 'flex-row-reverse' : 'flex-row'}`}>
                <i className={`ph-fill ${config.icon} text-2xl ${config.colorClass} drop-shadow-[0_0_8px_currentColor]`}></i>
                <div className={`flex flex-col ${nkoText ? 'items-end' : 'items-start'}`}>
                  {/* 👑 N'Ko is King : Titre N'Ko en premier */}
                  <span className={`font-kigelia text-base font-bold ${config.colorClass}`}>
                    {titleNko}
                  </span>
                  <span className="font-sans text-[10px] uppercase tracking-widest text-white/40">
                    {titleFr}
                  </span>
                </div>
              </div>

              {/* 👑 CONTENU */}
              <div className={`px-6 py-5 ${fontClass} ${config.colorClass} print:text-black`}>
                {calloutValue.text}
              </div>

              {/* 👑 SOURCE (si présente) */}
              {calloutValue.source && (
                <div className={`px-6 py-2 border-t ${config.borderClass} border-opacity-20 flex ${nkoText ? 'justify-start' : 'justify-end'}`}>
                  <span className="font-mono text-[10px] text-white/30 uppercase tracking-widest">
                    — {calloutValue.source}
                  </span>
                </div>
              )}
            </div>
          </FadeInBlock>
        );
      },
      // 👑 N'Ko is King — Titre de Rubrique (Revue Mensuelle)
      sectionHeader: ({ value: sectionValue }: PortableSectionHeaderProps) => {
        if (!sectionValue?.titleNko && !sectionValue?.titleFr) return null;
        return (
          <FadeInBlock>
            <div className="my-14 md:my-20 print:my-8">
              {/* Ligne décorative supérieure */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#fbbf24]/40 to-transparent" />
                {sectionValue.icon && (
                  <div className="w-10 h-10 rounded-full bg-[#fbbf24]/10 border border-[#fbbf24]/30 flex items-center justify-center shrink-0">
                    <i className={`ph-bold ${sectionValue.icon} text-[#fbbf24] text-xl`}></i>
                  </div>
                )}
                <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#fbbf24]/40 to-transparent" />
              </div>

              {/* 👑 Titre N'Ko — Souverain */}
              {sectionValue.titleNko && (
                <p
                  dir="rtl"
                  className="font-kigelia text-3xl md:text-4xl font-bold text-[#fbbf24] text-center leading-normal mb-2 print:text-black drop-shadow-[0_0_20px_rgba(251,191,36,0.3)]"
                >
                  {sectionValue.titleNko}
                </p>
              )}

              {/* Titre Français — Subordonné */}
              {sectionValue.titleFr && (
                <p
                  dir="ltr"
                  className="font-sans text-sm md:text-base text-gray-500 text-center uppercase tracking-[0.3em] print:text-gray-600 mt-1"
                >
                  {sectionValue.titleFr}
                </p>
              )}

              {/* Ligne décorative inférieure */}
              <div className="mt-6 h-[1px] bg-gradient-to-r from-transparent via-[#fbbf24]/20 to-transparent" />
            </div>
          </FadeInBlock>
        );
      },

      // 💻 Bloc Code Technologie
      code: ({ value: codeValue }: PortableCodeProps) => {
        if (!codeValue?.code) return null;
        return (
          <FadeInBlock>
            <div className="my-8 md:my-10 rounded-xl overflow-hidden border border-white/10 shadow-xl print:border-gray-300" dir="ltr">
              {/* Header du bloc */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#0b1121] border-b border-white/10 print:bg-gray-100">
                <div className="flex items-center gap-2">
                  <i className="ph-bold ph-terminal text-[#fbbf24] text-sm"></i>
                  {codeValue.filename && (
                    <span className="text-xs text-gray-400 font-mono tracking-wide">
                      {codeValue.filename}
                    </span>
                  )}
                </div>
                {codeValue.language && (
                  <span className="text-[10px] uppercase tracking-widest text-[#fbbf24]/60 font-mono border border-[#fbbf24]/20 px-2 py-0.5 rounded-full">
                    {codeValue.language}
                  </span>
                )}
              </div>
              {/* Code */}
              <pre className="overflow-x-auto p-4 md:p-6 bg-[#060910] print:bg-white">
                <code className="text-sm text-gray-300 print:text-black font-mono leading-relaxed whitespace-pre">
                  {codeValue.code}
                </code>
              </pre>
            </div>
          </FadeInBlock>
        );
      },
    }
 // 🚀 FIX VS CODE : Ajout de setLightbox dans les dépendances
  }), [firstTextBlockKey, setLightbox]);
  return (
    <>
      <PortableText value={value} components={components} />

      {/* 🚀 LA LOUPE CINÉMATIQUE (Plein écran scrolable) */}
      {lightbox && (
        <div 
          className="fixed inset-0 z-[999999] flex flex-col bg-black/98 backdrop-blur-2xl transition-all duration-300 print:hidden"
        >
          <div className="absolute top-0 w-full h-20 bg-gradient-to-b from-black/80 to-transparent z-50 flex items-center justify-end px-6 pointer-events-none">
            <button 
              className="w-12 h-12 rounded-full bg-white/10 hover:bg-[#fbbf24] text-white hover:text-black flex items-center justify-center transition-all cursor-pointer backdrop-blur-md border border-white/20 hover:border-[#fbbf24] pointer-events-auto"
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
                alt={lightbox.alt} 
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
                  <div dir="rtl" className="text-[#fbbf24] font-kigelia text-right text-[17px] md:text-[19px] leading-relaxed drop-shadow-md">
                    {lightbox.captionNko}
                  </div>
                )}
                
                {/* 2. Ligne de Lumière (Plus large en plein écran) */}
                {lightbox.captionNko && lightbox.caption && (
                  <div className="w-32 h-[1.5px] bg-gradient-to-r from-transparent via-[#fbbf24]/50 to-transparent mx-auto rounded-full my-2"></div>
                )}

                {/* 3. Français en Support : 14px/15px */}
                {lightbox.caption && (
                  <div dir="ltr" className="text-white/70 font-sans text-left text-[14px] md:text-[15px] italic leading-relaxed">
                    {lightbox.caption}
                  </div>
                )}

              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}