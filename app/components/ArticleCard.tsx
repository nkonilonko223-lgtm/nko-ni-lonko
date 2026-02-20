"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "./LanguageProvider";
import { useState, useMemo } from "react";
// ✅ SÉCURITÉ : Import du type officiel pour le contenu riche
import { PortableTextBlock } from "@portabletext/types";

// --- INTERFACE STRICTE ET ROBUSTE ---
export interface ArticleCardProps {
  article: {
    title: string;
    // ✅ FLEXIBILITÉ : Accepte les deux formats de slug pour éviter les erreurs
    slug: { current: string } | string;
    publishedAt: string;
    excerpt?: string;
    category: string;
    authorName: string;
    authorImageUrl: string | null;
    mainImageUrl: string | null;
    // ✅ SÉCURITÉ : Plus de 'any', on utilise le type Sanity officiel
    body?: PortableTextBlock[]; 
  };
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

// --- FONCTIONS UTILITAIRES ---

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

// Fonction utilitaire pour extraire le texte brut d'un bloc PortableText
function getBlockText(block: PortableTextBlock): string {
  if (!block.children) return "";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return block.children.map((child: any) => child.text).join("");
}

// Calcul du temps de lecture sécurisé
function calculateRealReadingTime(body: PortableTextBlock[] | undefined): number {
  if (!body || !Array.isArray(body)) return 3; // Valeur par défaut
  
  const text = body.map(getBlockText).join(" ");
  const wordCount = text.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / 200);
  
  return minutes > 0 ? minutes : 1;
}

function getCategoryIcon(category: string): string {
  if (!category) return "ph-star";
  const normalizedKey = category.toLowerCase().trim();
  const foundKey = Object.keys(ICON_MAP).find(key => normalizedKey.includes(key));
  return foundKey ? ICON_MAP[foundKey] : "ph-star";
}

// Récupération intelligente de la catégorie N'Ko
function getNkoCategory(raw: string, dictMap: Record<string, string> | undefined): string {
  // 1. Essayer le dictionnaire dynamique (JSON)
  const dictKey = Object.keys(dictMap || {}).find(k => k.toLowerCase() === raw.toLowerCase());
  if (dictKey && dictMap) return dictMap[dictKey];
  
  // 2. Essayer la liste de secours "en dur"
  const hardKey = Object.keys(NKO_HARD_TRANSLATIONS).find(k => k.toLowerCase() === raw.toLowerCase());
  if (hardKey) return NKO_HARD_TRANSLATIONS[hardKey];

  // 3. Sinon rendre l'original
  return raw;
}

