"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation"; 
import { useLanguage } from "./LanguageProvider";
import { Turnstile } from '@marsidev/react-turnstile'; // 🚀 IMPORT DU BOUCLIER CLOUDFLARE
import type { TurnstileInstance } from '@marsidev/react-turnstile';
import { URL_X } from "../lib/partage";
import { LIEN_ICONE_WHATSAPP, SIEGE, TELEGRAM } from "../lib/coordonnees";
import { ABONNEMENT_A_CONFIRMER } from "../lib/messages-lecteur";
import { TexteLangue } from "./application/Libelle";
import EtatFormulaire, { useVerification } from "./formulaires/EtatFormulaire";

interface SiteFooterProps {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

interface TranslationData {
  metadata: { siteName: string };
  footer: { about: string; contact: string; terms: string; privacy: string; copyright: string };
  nav: { articles: string; numeros: string; about: string };
  home: { categories: Record<string, string> };
}

export default function SiteFooter({ activeCategory, setActiveCategory }: SiteFooterProps) {
  const { t, lang, lien } = useLanguage();
  const typedT = t as unknown as TranslationData;
  const isNko = lang === 'nko';
  
  const pathname = usePathname();
  const router = useRouter();
  
  // 🚀 États de la Newsletter Intelligente
  const [email, setEmail] = useState("");
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [emailSubscribed, setEmailSubscribed] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null); // 🛡️ ÉTAT DU SÉSAME
  // Turnstile (Cloudflare) créé seulement au premier contact avec le formulaire : les lecteurs
  // qui n'écrivent pas ne téléchargent plus le script de Cloudflare (18 octobre 2026)
  const [protectionActive, setProtectionActive] = useState(false);
  const activerProtection = useCallback(() => setProtectionActive(true), []);
  const turnstileRef = useRef<TurnstileInstance>(null); // 🛡️ TÉLÉCOMMANDE DE RÉARMEMENT
  const verification = useVerification(protectionActive, turnstileToken);
  const formRef = useRef<HTMLFormElement>(null);
  const [glowPos, setGlowPos] = useState({ x: 0, y: 0 });

