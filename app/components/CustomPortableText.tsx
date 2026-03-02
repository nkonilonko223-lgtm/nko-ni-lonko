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
  caption?: string;
}

interface YouTubeBlock {
  url: string;
}

interface MathBlock {
  latex: string;
}

interface CalloutBlock {
  text: string;
  intent?: 'info' | 'warning' | 'success';
}

type PortableImageProps = PortableTextComponentProps<SanityImage>;
type PortableYouTubeProps = PortableTextComponentProps<YouTubeBlock>;
type PortableMathProps = PortableTextComponentProps<MathBlock>;
type PortableCalloutProps = PortableTextComponentProps<CalloutBlock>;

interface LightboxState {
  url: string;
  alt: string;
  caption?: string;
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
    return value?.find(b => b._type === 'block' && (!b.style || b.style === 'normal'))?._key;
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
          ? "first-letter:text-[5em] md:first-letter:text-[6.5em] first-letter:text-[#fbbf24] first-letter:float-right first-letter:ml-3 md:first-letter:ml-4 first-letter:-mt-4 md:first-letter:-mt-6 first-letter:-mb-3 md:first-letter:-mb-5 first-letter:leading-[0.5] first-letter:drop-shadow-[0_0_15px_rgba(251,191,36,0.4)] print:first-letter:text-black" 
          : "";
        const dropCapFr = isFirst && !nko 
          ? "first-letter:text-[5em] md:first-letter:text-[6.5em] first-letter:text-[#fbbf24] first-letter:float-left first-letter:mr-3 md:first-letter:mr-4 first-letter:-mt-2 md:first-letter:-mt-10 first-letter:-mb-3 md:first-letter:-mb-5 first-letter:leading-[0.5] first-letter:drop-shadow-[0_0_15px_rgba(251,191,36,0.4)] print:first-letter:text-black" 
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
        return <FadeInBlock><h1 dir={nko ? "rtl" : "ltr"} className={`text-3xl md:text-4xl font-extrabold text-[#fbbf24] print:text-black mt-10 md:mt-14 pb-0 -mb-2 leading-none text-balance ${nko ? "font-kigelia" : "font-sans"}`}>{children}</h1></FadeInBlock>;
      },
      h2: ({ value: blockValue, children }) => {
        const nko = isNko(getBlockText(blockValue));
        return <FadeInBlock><h2 dir={nko ? "rtl" : "ltr"} className={`text-2xl md:text-3xl font-bold text-[#fbbf24] print:text-black mt-10 md:mt-14 pb-0 -mb-2 leading-none text-balance ${nko ? "font-kigelia" : "font-sans"}`}>{children}</h2></FadeInBlock>;
      },
      h3: ({ value: blockValue, children }) => {
        const nko = isNko(getBlockText(blockValue));
        return <FadeInBlock><h3 dir={nko ? "rtl" : "ltr"} className={`text-xl md:text-2xl font-semibold text-white print:text-black mt-8 md:mt-10 mb-2 leading-none text-balance ${nko ? "font-kigelia" : "font-sans"}`}>{children}</h3></FadeInBlock>;
      },
      blockquote: ({ value: blockValue, children }) => {
        const nko = isNko(getBlockText(blockValue));
        const style = nko ? { fontSize: '1.2em', lineHeight: '2.0' } : {};
        return (
          <FadeInBlock>
            <blockquote dir={nko ? "rtl" : "ltr"} className={`border-l-4 border-[#fbbf24] print:border-black pl-4 md:pl-6 py-4 my-8 md:my-10 italic text-[#fbbf24] print:text-black text-lg bg-gradient-to-r from-[#fbbf24]/10 to-transparent print:bg-transparent rounded-r-xl ${nko ? "font-kigelia" : "font-sans"}`} style={style}>
                {children}
            </blockquote>
          </FadeInBlock>
        );
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
            <div className="relative w-full overflow-hidden my-8 md:my-12 group cursor-zoom-in print:block print:opacity-100" 
                 onClick={() => setLightbox({ url: imageUrl, alt: imageValue.alt || '', caption: imageValue.caption })}>
               <div className="-mx-4 md:-mx-12 relative rounded-xl md:rounded-2xl overflow-hidden border border-white/10 print:border-gray-300 shadow-2xl bg-black/50 print:bg-transparent">
                   
                   <Image 
                     src={imageUrl} 
                     alt={imageValue.alt || 'Illustration scientifique'} 
                     width={1200} 
                     height={800} 
                     className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105 print:scale-100" 
                     sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                   />
                   
                   <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center print:hidden">
                      <i className="ph-bold ph-arrows-out text-white text-4xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg"></i>
                   </div>

                   {imageValue.caption && (
                      <div className="bg-black/60 print:bg-transparent print:static print:translate-y-0 p-3 text-center backdrop-blur-md absolute bottom-0 w-full border-t border-white/10 print:border-none translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <p className={`text-xs md:text-sm text-gray-300 print:text-gray-600 italic ${lang === 'nko' ? 'font-kigelia' : 'font-sans'}`}>
                            {imageValue.caption}
                          </p>
                      </div>
                   )}
               </div>
            </div>
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
        const nkoText = isNko(calloutValue.text);
        const dir = nkoText ? "rtl" : "ltr";
        const fontClass = nkoText ? "font-kigelia text-lg leading-[1.8]" : "font-sans text-base leading-relaxed";
        
        const isWarning = calloutValue.intent === 'warning';
        const colorClass = isWarning ? 'text-red-400 border-red-500/50 from-red-500/10' : 'text-[#fbbf24] border-[#fbbf24] from-[#fbbf24]/10';
        const iconClass = isWarning ? 'ph-warning-circle' : 'ph-lightbulb';

        return (
          <FadeInBlock>
            <div dir={dir} className={`my-8 p-6 md:p-8 rounded-2xl bg-gradient-to-br to-transparent border-l-4 border-r border-y border-white/10 print:border-black print:bg-transparent flex gap-4 md:gap-6 shadow-lg ${colorClass} ${nkoText ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className="text-3xl mt-1 shrink-0">
                <i className={`ph-fill ${iconClass} drop-shadow-[0_0_8px_currentColor]`}></i>
              </div>
              <div className={`${fontClass} text-gray-200 print:text-black`}>
                 {calloutValue.text}
              </div>
            </div>
          </FadeInBlock>
        );
      }
    }
  }), [firstTextBlockKey, lang]);

  return (
    <>
      <PortableText value={value} components={components} />

      {/* 🚀 LA LOUPE CINÉMATIQUE (Z-index 999999 pour régner en maître absolu) */}
      {lightbox && (
        <div 
          className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl transition-all duration-300 p-4 md:p-8 print:hidden"
          onClick={() => setLightbox(null)}
        >
          <button 
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-[#fbbf24] text-white hover:text-black flex items-center justify-center transition-all cursor-pointer z-50 backdrop-blur-md border border-white/20 hover:border-[#fbbf24]"
            onClick={(e) => { e.stopPropagation(); setLightbox(null); }}
            aria-label={lang === 'nko' ? "ߊ߬ ߘߊߕߎ߲߯" : "Fermer l'image"}
          >
            <i className="ph-bold ph-x text-2xl"></i>
          </button>

          <div className="relative w-full max-w-6xl h-full max-h-[80vh] rounded-lg overflow-hidden flex items-center justify-center">
            <Image 
              src={lightbox.url} 
              alt={lightbox.alt} 
              fill
              className="object-contain drop-shadow-[0_0_50px_rgba(251,191,36,0.15)]"
              sizes="100vw"
            />
          </div>

          {lightbox.caption && (
             <div className="mt-6 md:mt-8 max-w-3xl text-center">
                <p className={`text-lg md:text-2xl text-[#fbbf24] font-bold tracking-wide ${lang === 'nko' ? 'font-kigelia' : 'font-sans'}`}>
                  {lightbox.caption}
                </p>
             </div>
          )}
        </div>
      )}
    </>
  );
}