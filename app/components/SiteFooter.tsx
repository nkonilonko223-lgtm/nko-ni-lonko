"use client";

import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "./LanguageProvider";

interface SiteFooterProps {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

export default function SiteFooter({ activeCategory, setActiveCategory }: SiteFooterProps) {
  const { t, lang } = useLanguage();
  const isNko = lang === 'nko';
  
  // État local pour gérer l'UX de la Newsletter
  const [emailSubscribed, setEmailSubscribed] = useState(false);

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

  // Gestion de la Newsletter (Simulée pour l'instant)
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ici, tu pourras ajouter ta logique API plus tard
    setEmailSubscribed(true);
    setTimeout(() => setEmailSubscribed(false), 3000); // Reset après 3s
  };

  return (
    <footer className="relative mt-16 md:mt-32 border-t border-white/15 bg-[#02040a]/80 backdrop-blur-xl">
      <div className="mx-auto max-w-8xl px-6 pt-6 pb-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          
          {/* ========================================== */}
          {/* COLONNE 1 : Branding & Newsletter */}
          {/* ========================================== */}
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
               
               {/* ✨ World Class : Vrai formulaire pour la Newsletter */}
               <form onSubmit={handleNewsletterSubmit} className="flex relative">
                  <input 
                    type="email" 
                    required
                    placeholder={isNko ? 'ߌ ߟߊ߫ ߞߘߎߡߊ...' : 'Votre email...'} 
                    className={`w-full rounded-s-md border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-[#fbbf24] focus:outline-none ${isNko ? 'text-end' : ''}`} 
                  />
                  <button 
                    type="submit"
                    className="rounded-e-md bg-[#fbbf24] px-4 py-2 text-black transition-colors hover:bg-white flex items-center justify-center min-w-[48px]"
                  >
                    {emailSubscribed ? (
                      <i className="ph-bold ph-check"></i>
                    ) : (
                      <i className={`ph-bold ${isNko ? 'ph-arrow-left' : 'ph-arrow-right'}`}></i>
                    )}
                  </button>
               </form>
               {emailSubscribed && (
                 <p className="text-xs text-green-400 mt-1">
                   {isNko ? 'ߌ ߣߌ߫ ߗߋ߫ ߸ ߌ ߓߘߊ߫ ߛߓߍߦߊ߫ !' : 'Merci pour votre inscription !'}
                 </p>
               )}
            </div>
          </div>

          {/* ========================================== */}
          {/* COLONNE 2 : Articles (Navigation Rapide) */}
          {/* ========================================== */}
          <div className="flex flex-col items-start">
            <h3 className={`mb-4 text-xm font-bold uppercase tracking-widest text-[#fbbf24] ${isNko ? 'font-kigelia text-lg' : ''}`}>
                {t.nav.articles}
            </h3>
            <ul className="space-y-3">
              {Object.entries(t.home.categories as Record<string, string>).slice(0, 4).map(([key, label]) => (
                  <li key={key}>
                      <button 
                        onClick={() => handleCategoryClick(key)} 
                        className={`group relative block text-sm transition-colors hover:text-white text-start ${activeCategory === key ? 'text-[#fbbf24]' : 'text-gray-400'}`}
                      >
                        <i className={`ph-bold ph-caret-right text-[#fbbf24] absolute top-1 opacity-0 transition-opacity group-hover:opacity-100 ${isNko ? '-end-5' : '-start-5'}`}></i>
                        {label}
                      </button>
                  </li>
              ))}
            </ul>
          </div>

          {/* ========================================== */}
          {/* COLONNE 3 : Menu */}
          {/* ========================================== */}
          <div className="flex flex-col items-start">
            <h3 className={`mb-4 text-xm font-bold uppercase tracking-widest text-[#fbbf24] ${isNko ? 'font-kigelia text-lg' : ''}`}>
              {isNko ? 'ߝߙߍ' : 'Menu'}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="group relative block text-sm text-gray-400 transition-colors hover:text-white">
                  <i className={`ph-bold ph-caret-right text-[#fbbf24] absolute top-1 opacity-0 transition-opacity group-hover:opacity-100 ${isNko ? '-end-5' : '-start-5'}`}></i>
                  {t.nav.about}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="group relative block text-sm text-gray-400 transition-colors hover:text-white">
                  <i className={`ph-bold ph-caret-right text-[#fbbf24] absolute top-1 opacity-0 transition-opacity group-hover:opacity-100 ${isNko ? '-end-5' : '-start-5'}`}></i>
                  {t.footer.contact}
                </Link>
              </li>
              {/* Ajout des liens légaux ici pour faire de la place dans la colonne 4 */}
              <li>
                <Link href="/terms" className="group relative block text-sm text-gray-400 transition-colors hover:text-white">
                  <i className={`ph-bold ph-caret-right text-[#fbbf24] absolute top-1 opacity-0 transition-opacity group-hover:opacity-100 ${isNko ? '-end-5' : '-start-5'}`}></i>
                  {t.footer.terms}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="group relative block text-sm text-gray-400 transition-colors hover:text-white">
                  <i className={`ph-bold ph-caret-right text-[#fbbf24] absolute top-1 opacity-0 transition-opacity group-hover:opacity-100 ${isNko ? '-end-5' : '-start-5'}`}></i>
                  {t.footer.privacy}
                </Link>
              </li>
            </ul>
          </div>

          {/* ========================================== */}
          {/* COLONNE 4 : Contact & Info (Nouveau) */}
          {/* ========================================== */}
          <div className="flex flex-col items-start">
            <h3 className={`mb-4 text-xm font-bold uppercase tracking-widest text-[#fbbf24] ${isNko ? 'font-kigelia text-lg' : ''}`}>
                {isNko ? 'ߓߌ߬ߟߊ߬ߢߐ߲߰ߡߊ' : 'Contact'}
            </h3>
            
            <ul className="space-y-4 text-sm text-gray-400">
              {/* Email */}
              <li className="flex items-start gap-3">
                <i className="ph-bold ph-envelope-simple text-lg text-[#fbbf24] mt-0.5"></i>
                <a href="mailto:contact@nkonilonko.com" className="hover:text-white transition-colors">
                  contact@nkonilonko.com
                </a>
              </li>
              
              {/* Téléphone / WhatsApp */}
              <li className="flex items-start gap-3">
                <i className="ph-bold ph-phone text-lg text-[#fbbf24] mt-0.5"></i>
                <div className="flex flex-col gap-1">
                  <a href="tel:+22300000000" className="hover:text-white transition-colors" dir="ltr">
                    +223 00 00 00 00
                  </a>
                  <a href="tel:+22400000000" className="hover:text-white transition-colors" dir="ltr">
                    +224 00 00 00 00
                  </a>
                </div>
              </li>

              {/* Adresse Physique */}
              <li className="flex items-start gap-3">
                <i className="ph-bold ph-map-pin text-lg text-[#fbbf24] mt-0.5"></i>
                <p className="leading-relaxed">
                  {isNko ? 'ߓߡߊ߬ߞߐ߫ ، ߡߊ߬ߟߌ' : 'Bamako, Mali'} <br/>
                  BP 0000
                </p>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* ========================================== */}
      {/* COPYRIGHT & RÉSEAUX SOCIAUX */}
      {/* ========================================== */}
      <div className="border-t border-white/5 bg-black/40">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-6 md:flex-row lg:px-8">
          