  // 🚀 Haptique Multiphase
  const triggerVibration = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
  }, []);

  const triggerSuccessVibration = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([30, 50, 30]); 
  }, []);

  // 🚀 LOGIQUE DE NAVIGATION BLINDÉE
  const handleCategoryClick = useCallback((key: string) => {
    triggerVibration();
    setActiveCategory(key);
    
    if (pathname !== '/') {
      router.push(lien('/'));
      if (typeof window !== 'undefined') sessionStorage.setItem('pending_category_scroll', 'true');
    } else {
      const articlesSection = document.getElementById('articles');
      if (articlesSection) {
        const y = articlesSection.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  }, [pathname, router, setActiveCategory, triggerVibration, lien]);

  useEffect(() => {
    if (pathname === '/' && typeof window !== 'undefined') {
      const pendingScroll = sessionStorage.getItem('pending_category_scroll');
      if (pendingScroll) {
        setTimeout(() => {
          const articlesSection = document.getElementById('articles');
          if (articlesSection) {
            const y = articlesSection.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
          sessionStorage.removeItem('pending_category_scroll');
        }, 500);
      }
    }
  }, [pathname]);

  const scrollToTop = () => {
    triggerVibration();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Logo : sur l'accueil, il remonte en haut de la page (sinon le lien rechargeait la même page
  // sans rien faire de visible) ; ailleurs, il ramène à l'accueil. Ctrl/Cmd + clic : nouvel onglet.
  const allerAccueil = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (window.location.pathname === new URL(lien("/"), window.location.href).pathname) {
      e.preventDefault();
      scrollToTop();
    } else {
      triggerVibration();
    }
  };

  // 🚀 Moteur de Validation Email en Temps Réel
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setEmailSubscribed(false);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValidEmail(emailRegex.test(value));
  };

  const handleFormMouseMove = (e: React.MouseEvent<HTMLFormElement>) => {
    if (!formRef.current) return;
    const rect = formRef.current.getBoundingClientRect();
    setGlowPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  // 🚀 MOTEUR DE L'API NEWSLETTER (1/1000)
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Sécurité stricte : On exige le token Cloudflare avant l'envoi
    if (!isValidEmail || isLoading || !turnstileToken) return; 
    
    setIsLoading(true);
    setErrorMessage("");
    triggerVibration(); 

    try {
      // 1. Préparation du Payload Sécurisé
      const payload = {
        email: email,
        honeypot: "", 
        source_url: pathname,
        category: activeCategory || "global",
        turnstileToken: turnstileToken // 🛡️ INJECTION DU SÉSAME POUR LE BACKEND
      };

      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Une erreur est survenue");
      }

      // 3. Le Triomphe
      triggerSuccessVibration();
      setEmailSubscribed(true);
      setEmail(""); 
      setIsValidEmail(false);

    } catch (error) {
      console.error("Erreur Newsletter:", error);
      const message = error instanceof Error ? error.message : "Impossible de s'abonner pour le moment.";
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(""), 4000);
    } finally {
      setIsLoading(false);
      // 🛡️ RÉARMEMENT AUTOMATIQUE : On forge un nouveau jeton pour le prochain essai
      if (turnstileRef.current) {
        turnstileRef.current.reset();
        setTurnstileToken(null);
      }
    }
  };

  return (
    <footer className="relative mt-16 md:mt-32 border-t border-white/10 bg-void/90 backdrop-blur-2xl shadow-[0_-10px_30px_rgba(251,191,36,0.03)] z-10 print:hidden overflow-hidden">
      
      <div className="absolute inset-0 pointer-events-none -z-10 flex items-center justify-center opacity-[0.02] md:opacity-[0.03]">
        <Image 
          src="/icon-512x512.png" 
          alt="" 
          width={800} 
          height={800} 
          className="scale-150 md:scale-125 md:translate-x-1/4 translate-y-1/4"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-8xl px-6 pt-6 pb-16 lg:px-8">
       <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          
          <div className="flex flex-col gap-5">
            <Link href={lien("/")} onClick={allerAccueil} className="group relative flex items-center gap-3 touch-manipulation w-fit">
              <div className="relative flex items-center justify-center p-0.5 rounded-lg border border-white/10 bg-white/5 transition-all duration-300 group-hover:border-or/50 group-hover:shadow-[0_0_10px_rgba(251,191,36,0.2)] overflow-hidden">
                <div className="absolute inset-0 bg-[#fbbf24] blur-md opacity-10 group-hover:opacity-30 transition-opacity"></div>
                {/* Version simplifiée du logo : le logo détaillé ne se lit pas à 30 px */}
                <Image src="/application/onglet-192.png" alt="Logo" lang="fr" width={30} height={30} className="rounded-md relative z-10 transition-transform group-hover:scale-105" />
              </div>
              <span className={`text-2xl font-bold text-white transition-colors group-hover:text-or ${isNko ? 'font-kigelia' : ''}`}>
                {typedT?.metadata?.siteName || "N'Ko ni Lonko"}
              </span>
            </Link>
            
            <p className={`leading-relaxed text-gray-400 ${isNko ? 'text-lg' : 'text-base'}`}>
              {typedT?.footer?.about || "Plateforme scientifique"}
            </p>
            
            <div className="flex flex-col gap-3 mt-3">
               <label className={`font-bold uppercase tracking-widest text-or ${isNko ? 'font-kigelia text-lg' : 'text-sm'}`}>
                  {isNko ? 'ߡߊ߬ߘߏ߬ߛߓߍ' : 'Newsletter'}
               </label>
               
               <form 
                 ref={formRef} 
                 onMouseMove={handleFormMouseMove}
                 onSubmit={handleNewsletterSubmit}
                 onFocusCapture={activerProtection}
                 onPointerDownCapture={activerProtection}
                 className="relative flex items-center w-full rounded-xl bg-surface/50 border border-white/10 overflow-hidden p-1 group transition-colors focus-within:border-white/30 focus-within:bg-surface"
               >
                 {/* 🛡️ INJECTION INVISIBLE DU RADAR CLOUDFLARE */}
                 {protectionActive && (
                 <div className="hidden">
                    <Turnstile
                      key={verification.cle}
                      ref={turnstileRef}
                      siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                      onSuccess={(token) => setTurnstileToken(token)}
                      onError={verification.signalerEchec}
                      onTimeout={verification.signalerEchec}
                      onExpire={() => setTurnstileToken(null)}
                    />
                 </div>
                 )}

                  <div 
                    className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `radial-gradient(80px circle at ${glowPos.x}px ${glowPos.y}px, rgba(251,191,36,0.15), transparent)` }}
                  />
                  
                <input 
    type="text"
    inputMode="email"
    autoComplete="email"
    value={email}
    onChange={handleEmailChange}
    placeholder={isNko ? 'ߌ ߟߊ߫ ߞߘߎߡߊ...' : 'Votre email...'} 
    className={`relative z-10 flex-1 min-w-0 bg-transparent border-none outline-none text-white px-3 py-2 placeholder-gray-600 ${isNko ? 'text-end text-base font-kigelia' : 'text-sm'}`} 
  />
                  
                  <button 
                    type="submit"
                    disabled={!isValidEmail || emailSubscribed || isLoading || !turnstileToken}
                    className={`relative z-10 rounded-lg w-12 h-[36px] shrink-0 flex items-center justify-center transition-all duration-500 touch-manipulation
                      ${emailSubscribed 
                        ? 'bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]' 
                        : isLoading
                          ? 'bg-or/50 text-black cursor-wait'
                          : isValidEmail && turnstileToken
                            ? 'bg-[#fbbf24] text-black shadow-[0_0_15px_rgba(251,191,36,0.3)] hover:scale-105 active:scale-95 cursor-pointer' 
                            : 'bg-white/5 text-gray-500 cursor-not-allowed'
                      }
                    `}
                    aria-label="S'inscrire à la newsletter"
                  >
                    {isLoading ? (
                      <i className="ph-bold ph-spinner animate-spin text-lg"></i>
                    ) : emailSubscribed ? (
                      <i className="ph-bold ph-check animate-in zoom-in duration-300"></i>
                    ) : (
                      <i className={`ph-bold ${isNko ? 'ph-arrow-left' : 'ph-arrow-right'} ${isValidEmail && turnstileToken ? 'animate-pulse' : ''}`}></i>
                    )}
                  </button>
               </form>
               
               <EtatFormulaire email={email} emailValide={isValidEmail} jeton={turnstileToken} echec={verification.echec} onReessayer={verification.reessayer} nko={isNko} />

               {/* Pas encore abonné : l'e-mail de confirmation reste à ouvrir (31 octobre 2026). Le message
                   reste affiché tant que le lecteur ne retape pas d'adresse */}
               <div role="status">
                 {emailSubscribed && (
                   <p className="mt-1 flex items-start gap-2 text-sm font-medium text-green-400">
                     <i className="ph-bold ph-envelope-simple mt-0.5 shrink-0 text-base" aria-hidden="true"></i>
                     <TexteLangue texte={ABONNEMENT_A_CONFIRMER} nko={isNko} className="leading-snug" />
                   </p>
                 )}
               </div>

               <div className={`overflow-hidden transition-all duration-300 ${errorMessage ? 'h-auto opacity-100 mt-1' : 'h-0 opacity-0 mt-0'}`}>
                 <p className="text-xs text-red-400 flex items-center gap-1">
                   <i className="ph-fill ph-warning-circle"></i>
                   {errorMessage}
                 </p>
               </div>
            </div>
          </div>

          <div className="flex flex-col items-start">
            <h3 className={`mb-5 font-bold uppercase tracking-widest text-or drop-shadow-[0_0_8px_rgba(251,191,36,0.3)] ${isNko ? 'font-kigelia text-xl' : 'text-base'}`}>
                {typedT?.nav?.articles || "Articles"}
            </h3>
            <ul className="space-y-4">
              {typedT?.home?.categories && Object.entries(typedT.home.categories).slice(0, 4).map(([key, label]) => (
                  <li key={key}>
                      <button 
                        onClick={() => handleCategoryClick(key)} 
                        className={`group relative block transition-colors hover:text-white text-start touch-manipulation ${activeCategory === key ? 'text-or font-bold' : 'text-gray-400'} ${isNko ? 'text-lg font-kigelia' : 'text-base'}`}
                      >
                        <i className={`ph-bold ph-caret-right text-or absolute top-1.5 opacity-0 transition-opacity group-hover:opacity-100 ${isNko ? '-end-6' : '-start-6'}`}></i>
                        {label as string}
                      </button>
                  </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col items-start">
            <h3 className={`mb-5 font-bold uppercase tracking-widest text-or drop-shadow-[0_0_8px_rgba(251,191,36,0.3)] ${isNko ? 'font-kigelia text-xl' : 'text-base'}`}>
              {isNko ? 'ߝߙߍ' : 'Menu'}
            </h3>
            <ul className="space-y-4">
              {[
                { path: lien("/numeros"), label: typedT?.nav?.numeros || "Numéros" },
                { path: lien("/bibliotheque"), label: isNko ? "ߒ ߠߊ߫ ߟߍߙߘߊ" : "Ma bibliothèque" }, // libellé N'Ko : L16 (rédaction, 23 octobre 2026 ; copié tel quel par programme)
                { path: lien("/about"), label: typedT?.nav?.about || "À propos" },
                { path: lien("/contact"), label: typedT?.footer?.contact || "Contact" },
                { path: lien("/terms"), label: typedT?.footer?.terms || "CGU" },
                { path: lien("/privacy"), label: typedT?.footer?.privacy || "Confidentialité" }
              ].map((link, i) => (
                <li key={i}>
                  <Link href={link.path} onClick={triggerVibration} className={`group relative block text-gray-400 transition-colors hover:text-white touch-manipulation ${isNko ? 'text-lg font-kigelia' : 'text-base'}`}>
                    <i className={`ph-bold ph-caret-right text-or absolute top-1.5 opacity-0 transition-opacity group-hover:opacity-100 ${isNko ? '-end-6' : '-start-6'}`}></i>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col items-start">
            <h3 className={`mb-5 font-bold uppercase tracking-widest text-or drop-shadow-[0_0_8px_rgba(251,191,36,0.3)] ${isNko ? 'font-kigelia text-xl' : 'text-base'}`}>
                {isNko ? 'ߟߊߛߘߐ߬ߢߊ' : 'Contact'}
            </h3>
            
            <ul className={`space-y-5 text-gray-400 ${isNko ? 'text-lg font-kigelia' : 'text-base'}`}>
              <li className="flex items-start gap-3">
                <i className="ph-bold ph-envelope-simple text-xl text-gray-500 mt-0.5 group-hover:text-or transition-colors"></i>
                <a href="mailto:contact@nkonilonko.com" onClick={triggerVibration} className="hover:text-white transition-colors">
                  contact@nkonilonko.com
                </a>
              </li>
              {/* Pas de numéro de téléphone dans le pied de page (décision du propriétaire) : voir la page Contact */}
              <li className="flex items-start gap-3">
                <i className="ph-bold ph-map-pin text-xl text-gray-500 mt-0.5"></i>
                {/* Adresse du siège (lien vers la page Contact), du plus petit au plus grand.
                    Textes N'Ko et français : app/lib/coordonnees.ts (SIEGE) */}
                <Link href={lien("/contact")} onClick={triggerVibration} className="leading-relaxed hover:text-white transition-colors">
                  {isNko ? <span lang="nqo" dir="rtl">{SIEGE.quartierEtRepere.nko}</span> : <span lang="fr" dir="ltr">{SIEGE.quartierEtRepere.fr}</span>}<br/>
                  {isNko ? <span lang="nqo" dir="rtl">{SIEGE.ville.nko}</span> : <span lang="fr" dir="ltr">{SIEGE.ville.fr}</span>}
                </Link>
              </li>
            </ul>
          </div>

        </div>
      </div>

      <div className="relative z-10 border-t border-white/5 bg-black/50">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-8 md:flex-row lg:px-8">
          
          <div className="flex flex-col md:flex-row items-center gap-4 order-3 md:order-1">
            <Link href={lien("/")} onClick={allerAccueil} className="group relative flex items-center justify-center p-1 rounded-xl border border-white/10 bg-white/5 transition-all duration-300 hover:border-or/50 hover:bg-white/10 hover:shadow-[0_0_15px_rgba(251,191,36,0.3)] touch-manipulation overflow-hidden" aria-label="Retour à l'accueil">
              <div className="absolute inset-0 bg-[#fbbf24] blur-lg opacity-10 group-hover:opacity-30 transition-opacity"></div>
              <Image src="/application/onglet-192.png" alt={typedT?.metadata?.siteName || "Logo"} width={44} height={44} className="rounded-lg relative z-10 transition-transform group-hover:scale-105" />
            </Link>
            <span className="hidden md:inline text-white/10 text-ml font-light">|</span>
            <p className={`text-sm text-gray-400 ${isNko ? 'font-kigelia' : ''}`}>
              {(typedT?.footer?.copyright || "© {year} N'Ko ni Lonko").replace("{year}", isNko ? "߂߀߂߆" : "2026")}
            </p>
          </div>
          
          <button 
            onClick={scrollToTop} 
            aria-label="Retour en haut"
            className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all hover:border-or hover:bg-[#fbbf24] hover:text-black order-1 md:order-2 md:absolute md:left-1/2 md:-translate-x-1/2 touch-manipulation hover:shadow-[0_0_20px_rgba(251,191,36,0.3)]"
          >
              <i className="ph-bold ph-arrow-up text-gray-400 transition-colors group-hover:text-black"></i>
          </button>
          
          <div className="flex flex-wrap justify-center gap-6 order-2 md:order-3">
             {[
               { href: "https://youtube.com/@nkonilonko", icon: "youtube-logo", label: "YouTube" },
               { href: "https://facebook.com/nkonilonko", icon: "facebook-logo", label: "Facebook" },
               { href: URL_X, icon: "twitter-logo", label: "Twitter / X" },
               { href: "https://instagram.com/nkonilonko", icon: "instagram-logo", label: "Instagram" },
               { href: "https://tiktok.com/@nkonilonko223", icon: "tiktok-logo", label: "TikTok" },
               // WhatsApp : vers la page Contact (aucun numéro dans le pied de page)
               { href: lien(LIEN_ICONE_WHATSAPP), icon: "whatsapp-logo", label: "WhatsApp" },
               { href: TELEGRAM.lien, icon: "telegram-logo", label: "Telegram" }
             ].map((social, i) => (
               <a
                 key={i}
                 href={social.href}
                 // Nouvel onglet seulement pour un autre site (pas pour /contact)
                 target={social.href.startsWith("http") ? "_blank" : undefined}
                 rel={social.href.startsWith("http") ? "noopener noreferrer" : undefined}
                 aria-label={social.label} 
                 onClick={triggerVibration}
                 className="group touch-manipulation p-1"
               >
                 <i className={`ph-fill ph-${social.icon} text-4xl text-gray-500 transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-110 group-hover:text-or group-hover:drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]`}></i>
               </a>
             ))}
          </div>

        </div>
      </div>
    </footer>
  );
}