"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "./LanguageProvider";
import { useState, useMemo, useRef, useCallback } from "react";

// --- INTERFACE STRICTE ET ROBUSTE ---
export interface ArticleCardProps {
  article: {
    title: string;
    slug: { current: string } | string;
    publishedAt: string;
    excerpt?: string;
    category: string;
    authorName: string;
    authorNameNko?: string | null; // 🚀 NOUVEAU : Accepte le nom N'Ko
    authorImageUrl: string | null;
    mainImageUrl: string | null;
    readingTime?: number; 
  };
  isPriority?: boolean; 
}

// --- 1. ICÔNES (MAPPING) ---
const ICON_MAP: Record<string, string> = {
  'astronomie': "ph-star", 'astronomy': "ph-star",
  'physique': "ph-atom", 'physics': "ph-atom", 'physique quantique': "ph-atom",
  'biologie': "ph-dna", 'biology': "ph-dna",
  'mathématiques': "ph-function", 'mathematics': "ph-function",
  'chimie': "ph-flask", 'chemistry': "ph-flask",
  'géologie': "ph-mountains", 'geology': "ph-mountains",
  'technologie': "ph-robot", 'technology': "ph-robot", 'tech': "ph-robot",
  'histoire': "ph-scroll", 'history': "ph-scroll",
  'santé': "ph-heartbeat", 'health': "ph-heartbeat",
  'science': "ph-flask"
};

// --- 2. SECOURS N'KO (FALLBACK) ---
const NKO_HARD_TRANSLATIONS: Record<string, string> = {
  'Science': 'ߟߐ߲ߞߏ', 'science': 'ߟߐ߲ߞߏ',
  'Astronomie': 'ߛߊ߲ߡߊߛߓߍ', 'astronomy': 'ߛߊ߲ߡߊߛߓߍ',
  'Physique': 'ߘߐ߬ߞߏ', 'physics': 'ߘߐ߬ߞߏ', 'Physique Quantique': 'ߘߐ߬ߞߏ ߢߊ߰ߙߊ',
  'Biologie': 'ߢߣߊߡߦߊ', 'biology': 'ߢߣߊߡߦߊ',
  'Chimie': 'ߖߎ߲߯ߛߊ', 'chemistry': 'ߖߎ߲߯ߛߊ',
  'Mathématiques': 'ߘߊ߲߬ߠߊ߬ߕߍ߰ߟߌ', 'mathematics': 'ߘߊ߲߬ߠߊ߬ߕߍ߰ߟߌ',
  'Technologie': 'ߛߋߒߞߏߟߦߊ', 'technology': 'ߛߋߒߞߏߟߦߊ',
  'Histoire': 'ߘߐ߬ߝߐ', 'history': 'ߘߐ߬ߝߐ',
  'Géologie': 'ߘߎ߰ߘߐ߬ߛߓߍ', 'geology': 'ߘߎ߰ߘߐ߬ߛߓߍ',
  'Santé': 'ߞߍ߲ߘߍߦߊ', 'health': 'ߞߍ߲ߘߍߦߊ'
};

// --- 3. CONFIGURATION DATE N'KO ---
const NKO_MONTHS = [
  "ߓߌ߲ߠߊߥߎߟߋ߲", "ߞߏ߲ߞߏߜߍ", "ߕߙߊߓߊ", "ߞߏ߲ߞߏߘߌ߬ߓߌ", 
  "ߘߓߊ߬ߕߊ", "ߘߓߊ߬ߓߌߟߊ", "ߞߐ߬ߓߊ߬ߟߏ߲", "ߘߓߊ߬ߗߍ", 
  "ߕߎߟߊߝߌ߲", "ߓߊ߲߬ߘߊ߬ߓߌߟߊ", "ߣߍߣߍߓߊ", "ߞߏߟߌ߲ߞߏߟߌ߲"
];
const NKO_DIGITS = ['߀', '߁', '߂', '߃', '߄', '߅', '߆', '߇', '߈', '߉'];

function toNkoDigits(num: number | string): string {
  return num.toString().replace(/[0-9]/g, (w) => NKO_DIGITS[+w]);
}

function formatDateNkoFull(dateString: string): string {
  const date = new Date(dateString);
  const day = toNkoDigits(date.getDate());
  const month = NKO_MONTHS[date.getMonth()];
  const year = toNkoDigits(date.getFullYear());
  return `${month} ߕߟߋ߬ ${day} ߛߊ߲߭ ${year}`;
}

function getCategoryIcon(category: string): string {
  if (!category) return "ph-star";
  const normalizedKey = category.toLowerCase().trim();
  const foundKey = Object.keys(ICON_MAP).find(key => normalizedKey.includes(key));
  return foundKey ? ICON_MAP[foundKey] : "ph-star";
}

function getNkoCategory(raw: string, dictMap: Record<string, string> | undefined): string {
  const dictKey = Object.keys(dictMap || {}).find(k => k.toLowerCase() === raw.toLowerCase());
  if (dictKey && dictMap) return dictMap[dictKey];
  const hardKey = Object.keys(NKO_HARD_TRANSLATIONS).find(k => k.toLowerCase() === raw.toLowerCase());
  if (hardKey) return NKO_HARD_TRANSLATIONS[hardKey];
  return raw;
}