// ==============================================================================
// COMPOSANT PRINCIPAL
// ==============================================================================
export default function ArticleCard({ article }: ArticleCardProps) {
  const { t, lang } = useLanguage();
  
  // Calcul optimisé du temps de lecture
  const readTime = useMemo(() => calculateRealReadingTime(article.body), [article.body]);
  const isNko = lang === 'nko';
  const [isImageLoading, setIsImageLoading] = useState(true);

  // Gestion robuste du slug (String ou Objet)
  const slugCurrent = typeof article.slug === 'string' ? article.slug : article.slug.current;

  // --- LOGIQUE CATÉGORIE ---
  const rawCategory = article.category || 'Science';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const categoriesMap = (t.home?.categories || {}) as any;
  
  // Logique d'affichage finale
  const displayCategory = isNko 
    ? getNkoCategory(rawCategory, categoriesMap) 
    : rawCategory; 

  return (
    <Link 
      href={`/article/${slugCurrent}`} 
      className="group block h-full w-full outline-none transition-transform active:scale-[0.98]"
    >
      <article className="
        relative flex h-full flex-col overflow-hidden rounded-[20px] 
        bg-[#0b1121] border border-white/10
        transition-all duration-500 ease-out
        hover:-translate-y-2 
        hover:border-[#fbbf24]/40 
        hover:shadow-[0_15px_40px_-10px_rgba(251,191,36,0.15)]
        focus-visible:ring-2 focus-visible:ring-[#fbbf24]
      ">
        
        {/* --- ZONE IMAGE --- */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#1e293b]">
          
          {isImageLoading && article.mainImageUrl && (
            <div className="absolute inset-0 z-0 animate-pulse bg-slate-800" />
          )}

          {article.mainImageUrl ? (
            <Image
              src={article.mainImageUrl}
              alt={article.title}
              fill
              className={`
                object-cover transition-all duration-700 ease-out group-hover:scale-110
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
          
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0b1121] via-[#0b1121]/50 to-transparent opacity-80"></div>

          {/* Badge Catégorie */}
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

        {/* --- ZONE CONTENU --- */}
        <div className="flex flex-1 flex-col p-6">
          
          {/* Méta-données */}
          <div className="mb-4 flex items-center justify-between font-mono text-xs text-slate-500">
            <span className={`flex items-center gap-1.5 ${!isNko ? 'uppercase tracking-wide' : 'font-kigelia text-sm'}`}>
              {isNko 
                ? formatDateNkoFull(article.publishedAt) 
                : new Date(article.publishedAt).toLocaleDateString("fr-FR", { month: 'short', day: 'numeric', year: 'numeric' })
              }
            </span>
            <span className={`flex items-center gap-1.5 ${isNko ? 'font-kigelia text-sm' : ''}`}>
              <i className="ph-bold ph-hourglass-medium text-[#fbbf24]"></i>
              {isNko 
                ? <span className="text-base">{toNkoDigits(readTime)} ߡߌ߬ߛߍ߲</span> 
                : `${readTime} min`
              }
            </span>
          </div>

          {/* Titre */}
          <h3 className={`
            mb-3 font-bold text-slate-100 
            transition-colors duration-300 group-hover:text-[#fbbf24]
            ${isNko ? 'font-kigelia text-2xl leading-relaxed' : 'text-xl leading-snug'}
          `} style={{ direction: isNko ? "rtl" : "ltr" }}>
            <span className="line-clamp-2" title={article.title}>
              {article.title}
            </span>
          </h3>

          {/* Extrait */}
          <p className={`
            mb-6 flex-1 text-slate-400 line-clamp-3
            ${isNko ? 'text-right leading-loose text-base' : 'text-left leading-relaxed text-sm'}
          `} style={{ direction: isNko ? "rtl" : "ltr" }}>
            {article.excerpt || (isNko ? "ߞߣߐߘߐ ߣߌ߲߬ ߘߐߜߍ߫..." : "Découvrez les détails fascinants de cette recherche scientifique...")}
          </p>

          {/* Footer Carte */}
          <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-4">
            <div className={`flex items-center gap-3 ${isNko ? 'flex-row-reverse' : ''}`}>
              
              {/* Avatar Auteur */}
              <div className="relative h-9 w-9 overflow-hidden rounded-full border border-white/10 bg-white/5 shadow-inner">
                {article.authorImageUrl ? (
                  <Image src={article.authorImageUrl} alt={article.authorName} fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-800 text-slate-500">
                    <i className="ph-fill ph-user text-lg"></i>
                  </div>
                )}
              </div>

              {/* Infos Auteur avec logique N'Ko/FR */}
              <div className={`flex flex-col ${isNko ? 'items-end' : 'items-start'}`}>
                {isNko ? (
                  <>
                    <span className="font-kigelia text-sm font-bold text-slate-300">
                      {article.authorName}
                    </span>
                    <span className="font-kigelia text-xs text-slate-500">
                      ߓߟߏ
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] uppercase tracking-widest text-slate-500">
                      PAR
                    </span>
                    <span className="text-xs font-bold text-slate-300">
                      {article.authorName}
                    </span>
                  </>
                )}
              </div>
            </div>

            <span className={`
              flex h-10 w-10 items-center justify-center rounded-full 
              border border-white/10 bg-white/5 text-[#fbbf24] 
              transition-all duration-300 
              group-hover:bg-[#fbbf24] group-hover:text-black group-hover:scale-110
              ${isNko ? 'group-hover:-rotate-45' : 'group-hover:rotate-45'}
            `}>
              <i className={`ph-bold text-lg ${isNko ? 'ph-arrow-left' : 'ph-arrow-right'}`}></i>
            </span>
          </div>

        </div>
      </article>
    </Link>
  );
}