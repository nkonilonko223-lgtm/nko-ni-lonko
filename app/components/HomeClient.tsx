"use client";

import Image from "next/image";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ArticleCard from "./ArticleCard";
import SiteFooter from "./SiteFooter";
import { useLanguage } from "./LanguageProvider";


// ==============================================================================
// 1. CONFIGURATION VISUELLE
// ==============================================================================
// ==============================================================================
// 1. CONFIGURATION VISUELLE & PONT DE TRADUCTION
// ==============================================================================
const CATEGORY_ICONS: Record<string, string> = {
  astronomy: "ph-star",
  astronomie: "ph-star",
  physics: "ph-atom",
  physique: "ph-atom",
  biology: "ph-dna",
  biologie: "ph-dna",
  mathematics: "ph-function",
  "mathématiques": "ph-function",
  chemistry: "ph-flask",
  chimie: "ph-flask",
  geology: "ph-mountains",
  "géologie": "ph-mountains",
  technology: "ph-robot",
  technologie: "ph-robot",
 history: "ph-scroll",
  histoire: "ph-scroll",
  health: "ph-heartbeat",
  "santé": "ph-heartbeat",
  science: "ph-flask",
  // 🚀 NOUVEAU : Icône pour la Revue Mensuelle
  review: "ph-calendar-star",
  revue: "ph-calendar-star",
  default: "ph-hash",
};

// 🚀 LE PONT INVERSE (Traduit le N'Ko de Sanity vers la clé JSON)
const CATEGORY_REVERSE_MAP: Record<string, string> = {
  'ߛߊ߲ߡߊߛߓߍߟߐ߲ߘߐߦߊ': 'astronomy',
  'ߘߐ߬ߞߏ': 'physics',
  'ߣߌߡߊߞߊߙߊ߲': 'biology',
  'ߘߡߊ߬ߟߐ߲': 'mathematics',
  'ߖߎ߯ߛߊߟߐ߲ߘߐߦߊ': 'chemistry',
  'ߘߎ߰ߘߐ߬ߟߐ߲ߘߐߦߊ': 'geology',
  'ߛߋߒߞߏߟߊߘߐߦߊ': 'technology',
  'ߘߐ߬ߝߐ': 'history',
  'ߞߍ߲ߘߍߦߊ': 'health',
  // 🚀 NOUVEAU : Pont pour la Revue Mensuelle
  'ߝߐ߬ߓߍ߬ߝߐߓߍ ߞߊߙߏߟߞߊ': 'review',
};

const ARTICLES_PER_PAGE = 6;

// ==============================================================================
// 2. TYPAGE STRICT (Standard 1/1000 - Zéro 'any')
// ==============================================================================
interface HomeArticle {
  title: string;
  slug: string;
  mainImageUrl: string | null;
  publishedAt: string;
  excerpt: string;
  category: string;
  authorName: string;
  authorNameNko: string | null; // 🚀 NOUVEAU : Synchronisé avec la base de données
  authorImageUrl: string | null;
  readingTime: number; // 🚀 NOUVEAU : Synchronisé pour le temps de lecture
  // 🚀 OPTIMISATION : 'body' a été supprimé pour correspondre à page.tsx et alléger la mémoire
}

interface TranslationData {
  metadata?: { siteName?: string };
  home?: {
    allCategories?: string;
    loadMore?: string;
    hero: { title: string; subtitle: string; cta: string };
    featured: { title: string; viewAll: string };
    categories: Record<string, string>;
  };
  search?: { placeholder?: string; noResults?: string; noArticles?: string };
  nav: { home: string; articles: string; about: string; contact: string };
}
// ==============================================================================
// 3. HOOKS UTILITAIRES
// ==============================================================================

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

function useScrollDetection(threshold: number = 50): boolean {
  const [scrolled, setScrolled] = useState(false);
  const scrolledRef = useRef(false); // 🚀 MÉMOIRE SILENCIEUSE 1/1000

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > threshold;
      
      // 🚀 ALGORITHME "EDGE-CROSSING" : On ne réveille React QUE si l'état change réellement.
      // Fin de l'étouffement du processeur sur mobile !
      if (isScrolled !== scrolledRef.current) {
        scrolledRef.current = isScrolled;
        setScrolled(isScrolled);
      }
    };
    
    // Écoute passive pour ne pas bloquer le défilement tactile
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Initialisation silencieuse au chargement
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return scrolled;
}

