"use client";

import { useState, useEffect } from "react";
import Link from "next/link"; // Indispensable pour la navigation

// Type pour nos articles
type Post = {
  id: string;
  title: string;
  date: string;
  category: string;
  image: string;
  excerpt: string;
};

// --- LE DICTIONNAIRE COMPLET (Traductions) ---
const dictionary = {
  fr: {
    metadata: { siteName: "N'ko ni Lonko" },
    nav: { home: "Accueil", articles: "Articles", about: "À propos", contact: "Contact" },
    home: {
      hero: { title: "La Science en N'Ko", subtitle: "Diffusion des connaissances scientifiques avancées en langue N'Ko", cta: "Découvrir les articles" },
      featured: { title: "Articles récents", viewAll: "Voir tout" },
      categories: { astronomy: "Astronomie", physics: "Physique", biology: "Biologie", mathematics: "Mathématiques", chemistry: "Chimie", geology: "Géologie" }
    },
    article: { minutes: "min", views: "vues", downloads: "téléch.", readMore: "Lire l'article" },
    search: { placeholder: "Rechercher dans les articles..." },
    footer: {
      about: "N'ko ni Lonko est une plateforme de diffusion scientifique en langue N'Ko.",
      contact: "Contact", legal: "Mentions légales", privacy: "Confidentialité", terms: "Conditions d'utilisation",
      copyright: "© 2026 N'ko ni Lonko - Tous droits réservés"
    }
  },
  nqo: {
    metadata: { siteName: "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ" },
    nav: { home: "ߟߊ߬ߓߍ߲߬ߠߌ", articles: "ߞߎߡߘߊ", about: "ߞߊ߲߬ߞߎߡߊ", contact: "ߟߊ߬ߛߘߐ߬ߢߊ" },
    home: {
      hero: { title: "ߟߐ߲ߠߌ߲ߧߊ ߒߞߏ ߘߐ߫", subtitle: "ߝߘߏ߬ߓߊ߬ ߟߐ߲ߠߌ߲ ߠߎ߬ ߟߊߛߋߟߌ ߒߞߏ ߞߊ߲ ߘߐ߫", cta: "ߞߎߡߘߊ ߟߎ߬ ߦߋ߫" },
      featured: { title: "ߞߎߡߘߊ ߞߎߘߊ ߟߎ߬", viewAll: "ߕߐ߭ ߓߍ߯ ߝߌߟߍ߫" },
      categories: { astronomy: "ߛߊ߲ߡߊߛߓߍߟߐ߲ߘߐߦߊ", physics: "ߘߐ߬ߞߏ", biology: "ߣߌߡߊߞߊߙߊ߲", mathematics: "ߘߡߊ߬ߟߐ߲", chemistry: "ߖߎ߯ߛߊߟߐ߲ߘߐߦߊ", geology: "ߘߎ߰ߘߐ߬ߟߐ߲ߘߐߦߊ" }
    },
    article: { minutes: "ߡߌ߬ߛߍ߲", views: "ߦߋߟߊ", downloads: "ߖߌ߰ߟߌ", readMore: "ߊ߬ ߘߐߞߊ߬ߙߊ߲߬" },
    search: { placeholder: "ߢߌߣߌ߲ߠߌ߲ ߞߎߡߘߊ ߟߎ߬ ߘߐ߫.." },
    footer: {
      about: "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ ߦߋ߫ ߟߐ߲ߠߌ߲ ߞߎߘߍߞߎߘߍ߫ ߢߊߝߐ߫ ߦߙߐ ߠߋ߬ ߘߌ߫ ߊ߲ ߠߊ߫ ߞߊ߲ ߘߐ߫",
      contact: "ߟߊߛߘߐ߬ߢߊ", legal: "ߛߊ߬ߙߌ߬ߦߊ߬ߡߊ", privacy: "ߜߎ߲߬ߘߏ߬ߦߊ߬ߡߊ", terms: "ߟߊ߬ߓߊ߰ߙߊ߬ߟߌ ߞߎ߬ߙߎ߲߬ߘߎ ߟߎ߬",
      copyright: "© 2026 ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ - ߤߊߞߍ ߓߍ߯ ߟߊߕߊ߲߬ߞߌ߲߬ߣߍ߲߫"
    }
  }
};

type Lang = "fr" | "nqo";