// ==============================================================================
// 🚀 HOOK MAGNÉTIQUE
// ==============================================================================
function useCardPhysics() {
  const divRef = useRef<HTMLElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!divRef.current) return;
    const div = divRef.current;
    const rect = div.getBoundingClientRect();
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPosition({ x, y });

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const tiltX = -((y - centerY) / centerY) * 6;
    const tiltY = ((x - centerX) / centerX) * 6;
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => {
    setOpacity(0);
    setTilt({ x: 0, y: 0 }); 
  };

  return { divRef, position, opacity, tilt, handleMouseMove, handleMouseEnter, handleMouseLeave };
}

// ==============================================================================
// COMPOSANT PRINCIPAL
// ==============================================================================
export default function ArticleCard({ article, isPriority = false }: ArticleCardProps) {
  const { t, lang } = useLanguage();
  const { divRef, position, opacity, tilt, handleMouseMove, handleMouseEnter, handleMouseLeave } = useCardPhysics();
  
  const isNko = lang === 'nko';
  const [isImageLoading, setIsImageLoading] = useState(!isPriority);

  const slugCurrent = typeof article.slug === 'string' ? article.slug : article.slug.current;

  const categoriesMap = (t.home?.categories || {}) as Record<string, string>;
  const rawCategory = article.category || 'Science';
  const displayCategory = isNko ? getNkoCategory(rawCategory, categoriesMap) : rawCategory; 

  const isNew = useMemo(() => {
    if (!article.publishedAt) return false;
    const pubDate = new Date(article.publishedAt).getTime();
    const now = new Date().getTime();
    return (now - pubDate) < 7 * 24 * 60 * 60 * 1000;
  }, [article.publishedAt]);

  const triggerVibration = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
  }, []);

  const readTime = article.readingTime || 3;

  return (
    <Link 
      href={`/article/${slugCurrent}`} 
      onClick={triggerVibration}
      className="group/card block h-full w-full outline-none focus-visible:ring-2 focus-visible:ring-[#fbbf24] rounded-[20px]"
      style={{ perspective: "1000px" }}
    >
      <article 
        ref={divRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="
          relative flex h-full flex-col overflow-hidden rounded-[20px] 
          bg-[#0b1121]/40 backdrop-blur-xl border border-white/10
          shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]
        "
        style={{
          transform: opacity === 1 
            ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-8px) scale3d(1.02, 1.02, 1.02)` 
            : `rotateX(0deg) rotateY(0deg) translateY(0px) scale3d(1, 1, 1)`,
          transition: opacity === 1 
            ? "transform 0.1s ease-out" 
            : "transform 0.5s ease-out, box-shadow 0.5s ease-out",
          boxShadow: opacity === 1 
            ? "0 20px 40px -10px rgba(251,191,36,0.2), 0 0 20px rgba(251,191,36,0.1)" 
            : "0 8px 32px 0 rgba(0,0,0,0.3)",
          borderColor: opacity === 1 ? "rgba(251,191,36,0.3)" : "rgba(255,255,255,0.1)"
        }}
      >
        <div
          className="pointer-events-none absolute -inset-px rounded-[20px] transition-opacity duration-300 z-0"
          style={{
            opacity,
            background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(251,191,36,0.15), transparent 40%)`,
          }}
        />

        <div className="relative z-10 flex h-full flex-col">
          
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#1e293b]">
            
            {isImageLoading && article.mainImageUrl && (
              <div className="absolute inset-0 z-0 animate-pulse bg-slate-800" />
            )}

            {article.mainImageUrl ? (
              <Image
                src={article.mainImageUrl}
                alt={article.title}
                fill
                priority={isPriority} 
                className={`
                  object-cover transition-all duration-700 ease-out group-hover/card:scale-110
                  ${isImageLoading ? 'scale-105 blur-lg grayscale' : 'scale-100 blur-0 grayscale-0'}
                `}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onLoad={() => setIsImageLoading(false)}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-white/10">
                <i className="ph-fill ph-image text-5xl"></i>
              </div>
            )}
            
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0b1121] via-[#0b1121]/50 to-transparent opacity-90"></div>

            <div className={`absolute top-4 ${isNko ? 'right-4' : 'left-4'} z-10`}>
              <span className={`
                flex items-center gap-2 rounded-full 
                bg-black/60 backdrop-blur-md border border-white/10 
                text-[#fbbf24] shadow-lg
                ${isNko 
                  ? 'font-kigelia text-sm px-4 py-1.5' 
                  : 'text-[10px] font-bold uppercase tracking-widest px-3 py-1.5'} 
              `}>
                <i className={`ph-fill ${getCategoryIcon(rawCategory)}`}></i>
                {displayCategory}
              </span>
            </div>
          </div>

<div className="flex flex-1 flex-col p-6">
            
            <div className="mb-4 flex items-center justify-between font-mono text-xs text-slate-500">
              <span className={`flex items-center gap-1.5 ${!isNko ? 'uppercase tracking-wide' : 'font-kigelia text-sm'}`}>
                {isNko 
                  ? formatDateNkoFull(article.publishedAt) 
                  : new Date(article.publishedAt).toLocaleDateString("fr-FR", { month: 'short', day: 'numeric', year: 'numeric' })
                }
                {isNew && (
                  <span className={`ml-2 inline-flex items-center gap-1 rounded-full bg-[#fbbf24]/20 border border-[#fbbf24]/50 px-2 py-0.5 text-[#fbbf24] animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.2)] ${isNko ? 'font-kigelia text-xs' : 'text-[9px] font-bold uppercase tracking-wider'}`}>
                    <i className="ph-fill ph-sparkle"></i>
                    {isNko ? "ߞߎߘߊ" : "Nouveau"}
                  </span>
                )}
              </span>
              
              <span className={`flex items-center gap-1.5 ${isNko ? 'font-kigelia text-sm' : ''}`}>
                <i className="ph-bold ph-book-open text-[#fbbf24]"></i>
                {isNko 
                  ? <span className="text-base">{toNkoDigits(readTime)} ߡߌ߬ߛߍ߲</span> 
                  : `${readTime} min`
                }
              </span>
            </div>

            <h3 className={`
              mb-3 font-bold text-slate-100 
              transition-colors duration-300 group-hover/card:text-[#fbbf24]
              ${isNko ? 'font-kigelia text-2xl leading-[1.6] py-1 -my-1' : 'text-xl leading-snug'}
            `} style={{ direction: isNko ? "rtl" : "ltr" }}>
              <span className="line-clamp-2" title={article.title}>
                {article.title}
              </span>
            </h3>

            <p className={`
              mb-6 flex-1 text-slate-400 line-clamp-3 py-1 -my-1
              ${isNko ? 'text-right leading-loose text-base' : 'text-left leading-relaxed text-sm'}
            `} style={{ direction: isNko ? "rtl" : "ltr" }}>
              {article.excerpt ? article.excerpt : (isNko ? "ߞߣߐߘߐ ߣߌ߲߬ ߘߐߜߍ߫..." : "Découvrez les détails fascinants de cette recherche scientifique...")}
            </p>

            <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-4">
              <div className={`flex items-center gap-3 ${isNko ? 'flex-row-reverse' : ''}`}>
                
                <div className="relative h-9 w-9 overflow-hidden rounded-full border border-[#fbbf24]/20 bg-white/5 shadow-inner transition-transform duration-300 group-hover/card:scale-110">
                  {article.authorImageUrl ? (
                    <Image src={article.authorImageUrl} alt={article.authorName} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-800 text-slate-500">
                      <i className="ph-fill ph-user text-lg"></i>
                    </div>
                  )}
                </div>

               {/* 🚀 L'ARME ABSOLUE : Le Dual-Stack Byline (Logique 1/1000) */}
                <div className={`flex flex-col justify-center ${isNko ? 'items-end' : 'items-start'}`}>
                  <span className={`text-[9px] uppercase tracking-widest text-slate-500 mb-1 ${isNko ? 'font-kigelia' : ''}`}>
                    {isNko ? 'ߛߓߍߦߟߊ' : 'Auteur'}
                  </span>
                  
                  <div className="flex flex-col gap-[2px]">
                    {/* Le Nom Principal (s'adapte à la langue de l'interface) */}
                    <span className={`font-bold transition-colors duration-300 group-hover/card:text-white leading-none ${isNko ? 'font-kigelia text-sm text-[#fbbf24]' : 'text-xs text-slate-200'}`}>
                      {isNko ? (article.authorNameNko || article.authorName) : article.authorName}
                    </span>
                    
                    {/* Le Nom Secondaire (Sécurité : Ne s'affiche QUE si le nom N'Ko existe dans la base de données) */}
                    {article.authorNameNko && (
                      <span className={`transition-colors duration-300 leading-none ${isNko ? 'text-[10px] text-slate-400 font-mono tracking-wide' : 'font-kigelia text-[11px] text-[#fbbf24]/80'}`}>
                        {isNko ? article.authorName : article.authorNameNko}
                      </span>
                    )}
                  </div>
                </div>

              </div>

              <span className={`
                flex h-10 w-10 items-center justify-center rounded-full 
                border border-[#fbbf24]/30 bg-[#fbbf24]/10 text-[#fbbf24] 
                transition-all duration-300 
                group-hover/card:bg-[#fbbf24] group-hover/card:text-black group-hover/card:scale-110 group-hover/card:shadow-[0_0_15px_rgba(251,191,36,0.4)]
                ${isNko ? 'group-hover/card:-rotate-45' : 'group-hover/card:rotate-45'}
              `}>
                <i className={`ph-bold text-lg ${isNko ? 'ph-arrow-left' : 'ph-arrow-right'}`}></i>
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}