function useParallax() {
  const spaceRef = useRef<HTMLDivElement>(null);
  const patternRef = useRef<HTMLDivElement>(null);
  const baobabRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 900px) and (hover: hover)");
    if (!mediaQuery.matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const x = (window.innerWidth - e.pageX) / 100;
        const y = (window.innerHeight - e.pageY) / 100;
        if (spaceRef.current) spaceRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(1.05)`;
        if (patternRef.current) patternRef.current.style.transform = `translate3d(${x * 1.5}px, ${y * 1.5}px, 0)`;
        if (baobabRef.current) baobabRef.current.style.transform = `translate3d(${x * 0.5}px, ${y * 0.5}px, 0)`;
        rafRef.current = 0;
      });
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);
  return { spaceRef, patternRef, baobabRef };
}

function useRevealObserver() {
  const observerRef = useRef<IntersectionObserver | null>(null);
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    return () => observerRef.current?.disconnect();
  }, []);

  const observeElements = useCallback(() => {
    requestAnimationFrame(() => {
      document.querySelectorAll(".reveal:not(.active)").forEach((el) => {
        observerRef.current?.observe(el);
      });
    });
  }, []);
  return observeElements;
}

// ==============================================================================
// 4A. L'ARME SECRÈTE 0.1/1000 : LE LOGO MAGNÉTIQUE (VERSION PURE)
// ==============================================================================
interface MagneticLogoProps {
  siteName: string;
  isNko: boolean;
}

function MagneticLogo({ siteName, isNko }: MagneticLogoProps) {
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handlePointerDown = () => {
    // 🚀 Le Secret du Bâtisseur : Redirection directe vers la vraie page About
    timerRef.current = setTimeout(() => {
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([100, 50, 100]);
      router.push("/about");
      timerRef.current = null;
    }, 600);
  };

  const handlePointerUp = () => {
    // Clic standard : Remonte doucement en haut de la page d'accueil
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(30);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div 
      className="brand group flex items-center gap-2 cursor-pointer touch-none select-none"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      aria-label="Retour à l'accueil"
      role="button"
      tabIndex={0}
    >
      <div className="relative flex items-center justify-center p-0.5 rounded-lg border border-white/10 bg-white/5 transition-all duration-300 group-hover:border-[#fbbf24]/50 group-hover:shadow-[0_0_10px_rgba(251,191,36,0.2)] overflow-hidden">
        <div className="absolute inset-0 bg-[#fbbf24] blur-md opacity-10 group-hover:opacity-30 transition-opacity"></div>
        <Image 
          src="/icon-192x192.png" 
          alt={siteName} 
          width={34} 
          height={34} 
          className="rounded-md relative z-10 transition-transform group-active:scale-90"
          priority
        />
      </div>
      <span className={`transition-colors group-hover:text-[#fbbf24] ${isNko ? "font-kigelia" : ""}`}>
        {siteName}
      </span>
    </div>
  );
}

