"use client";

import { useEffect, useState, useCallback } from "react";

export default function PrivacyClient() {
  const [activeSection, setActiveSection] = useState("collecte");
  const [focusedLang, setFocusedLang] = useState<'none' | 'fr' | 'nko'>('none');
  
  // 🚀 L'INNOVATION 0.01% : Jauge de progression de lecture
  const [scrollProgress, setScrollProgress] = useState(0);

  const triggerVibration = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(30);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // Calcul de la jauge de progression
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
      setScrollProgress(progress);

      // Détection de la section active
      const sections = ["collecte", "utilisation", "protection", "partage", "droits"];
      const scrollPosition = window.scrollY + 250;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element && element.offsetTop <= scrollPosition && (element.offsetTop + element.offsetHeight) > scrollPosition) {
          setActiveSection(section);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    triggerVibration();
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 150;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const clauses = [
    {
      id: "collecte",
      titleNko: "ߘߎ߲߬ߘߎ߬ߡߊ߬ ߞߎ߲ߣߊߝߏߣߌ߲ ߠߎ߬ ߟߊߘߍ߭",
      titleFr: "1. Collecte des Données",
      tldrNko: "ߊ߬ ߞߘߐ ߜߍߘߐ: ߊ߲ ߧߋ߫ ߞߎ߲߬ߣߊ߬ߝߏߣߌ߲ ߡߌ߬ߘߊ߬ ߟߊ߫ ߡߍ߲ ߡߊߞߏ ߦߴߊ߲ ߠߊ߫ ߖߋ߬ߓߌ߬ߟߌ ߘߐ߫ ߘߐߙߐ߲߫.",
      tldrFr: "En clair : Nous collectons uniquement ce qui est strictement nécessaire pour vous répondre.",
      textNko: "ߊ߲ ߠߊ߫ ߟߐ߲ߞߏ ߟߊߖߍ߲ߛߍ߲ ߗߋߦߊ ߞߣߐ߫߸ ߊ߲ ߧߋ߫ ߘߎ߲߬ߘߎ߬ߡߊ߬ ߞߎ߲ߣߊߝߏߣߌ߲ ߠߎ߬ ߟߊߘߍ߭ ߘߊ߲߬ߛߌ߰ߟߊ߫ ߞߊ߬ ߓߍ߲߬ ߡߊ߬ߞߏ߬ ߢߣߊߡߊ ߟߎ߬ ߘߐߙߐ߲ ߔߋ߫ ߟߋ߬ ߡߊ߬. ߏ߬ ߦߋ߫ ߞߍ߫ ߟߊ߫ ߟߋ߬ ߣߴߊߟߎ߫ ߞߵߊ߲ ߟߊߛߐ߬ߘߐ߲߬ ߛߌߟߊ ߟߊߓߊ߯ߙߊ߫߸ ߊ߲ ߧߴߊ߬ߟߎ߫ ߕߐ߮ ߣߴߊߟߎ߫ ߟߊ߫ ߢߎߡߍߙߋ߲ߞߏ߲ߘߏ ߊ߬ ߣߴߊ߬ߟߎ߫ ߟߊ߫ ߗߋߛߓߍ ߘߐߙߐ߲߫ ߠߋ߬ ߡߌ߬ߘߊ߬ ߟߊ߫ ߛߴߊ߲ ߘߌ߫ ߛߋ߫ ߊߟߎ߫ ߖߋ߬ߓߌ߬ ߟߊ߫߸ ߏ߬ ߘߐ߫߹",
      textFr: "Dans le cadre de notre mission de vulgarisation scientifique, nous limitons la collecte de données au strict minimum. Lorsque vous utilisez notre formulaire de contact, nous recueillons uniquement votre nom, votre adresse e-mail et le contenu de votre message afin de pouvoir vous répondre."
    },
    {
      id: "utilisation",
      titleNko: "ߞߎ߲߬ߣߊ߬ߝߏߣߌ߲ ߠߎ߬ ߟߊߓߊ߯ߙߊߢߊ",
      titleFr: "2. Utilisation des Informations",
      tldrNko: "ߊ߬ ߞߘߐ ߜߍߘߐ: ߊߟߎ߫ ߟߊ߫ ߞߎ߲߬ߣߊ߬ߝߏߣߌ߲ ߠߎ߬ ߦߋ߫ ߟߊߓߊ߯ߙߊ߫ ߟߊ߫ ߓߌ߬ߟߊ߬ߢߐ߲߰ߡߊ ߘߐߙߐ߲߫ ߠߋ߬ ߘߐ߫.",
      tldrFr: "En clair : Vos informations ne servent qu'à la communication. Pas de publicité, pas de ciblage.",
      textNko: "ߊߟߎ߫ ߦߴߊߟߎ߫ ߟߊ߫ ߞߎ߲߬ߣߊ߬ߝߏߣߌ߲ ߡ߲ ߠߎ߬ ߟߊߕߊ߬ߡߌ߲߬ߠߊ߫ ߊ߲ ߡߊ߬߸ ߏ߬ ߟߎ߬ ߦߋ߫ ߟߊߓߊ߯ߙߊ߫ ߟߊ߫ ߞߎ߲߬ ߞߋߟߋ߲߫ ߔߋ߫ ߘߐߙߐ߲߫ ߠߋ߬ ߘߐ߫ ߊ߲ ߓߟߏ߫߹ ߣߴߏߴ ߦߴߊ߲ ߓߍ߫ ߛߋ߫ ߞߊ߬ ߢߐ߲߯ ߟߊߛߐ߬ߘߐ߲߬ ߢߊ ߡߌ߲ ߡߊ߬߹ ߞߊ߬ ߓߌ߬ߟߊ߬ߢߐ߲߰ߡߊ߬ߦߊ߫߹ ߣߴߏ߬ ߕߍ߫ ߊ߲ ߕߴߊߟߎ߫ ߟߊ߫ ߞߎ߲߬ߣߊ߬ߝߏߣߌ߲ ߠߎ߬ ߟߊߓߊ߯ߙߊ߫ ߟߊ߫ ߖߎ߬ߟߊ߬ߦߊ߬ ߟߊ߬ߛߙߋ߬ߦߊ߬ߟߌ ߣߴߊ߬ ߕߣߐ߬ߓߐ߬ ߛߌߙߊ߫ ߛߌ߫ ߞߊ߲߬߹ ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ ߦߋ߫ ߟߐ߲ߠߌ߲ ߝߏߟߏ߲ߝߊߟߊ߲ ߠߋ߬ ߘߌ߫߸ ߊ߬ ߕߍ߫ ߖߎ߬ߟߊ߬ߦߊ߬ ߘߊߞߎ߲߫ ߛߌ߫ ߘߐ߫ ߡߎ߬ߡߍ߫߹",
      textFr: "Les informations que vous nous confiez sont utilisées dans un seul but : la communication directe avec vous. Nous n'utilisons pas vos données pour vous envoyer des publicités non sollicitées, ni pour du profilage marketing. Le sanctuaire N'Ko ni Lonko est un espace de savoir, pas un espace commercial."
    },
    {
      id: "protection",
      titleNko: "ߟߊ߬ߞߊ߲߬ߘߊ߬ߟߌ ߣߌ߫ ߞߣߐ߬ߜߍ߲߬ߠߌ߲",
      titleFr: "3. Sécurité de l'Architecture",
      tldrNko: "ߊ߬ ߞߘߐ ߜߍߘߐ: ߊ߲ ߧߋ߫ ߛߋߒߞߏߟߦߊ ߞߎ߲߬ߕߍߡߊ ߟߊߓߊ߯ߙߊ߫ ߟߊ߫ ߞߵߊߟߎ߫ ߟߊ߫ ߞߎ߲߬ߣߊ߬ߝߏߣߌ߲ ߠߎ߬ ߟߊߞߊ߲ߘߊ߫.",
      tldrFr: "En clair : Nous utilisons un cryptage de haut niveau pour sécuriser vos échanges.",
      textNko: "ߊߟߎ߫ ߟߊ߫ ߞߎ߲߬ߣߊ߬ߝߏߣߌ߲ ߠߎ߬ ߟߊߞߊ߲ߘߊ ߦߴߊ߲ ߡߊ߬ߞߏ߬ ߝߟߐ߫ ߟߋ߬ ߘߌ߫. ߊ߲ ߠߊ߫ ߓߟߐߟߐ ߞߐߜߍ ߦߋ߫ ߘߞߏ߬ߓߛߍ ߟߊߞߊ߲ߘߊ߫ ߛߋߞߏߦߊ ߟߎ߬ ߓߍ߯ ߘߐ߫ ߞߟߏߜߍߟߍ߲߫ ߠߎ߬ ߟߋ߬ ߕߍ߫ ߡߊ߬ ߓߌ߬߸ ߥߟߊ߫ ߛߊ߫ ߞߴߊ߲ ߟߊ߫ ߓߊ߯ߙߊߛߌ߮ ߟߎ߬ ߣߌ߫ ߊ߬ߟߎ߬ ߟߊ߫ ߓߟߐߟߐ ߛߏ߯ߓߊߟߌߟߊ ߟߎ߬ ߣߌ߫ ߢߐ߲߯ ߕߍ߫ ߓߌ߬ߟߊ߬ߢߐ߲߰ߡߊߦߊ ߛߘߌ߬ߜߋ߲߫ ߠߎ߬ ߟߊߞߊ߲ߘߊ߫߸ ߊ߬ ߢߊ ߓߘߍߓߘߍ߫ ߡߊ߬߸ ߏ߬ ߘߐ߫ ߊ߲ ߠߊ߫ ߟߐ߲ߞߏ ߞߋߛߓߍ ߟߎ߬ ߘߌ߫ ߕߏ߫ ߜߎ߲߬ߘߏ ߊ߬ ߣߌ߫ ߘߎ߲߬ߘߎ߬ߡߊ߬ߦߊ ߘߝߊߣߍ߲ ߘߐ߫.",
      textFr: "La sécurité de vos données est une priorité absolue. Notre architecture utilise les technologies de cryptage les plus avancées pour protéger les échanges entre votre navigateur et nos serveurs, garantissant ainsi que vos communications scientifiques restent strictement confidentielles."
    },
    {
      id: "partage",
      titleNko: "ߟߊ߬ߖߍ߲߬ߛߍ߲߬ߓߊߟߌߦߊ ߣߌ߫ ߜߎ߲߬ߘߏ߬ߦߊ",
      titleFr: "4. Confidentialité Absolue",
      tldrNko: "ߊ߬ ߞߘߐ ߜߍߘߐ: ߊ߲ ߕߍߣߊ߬ ߊߟߎ߫ ߟߊ߫ ߞߎ߲߬ߣߊ߬ߝߏߣߌ߲ ߠߎ߬ ߝߙߋ߬ ߟߊ߫ ߥߟߴߊ߬ ߘߌ߫ ߟߊ߫ ߡߐ߰ ߜߘߍ߫ ߡߊ߬ ߡߎ߰ߡߍ߫.",
      tldrFr: "En clair : N'Ko ni Lonko ne vendra et ne cédera jamais vos données à des tiers.",
      textNko: "ߊ߲ ߧߴߊ߲ ߞߎߡߊߞߊ߲ ߘߌ߫ ߟߊ߫߸ ߞߵߊ߲ ߞߎ߲߬ ߘߏ߲߬ ߊ߬ ߞߘߐ߫߸ ߊ߲ ߕߍߣߊ߬ ߊߟߎ߫ ߟߊ߫ ߘߎ߲߬ߘߎ߬ߡߊ߬ ߞߎ߲ߣߊߝߏߣߌ߲ ߠߎ߬ ߛߌ߲ߞߊ߫ ߟߊ߫߸ߊ߬ ߝߙߋ߬ ߟߊ߫ ߥߟߴߊ߬ ߘߏ߲߬ߠߊ߫ ߡߐ߰ ߜߘߍ߫ ߓߟߏ߫ ߡߎ߰ߡߍ߫߹ ߞߎ߲߬ߣߊ߬ߝߏߣߌ߲ ߡߍ߲ ߠߎ߬ ߦߋ߫ ߘߏ߲߬ ߠߊ߫ ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ ߝߏߟߏ߲ߝߊߟߊ߲ ߞߣߐ߫߸ ߏ߬ ߟߎ߬ ߦߋ߫ ߕߏ߫ ߟߴߊ߲ ߠߊ߫ ߞߣߐ߬ߜߍ߲߬ߠߌ߲ ߘߊߞߎ߲ ߠߋ߬ ߘߐ߫ ߞߘߊߎ߫߹ ߏ߬ ߟߎ߬ ߕߍ߫ ߘߌߟߊ߫ ߛߌ߲߬ߝߏ߲߬ߘߊ ߜߘߍ߫ ߛߌ߫ ߡߊ߬߹",
      textFr: "Nous prenons l'engagement solennel de ne jamais vendre, louer ou céder vos données personnelles à des tiers. Les informations que vous partagez avec N'Ko ni Lonko restent au sein de notre infrastructure et ne sont accessibles qu'à l'équipe d'administration pour répondre à vos requêtes."
    },
    {
      id: "droits",
      titleNko: "ߟߊߓߊ߯ߙߊߟߊ ߟߊ߫ ߤߊߞߍ ߟߎ߬",
      titleFr: "5. Droits Numériques",
      tldrNko: "ߊ߬ ߞߘߐ ߜߍߘߐ: ߊߟߎ߫ ߤߊߞߍ ߦߴߊߟߎ߫ ߓߟߏ߫ ߞߊ߬ ߢߌ߬ߣߌ߲߬ߞߊ߬ߟߌ ߞߍ߫ ߞߵߊߟߎ߫ ߟߊ߫ ߞߎ߲߬ߣߊ߬ߝߏߣߌ߲ ߖߐ߬ߛߌ߬.",
      tldrFr: "En clair : Vous restez le seul maître de vos informations personnelles.",
      textNko: "ߞߊ߬ ߓߍ߲߬ ߞߊ߬ ߞߢߊ߫ ߘߎߢߊ߫ ߝߘߏ߬ߓߊ߬ ߞߎ߲߬ߣߊ߬ߝߏߣߌ߲ ߠߎ߬ ߟߊߞߊ߲ߘߊ ߞߎ߬ߙߎ߲߬ߘߎ ߖߍ߬ߘߍ ߞߊ߫ ߟߊ߬ߛߋ߬ߟߌ ߟߎ߬ ߡߊ߬߸ ߊߟߎ߫ ߟߊ߫ ߤߊߞߍ ߟߎ߬ ߓߍ߯ ߘߝߊߣߍ߲ ߧߴߊߟߎ߫ ߓߟ߫ ߟߋ߬ ߕߎ߬ߡߊ߬ ߓߍ߫߹ ߊ߬ߟߎ߫ ߟߊ߫ ߤߊߞߍ ߦߴߊߟߎ߫ ߓߟߏ߫ ߞߊ߬ ߢߌ߬ߣߌ߲߬ߞߊ߬ߟߌ ߞߍ߫ ߛߊ߫ ߞߵߊ߬ߟߎ߫ ߟߊ߫ ߞߎ߲߬ߣߊ߬ߝߏߣߌ߲ ߘߌߟߋ߲߫ ߠߎ߬ ߟߊߛߐ߲߬ߘߐ߲߬߸ ߞߵߊ߬ߟߎ߬ ߡߊߦߟߍ߬ߡߊ߲ ߥߟߊ߫ ߞߵߊ߬ ߖߐ߬ߛߌ߬ ߔߋߎ߫߸ ߞߊ߬ ߛߌߟߊ߫ ߕߍ߰ ߊ߲ ߣߌ߫ ߊ߬ߟߎ߫ ߕߍ߫߹ ߣߴߊߟߎ߫ ߡߊߞߏ ߟߐ߬ߘߊ߫ ߣߌ߲߬ ߞߏ߫ ߘߏ߫ ߘߐ߫ ߞߋߟߋ߲߫ ߠߊ߫ ߊߟߎ߫ ߘߌ߫ ߛߋ߫ ߊ߲ ߟߊߛߐ߬ߘߐ߲߬ ߞߋߛߓߍ߫ ߥߟߊ߫ ߜߋ߲ߟߋ߲ߜߋߟߋ߲ ߝߙߍߕߍ ߞߊ߲߬ ߝߍ߬߹",
      textFr: "Conformément aux standards mondiaux de protection des données, vous conservez le contrôle total sur vos informations. Vous avez le droit de demander l'accès, la modification ou la suppression définitive de toute correspondance que vous nous auriez envoyée, en nous contactant directement."
    }
  ];

  return (
    <div className="relative text-white flex flex-col items-center justify-start px-6 pt-32 pb-24 selection:bg-[#fbbf24] selection:text-black overflow-hidden print:bg-white print:text-black print:p-0">
      
      {/* 🚀 JAUGE DE PROGRESSION DE LECTURE */}
      <div className="fixed top-0 left-0 h-1 bg-[#fbbf24] z-50 print:hidden transition-all duration-300 ease-out shadow-[0_0_10px_rgba(251,191,36,0.8)]" style={{ width: `${scrollProgress}%` }}></div>

      {/* 🚀 L'AURA COSMIQUE */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] md:w-[700px] h-[350px] md:h-[700px] bg-blue-500 rounded-full blur-[130px] opacity-20 pointer-events-none animate-pulse duration-[7000ms] z-[-1] print:hidden"></div>

      <div className="relative z-10 max-w-7xl w-full mx-auto animate-in fade-in slide-in-from-bottom-10 duration-1000 fill-mode-forwards print:m-0 print:max-w-none">
        
        {/* EN-TÊTE JURIDIQUE INSTITUTIONNEL */}
        <div className="text-center mb-16 flex flex-col items-center print:mb-8">
            <div className="mb-6 relative group flex items-center justify-center p-4 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-[inset_0_0_20px_rgba(251,191,36,0.05)] print:hidden">
                <i className="ph-duotone ph-shield-check text-6xl text-[#fbbf24] drop-shadow-[0_0_15px_rgba(251,191,36,0.4)]"></i>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold text-[#fbbf24] mb-8 tracking-tight flex flex-col items-center print:text-black print:mb-4">
                <span className="block mb-4 leading-tight drop-shadow-lg font-kigelia print:drop-shadow-none">ߜߎ߲߬ߘߏ߬ߦߊ ߞߎ߬ߙߎ߲߬ߘߎ</span>
                <span className="text-white/60 text-base md:text-xl font-light uppercase tracking-[0.3em] border-y border-white/10 py-2 inline-block print:text-black print:border-black print:font-bold">
                    Politique de confidentialité
                </span>
            </h1>
            
            <div className="flex flex-col items-center gap-2">
                <p className="font-kigelia text-[#fbbf24] text-xl print:text-gray-800">ߟߊ߬ߞߎ߬ߘߊ߬ߟߌ ߟߊߓߊ߲ : ߞߏ߲ߞߏߜߍ ߂߀߂߆</p>
                <p className="text-gray-400 font-light text-xs md:text-sm tracking-widest uppercase print:text-gray-600">Dernière mise à jour : Février 2026</p>
            </div>
        </div>

        {/* 🚀 NAVIGATION MOBILE */}
        <div className="lg:hidden sticky top-[80px] z-40 bg-[#02040a]/90 backdrop-blur-xl border-y border-white/10 -mx-6 px-6 py-4 mb-12 flex overflow-x-auto hide-scrollbar touch-pan-x shadow-[0_10px_30px_rgba(0,0,0,0.5)] print:hidden">
            <div className="flex gap-3">
                {clauses.map((clause, idx) => (
                    <button
                        key={`mob-${clause.id}`}
                        onClick={() => scrollToSection(clause.id)}
                        className={`whitespace-nowrap px-5 py-2.5 rounded-full border transition-all duration-300 font-bold text-sm touch-manipulation flex flex-col items-center justify-center gap-1 ${
                            activeSection === clause.id 
                            ? "bg-[#fbbf24] border-[#fbbf24] text-black shadow-[0_0_15px_rgba(251,191,36,0.3)]" 
                            : "bg-white/5 border-white/10 text-gray-400"
                        }`}
                    >
                        <span className={`font-kigelia ${activeSection === clause.id ? "text-black" : "text-[#fbbf24]"}`}>{idx + 1}. {clause.titleNko}</span>
                    </button>
                ))}
            </div>
        </div>

        {/* STRUCTURE EN DEUX COLONNES (Bureau) */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 relative print:flex-col print:gap-4">
            
            {/* 1. LE MENU LATÉRAL "STICKY" (PC uniquement) */}
            <div className="hidden lg:block w-1/4 shrink-0 print:hidden">
                <div className="sticky top-32 flex flex-col gap-6 border-l border-white/10 pl-6">
                    <div className="flex flex-col items-start mb-4" dir="rtl">
                        <span className="font-kigelia text-[#fbbf24] text-2xl mb-1">ߞߎ߬ߙߎ߲߬ߘߎ ߢߍߛߓߍ</span>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold" dir="ltr">Sommaire Juridique</span>
                    </div>

                    {clauses.map((clause) => (
                        <button 
                            key={`nav-${clause.id}`}
                            onClick={() => scrollToSection(clause.id)}
                            className={`flex flex-col items-start text-left transition-all duration-300 group ${activeSection === clause.id ? "opacity-100 translate-x-2" : "opacity-40 hover:opacity-80"}`}
                        >
                            <span className={`font-kigelia text-xl mb-1 transition-colors ${activeSection === clause.id ? "text-[#fbbf24] drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]" : "text-white group-hover:text-[#fbbf24]"}`} dir="rtl">{clause.titleNko}</span>
                            <span className="text-[10px] text-white font-light tracking-wider uppercase">{clause.titleFr}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. LE CONTENU ZEN AVEC FOCUS COGNITIF */}
            <div className="w-full lg:w-3/4 max-w-4xl flex flex-col gap-12 lg:pl-10 pb-20 print:w-full print:p-0 print:pb-0">
                {clauses.map((clause) => (
                    <section key={clause.id} id={clause.id} className="scroll-mt-40 print:scroll-mt-0 print:break-inside-avoid print:mb-8">
                        
                        {/* Titre de Section */}
                        <div className="mb-6 flex flex-col items-start border-b border-white/10 pb-6 print:border-black print:pb-2" dir="rtl">
                            <h2 className="font-kigelia text-3xl md:text-4xl text-[#fbbf24] mb-2 drop-shadow-md print:text-black print:drop-shadow-none">{clause.titleNko}</h2>
                            <span className="text-xs md:text-sm tracking-[0.2em] text-gray-400 uppercase font-bold print:text-gray-800" dir="ltr">{clause.titleFr}</span>
                        </div>
                        
                        {/* Corps de Section */}
                        <div className="flex flex-col gap-8 backdrop-blur-md bg-[#02040a]/60 p-8 md:p-12 rounded-[2rem] border border-white/5 shadow-xl hover:border-white/10 transition-colors print:bg-white print:border-none print:shadow-none print:p-0">
                            
                            {/* 🚀 LE TL;DR (Le résumé ultra-différencié) */}
                            <div className="flex flex-col gap-4 bg-white/5 border-l-2 border-[#fbbf24] p-5 rounded-r-xl print:bg-gray-100 print:border-l-gray-500">
                                <div className="flex flex-col items-start" dir="rtl">
                                    <div className="flex items-center gap-3 mb-2">
                                      <i className="ph-fill ph-info text-[#fbbf24] print:hidden text-xl"></i>
                                      {/* 🚀 N'Ko en blanc/gris clair pour trancher avec l'Or du texte principal */}
                                      <p className="font-kigelia text-xl text-white/90 print:text-black">{clause.tldrNko}</p>
                                    </div>
                                </div>
                                <div className="flex items-start text-left" dir="ltr">
                                  {/* 🚀 FR en gris clair pour la hiérarchie */}
                                  <p className="text-sm font-light text-gray-400 print:text-gray-700 italic">{clause.tldrFr}</p>
                                </div>
                            </div>

                            {/* BLOC N'KO (Le Texte Principal majestueux en Or) */}
                            <div 
                              className={`transition-opacity duration-500 ${focusedLang === 'fr' ? 'opacity-30 blur-[1px]' : 'opacity-100'} print:opacity-100 print:blur-none`}
                              onMouseEnter={() => setFocusedLang('nko')}
                              onMouseLeave={() => setFocusedLang('none')}
                            >
                                <p className="font-kigelia text-2xl md:text-3xl text-[#fbbf24] leading-[1.8] md:leading-[2] text-right drop-shadow-sm print:text-black print:drop-shadow-none" dir="rtl">
                                    {clause.textNko}
                                </p>
                            </div>
                            
                            <div className="flex items-center justify-center opacity-20 print:hidden">
                                <div className="h-[1px] w-1/3 bg-gradient-to-r from-transparent via-[#fbbf24] to-transparent"></div>
                            </div>
                            
                            {/* BLOC FRANÇAIS */}
                            <div 
                              className={`transition-opacity duration-500 ${focusedLang === 'nko' ? 'opacity-30 blur-[1px]' : 'opacity-100'} print:opacity-100 print:blur-none`}
                              onMouseEnter={() => setFocusedLang('fr')}
                              onMouseLeave={() => setFocusedLang('none')}
                            >
                                <p className="font-light text-lg md:text-xl text-gray-300 leading-[2] md:leading-[2.2] text-left print:text-black" dir="ltr">
                                    {clause.textFr.replace(/'/g, "&apos;")}
                                </p>
                            </div>
                        </div>
                    </section>
                ))}

                {/* 🚀 SIGNATURE INSTITUTIONNELLE */}
                <div className="mt-8 flex flex-col items-end border-t border-white/10 pt-12 print:border-black print:pt-6" dir="rtl">
                    <div className="flex items-center gap-3 mb-2 print:hidden">
                       <i className="ph-fill ph-seal-check text-[#fbbf24] text-2xl"></i>
                    </div>
                    <p className="font-kigelia text-xl text-[#fbbf24] mb-2 print:text-black">ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ — ߖߏ߯ߦߊߟߌ ߣߌ߫ ߞߎ߲߬ߣߊ߬ߝߏߣߌ߲ ߠߊߞߊ߲ߘߊ ߕߏ߲߰ߘߊ</p>
                    <p className="text-xs tracking-[0.2em] text-white/50 uppercase font-bold print:text-gray-600" dir="ltr">N&apos;Ko ni Lonko — Département d&apos;Éthique et de Protection des Données</p>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}