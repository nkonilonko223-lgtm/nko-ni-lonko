"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import ArticleCard from "./ArticleCard";
import SiteFooter from "./SiteFooter";
import { useLanguage } from "./LanguageProvider";
import { PortableTextBlock } from "@portabletext/types";

// ==============================================================================
// 1. CONFIGURATION VISUELLE
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
  default: "ph-hash",
};

const ARTICLES_PER_PAGE = 6;

// ==============================================================================
// 2. TYPAGE
// ==============================================================================
interface HomeArticle {
  title: string;
  slug: string;
  mainImageUrl: string | null;
  publishedAt: string;
  excerpt: string;
  category: string;
  authorName: string;
  authorImageUrl: string | null;
  body: PortableTextBlock[];
}

// ==============================================================================
// 3. HOOKS UTILITAIRES
// ==============================================================================

/**
 * Debounce une valeur avec un délai configurable.
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Gère la détection de scroll avec throttle via RAF.
 */
function useScrollDetection(threshold: number = 50): boolean {
  const [scrolled, setScrolled] = useState(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        setScrolled(window.scrollY > threshold);
        rafRef.current = 0;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [threshold]);

  return scrolled;
}

/**
 * Parallaxe via useRef + RAF. Zéro manipulation DOM directe.
 */
function useParallax() {
  const spaceRef = useRef<HTMLDivElement>(null);
  const patternRef = useRef<HTMLDivElement>(null);
  const baobabRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    // Pas de parallaxe sur mobile/tactile
    const mediaQuery = window.matchMedia("(min-width: 900px) and (hover: hover)");
    if (!mediaQuery.matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        const x = (window.innerWidth - e.pageX) / 100;
        const y = (window.innerHeight - e.pageY) / 100;

        if (spaceRef.current) {
          spaceRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(1.05)`;
        }
        if (patternRef.current) {
          patternRef.current.style.transform = `translate3d(${x * 1.5}px, ${y * 1.5}px, 0)`;
        }
        if (baobabRef.current) {
          baobabRef.current.style.transform = `translate3d(${x * 0.5}px, ${y * 0.5}px, 0)`;
        }
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

/**
 * IntersectionObserver stable — ne se recrée pas à chaque filtrage.
 */
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

  // Callback pour observer de nouveaux éléments après un rendu
  const observeElements = useCallback(() => {
    // Petit délai pour laisser le DOM se mettre à jour
    requestAnimationFrame(() => {
      document.querySelectorAll(".reveal:not(.active)").forEach((el) => {
        observerRef.current?.observe(el);
      });
    });
  }, []);

  return observeElements;
}

// ==============================================================================
// 4. COMPOSANT MOBILE OVERLAY
// ==============================================================================
interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  nav: {
    home: string;
    articles: string;
    about: string;
    contact: string;
  };
}

function MobileMenu({ isOpen, onClose, nav }: MobileMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Focus trap : piège le focus dans le menu quand ouvert
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;

    const menu = menuRef.current;
    const focusableElements = menu.querySelectorAll<HTMLElement>(
      'a, button, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus le bouton fermer à l'ouverture
    firstElement?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    // Empêche le scroll du body
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <div
      ref={menuRef}
      role="dialog"
      aria-modal="true"
      aria-label="Menu de navigation"
      className={`mobile-overlay ${isOpen ? "mobile-overlay--open" : ""}`}
      // Clic sur le fond ferme le menu
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button
        className="mobile-overlay__close"
        onClick={onClose}
        aria-label="Fermer le menu"
      >
        <i className="ph-bold ph-x" aria-hidden="true"></i>
      </button>

      <nav aria-label="Menu principal mobile">
        <ul className="mobile-overlay__links">
          <li>
            <Link href="/" onClick={onClose}>
              {nav.home}
            </Link>
          </li>
          <li>
            <a href="#articles" onClick={onClose}>
              {nav.articles}
            </a>
          </li>
          <li>
            <Link href="/about" onClick={onClose}>
              {nav.about}
            </Link>
          </li>
          <li>
            <Link href="/contact" onClick={onClose}>
              {nav.contact}
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

// ==============================================================================
// 5. COMPOSANT PRINCIPAL
// ==============================================================================
export default function HomeClient({ articles }: { articles: HomeArticle[] }) {
  const { t, lang, toggleLanguage } = useLanguage();
  const isNko = lang === "nko";

  // --- ÉTATS ---
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(ARTICLES_PER_PAGE);

  // --- HOOKS CUSTOM ---
  const scrolled = useScrollDetection(50);
  const { spaceRef, patternRef, baobabRef } = useParallax();
  const observeElements = useRevealObserver();
  const debouncedQuery = useDebounce(searchQuery, 300);

  // ==========================================================================
  // EVENT HANDLERS — Remplacent le useEffect(setState) interdit par ESLint
  // ==========================================================================

  /**
   * Change la catégorie active ET reset la pagination.
   * Utilisé par les boutons de catégories + le SiteFooter.
   */
  const handleCategoryChange = useCallback((key: string) => {
    setActiveCategory(key);
    setVisibleCount(ARTICLES_PER_PAGE);
  }, []);

  /**
   * Met à jour la recherche ET reset la pagination.
   * Utilisé par l'input de recherche.
   */
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
      setVisibleCount(ARTICLES_PER_PAGE);
    },
    []
  );

  /**
   * Efface la recherche ET reset la pagination.
   * Utilisé par le bouton X de la barre de recherche.
   */
  const handleSearchClear = useCallback(() => {
    setSearchQuery("");
    setVisibleCount(ARTICLES_PER_PAGE);
  }, []);

  // --- FILTRAGE ---
  const filteredArticles = useMemo(() => {
    const normalizedSearch = debouncedQuery.toLowerCase().trim();

    return articles.filter((article) => {
      // Filtre catégorie
      let matchesCategory = true;
      if (activeCategory !== "all") {
      
        const categoriesMap = (t.home?.categories || {}) as Record<string, string>;
        const activeLabel = categoriesMap[activeCategory];
        const artCat = (article.category || "").toLowerCase().trim();
        const targetLabel = (activeLabel || "").toLowerCase().trim();
        const targetKey = activeCategory.toLowerCase().trim();
        matchesCategory =
          artCat === targetLabel || artCat === targetKey || artCat.includes(targetKey);
      }

      // Filtre recherche
      let matchesSearch = true;
      if (normalizedSearch) {
        matchesSearch =
          article.title.toLowerCase().includes(normalizedSearch) ||
          article.excerpt.toLowerCase().includes(normalizedSearch);
      }

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, debouncedQuery, articles, t]);

  // --- PRELOADER INTELLIGENT ---
  useEffect(() => {
    // Se ferme dès que les articles sont prêts OU après 2s max (safety net)
    if (articles.length > 0) {
      const timer = setTimeout(() => setLoading(false), 400);
      return () => clearTimeout(timer);
    }
    const maxTimer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(maxTimer);
  }, [articles]);

  // --- OBSERVER les éléments .reveal après chaque changement de liste ---
  useEffect(() => {
    observeElements();
  }, [filteredArticles, visibleCount, observeElements]);

  // --- HELPERS ---
  const getCategoryIconClass = useCallback((key: string) => {
    const normalizedKey = key.toLowerCase();
    const iconKey =
      Object.keys(CATEGORY_ICONS).find((k) => normalizedKey.includes(k)) || "default";
    return CATEGORY_ICONS[iconKey] || CATEGORY_ICONS["default"];
  }, []);

  // Utilisation de 'as any' pour éviter les erreurs TypeScript sur siteName
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const siteName = (t.metadata as any)?.siteName || "Kiba";
  
  const categories = (t.home?.categories || {}) as Record<string, string>;
  const visibleArticles = filteredArticles.slice(0, visibleCount);
  const hasMore = visibleCount < filteredArticles.length;

  return (
    <>
      {/* ===== SKIP-TO-CONTENT (Accessibilité clavier) ===== */}
      <a href="#articles" className="skip-to-content">
        {isNko ? "ߞߎ߲ߘߍ߲ ߡߊ߫ ߞߐ߲ߛߐ߲" : "Aller au contenu"}
      </a>

      {/* ===== PRELOADER ===== */}
      <div
        id="preloader"
        role="status"
        aria-live="polite"
        aria-label={isNko ? "ߛߎ߲ߞߎ߲ ߦߋ߫ ..." : "Chargement en cours..."}
        data-loaded={!loading}
      >
        <div className="loader-symbol" aria-hidden="true">
          ߒ
        </div>
        <div className="loader-line" aria-hidden="true"></div>
        <span className="sr-only">
          {isNko ? "ߛߎ߲ߞߎ߲ ߦߋ߫ ..." : "Chargement en cours..."}
        </span>
      </div>

      {/* ===== BACKGROUND COSMIQUE (useRef, pas getElementById) ===== */}
      <div className="cosmic-background" aria-hidden="true">
        <div className="bg-layer-space" ref={spaceRef}></div>
        <div className="bg-layer-pattern" ref={patternRef}></div>
        <div className="bg-layer-baobab" ref={baobabRef}></div>
        <div className="bg-overlay"></div>
      </div>

      {/* ===== NAVIGATION ===== */}
      <nav
        className={scrolled ? "scrolled" : ""}
        role="navigation"
        aria-label={isNko ? "ߛߌ߲ߘߐ ߓߟߏ" : "Navigation principale"}
      >
        <Link href="/" className="brand">
          <i className="ph-fill ph-diamond" aria-hidden="true"></i>
          <span className={isNko ? "font-kigelia" : ""}>{siteName}</span>
        </Link>

        {/* MENU DESKTOP */}
        <ul className="nav-links">
          <li className="nav-item">
            <Link href="/" aria-current="page">
              {t.nav.home}
            </Link>
          </li>
          <li className="nav-item">
            <a href="#articles">{t.nav.articles}</a>
          </li>
          <li className="nav-item">
            <Link href="/about">{t.nav.about}</Link>
          </li>
          <li className="nav-item">
            <Link href="/contact">{t.nav.contact}</Link>
          </li>
        </ul>

        <div className="nav-actions">
          <button
            className="btn-lang"
            onClick={toggleLanguage}
            aria-label={
              isNko
                ? "Changer la langue en Français"
                : "ߞߊ߲ ߡߊߝߟߍ ߒߞߏ ߡߊ߬"
            }
          >
            <i className="ph ph-translate" aria-hidden="true"></i>
            <span>{isNko ? "FR" : "ߒߞߏ"}</span>
          </button>

          <button
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(true)}
            aria-label={isNko ? "ߡߍߣߎ ߟߊߝߍ" : "Ouvrir le menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <i className="ph ph-list" aria-hidden="true"></i>
          </button>
        </div>
      </nav>

      {/* ===== MENU MOBILE (composant séparé, focus trap, dialog) ===== */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        nav={t.nav}
      />

      {/* ===== HERO ===== */}
      <header className="hero">
        <h1 className={`reveal ${isNko ? "font-kigelia" : ""}`}>
          {t.home.hero.title}
        </h1>
        <p className="reveal" style={{ transitionDelay: "0.15s" }}>
          {t.home.hero.subtitle}
        </p>
        <a
          href="#articles"
          className="cta-btn reveal"
          style={{ transitionDelay: "0.3s" }}
        >
          <span>{t.home.hero.cta}</span>
          <i className="ph-bold ph-arrow-down" aria-hidden="true"></i>
        </a>
      </header>

      {/* ===== SEARCH ===== */}
      <section
        className="search-container reveal"
        aria-label={isNko ? "ߢߌ߬ߣߌ߲ ߓߊ߯ߙߊ" : "Barre de recherche"}
      >
        <div className="search-bar">
          <i
            className="ph ph-magnifying-glass"
            aria-hidden="true"
            style={{ fontSize: "1.3rem", color: "var(--color-gold)", flexShrink: 0 }}
          ></i>
          <input
            type="search"
            className="search-input"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            placeholder={(t.search as any)?.placeholder || (isNko ? "ߢߌ߬ߣߌ߲..." : "Rechercher...")}
            dir={isNko ? "rtl" : "ltr"}
            value={searchQuery}
            onChange={handleSearchChange}
            aria-label={isNko ? "ߢߌ߬ߣߌ߲ ߞߎ߲ߘߍ߲ ߘߐ߫" : "Rechercher des articles"}
          />
          {searchQuery && (
            <button
              onClick={handleSearchClear}
              className="search-btn"
              aria-label={isNko ? "ߢߌ߬ߣߌ߲ ߝߊ߬ߘߌ" : "Effacer la recherche"}
              style={{
                background: "transparent",
                color: "var(--color-text-muted)",
                width: "44px",
                height: "44px",
              }}
            >
              <i className="ph-fill ph-x-circle" aria-hidden="true"></i>
            </button>
          )}
          <button
            className="search-btn"
            aria-label={isNko ? "ߢߌ߬ߣߌ߲" : "Rechercher"}
          >
            <i
              className={`ph-bold ${isNko ? "ph-arrow-left" : "ph-arrow-right"}`}
              aria-hidden="true"
            ></i>
          </button>
        </div>
      </section>

      {/* ===== CATÉGORIES ===== */}
      <div
        className="categories-wrapper reveal"
        role="group"
        aria-label={isNko ? "ߓߐ߬ߟߐ ߝߊ߬ߣߊ ߟߎ" : "Filtrer par catégorie"}
      >
        {/* Bouton TOUT */}
        <button
          className={`category-pill ${activeCategory === "all" ? "active" : ""}`}
          onClick={() => handleCategoryChange("all")}
          aria-pressed={activeCategory === "all"}
        >
          <i className="ph-bold ph-squares-four" aria-hidden="true"></i>
          {/* Correction TypeScript : on cast t.home en any pour accéder à allCategories */}
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <span>{(t.home as any)?.allCategories || (isNko ? "ߓߍ߯" : "Tout")}</span>
        </button>

        {Object.entries(categories).map(([key, label]) => (
          <button
            key={key}
            className={`category-pill ${activeCategory === key ? "active" : ""}`}
            onClick={() => handleCategoryChange(key)}
            aria-pressed={activeCategory === key}
          >
            <i
              className={`ph-bold ${getCategoryIconClass(key)}`}
              aria-hidden="true"
            ></i>
            <span className={isNko ? "font-kigelia" : ""}>{label}</span>
          </button>
        ))}
      </div>

      {/* ===== SECTION HEADER ===== */}
      <div className="section-header" id="articles">
        <h2 className="section-title reveal">{t.home.featured.title}</h2>
        {/* Lien fonctionnel ou retiré — pas de href="#" mort */}
        <Link href="/articles" className="reveal link-gold">
          {t.home.featured.viewAll}
        </Link>
      </div>

      {/* ===== GRILLE ARTICLES ===== */}
      <div className="grid-container" id="articles-grid">
        {visibleArticles.map((article, index) => (
          <div
            key={article.slug}
            className="reveal"
            style={{ transitionDelay: `${index * 0.08}s` }}
          >
            <ArticleCard article={article} />
          </div>
        ))}

        {/* Message "aucun résultat" */}
        {filteredArticles.length === 0 && (
          <div
            className="empty-state"
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              padding: "80px 20px",
              color: "var(--color-text-subtle)",
            }}
          >
            <i
              className="ph ph-magnifying-glass"
              aria-hidden="true"
              style={{ fontSize: "3rem", display: "block", marginBottom: "16px", opacity: 0.5 }}
            ></i>
            <p style={{ fontSize: "1.1rem" }}>
              {/* Correction TypeScript : Utilisation de (t.search as any) */}
              {debouncedQuery
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ? (t.search as any)?.noResults
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ? (t.search as any).noResults.replace("{query}", debouncedQuery)
                  : isNko
                    ? `ߝߋ߲߫ ߡߊ߫ ߛߐ߬ߘߐ߲߬ "${debouncedQuery}" ߞߏ ߘߐ߫.`
                    : `Aucun résultat pour "${debouncedQuery}"`
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                : (t.search as any)?.noArticles ||
                  (isNko
                    ? "ߞߎߡߘߊ߫ ߛߌ߫ ߡߊ߫ ߛߐ߬ߘߐ߲߬."
                    : "Aucun article trouvé.")}
            </p>
          </div>
        )}
      </div>

      {/* ===== BOUTON "VOIR PLUS" ===== */}
      {hasMore && (
        <div style={{ textAlign: "center", marginBottom: "80px" }}>
          <button
            className="cta-btn"
            onClick={() => setVisibleCount((prev) => prev + ARTICLES_PER_PAGE)}
            style={{
              background: "var(--gradient-panel)",
              color: "var(--color-gold)",
              border: "1px solid var(--color-border)",
              fontSize: "1rem",
              padding: "16px 40px",
            }}
          >
            <span>
              {/* Correction TypeScript : (t.home as any) pour loadMore */}
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(t.home as any)?.loadMore || (isNko ? "ߕߎ߲ ߘߐ" : "Voir plus")}
            </span>
            <i className="ph-bold ph-caret-down" aria-hidden="true"></i>
          </button>
        </div>
      )}

      {/* ===== FOOTER ===== */}
      <SiteFooter
        activeCategory={activeCategory}
        setActiveCategory={handleCategoryChange}
      />
    </>
  );
}