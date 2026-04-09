"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation"; // 🚀 IMPORT DU ROUTEUR NATIF
import { useLanguage } from "../components/LanguageProvider"; // 🚀 IMPORT DU CERVEAU BILINGUE

export default function AboutClient() {
  // 🚀 1. LE FOCUS COGNITIF (Bilinguisme intelligent)
  const [focusedLang, setFocusedLang] = useState<'none' | 'fr' | 'nko'>('none');

  // 🚀 2. LE RADAR HAPTIQUE NARRATIF
  const quoteRef = useRef<HTMLDivElement>(null);
  const [quoteVibrated, setQuoteVibrated] = useState(false);

  // 🚀 3. LA CASCADE CINÉMATIQUE (Intersection Observer)
  const [visibleSections, setVisibleSections] = useState<Set<number>>(new Set());
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // 🚀 INTELLIGENCE LINGUISTIQUE & NAVIGATION (Nouveau)
  const router = useRouter();
  const { lang } = useLanguage();
  const isNko = lang === "nko";

  const triggerVibration = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
  }, []);

  // 🚀 L'ALGORITHME DE REPLI PWA (Le Bouton Retour 1/10000)
  const handleBack = useCallback(() => {
    triggerVibration();
    if (window.history.length > 2) {
      router.back();
    } else {
      router.push('/');
    }
  }, [router, triggerVibration]);

  // 🚀 DÉTECTION "POWER USER" 1/10000 (Échap + Retour Arrière Sécurisé - 100% Invisible)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleBack();
      }
      if (e.key === 'Backspace') {
        const activeElement = document.activeElement;
        const isTyping = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA';
        if (!isTyping) {
          handleBack();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleBack]);

  useEffect(() => {
    const cascadeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = Number(entry.target.getAttribute('data-index'));
          setVisibleSections(prev => new Set(prev).add(index));
          cascadeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    sectionRefs.current.forEach(ref => {
      if (ref) cascadeObserver.observe(ref);
    });

    const hapticObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !quoteVibrated) {
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([30, 50, 30]);
        setQuoteVibrated(true);
      }
    }, { threshold: 0.6 });

    if (quoteRef.current) hapticObserver.observe(quoteRef.current);

    return () => {
      cascadeObserver.disconnect();
      hapticObserver.disconnect();
    };
  }, [quoteVibrated]);

  // 🚀 4. LE SPOTLIGHT MAGNÉTIQUE
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

  const socialLinks = [
    { icon: "youtube-logo", href: "https://youtube.com/@nkonilonko", label: "YouTube" },
    { icon: "whatsapp-logo", href: "https://wa.me/22300000000", label: "WhatsApp" },
    { icon: "instagram-logo", href: "https://instagram.com/nkonilonko", label: "Instagram" },
    { icon: "facebook-logo", href: "https://facebook.com/nkonilonko", label: "Facebook" },
    { icon: "telegram-logo", href: "https://t.me/nkonilonko", label: "Telegram" }
  ];

  return (
    <div className="relative text-white flex flex-col items-center justify-center px-6 pt-32 pb-24 text-center selection:bg-[#fbbf24] selection:text-black overflow-hidden">
      
      {/* 🚀 LA PILULE DE VERRE DYNAMIQUE (Version Épurée 1/10000) */}
      <button
        onClick={handleBack}
        className={`group fixed top-6 z-[9999] flex items-center gap-2 p-1 md:px-3 md:py-1.5 rounded-full bg-[#02040a]/40 backdrop-blur-md border border-white/10 shadow-lg hover:bg-[#02040a]/80 hover:border-[#fbbf24]/50 transition-all duration-500 touch-manipulation print:hidden ${
          isNko ? 'right-4 md:right-8' : 'left-4 md:left-8'
        }`}
        aria-label={isNko ? "ߛߊ߬ߦߌ߲߬" : "Retour en arrière"}
        dir={isNko ? "rtl" : "ltr"}
      >
        {/* L'Icône */}
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10 group-hover:bg-[#fbbf24] transition-colors duration-300 shrink-0 shadow-inner">
          <i className={`ph-bold ${isNko ? 'ph-arrow-right' : 'ph-arrow-left'} text-base text-gray-300 group-hover:text-black transition-colors`}></i>
        </div>
        
        {/* Le Texte */}
        <div className="hidden md:flex flex-col items-start pr-2">
          <span className={`font-bold text-[#fbbf24] text-xs md:text-sm leading-none ${isNko ? 'font-kigelia' : ''}`}>
            {isNko ? 'ߛߊ߬ߦߌ߲߬' : 'Retour'}
          </span>
        </div>
      </button>

      {/* 🚀 Aura bleue vibrante et visible pour un vrai contraste */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] md:w-[700px] h-[350px] md:h-[700px] bg-blue-500 rounded-full blur-[130px] opacity-20 pointer-events-none animate-pulse duration-7000 z-[-1]"></div>

      <div className="relative z-10 max-w-6xl mx-auto flex flex-col items-center animate-in fade-in slide-in-from-bottom-10 duration-1000 fill-mode-forwards">

        <div className="mb-10 relative group">
            <div className="absolute inset-0 bg-[#fbbf24] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
            <i className="ph-duotone ph-scroll text-7xl md:text-8xl text-[#fbbf24] relative z-10 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]"></i>
        </div>

        <h1 className="text-4xl md:text-7xl font-extrabold text-[#fbbf24] mb-20 tracking-tight font-sans">
            <span className="block mb-4 md:mb-6 leading-tight drop-shadow-lg font-kigelia">ߞߊ߲߬ߞߎߡߊ</span>
            <span className="text-white/80 text-base md:text-xl font-light uppercase tracking-[0.3em] border-y border-white/10 py-2 inline-block">
                À Propos de nous
            </span>
        </h1>

        {/* ========================================== */}
        {/* SECTION 1 : LA VISION */}
        {/* ========================================== */}
        <div 
          ref={(el) => { sectionRefs.current[0] = el; }}
          data-index={0}
          onMouseMove={handleMouseMove}
          className={`group/spotlight relative backdrop-blur-xl bg-[#02040a]/80 p-8 md:p-14 rounded-[2rem] border border-white/10 shadow-2xl w-full mb-12 overflow-hidden transition-all duration-1000 transform ${visibleSections.has(0) ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'}`}
        >
            <div className="pointer-events-none absolute -inset-px rounded-[2rem] opacity-0 transition duration-300 group-hover/spotlight:opacity-100" style={{ background: 'radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(251,191,36,0.06), transparent 40%)' }}></div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 relative z-10" dir="ltr">
                <div 
                  className={`order-2 lg:order-1 flex flex-col justify-center text-left transition-opacity duration-500 ${focusedLang === 'nko' ? 'opacity-30 blur-[1px]' : 'opacity-100'}`}
                  onMouseEnter={() => setFocusedLang('fr')}
                  onMouseLeave={() => setFocusedLang('none')}
                >
                    <h2 className="text-sm tracking-[0.2em] text-[#fbbf24] uppercase mb-6 opacity-80 font-bold">La Vision</h2>
                    {/* 🚀 FR : Agrandissement de taille (text-lg/xl) et d'interligne (leading-2) */}
                    <p className="font-light text-lg md:text-xl text-gray-300 leading-[2] md:leading-[2.2]">
                        <strong>La science n&apos;a pas de frontières. La langue ne devrait plus en être une.</strong><br/><br/>
                        N&apos;Ko ni Lonko est né d&apos;une vision radicale : démocratiser l&apos;accès aux sciences exactes (astronomie, physique quantique, biologie) pour le peuple Mandingue et au-delà, en utilisant le N&apos;Ko non plus seulement comme un héritage culturel, mais comme un vecteur technologique de pointe.
                    </p>
                </div>
                <div 
                  className={`order-1 lg:order-2 flex flex-col justify-center text-right transition-opacity duration-500 ${focusedLang === 'fr' ? 'opacity-30 blur-[1px]' : 'opacity-100'}`}
                  onMouseEnter={() => setFocusedLang('nko')}
                  onMouseLeave={() => setFocusedLang('none')}
                  dir="rtl"
                >
                    {/* 🚀 N'KO : Verrouillé tel que tu l'as validé */}
                    <h2 className="font-kigelia text-2xl md:text-3xl text-[#fbbf24] mb-6">ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ</h2>
                    <p className="font-kigelia text-2xl md:text-3xl text-[#fbbf24] leading-[1.8] md:leading-[2] drop-shadow-md">
                        ߞߵߊ߬ ߘߐߛߊߙߌ߫ ߸ ߞߵߊ߬ ߢߊߦߋ߫ ߸ ߞߵߊ߬ ߟߊߓߊ߯ߙߊ߫ ߏ߬ ߟߋ߬ ߦߋ߫ ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ ߞߊ߫ ߘߐ߬ߖߊ ߘߌ߫: ߊ߬ ߟߐ߲߫ ߞߏ߫ ߘߊ߲߬ ߛߌ߫ ߕߍ߫ ߟߐ߲ߞߏ ߟߊ߫߸ ߊ߰ ߏ߬ ߗߏ߯ ߞߋߟߋ߲߫ ߘߐ߫ ߘߊ߲߬ ߡߊ߲߫ ߞߊ߲߫ ߞߊ߬ ߞߍ߫߸ ߒ߬ ߠߊ߫ ߞߊ߲߫ ߘߐߦߙߌߥߊߟߋ߲߫ ߣߌ߲߬ ߝߣߊ߫ ߟߊ߫ ߘߋ߬߹ ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ ߟߊߘߊ߲߫ ߘߊ߫ ߣߊ߬ߕߊ ߘߏ߫ ߟߋ߬ ߞߊߡߊ߬،ߛߊ߫߸ ߞߊ߬ ߟߐ߲ߞߏ߫ &quot;ߛߓߍߡߊ&quot; ߟߎ߬ ߟߊߝߘߏ߬ߓߊ߬ߦߊ߬ ߦߏ߫:(ߛߊ߲ߡߊߛߓߍߟߐ߲ߘߐߦߊ߸ ߝߕߌߙߋ߲ ߘߐ߬ߞߏ߬ߦߊ߸ ߣߌߡߊߞߊߙߊ߲ ߣߴߊ߬ ߢߐ߲߰ ߘߐ߫ ߟߎ߬) ߡߊ߲߬ߘߋ߲߫ ߡߌ߬ߙߌ߲߬ߘߌ ߦߋ߫߸ ߞߊ߬ ߕߊ߬ߡߌ߲ ߏ߬ ߟߊ߫ ߝߐ߫ ߞߊ߬ ߕߊ߫ ߛߋ߫ ߘߎߢߊ߫ ߡߌ߬ߙߌ߲߬ߘߌ ߕߐ߭ ߓߍ߯ ߡߊ߬߹ ߒߞߏ ߟߊߓߊ߯ߙߊߟߌ ߕߍ߫ ߕߏ߫ ߣߊߡߎ߲ ߛߌߟߊ߫ ߘߐߙߐ߲߫ ߡߊ߬߸ ߏ߬ ߞߐ߫߸ ߊ߬ ߞߍߕߐ߫ ߓߍ߯ ߟߋ߬ ߦߋ߫ ߛߌߟߊߓߐߛߐ߯ߣߊ ߘߌ߫ ߣߌ߲߬߸ ߞߊ߬ ߥߊ߫ ߛߋߒߞߏߟߦߊ ߣߌ߫ ߞߎ߲߬ߛߊ߲߬ߧߊ ߞߎ߲߬ߕߍ߫ ߡߊ߬ ߘߎߢߊ߫ ߞߣߐ߫߹
                    </p>
                </div>
            </div>
        </div>

        {/* ========================================== */}
        {/* SECTION 2 : L'ÉMANCIPATION */}
        {/* ========================================== */}
        <div 
          ref={(el) => { sectionRefs.current[1] = el; }}
          data-index={1}
          onMouseMove={handleMouseMove}
          className={`group/spotlight relative backdrop-blur-xl bg-[#02040a]/80 p-8 md:p-14 rounded-[2rem] border border-white/10 shadow-2xl w-full mb-12 overflow-hidden transition-all duration-1000 delay-150 transform ${visibleSections.has(1) ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'}`}
        >
            <div className="pointer-events-none absolute -inset-px rounded-[2rem] opacity-0 transition duration-300 group-hover/spotlight:opacity-100" style={{ background: 'radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(251,191,36,0.06), transparent 40%)' }}></div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 relative z-10" dir="ltr">
                <div 
                  className={`order-2 lg:order-1 flex flex-col justify-center text-left transition-opacity duration-500 ${focusedLang === 'nko' ? 'opacity-30 blur-[1px]' : 'opacity-100'}`}
                  onMouseEnter={() => setFocusedLang('fr')}
                  onMouseLeave={() => setFocusedLang('none')}
                >
                    <h2 className="text-sm tracking-[0.2em] text-[#fbbf24] uppercase mb-6 opacity-80 font-bold">L&apos;Émancipation</h2>
                    {/* 🚀 FR : Agrandissement de taille et d'interligne */}
                    <p className="font-light text-lg md:text-xl text-gray-300 leading-[2] md:leading-[2.2]">
                        L&apos;émancipation par le Savoir : nous croyons que l&apos;intelligence et l&apos;innovation s&apos;expriment le mieux dans la langue maternelle. Traduire les concepts scientifiques les plus complexes en N&apos;Ko, ce n&apos;est pas seulement traduire des mots, c&apos;est forger les outils intellectuels des futures générations de chercheurs, d&apos;ingénieurs et d&apos;innovateurs africains.
                    </p>
                </div>
                <div 
                  className={`order-1 lg:order-2 flex flex-col justify-center text-right transition-opacity duration-500 ${focusedLang === 'fr' ? 'opacity-30 blur-[1px]' : 'opacity-100'}`}
                  onMouseEnter={() => setFocusedLang('nko')}
                  onMouseLeave={() => setFocusedLang('none')}
                  dir="rtl"
                >
                    <h2 className="font-kigelia text-xl md:text-2xl text-[#fbbf24] mb-6">ߒߞߏ ߦߋ߫ ߡߊ߲߬ߛߊ ߟߋ߬ ߘߌ߫</h2>
                    <p className="font-kigelia text-xl md:text-2xl text-white/90 leading-[1.8] md:leading-[2]">
                        ߣߌ߫ ߟߐ߲ߞߏ ߞߍ߫ ߘߊ߫ ߦߙߍ߬ߛߘߐ߫ ߡߌ߲߫ ߘߌ߫ ߒߞߏ ߦߴߏ߬ ߝߊ߲߬ߞߊ ߟߋ߬ ߘߌ߫߸ ߞߏ߬ߣߌ߲߬ ߊ߲ ߧߴߊ߬ ߖߊ߬ߕߋ߬ߟߊ ߟߋ߬ ߞߏ߫ ߦߟߌߟߊ߲ߘߌߦߊ ߣߌ߫ ߟߊ߬ߞߎ߬ߘߊ߬߬ߞߎ߬ߘߊ߬ߦߊߟߌ ߟߎ߬ ߓߍ߯ ߞߍߝߍ߲߫ ߢߌ߲߬ߡߊ߲߫ ߠߋ߬ ߦߋ߫ ߝߊ߬ߛߏ ߞߊ߲ ߘߌ߫߹ ߏ߬ ߘߐ߫ ߛߊ߫߸ ߞߊ߬ ߟߐ߲ߞߏ ߡߌ߬ߣߊ߬ߘߊ ߞߛߌ߬ߞߛߊ߬ߡߊ ߟߎ߬ ߢߊߝߐ߫ ߊ߲ ߠߊ߫ ߞߊ߲߫ ߘߐ߫߸ ߏ߬ ߞߏ߫߸ ߏ߬ ߕߍ߫ ߛߋ߫ ߟߊߝߍ߯ߦߊߟߊ߫ ߞߵߏ߬ ߓߌ߬ߟߊ߬߫ ߞߎߡߊߘߋ߲ ߘߟߊߡߌߣߊߟߌ ߘߐߙߐ߲߫ ߡߌ߬ߣߊ߲ ߞߣߐ߫ ߢߊ߫ ߛߌ߫ ߡߊ߬߹ ߐ߲߫ ߊ߬ ߟߐ߲߫ ߞߴߏ߬ ߓߊ߯ߙߊ ߜߙߋߡߊߕߍ߯ߟߌ ߟߋ߬ ߘߌ߫ ߓߍ߲߬ ߥߙߎߞߟߌ ߛߌߙߊ߫ ߕߋߟߋ߲ߠߋ߲߫ ߡߊ߬ ߕߋߙߎ߲߫߸ ߘߋ߲ߣߍ߲߫ ߦߟߌߟߊ߲ߘߌ ߝߊ߯ߘߐߞߍ ߣߊ߬ߕߐ߫ ߟߎ߬ ߦߋ߫߸ ߏ߬ ߟߎ߬ ߡߌ߲ ߠߎ߬ ߓߍߣߊ߬ ߞߍ߫ ߛߌߣߌ߲߫ ߢߌߣߌߣߌ߲ߠߊ ߞߎ߬ߛߊ߲߸ ߞߋ߬ߞߎ߲߬ߣߌߞߋߞߎ߲ ߊ߬ ߣߌ߫ ߝߊ߬ߘߊ߬ߝߌ߲߬ߠߊ ߟߊ߬ߞߎ߬ߘߊ߬ߞߎ߬ߘߊ߬ߦߊ߬ߟߌ ߟߊ߫ ߟߎ߬ ߘߌ߫ ߞߐߟߊ߫߹
                    </p>
                </div>
            </div>
        </div>

        {/* ========================================== */}
        {/* SECTION 3 : LE FONDATEUR */}
        {/* ========================================== */}
        <div 
          ref={(el) => { 
            sectionRefs.current[2] = el; 
            if (quoteRef && typeof quoteRef !== 'function') (quoteRef as React.MutableRefObject<HTMLDivElement | null>).current = el; 
          }}
          data-index={2}
          onMouseMove={handleMouseMove}
          className={`group/spotlight relative backdrop-blur-md bg-[#02040a]/90 p-8 md:p-14 rounded-[1.5rem] border-t-2 border-[#fbbf24] shadow-[0_10px_30px_rgba(251,191,36,0.15)] w-full text-center overflow-hidden transition-all duration-1000 delay-300 transform ${visibleSections.has(2) ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'}`}
        >
            <div className="pointer-events-none absolute -inset-px rounded-[1.5rem] opacity-0 transition duration-300 group-hover/spotlight:opacity-100" style={{ background: 'radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(251,191,36,0.08), transparent 40%)' }}></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 relative z-10" dir="ltr">
                <div 
                  className={`order-2 lg:order-1 flex flex-col items-center lg:items-start text-left transition-opacity duration-500 ${focusedLang === 'nko' ? 'opacity-30 blur-[1px]' : 'opacity-100'}`}
                  onMouseEnter={() => setFocusedLang('fr')}
                  onMouseLeave={() => setFocusedLang('none')}
                >
                    <i className="ph-fill ph-quotes text-4xl text-[#fbbf24]/30 mb-6"></i>
                    {/* 🚀 FR : Agrandissement de taille et d'interligne */}
                    <p className="text-lg md:text-xl text-gray-300 font-light italic leading-[2] md:leading-[2.2] mb-8">
                        &quot;J&apos;ai conçu cette plateforme avec une conviction absolue : le N&apos;Ko est la clé de voûte de notre souveraineté technologique. Ce sanctuaire numérique est une fondation posée pour l&apos;avenir. La science appartient à ceux qui peuvent la lire.&quot;
                    </p>
                    <p className="text-[#fbbf24] font-bold text-sm uppercase tracking-widest">— Moustapha CAMARA / MckV</p>
                    <p className="text-xs text-white/50 tracking-widest uppercase mt-2">Fondateur & Architecte</p>
                </div>
                
                <div 
                  className={`order-1 lg:order-2 flex flex-col items-center lg:items-end text-right transition-opacity duration-500 ${focusedLang === 'fr' ? 'opacity-30 blur-[1px]' : 'opacity-100'}`}
                  onMouseEnter={() => setFocusedLang('nko')}
                  onMouseLeave={() => setFocusedLang('none')}
                  dir="rtl"
                >
                    <h2 className="font-kigelia text-xl md:text-2xl text-[#fbbf24] mb-6 opacity-90">ߊ߬ ߟߊߘߊ߲ߓߊ߮ ߣߴߊ߬ ߓߐ߰ߟߐ߲߬ߠߊ ߟߊ߫ ߦߋߕߊ ߟߎ߬</h2>
                    <p className="font-kigelia text-xl md:text-2xl text-white/90 leading-[1.8] md:leading-[2] mb-8">
                        ߊ߲ ߞߊ߬ ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ ߓߟߐߟߐ ߝߏߟߏ߲ߝߊߟߊ߲ ߣߌ߲߬ ߟߊߘߊ߲߫ ߞߎ߲߬ ߞߎ߲߬ߓߊ߬ߓߊ ߞߋߟߋ߲߫ ߘߐߙߐ߲߫ ߠߋ߬ ߟߊ߫: ߣߴߏ߬ ߦߋ߫ ߞߊ߬ ߒߞߏ ߟߊ߫ ߛߊ߲ߠߞߊߦߊ߫ ߡߊߦߌ߬ߘߊ߬ ߞߛߐߓߍ߫߸ ߐ߲߫ ߏ߬ ߘߐ߫߸ ߊ߬ ߟߐ߲߫ ߞߏ߫ ߒߞߏ ߛߓߍߛߎ߲ ߠߋ߬ ߦߋ߫ ߛߋ߫ ߞߴߊ߲ ߠߊ߫ ߖߘߍ߬ߕߌ߰ߦߊ ߘߝߊߟߋ߲߫ ߟߊߛߊ߬ߞߌ߲߬ ߊ߲ ߡߊ߬߸ ߘߎߢߊ߫ ߛߋߞߏߟߦߊ ߘߊߞߎ߲ ߠߎ߬ ߓߍ߯ ߘߐ߫ ߓߌ߬߹ ߏ߬ ߞߏߛߐ߲߬ ߊ߲ ߠߊ߫ ߓߟߐߟߐ ߛߋߞߏߟߊ ߝߙߍߕߍߡߊ߫ ߣߌ߲߬ ߧߋ߫ ߖߎ߬ߓߌߟߊ ߥߟߊ߫ ߖߎ߬ߕߞߍ߫ ߟߋ߬ ߘߌ߫ ߞߊ߬ ߛߌߣߌ߲߫ ߢߍ߫ ߛߞߌ߬߸ ߒߞߏ ߞߊߙߊ߲ߡߐ߮ ߟߎ߬ ߣߌ߫ ߒߞߏ߫ ߞߊߙߊ߲ߘߋ߲߫ ߠߎ߬ ߘߌ߫ ߒߞߏ߫ ߟߊ߫ ߛߐ߬ߘߐ߲߬ߠߊ ߘߎߢߊ߫ ߝߊ߲߬ ߓߍ߯ ߘߐ߫ ߢߊ ߡߌ߲ ߡߊ߬߸ ߞߵߊ߬ ߞߊ߬ߙߊ߲߫߸ ߞߊ߬ ߢߊߦߋ߫߹ ߟߊߓߊ߲߫ ߘߐ߫ ߟߐ߲ߞߏ ߞߏ߬ߣߌ߲߬ ߧߋ߫ ߡߞߐ߬ ߟߋ߬ ߕߊ߫ ߘߌ߫ ߡߌ߲ ߓߍ߫ ߛߋ߫ ߊ߬ ߢߊߦߋ߫ ߟߊ߫߸ ߊ߬ ߝߊ߬ߛߏ ߞߊ߲ ߘߐ߫߹
                    </p>
                    <p className="text-[#fbbf24] font-kigelia text-lg md:text-xl">— ߡߎ߬ߛߊߝߊ߬ ߞߊ߬ߡߙߊ߬ / ߡ.ߞ</p>
                    <p className="text-xs font-kigelia text-[#fbbf24]/50 mt-2">ߟߊߘߊ߲ߓߊ߮ ߣߴߊ߬ ߓߐ߰ߟߐ߲߬ߦߊ߬ߟߊ</p>
                </div>
            </div>
        </div>

        {/* 🚀 RÉSEAUX SOCIAUX HAPTIQUES */}
        <div className="mt-8 flex justify-center">
            <div className="flex flex-wrap gap-5 justify-center">
                {socialLinks.map((link, i) => (
                    <a 
                      key={i} 
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.label}
                      onClick={triggerVibration}
                      className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center text-gray-400 hover:text-[#fbbf24] hover:border-[#fbbf24] hover:bg-[#fbbf24]/10 transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(251,191,36,0.3)] touch-manipulation group"
                    >
                        <i className={`ph-fill ph-${link.icon} text-2xl group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300`}></i>
                    </a>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
}