export default function HomeClient({ posts }: { posts: Post[] }) {
  const [lang, setLang] = useState<Lang>("nqo");
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = dictionary[lang];

  // --- EFFETS (Parallaxe, Scroll, Preloader) ---
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    const handleScroll = () => setScrolled(window.scrollY > 50);

    const handleMouseMove = (e: MouseEvent) => {
      const x = (window.innerWidth - e.pageX) / 100;
      const y = (window.innerHeight - e.pageY) / 100;
      
      const space = document.getElementById('parallax-space');
      const pattern = document.getElementById('parallax-pattern');
      const baobab = document.getElementById('parallax-baobab');

      if (space) space.style.transform = `translateX(${x}px) translateY(${y}px) scale(1.05)`;
      if (pattern) pattern.style.transform = `translateX(${x * 1.5}px) translateY(${y * 1.5}px)`;
      if (baobab) baobab.style.transform = `translateX(${x * 0.5}px) translateY(${y * 0.5}px)`;
    };

    // Reveal on Scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    window.addEventListener("scroll", handleScroll);
    if (window.matchMedia("(min-width: 900px)").matches) {
        window.addEventListener("mousemove", handleMouseMove);
    }

    // Gestion de la langue et direction
    document.body.setAttribute('data-lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'nqo' ? 'rtl' : 'ltr';

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [lang]);

  return (
    <>
      {/* --- PRELOADER --- */}
      <div id="preloader" style={{ opacity: loading ? 1 : 0, visibility: loading ? 'visible' : 'hidden' }}>
        <div className="loader-symbol">ߒ</div>
        <div className="loader-line"></div>
      </div>

      {/* --- BACKGROUND COSMIC --- */}
      <div className="cosmic-background">
        <div className="bg-layer-space" id="parallax-space"></div>
        <div className="bg-layer-pattern" id="parallax-pattern"></div>
        <div className="bg-layer-baobab" id="parallax-baobab"></div>
        <div className="bg-overlay"></div>
      </div>

      {/* --- NAVIGATION --- */}
      <nav className={scrolled ? "scrolled" : ""}>
        <Link href="/" className="brand" style={{ textDecoration: 'none' }}>
          <i className="ph-fill ph-diamond" style={{ color: "var(--color-gold)" }}></i>
          <span>{t.metadata.siteName}</span>
        </Link>

        <ul className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
          <li className="nav-item"><Link href="/" className="active" onClick={() => setMobileMenuOpen(false)}>{t.nav.home}</Link></li>
          <li className="nav-item"><a href="#articles" onClick={() => setMobileMenuOpen(false)}>{t.nav.articles}</a></li>
          {/* 👇 LIENS ACTIVÉS ICI */}
          <li className="nav-item"><Link href="/about" onClick={() => setMobileMenuOpen(false)}>{t.nav.about}</Link></li>
          <li className="nav-item"><Link href="/contact" onClick={() => setMobileMenuOpen(false)}>{t.nav.contact}</Link></li>
        </ul>

        <div className="nav-actions">
          <button className="btn-lang" onClick={() => setLang(lang === 'nqo' ? 'fr' : 'nqo')}>
            <i className="ph ph-translate"></i>
            <span>{lang === 'nqo' ? 'FR' : 'ߒߞߏ'}</span>
          </button>
          <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <i className={mobileMenuOpen ? "ph ph-x" : "ph ph-list"}></i>
          </button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="hero">
        <h1 className="reveal active">{t.home.hero.title}</h1>
        <p className="reveal active" style={{ transitionDelay: '0.2s' }}>{t.home.hero.subtitle}</p>
        <a href="#articles" className="cta-btn reveal active" style={{ transitionDelay: '0.4s' }}>
          <span>{t.home.hero.cta}</span>
          <i className="ph-bold ph-arrow-down"></i>
        </a>
      </header>

      {/* --- SEARCH & CATEGORIES --- */}
      <section className="search-container reveal active">
        <div className="search-bar">
          <i className="ph ph-magnifying-glass" style={{ margin: "0 15px", color: "var(--color-gold)", fontSize: "1.5rem" }}></i>
          <input type="text" className="search-input" placeholder={t.search.placeholder} />
          <button className="search-btn"><i className="ph-bold ph-arrow-right"></i></button>
        </div>
      </section>

      <div className="categories-wrapper reveal active">
        <div className="category-pill active"><i className="ph ph-star"></i> <span>{t.home.categories.astronomy}</span></div>
        <div className="category-pill"><i className="ph ph-atom"></i> <span>{t.home.categories.physics}</span></div>
        <div className="category-pill"><i className="ph ph-dna"></i> <span>{t.home.categories.biology}</span></div>
        <div className="category-pill"><i className="ph ph-function"></i> <span>{t.home.categories.mathematics}</span></div>
        <div className="category-pill"><i className="ph ph-flask"></i> <span>{t.home.categories.chemistry}</span></div>
        <div className="category-pill"><i className="ph ph-mountains"></i> <span>{t.home.categories.geology}</span></div>
      </div>

      {/* --- ARTICLES GRID --- */}
      <div className="section-header" id="articles">
        <h2 className="section-title reveal">{t.home.featured.title}</h2>
        <a href="#" className="reveal" style={{ color: "var(--color-gold)", textDecoration: "none", fontWeight: 600, fontSize: "1.2rem", borderBottom: "1px solid var(--color-gold)", paddingBottom: "5px" }}>{t.home.featured.viewAll}</a>
      </div>

      <div className="grid-container" id="articles-grid">
        
        {/* 🔥 BOUCLE DYNAMIQUE AVEC LIENS - LE CŒUR DU SYSTÈME 🔥 */}
        {posts.map((post, index) => (
          <Link href={`/posts/${post.id}`} key={post.id} className="reveal" style={{ transitionDelay: `${index * 0.1}s`, textDecoration: 'none', display: 'block' }}>
            <article className="glass-panel article-card">
              <div className="card-image">
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.image} alt={post.title} />
              </div>
              <div className="card-content">
                <div className="card-meta">
                  <span>{post.category}</span>
                  <span>{post.date}</span>
                </div>
                <h3 className="card-title">{post.title}</h3>
                <p className="card-excerpt">{post.excerpt}</p>
                <div className="card-stats">
                  <div className="stat-item"><i className="ph ph-clock"></i> 5 {t.article.minutes}</div>
                  <div className="stat-item" style={{ marginInlineStart: "auto", color: "var(--color-gold)", cursor: "pointer" }}>
                      {t.article.readMore} <i className="ph-bold ph-arrow-right"></i>
                  </div>
                </div>
              </div>
            </article>
          </Link>
        ))}

        {/* Message si vide */}
        {posts.length === 0 && (
          <div style={{gridColumn: "1 / -1", textAlign: "center", padding: "50px", color: "var(--color-text-muted)"}}>
            <p>Aucun article trouvé pour le moment. / ߞߎߡߘߊ߫ ߛߌ߫ ߡߊ߫ ߛߐ߬ߘߐ߲߬ ߡߎߣߎ߲߬.</p>
          </div>
        )}

      </div>

      {/* --- FOOTER COMPLET --- */}
      <footer>
        <div className="footer-grid reveal active">
            <div className="footer-brand">
                <h2>{t.metadata.siteName}</h2>
                <p>{t.footer.about}</p>
            </div>
            <div className="footer-col">
                <h4>{t.nav.articles}</h4>
                <ul className="footer-links">
                    <li><a href="#"><i className="ph-bold ph-caret-right"></i> {t.home.categories.astronomy}</a></li>
                    <li><a href="#"><i className="ph-bold ph-caret-right"></i> {t.home.categories.biology}</a></li>
                    <li><a href="#"><i className="ph-bold ph-caret-right"></i> {t.home.categories.physics}</a></li>
                </ul>
            </div>
            <div className="footer-col">
                <h4>{t.metadata.siteName}</h4>
                <ul className="footer-links">
                    {/* 👇 LIENS FOOTER ACTIVÉS ICI */}
                    <li><Link href="/about"><i className="ph-bold ph-caret-right"></i> {t.nav.about}</Link></li>
                    <li><Link href="/contact"><i className="ph-bold ph-caret-right"></i> {t.footer.contact}</Link></li>
                </ul>
            </div>
            <div className="footer-col">
                <h4>{t.footer.legal}</h4>
                <ul className="footer-links">
                    <li><a href="#"><i className="ph-bold ph-caret-right"></i> {t.footer.terms}</a></li>
                    <li><a href="#"><i className="ph-bold ph-caret-right"></i> {t.footer.privacy}</a></li>
                </ul>
            </div>
        </div>
        <div className="footer-bottom">
            <span>{t.footer.copyright}</span>
            <div style={{ display: "flex", gap: "20px", fontSize: "1.5rem", color: "var(--color-text-muted)" }}>
                <i className="ph-fill ph-twitter-logo" style={{ cursor: "pointer" }}></i>
                <i className="ph-fill ph-facebook-logo" style={{ cursor: "pointer" }}></i>
                <i className="ph-fill ph-linkedin-logo" style={{ cursor: "pointer" }}></i>
            </div>
        </div>
      </footer>
    </>
  );
}