// ==============================================================================
// 4B. COMPOSANT MOBILE OVERLAY
// ==============================================================================
interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  nav: { home: string; articles: string; about: string; contact: string };
  showInstallBtn?: boolean;
  onInstallClick?: () => void;
  isNko?: boolean;
}
function MobileMenu({ isOpen, onClose, nav, showInstallBtn, onInstallClick, isNko }: MobileMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !menuRef.current) return;
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <div
      ref={menuRef}
      role="dialog"
      aria-modal="true"
      aria-label="Menu de navigation"
      className={`fixed inset-0 z-[9999] flex flex-col overscroll-contain bg-[#02040a]/95 backdrop-blur-3xl transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none"
      }`}
    >
      <button
        className="absolute top-6 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white hover:bg-[#fbbf24] hover:text-black hover:border-[#fbbf24] transition-all duration-300"
        onClick={onClose}
        aria-label="Fermer le menu"
      >
        <i className="ph-bold ph-x text-2xl" aria-hidden="true"></i>
      </button>

      <div className="flex flex-col items-center justify-center h-full w-full px-8 pb-12">
        <div className="w-24 h-24 mb-10 relative flex items-center justify-center p-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-[1.5rem] shadow-[inset_0_0_20px_rgba(251,191,36,0.05)]">
            <div className="absolute inset-0 bg-[#fbbf24] blur-xl opacity-20 rounded-full animate-pulse"></div>
            <Image src="/icon-192x192.png" alt="Sceau N'Ko ni Lonko" width={96} height={96} className="relative z-10 drop-shadow-lg" />
        </div>

        <nav aria-label="Menu principal mobile" className="w-full max-w-sm">
          <ul className="flex flex-col gap-6 text-center w-full">
            {showInstallBtn && onInstallClick && (
              <li className="mb-4 pb-6 border-b border-white/10">
                <button 
                  onClick={() => { onInstallClick(); onClose(); }}
                  className="w-full group relative px-6 py-4 rounded-2xl bg-[#fbbf24]/10 border border-[#fbbf24]/30 hover:bg-[#fbbf24] transition-all duration-500 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.15)] overflow-hidden"
                >
                  <div className="absolute inset-0 bg-[#fbbf24]/20 blur-xl animate-pulse group-hover:opacity-0 transition-opacity"></div>
                  <i className="ph-bold ph-download-simple text-3xl text-[#fbbf24] group-hover:text-black mb-2 relative z-10" aria-hidden="true"></i>
                  <span className={`text-[#fbbf24] group-hover:text-black font-bold text-lg relative z-10 ${isNko ? "font-kigelia" : ""}`}>
                    {isNko ? "ߊ߬ ߟߊߖߌ߰ ߜߋߟߋ߲ߜߋߟߋ߲ ߞߣߐ߫" : "Installer l'application"}
                  </span>
                </button>
              </li>
            )}
            {[
              { href: "/", label: nav.home, active: true },
              { href: "#articles", label: nav.articles },
              { href: "/about", label: nav.about },
              { href: "/contact", label: nav.contact }
            ].map((link, i) => (
              <li key={i} className="w-full">
                {link.href.startsWith('#') ? (
                  <a href={link.href} onClick={onClose} className={`block text-2xl md:text-3xl font-light tracking-wide transition-colors ${link.active ? "text-[#fbbf24] font-bold" : "text-gray-300 hover:text-white"} ${isNko ? "font-kigelia text-3xl" : ""}`}>
                    {link.label}
                  </a>
                ) : (
                  <Link href={link.href} onClick={onClose} className={`block text-2xl md:text-3xl font-light tracking-wide transition-colors ${link.active ? "text-[#fbbf24] font-bold" : "text-gray-300 hover:text-white"} ${isNko ? "font-kigelia text-3xl" : ""}`}>
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

// ==============================================================================
// 5. COMPOSANT PRINCIPAL
// ==============================================================================
export default function HomeClient({ articles }: { articles: HomeArticle[] }) {
  const { t, lang, toggleLanguage } = useLanguage();
  const isNko = lang === "nko";
  
  const typedT = t as unknown as TranslationData;

  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showVerifyToast, setShowVerifyToast] = useState(false); // 🚀 NOUVEAU : Le déclencheur du Toast
  
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(ARTICLES_PER_PAGE);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  const scrolled = useScrollDetection(50);
  const { spaceRef, patternRef, baobabRef } = useParallax();
  const observeElements = useRevealObserver();
  const debouncedQuery = useDebounce(searchQuery, 300);

  const triggerVibration = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }
  }, []);

  const scrollToArticlesGrid = useCallback(() => {
    setTimeout(() => {
      const articlesSection = document.getElementById('articles');
      if (articlesSection) {
        const offset = 100;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = articlesSection.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
      }
    }, 50);
  }, []);

  const handleCategoryChange = useCallback((key: string) => {
    triggerVibration();
    setActiveCategory(key);
    setVisibleCount(ARTICLES_PER_PAGE);
    scrollToArticlesGrid();
  }, [scrollToArticlesGrid, triggerVibration]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
      setVisibleCount(ARTICLES_PER_PAGE);
    },
    []
  );

  const handleSearchClear = useCallback(() => {
    triggerVibration();
    setSearchQuery("");
    setVisibleCount(ARTICLES_PER_PAGE);
    scrollToArticlesGrid();
  }, [scrollToArticlesGrid, triggerVibration]);
  const handleDropdownToggle = useCallback(() => {
  triggerVibration();
  setDropdownOpen((prev) => !prev);
}, [triggerVibration]);

const handleCategorySelect = useCallback((key: string) => {
  triggerVibration();
  handleCategoryChange(key);
  setDropdownOpen(false);
}, [handleCategoryChange, triggerVibration]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    triggerVibration();
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowInstallBtn(false);
    }
    setDeferredPrompt(null);
  };

  const filteredArticles = useMemo(() => {
    const normalizedSearch = debouncedQuery.toLowerCase().trim();
    return articles.filter((article) => {
      let matchesCategory = true;
      if (activeCategory !== "all") {
        const artCatRaw = (article.category || "").trim();
        // On convertit le N'Ko de Sanity en clé universelle (ex: "astronomy")
        const artCatKey = CATEGORY_REVERSE_MAP[artCatRaw] || artCatRaw.toLowerCase();
        // On compare cette clé avec la catégorie cliquée
        matchesCategory = artCatKey === activeCategory.toLowerCase();
      }
      let matchesSearch = true;
      if (normalizedSearch) {
        matchesSearch =
          article.title.toLowerCase().includes(normalizedSearch) ||
          article.excerpt.toLowerCase().includes(normalizedSearch);
      }
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, debouncedQuery, articles]);

  useEffect(() => {
    if (articles.length > 0) {
      const timer = setTimeout(() => setLoading(false), 400);
      return () => clearTimeout(timer);
    }
    const maxTimer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(maxTimer);
  }, [articles]);

  // 🚀 RADAR 1/1000 : Intercepte la confirmation sans alerter ESLint
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("verified") === "true") {
        // Le délai de 10ms empêche le bug "cascading render" de React
        setTimeout(() => {
          triggerVibration();
          setShowVerifyToast(true);
        }, 10);
        
        // Nettoyage : On efface "?verified=true" de l'URL silencieusement
        window.history.replaceState(null, "", window.location.pathname);
        
        // Disparition après 6 secondes
        setTimeout(() => setShowVerifyToast(false), 6000);
      }
    }
  }, [triggerVibration]);
  
  // 🚀 RADAR 1/1000 : On ajoute "lang" pour qu'il relance les animations à chaque traduction
  useEffect(() => {
    observeElements();
  }, [filteredArticles, visibleCount, observeElements, lang]);
  // Fermeture dropdown (ESC + click outside)