          <p className="text-sm text-gray-600 order-3 md:order-1">
            {t.footer.copyright.replace("{year}", isNko ? "߂߀߂߆" : "2026")}
          </p>
          
          {/* Bouton Back to Top */}
          <button 
            onClick={scrollToTop} 
            aria-label="Retour en haut"
            className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all hover:border-[#fbbf24] hover:bg-[#fbbf24] hover:text-black order-1 md:order-2 md:absolute md:left-1/2 md:-translate-x-1/2"
          >
              <i className="ph-bold ph-arrow-up text-gray-400 transition-colors group-hover:text-black"></i>
          </button>
          
          {/* ✨ Liens Sociaux Sécurisés */}
          <div className="flex flex-wrap justify-center gap-5 order-2 md:order-3">
             <a href="https://youtube.com/@nkonilonko" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="group">
               <i className="ph-fill ph-youtube-logo text-2xl text-gray-400 transition-all group-hover:scale-110 group-hover:text-[#fbbf24]"></i>
             </a>
             <a href="https://facebook.com/nkonilonko" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="group">
               <i className="ph-fill ph-facebook-logo text-2xl text-gray-400 transition-all group-hover:scale-110 group-hover:text-[#fbbf24]"></i>
             </a>
             <a href="https://twitter.com/nkonilonko" target="_blank" rel="noopener noreferrer" aria-label="Twitter / X" className="group">
               <i className="ph-fill ph-twitter-logo text-2xl text-gray-400 transition-all group-hover:scale-110 group-hover:text-[#fbbf24]"></i>
             </a>
             <a href="https://instagram.com/nkonilonko" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="group">
               <i className="ph-fill ph-instagram-logo text-2xl text-gray-400 transition-all group-hover:scale-110 group-hover:text-[#fbbf24]"></i>
             </a>
             <a href="https://wa.me/22300000000" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="group">
               <i className="ph-fill ph-whatsapp-logo text-2xl text-gray-400 transition-all group-hover:scale-110 group-hover:text-[#fbbf24]"></i>
             </a>
             <a href="https://t.me/nkonilonko" target="_blank" rel="noopener noreferrer" aria-label="Telegram" className="group">
               <i className="ph-fill ph-telegram-logo text-2xl text-gray-400 transition-all group-hover:scale-110 group-hover:text-[#fbbf24]"></i>
             </a>
          </div>

        </div>
      </div>
    </footer>
  );
}