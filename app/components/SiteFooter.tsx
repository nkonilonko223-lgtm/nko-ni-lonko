"use client";

import Link from "next/link";
import { useLanguage } from "./LanguageProvider";

interface SiteFooterProps {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

export default function SiteFooter({ activeCategory, setActiveCategory }: SiteFooterProps) {
  const { t, lang } = useLanguage();
  const isNko = lang === 'nko';

  const handleCategoryClick = (key: string) => {
    setActiveCategory(key);
    // Défilement doux vers la section articles
    const articlesSection = document.getElementById('articles');
    if (articlesSection) {
      articlesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative mt-16 md:mt-32 border-t border-white/15 bg-[#02040a]/80 backdrop-blur-xl">
      <div className="mx-auto max-w-8xl px-6 pt-6 pb-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          
          {/* COLONNE 1 : Branding & Newsletter */}
          <div className="flex flex-col gap-5">
            <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-white no-underline transition-opacity hover:opacity-80">
              <i className="ph-fill ph-diamond text-[#fbbf24]"></i>
              <span className={isNko ? 'font-kigelia' : ''}>{t.metadata.siteName}</span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-300">{t.footer.about}</p>
            
            <div className="flex flex-col gap-2 mt-2">
               <label className={`text-sm font-bold uppercase tracking-wider text-[#fbbf24] ${isNko ? 'font-kigelia' : ''}`}>
                  {isNko ? '@ߡߊ߬ߘߏ߬ߛߓߍ' : 'Newsletter'}
               </label>
               <div className="flex">
                  <input 
                    type="email" 
                    placeholder={isNko ? 'ߌ ߟߊ߫ ߞߘߎߡߊ...' : 'Votre email...'} 
                    // ✅ MODERNE : 'text-end' s'adapte automatiquement au N'Ko
                    className={`w-full rounded-s-md border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-[#fbbf24] focus:outline-none ${isNko ? 'text-end' : ''}`} 
                  />
                  <button className="rounded-e-md bg-[#fbbf24] px-4 py-2 text-black transition-colors hover:bg-white">
                    <i className={`ph-bold ${isNko ? 'ph-arrow-left' : 'ph-arrow-right'}`}></i>
                  </button>
               </div>
            </div>
          </div>

          {/* COLONNE 2 : Articles (Navigation Rapide) */}
          <div className="flex flex-col items-start">
            <h3 className={`mb-4 text-xm font-bold uppercase tracking-widest text-[#fbbf24] ${isNko ? 'font-kigelia text-lg' : ''}`}>
                {t.nav.articles}
            </h3>
            <ul className="space-y-3">
              {Object.entries(t.home.categories as Record<string, string>).slice(0, 4).map(([key, label]) => (
                  <li key={key}>
                      <button 
                        onClick={() => handleCategoryClick(key)} 
                        // ✅ MODERNE : 'text-start' gère Gauche/Droite auto
                        className={`group relative block text-sm transition-colors hover:text-white text-start ${activeCategory === key ? 'text-[#fbbf24]' : 'text-gray-400'}`}
                      >
                        {/* ✅ MODERNE : '-start-5' place la flèche du bon côté auto */}
                        <i className={`ph-bold ph-caret-right text-[#fbbf24] absolute top-1 opacity-0 transition-opacity group-hover:opacity-100 ${isNko ? '-end-5' : '-start-5'}`}></i>
                        {label}
                      </button>
                  </li>
              ))}
            </ul>
          </div>

          {/* COLONNE 3 : Menu */}
          <div className="flex flex-col items-start">
            <h3 className={`mb-4 text-xm font-bold uppercase tracking-widest text-[#fbbf24] ${isNko ? 'font-kigelia text-lg' : ''}`}>
              {isNko ? 'ߝߙߍ' : 'Menu'}
            </h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="group relative block text-sm text-gray-400 transition-colors hover:text-white"><i className={`ph-bold ph-caret-right text-[#fbbf24] absolute top-1 opacity-0 transition-opacity group-hover:opacity-100 ${isNko ? '-end-5' : '-start-5'}`}></i>{t.nav.about}</Link></li>
              <li><Link href="/contact" className="group relative block text-sm text-gray-400 transition-colors hover:text-white"><i className={`ph-bold ph-caret-right text-[#fbbf24] absolute top-1 opacity-0 transition-opacity group-hover:opacity-100 ${isNko ? '-end-5' : '-start-5'}`}></i>{t.footer.contact}</Link></li>
            </ul>
          </div>

          {/* COLONNE 4 : Légal */}
          <div className="flex flex-col items-start">
            <h3 className={`mb-4 text-xm font-bold uppercase tracking-widest text-[#fbbf24] ${isNko ? 'font-kigelia text-lg' : ''}`}>
                {t.footer.legal}
            </h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-gray-400 hover:text-white">{t.footer.terms}</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white">{t.footer.privacy}</a></li>
            </ul>
          </div>

        </div>
      </div>

      {/* COPYRIGHT & BACK TO TOP */}
      <div className="border-t border-white/5 bg-black/40">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 md:flex-row lg:px-8">
          <p className="text-sm text-gray-600">{t.footer.copyright.replace("{year}", isNko ? "߂߀߂߆" : "2026")}</p>
          
          <button onClick={scrollToTop} className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all hover:border-[#fbbf24] hover:bg-[#fbbf24] hover:text-black md:absolute md:left-1/2 md:-translate-x-1/2">
              <i className="ph-bold ph-arrow-up text-gray-400 transition-colors group-hover:text-black"></i>
          </button>
          
          <div className="flex gap-6">
             <i className="ph-fill ph-facebook-logo cursor-pointer text-2xl text-gray-400 transition-all hover:scale-110 hover:text-[#fbbf24]"></i>
             <i className="ph-fill ph-twitter-logo cursor-pointer text-2xl text-gray-400 transition-all hover:scale-110 hover:text-[#fbbf24]"></i>
             <i className="ph-fill ph-youtube-logo cursor-pointer text-2xl text-gray-400 transition-all hover:scale-110 hover:text-[#fbbf24]"></i>
             <i className="ph-fill ph-whatsapp-logo cursor-pointer text-2xl text-gray-400 transition-all hover:scale-110 hover:text-[#fbbf24]"></i>
          </div>
        </div>
      </div>
    </footer>
  );
}