useEffect(() => {
  if (!dropdownOpen) return;
  
  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape') setDropdownOpen(false);
  };
  
  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.category-dropdown-wrapper')) {
      setDropdownOpen(false);
    }
  };
  
  document.addEventListener('keydown', handleEsc);
  document.addEventListener('click', handleClickOutside);
  
  return () => {
    document.removeEventListener('keydown', handleEsc);
    document.removeEventListener('click', handleClickOutside);
  };
}, [dropdownOpen]);

  const getCategoryIconClass = useCallback((key: string) => {
    const normalizedKey = key.toLowerCase();
    const iconKey = Object.keys(CATEGORY_ICONS).find((k) => normalizedKey.includes(k)) || "default";
    return CATEGORY_ICONS[iconKey] || CATEGORY_ICONS["default"];
  }, []);

  const siteName = typedT.metadata?.siteName || "Kiba";
  const categories = typedT.home?.categories || {};
  const visibleArticles = filteredArticles.slice(0, visibleCount);
  const MAX_ARTICLES_HOMEPAGE = 36;
const hasMore = visibleCount < filteredArticles.length && visibleCount < MAX_ARTICLES_HOMEPAGE;

  return (
    <>
      <a href="#articles" className="skip-to-content">
        {isNko ? "ߥߊ߫ ߞߣߐߘߐ ߝߟߍ߫" : "Aller au contenu"}
      </a>

      <div
        id="preloader"
        role="status"
        aria-live="polite"
        aria-label={isNko ? "ߟߊߖߛߐߟߌ ߦߋ߫ ߞߊ߬ ߞߍ߫..." : "Chargement en cours..."}
        data-loaded={!loading}
      >
        <div className="loader-symbol" aria-hidden="true">ߒ</div>
        <div className="loader-line" aria-hidden="true"></div>
        <span className="sr-only">
          {isNko ? "ߟߊߖߛߐߟߌ ߦߋ߫ ߞߊ߬ ߞߍ߫..." : "Chargement en cours..."}
        </span>
      </div>

      {/* 🚀 L'INJECTION DU RÉACTEUR (Optimisation AVIF Extrême 1/1000) */}
      <div className="cosmic-background" aria-hidden="true">
        
        {/* 1. Jams Webb : Qualité baissée à 60 (Invisible sous le filtre noir) */}
        <div className="bg-layer-space" ref={spaceRef} style={{ backgroundImage: 'none' }}>
          <Image 
            src="/jams-webb.png" 
            alt="Espace cosmique" 
            fill 
            priority 
            quality={60}
            sizes="100vw"
            className="object-cover"
          />
        </div>

        {/* 2. Le motif répétitif (Généralement léger, on le laisse gérer par le CSS pour le repeat) */}
        <div className="bg-layer-pattern" ref={patternRef}></div>

        {/* 3. Le Baobab : Qualité baissée à 60 (Invisible sous le filtre noir) */}
        <div className="bg-layer-baobab" ref={baobabRef} style={{ backgroundImage: 'none' }}>
          <Image 
            src="/le-baobaob.png" 
            alt="Baobab de la connaissance" 
            fill 
            priority 
            quality={60}
            sizes="100vw"
            className="object-cover"
          />
        </div>

        <div className="bg-overlay"></div>
      </div>

      <nav
        className={scrolled ? "scrolled" : ""}
        role="navigation"
        aria-label={isNko ? "ߛߏ߯ߓߊߟߌߟߊ ߢߣߊߡߊ" : "Navigation principale"}
      >
        {/* 🚀 L'INJECTION DU LOGO MAGNÉTIQUE ICI */}
        <MagneticLogo 
          siteName={siteName} 
          isNko={isNko} 
        />

        <ul className="nav-links">
          <li className="nav-item">
            <Link href="/" aria-current="page">{typedT.nav.home}</Link>
          </li>
          <li className="nav-item">
            <a href="#articles">{typedT.nav.articles}</a>
          </li>
          <li className="nav-item">
            <Link href="/about">{typedT.nav.about}</Link>
          </li>
          <li className="nav-item">
            <Link href="/contact">{typedT.nav.contact}</Link>
          </li>
        </ul>

        <div className="nav-actions">
          {showInstallBtn && (
            <button
              className="hidden md:flex btn-lang relative group overflow-hidden" // 🚀 MODIF 1/1000: "hidden md:flex" (Caché sur mobile, visible PC)
              onClick={handleInstallClick}
              aria-label={isNko ? "ߊ߬ ߟߊߖߌ߰" : "Installer l'application"}
              style={{ color: "var(--color-gold)", borderColor: "var(--color-gold)" }}
            >
              <div className="absolute inset-0 bg-[#fbbf24] blur-md opacity-20 group-hover:opacity-40 animate-pulse transition-opacity pointer-events-none"></div>
              <i className="ph-bold ph-download-simple relative z-10" aria-hidden="true"></i>
              <span className={`relative z-10 ml-1.5 ${isNko ? "font-kigelia" : ""}`}>
                {isNko ? "ߊ߬ ߟߊߖߌ߰" : "Installer"}
              </span>
            </button>
          )}

         <button
            className="btn-lang group relative flex items-center gap-2 overflow-hidden transition-all duration-500 hover:border-[#fbbf24]/50 hover:bg-white/5 hover:shadow-[0_0_15px_rgba(251,191,36,0.2)] active:text-[#fbbf24]"
            onClick={() => { triggerVibration(); toggleLanguage(); }}
            aria-label={isNko ? "Changer la langue en Français" : "ߞߊ߲ ߦߟߍ߬ߡߊ ߒߞߏ ߘߐ߫"}
          >
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full"></div>
            
            {/* 🚀 MODIF 1/1000 : L'icône a maintenant "text-[#fbbf24]" EN PERMANENCE */}
            <i 
              className={`ph ph-translate transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] text-[#fbbf24] ${isNko ? 'rotate-[360deg] scale-110' : 'rotate-0 scale-100'}`} 
              aria-hidden="true"
            ></i>

            <div className="relative flex h-[20px] w-[35px] items-center justify-center">
               <span className={`absolute transition-all duration-500 font-bold ${isNko ? 'opacity-0 scale-50 -translate-y-4' : 'opacity-100 scale-100 translate-y-0 text-[#fbbf24]'}`}>
                 FR
               </span>
               <span className={`absolute font-kigelia font-bold text-[#fbbf24] transition-all duration-500 ${isNko ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 translate-y-4'}`}>
                 ߒߞߏ
               </span>
            </div>
          </button>

          <button
            className="mobile-toggle"
            onClick={() => { triggerVibration(); setMobileMenuOpen(true); }}
            aria-label={isNko ? "ߡߍߣߎ ߟߊߝߍ" : "Ouvrir le menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <i className="ph ph-list" aria-hidden="true"></i>
          </button>
        </div>
      </nav>

      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        nav={typedT.nav}
        showInstallBtn={showInstallBtn}
        onInstallClick={handleInstallClick}
        isNko={isNko}
      />

      {/* 🚀 TOAST DE TRIOMPHE (Abonnement Confirmé) */}
      <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[9999] transition-all duration-700 ease-out print:hidden ${showVerifyToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'}`}>
        <div className="bg-black/95 backdrop-blur-xl border border-green-500/50 text-green-400 px-6 py-4 rounded-full shadow-[0_10px_40px_rgba(34,197,94,0.2)] flex items-center gap-3">
          <i className="ph-fill ph-check-circle text-2xl animate-pulse"></i>
          <span className={`text-sm md:text-base font-bold tracking-wide ${isNko ? 'font-kigelia text-lg' : ''}`}>
            {isNko ? 'ߌ ߣߌ߫ ߗߋ߫ ߸ ߌ ߓߘߊ߫ ߟߊߜߊ߲ߞߎ߲߫ ߞߏߢߊ߬ !' : 'Félicitations, votre abonnement est confirmé !'}
          </span>
        </div>
      </div>

      <header className="hero pt-24 pb-2 md:py-0 flex flex-col justify-center min-h-[40vh] md:min-h-[70vh]">
        {/* 🚀 MODIF 1/1000 : Clé "key" pour forcer la réanimation fluide sans bug fantôme */}
        <h1 key={`title-${lang}`} className={`reveal mb-1 md:mb-6 ${isNko ? "font-kigelia text-6xl md:text-8xl leading-normal" : "text-4xl md:text-6xl leading-tight"}`}>
          {typedT.home?.hero?.title}
        </h1>
        
        <p key={`sub-${lang}`} className="reveal text-base md:text-xl max-w-md md:max-w-2xl mx-auto opacity-80 mb-4 md:mb-10" style={{ transitionDelay: "0.15s" }}>
          {typedT.home?.hero?.subtitle}
        </p>
        
        <a
          key={`btn-${lang}`}
          href="#articles"
          className="cta-btn reveal"
          style={{ transitionDelay: "0.3s" }}
          onClick={triggerVibration}
        >
          <span>{typedT.home?.hero?.cta}</span>
          <i className="ph-bold ph-arrow-down" aria-hidden="true"></i>
        </a>
      </header>

      <section className="search-container reveal" aria-label={isNko ? "ߢߌߣߌ߲ ߞߊߟߊ߫" : "Barre de recherche"}>
        <div className="search-bar">
          <i className="ph ph-magnifying-glass" aria-hidden="true" style={{ fontSize: "1.3rem", color: "var(--color-gold)", flexShrink: 0 }}></i>
          <input
            type="search"
            // 🚀 MODIF 1/1000: Cache la croix native + Alignement Intelligent (Auto-detect)
            className="search-input [&::-webkit-search-cancel-button]:hidden"
            placeholder={typedT.search?.placeholder || (isNko ? "ߢߌ߬ߣߌ߲..." : "Rechercher...")}
            dir={searchQuery ? (/[\u07C0-\u07FA]/.test(searchQuery) ? "rtl" : "ltr") : (isNko ? "rtl" : "ltr")}
            value={searchQuery}
            onChange={handleSearchChange}
            aria-label={isNko ? " ߞߎߡߘߊ ߢߌ߲ߣߌ߫" : "Rechercher des articles"}
          />
          {searchQuery && (
            <button
              onClick={handleSearchClear}
              className="search-btn animate-in fade-in zoom-in duration-300"
              aria-label={isNko ? "ߢߌ߲ߣߌ߲ߠߌ ߝߘߏ߬" : "Effacer la recherche"}
              style={{ background: "transparent", color: "var(--color-text-muted)", width: "44px", height: "44px" }}
            >
              {/* C'est ta croix personnalisée (la seule visible désormais) */}
              <i className="ph-fill ph-x-circle hover:text-[#fbbf24] transition-colors" aria-hidden="true"></i>
            </button>
          )}
          <button className="search-btn" aria-label={isNko ? "ߢߊߢߌ߬ߣߌ߲߫" : "Rechercher"} onClick={triggerVibration}>
            <i className={`ph-bold ${isNko ? "ph-arrow-left" : "ph-arrow-right"}`} aria-hidden="true"></i>
          </button>
        </div>
      </section>

{/* 🚀 MODIF 1/1000: Wrapper relatif pour les masques de scroll */}
      {/* MOBILE: Dropdown Custom Premium */}
<div className="md:hidden w-full mb-6 px-6">
  <div className="category-dropdown-wrapper">
    <button
      onClick={handleDropdownToggle}
      className={`category-dropdown-trigger ${dropdownOpen ? 'active' : ''} ${isNko ? 'font-kigelia' : ''}`}
      aria-expanded={dropdownOpen}
      aria-label={isNko ? "ߛߎ߯ߦߊ ߓߟߐߡߊ ߟߎ߬" : "Filtrer par catégorie"}
    >
      <span className="flex items-center gap-2">
        <i className="ph-bold ph-squares-four"></i>
        {activeCategory === 'all' 
          ? (isNko ? 'ߛߎ߯ߦߊ ߟߎ߬ ߓߍ߯' : 'Toutes les catégories')
          : categories[activeCategory] || activeCategory
        }
      </span>
      <i className="ph-bold ph-caret-down"></i>
    </button>

    {/* Overlay */}
    <div 
      className={`category-dropdown-overlay ${dropdownOpen ? 'open' : ''}`}
      onClick={() => setDropdownOpen(false)}
      aria-hidden="true"
    />

    {/* Menu */}
    <div className={`category-dropdown-menu ${dropdownOpen ? 'open' : ''}`}>
      {/* Toutes */}
      <div
        onClick={() => handleCategorySelect('all')}
        className={`category-dropdown-option ${activeCategory === 'all' ? 'active' : ''} ${isNko ? 'font-kigelia' : ''}`}
      >
        <i className="ph-bold ph-squares-four"></i>
        <span>{isNko ? 'ߛߎ߯ߦߊ ߟߎ߬ ߓߍ߯' : 'Toutes les catégories'}</span>
      </div>

      {/* Revue Mensuelle (Premium) - Position 2 */}
      <div
        onClick={() => handleCategorySelect('review')}
        className={`category-dropdown-option premium ${activeCategory === 'review' ? 'active' : ''} ${isNko ? 'font-kigelia' : ''}`}
      >
        <i className="ph-bold ph-calendar-star"></i>
        <span>{isNko ? 'ߝߐ߬ߓߍ߬ߝߐߓߍ ߞߊߙߏߟߞߊ' : 'Revue Mensuelle'}</span>
      </div>

      {/* Autres catégories */}
      {Object.entries(categories)
        .filter(([key]) => key !== 'review')
        .map(([key, label]) => (
          <div
            key={key}
            onClick={() => handleCategorySelect(key)}
            className={`category-dropdown-option ${activeCategory === key ? 'active' : ''} ${isNko ? 'font-kigelia' : ''}`}
          >
            <i className={`ph-bold ${getCategoryIconClass(key)}`}></i>
            <span>{label}</span>
          </div>
        ))}
    </div>
  </div>
</div>

{/* DESKTOP: Pills (masqué sur mobile) */}
<div className="relative w-full md:w-auto hidden md:block">
  <div
    className="categories-wrapper reveal flex flex-wrap"
    role="group"
    aria-label={isNko ? "ߛߎ߯ߦߊ ߓߟߐߡߊ ߟߎ߬" : "Filtrer par catégorie"}
  >
          <button
            className={`category-pill snap-start shrink-0 touch-manipulation ${activeCategory === "all" ? "active" : ""}`}
            onClick={() => handleCategoryChange("all")}
            aria-pressed={activeCategory === "all"}
          >
            <i className="ph-bold ph-squares-four" aria-hidden="true"></i>
            <span>{typedT.home?.allCategories || (isNko ? "ߓߍ߯" : "Tout")}</span>
          </button>

          {Object.entries(categories).map(([key, label]) => {
            // 🚀 LE RADAR DE L'ÉLITE : Si c'est la Revue Mensuelle, on active la Pépite d'Or
            const isPremium = key === "review";
            
            return (
              <button
                key={key}
                className={`category-pill ${isPremium ? "premium" : ""} snap-start shrink-0 touch-manipulation ${activeCategory === key ? "active" : ""}`}
                onClick={() => handleCategoryChange(key)}
                aria-pressed={activeCategory === key}
              >
                <i className={`ph-bold ${getCategoryIconClass(key)}`} aria-hidden="true"></i>
                <span className={isNko ? "font-kigelia" : ""}>{label}</span>
              </button>
            );
          })}
        </div>
      </div>
      
<div className="section-header items-baseline" id="articles">
        {/* 🚀 MODIF 1/1000 : Écart réduit (Léger)
            - Français : text-xl
            - N'Ko : text-2xl (Juste un cran au-dessus pour la compensation optique)
        */}
        <h2 className={`reveal font-bold mb-0 ${isNko ? "font-kigelia text-2xl md:text-4xl leading-normal" : "text-xl md:text-3xl"}`}>
          {typedT.home?.featured?.title}
        </h2>
        
        {/* 🚀 MODIF 1/1000 : Écart réduit (Léger)
            - Français : text-sm
            - N'Ko : text-base (Taille standard, juste au-dessus de sm)
            (Remplacement du Link par une ancre pour éviter l'erreur 404 de pré-chargement Next.js)
        */}
        <a 
          href="#articles-grid" 
          onClick={triggerVibration}
          className={`reveal text-[#fbbf24]/90 hover:text-[#fbbf24] transition-colors font-normal ml-4 ${isNko ? "font-kigelia text-base tracking-wider" : "text-sm tracking-wide"}`}
        >
          {typedT.home?.featured?.viewAll}
        </a>
      </div>

      <div className="grid-container" id="articles-grid">
        {visibleArticles.map((article, index) => (
          <div key={article.slug} className="reveal" style={{ transitionDelay: `${index * 0.08}s` }}>
            <ArticleCard article={article} />
          </div>
        ))}

        {filteredArticles.length === 0 && (
          <div className="empty-state animate-in fade-in duration-500" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "80px 20px", color: "var(--color-text-subtle)" }}>
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-[#fbbf24] blur-xl opacity-10 rounded-full animate-pulse"></div>
              <i className="ph-fill ph-magnifying-glass relative z-10 animate-[bounce_3s_infinite]" aria-hidden="true" style={{ fontSize: "4rem", color: "var(--color-gold)", opacity: 0.8 }}></i>
            </div>
            <p style={{ fontSize: "1.1rem" }}>
              {debouncedQuery
                ? typedT.search?.noResults
                  ? typedT.search.noResults.replace("{query}", debouncedQuery)
                  : isNko
                    ? `ߝߋ߲߫ ߡߊ߫ ߛߐ߬ߘߐ߲߬ "${debouncedQuery}" ߞߏ ߘߐ߫.`
                    : `Aucun résultat pour "${debouncedQuery}"`
                : typedT.search?.noArticles || (isNko ? "ߞߎߡߘߊ߫ ߛߌ߫ ߡߊ߫ ߛߐ߬ߘߐ߲߬." : "Aucun article trouvé.")}
            </p>
          </div>
        )}
      </div>

     <div style={{ textAlign: "center", marginBottom: "80px" }}>
  {hasMore ? (
    <button
      className="cta-btn touch-manipulation"
      onClick={() => { triggerVibration(); setVisibleCount((prev) => prev + ARTICLES_PER_PAGE); }}
      style={{
        background: "var(--gradient-panel)", color: "var(--color-gold)",
        border: "1px solid var(--color-border)", fontSize: "1rem", padding: "16px 40px",
      }}
    >
      <span className={isNko ? "font-kigelia" : ""}>
        {typedT.home?.loadMore || (isNko ? "ߘߏ߫ ߜߘߍ߫ ߟߎ߫ ߦߋ߫" : "Voir plus")}
      </span>
      <i className="ph-bold ph-caret-down" aria-hidden="true"></i>
    </button>
  ) : filteredArticles.length > MAX_ARTICLES_HOMEPAGE ? (
    <Link href="/articles" className="cta-btn touch-manipulation" style={{
      background: "var(--gradient-panel)", color: "var(--color-gold)",
      border: "1px solid var(--color-border)", fontSize: "1rem", padding: "16px 40px",
    }}>
      <span className={isNko ? "font-kigelia" : ""}>
        {isNko ? "ߞߎߡߘߊ ߓߍ߯ ߦߋ߫" : "Voir toutes les publications"}
      </span>
      <i className={`ph-bold ${isNko ? "ph-arrow-left" : "ph-arrow-right"}`} aria-hidden="true"></i>
    </Link>
  ) : null}
</div>

      <SiteFooter activeCategory={activeCategory} setActiveCategory={handleCategoryChange} />
    </>
  );
}