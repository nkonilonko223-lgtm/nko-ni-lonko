"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation"; // 🚀 IMPORT DU ROUTEUR NATIF
import { useLanguage } from "../components/LanguageProvider"; // 🚀 IMPORT DU CERVEAU BILINGUE

export default function TermsClient() {
  // 🚀 INTELLIGENCE LINGUISTIQUE & NAVIGATION
  const router = useRouter();
  const { lang } = useLanguage();
  const isNko = lang === "nko";

  const [activeSection, setActiveSection] = useState("acceptation");
  const [focusedLang, setFocusedLang] = useState<'none' | 'fr' | 'nko'>('none');
  const [scrollProgress, setScrollProgress] = useState(0);

  const triggerVibration = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(30);
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

  // 🚀 DÉTECTION "POWER USER" 1/10000 (Échap + Retour Arrière Sécurisé)
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

const clauses = [
    {
      id: "acceptation",
      titleNko: "߁. ߛߙߊߕߌ ߟߎ߬ ߟߊߡߌ߬ߘߊ߬ߟߌ",
      titleFr: "1. Acceptation des conditions",
      tldrNko: "ߊ߬ ߞߘߐ ߜߍߘߐߕߊ: ߞߊ߬ ߘߏ߲߬ ߦߊ߲߬ ߦߴߌ ߛߐ߲߭ ߠߋ߬ ߘߌ߫ ߛߙߊߕߌ ߟߎ߬ ߡߊ߬ ߞߐߘߏ߲ߓߊߟߌߦߊ ߘߐ߫.",
      tldrFr: "En clair : Utiliser ce site signifie accepter ses règles sans réserve.",
      textNko: "ߞߊ߬ ߘߏ߲߬ ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ ߓߟߐߟߐ ߝߏߟߏ߲ߝߊߟߊ߲ ߞߣߐ߫߸ ߏ߬ ߓߴߊ߬ ߦߌ߬ߘߊ߬ ߞߏ߫߸ ߌ ߓߘߊ߫ ߘߌ߬ߢߍ߬ ߣߌ߲߬ ߛߙߊߕߌ ߟߊߘߊ߲ߣߍ߲ ߠߎ߬ ߓߍ߯ ߟߊߓߊ߬ߕߏ߬ߟߌ ߞߐߘߏ߲ߓߊߟߌߦߊ ߡߊ߬߸ ߓߟߐߟߐ ߝߙߍߕߍߡߊ ߣߌ߲߬ ߛߌ߰ߟߋ߲߫ ߞߎ߬ߙߎ߲߬ߘߎ߬ ߞߍߙߍ߲ߞߍߙߍ߲ߟߋ߲߫ ߠߎ߬ ߟߋ߬ ߞߊ߲߬߸ ߡߌ߲ ߠߎ߬ ߘߊߕߐߡߟߊߟߌ ߦߋ߫ ߛߋ߲ߛߋ߲ߘߋ߲߫ ߘߌ߫ ߟߊ߬ߞߊ߬ߙߊ߲߬ߠߌ߲ ߣߌ߫ ߟߊ߬ߖߍ߲߬ߛߍ߲߬ߠߌ߲ ߘߊߞߎ߲ ߓߍ߯ ߘߐ߫ ߟߐ߲ߞߏ ߞߣߐ߫߹ ߣߴߌ ߡߊ߫ ߛߐ߲߬ ߏ߬ ߓߍ߲߬ߞߊ߲ ߠߎ߬ ߡߊ߬߸ ߌ ߞߊߣߊ߬ ߓߟߐߟߐ ߞߐߜߍ߫ ߣߌ߲߬ ߠߊߓߊ߯ߙߊ ߢߊ߫ ߛߌ߫ ߡߊ߬ ߘߋ߬߹",
      textFr: "En accédant à la plateforme N'Ko ni Lonko, vous acceptez pleinement et sans réserve les présentes conditions. Ce sanctuaire numérique est régi par des règles strictes de respect, d'apprentissage et de partage du savoir. Si vous refusez ces termes, vous n'êtes pas autorisé à utiliser nos services."
    },
    { 
      id: "mission",
      titleNko: "߂. ߣߊ߬ߞߊ߲ ߣߌ߫ ߗߋߦߊ",
      titleFr: "2. Mission et Vocation",
      tldrNko: "ߊ߬ ߞߘߐ ߜߍߘߐߕߊ: ߊ߲ ߠߊ߫ ߟߊ߬ߢߌߣߌ߲ ߠߋ߬ ߟߐ߲ߞߏ ߟߊߖߍ߲ߛߍ߲ ߘߌ߫ ߒߞߏ ߘߐ߫.",
      tldrFr: "En clair : Notre seul but est l'éducation et la diffusion des sciences exactes en N'Ko.",
      textNko: "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ ߟߊ߬ߢߌ߬ߣߌ߲߬ ߞߋߟߋ߲߫ ߔߋ߫ ߟߋ߬ ߣߴߏ߬ ߦߋ߫ ߟߐ߲ߞߏ ߛߓߊߡߊ ߟߎ߬ (ߛߊ߲ߡߊߛߓߍߟߐ߲ߘߐߦߊ߸ ߘߐ߬ߞߏ߸ ߣߌߡߊߞߊߙߊ߲߫߸ ߘߎ߰ߘߐ߬ߟߐ߲ߘߐߦߊ ߊ߬ ߣߴߊ߬ ߢߐ߲߰ ߕߐ߭ ߟߎ߬ ߓߍ߯) ߟߊߖߍ߲ߛߍ߲ ߘߌ߫ ߡߊ߲߬ߘߋ߲߫ ߝߘߏ߬ߓߊ߬ ߞߊ߲ ߘߐ߫. ߓߟߐߟߐ ߞߐߜߍ ߣߌ߲߬ ߧߋ߫ ߞߊ߬ߞߎߘߊ ߟߊ߬ߡߍ߲߬ߛߍ߲߬ߧߊ߬ߟߌ ߞߍ߫ ߡߌߣߊ߲߫ ߠߋ߬ ߘߌ߫ ߡߌ߲ ߟߊߘߊ߲߫ ߠߊ߫ ߛߊ߫ ߞߊ߬ ߞߊ߲ ߞߏ߫ ߘߊ߲߭ ߠߎ߬ ߓߍ߯ ߟߊߓߋ߫ ߔߘߋߎ߫߸ ߛߋߞߏߟߦߊ ߣߌ߫ ߞߎ߲߬ߣߊ߬ߞߊ߬ߟߌ ߣߐ߬ߡߊ߬ߓߊ߫ ߟߎ߬ ߢߊߢߌߣߌ߲ߠߌ ߣߴߊ߬ ߟߎ߬ ߝߊ߬ߡߎ߲߬ߠߌ ߘߐ߫ ߘߎߢߊ ߞߣߐ߫ ߓߌ߬߹",
      textFr: "N'Ko ni Lonko a pour vocation exclusive la vulgarisation des sciences exactes (astronomie, physique, biologie) en langue Mandingue. La plateforme est un outil éducatif d'avant-garde destiné à briser les barrières linguistiques dans l'accès aux technologies et découvertes mondiales."
    },
    {
      id: "propriete",
      titleNko: "߃. ߦߟߌߡߦߊ ߤߊߞߍ",
      titleFr: "3. Propriété Intellectuelle",
      tldrNko: "ߊ߬ ߞߘߐ ߜߍߘߐߕߊ: ߓߟߐߟߐ ߣߌ߲߬ ߝߋ߲ ߓߍ߯ ߦߋ߫ ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ ߟߋ߬ ߕߊ ߘߌ߫߸ ߊ߬ ߕߍ߫ ߛߏ߲߬ߧߊ߬ ߟߊ߫.",
      tldrFr: "En clair : Le code, le design et les traductions nous appartiennent. Copie interdite.",
      textNko: "ߓߟߐߟߐ ߞߐߜߍ ߣߌ߲߬ ߓߐ߬ߟߐ߲߬ߡߊ߬ߦߊ ߥߊ߫߸ߊ߬ ߘߞߏ߬ߥߟߊ ߛߓߍߟߌ ߓߐߖߎ߲ ߥߊ߫߸ ߊ߬ ߖߊ߬ߥߟߊ ߟߎ߬ ߥߊ߫߸ߝߐ߫ ߞߊ߬ ߕߊ߫ ߛߴߊ߬ ߘߟߊߡߌߣߊߟߌ ߟߎ߬ ߓߍ߯ ߡߊ߬ ߒߞߏ ߛߓߍߛߎ߲ ߘߐ߫ ߡߍ߲ ߠߎ߬ ߓߍ߯ ߟߊߖߍ߲ߛߍ߲߫ ߘߊ߫ ߦߊ߲߬߸ ߏ߬ ߓߍ߯ ߕߞߌ߬ߦߊ ߞߐߕߍ߰ߓߊߟߌ ߦߋ߫ ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ ߊ߬ ߣߌ߫ ߡߎ߬ߛߊߝߊ߬ ߞߊ߬ߡߙߊ߬ ߟߋ߬ ߓߟ߫߸ ߏ߬ ߘߐ߫ ߊ߬ ߕߍ߫ ߓߍ߲߬ ߗߞߏ߫ ߛߌ߫ ߟߊ߫߸ ߞߊ߬ ߣߌ߲߬ ߓߟߐߟߐ ߝߏߟߏ߲ߝߊߟߊ߲ ߞߣߐ߫ ߝߋ߲߫ ߕߊ߬ ߞߵߊ߬ ߟߊߓߊ߯ߙߊ߫ ߖߎ߬ߟߊ߬ߦߊ ߘߐ߫ ߣߌ߫ ߘߌ߬ߢߍ߬ ߛߓߍ߫ ߕߴߌ ߓߟ߫߹ ߞߊ߬ ߝߊߘߊ߫ ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ ߟߊ߫߹",
      textFr: "L'architecture du site, les codes sources, le design Glassmorphism, ainsi que toutes les traductions scientifiques originales en N'Ko publiées ici sont la propriété exclusive de N'Ko ni Lonko et de son fondateur, Moustapha CAMARA. Toute reproduction, copie ou exploitation commerciale sans autorisation écrite préalable est formellement interdite et passible de poursuites."
    },
    {
      id: "comportement",
      titleNko: "߄. ߟߊߓߊ߯ߙߊߟߊ ߟߊ߫ ߘߐ߬ߕߙߐ߬ߛߌ߬ߕߊ ߟߎ߬",
      titleFr: "4. Comportement de l'Utilisateur",
      tldrNko: "ߊ߬ ߞߘߐ ߜߍߘߐߕߊ: ߌ ߖߏ߯ߦߊ ߓߘߍ߬ ߞߍ߫߸ ߡߊ߬ߓߏ߲߬ߢߊ߬ߟߌ ߞߍ߫. ߘߞߏ߬ߕߋ߯ߙߋߦߊ ߟߊߓߊ߲ ߦߋ߫ ߜߍ߲ߠߌ߲ ߠߋ߬ ߘߌ߫.",
      tldrFr: "En clair : Respectez la science et les autres. Les piratages et fausses infos entraînent un bannissement.",
      textNko: "ߟߊߓߊ߯ߙߊߟߊ ߞߊ߫ ߞߊ߲߫ ߞߊ߬ ߛߐ߲߬߸ ߞߵߊ߬ ߓߟ߫ ߝߊ߫ ߡߊ߬ߓߏ߲߬ߢߊ߬ߟߌ ߘߊߝߊߣߍ߲ ߠߋ߬ ߟߊ߫ ߞߊ߬ ߢߊߛߌ߲߫ ߟߐ߲ߞߏ ߊ߬ ߣߌ߫ ߞߙߏ߬ߝߏ ߛߌ߬ߝߏ߲߬ߘߊ ߡߊ߬߹ ߡߐ߯ ߐ߫ ߡߐ߰ ߞߊ߬ ߓߟߐߓߐ ߝߏߟߏ߲ߝߊߟߊ߲ ߣߌ߲߬ ߞߍ߫ ߞߎ߲߬ߣߊ߬ߝߏ߲߬ߣߌ߲߬ ߖߞߎ߫ ߠߎ߬ ߣߌ߫ ߞߎߡߊ ߞߏߙߏ߲߫ ߠߎ߬ ߟߊߛߋ߫ ߦߙߐ߫ ߘߌ߫ ߥߟߊ߫ ߞߊ߬ ߝߐ߫ ߞߏ߫ ߌ ߦߋ߫ ߘߞߏ߬ߕߋ߯ߙߋߦߊ߫ ߟߋ߬ ߞߍ߫ ߟߊ߫ ߞߐߜߍ߫ ߣߌ߲߬ ߣߊ߫߸ ߏ߬ ߥߊߟߋߦߊ ߟߎ߬ ߓߍ߯ ߘߌ߫ ߟߊߓߊ߲߫ ߜߍ߲ߠߌ߲ ߞߐߛߊ߬ߦߌ߲߬ߓߊߟߌ ߟߋ߬ ߡߊ߬ ߌߞߘߐ߫.",
      textFr: "L'utilisateur s'engage à maintenir une attitude respectueuse envers la science et la communauté. Tout usage de la plateforme pour diffuser des fausses informations, des propos haineux, ou pour tenter de pirater l'infrastructure (attaques DDoS, injection SQL) entraînera un bannissement définitif et immédiat de nos serveurs."
    },
    {
      id: "limitation",
      titleNko: "߅. ߖߋ߬ߓߌ߬ߦߊ߬ߟߌ ߡߊߓߌߟߊ ߖߊ߰ߛߙߋ",
      titleFr: "5. Limitation de Responsabilité",
      tldrNko: "ߊ߬ ߞߘߐ ߜߍߘߐߕߊ: ߊ߲ ߕߍ߫ ߡߌ߬ߣߊ߬ ߟߊ߫ ߟߊߓߊ߯ߙߊߟߌ ߟߊ߫ ߟߎ߬ ߞߊ߫ ߝߊ߬ߡߎ߲߬ߠߌ߲ ߖߎ߯ ߛߌ߫ ߡߊ߬.",
      tldrFr: "En clair : Nous visons l'exactitude, mais ne sommes pas responsables de vos erreurs d'interprétation.",
      textNko: "ߤߊߟߌ߬ ߣߴߊ߲ ߧߋ߫ ߟߐ߲ߞߏ ߖߐ߲ߖߐ߲ߧߊ߫ ߊ߬ ߣߴߊ߬ ߕߎ߬ߢߊ߬ ߜߍߟߍ߲ ߢߌߣߌ߲߫ ߠߋ߬ ߟߊ߫ ߕߎ߬ߡߊ߬ ߓߍ߯߸ ߊ߲ ߠߊ߫ ߟߊ߬ߖߍ߲߬ߛߍ߲߬ߠߌ߲ ߣߴߊ߲ ߟߊߘߟߊߡߌߣߊߟߌ ߟߎ߬ ߘߐ߫ ߛߐ߲߬߹ ߝߐ߫ ߊߟߎ߫ ߦߴߊ߬ ߟߐ߲߫ ߞߏ߫ ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ ߟߊ߫ ߞߎߡߘߊ ߟߎ߬ ߓߍ߫ ߦߋ߲߬ ߞߎ߲߬ߣߊ߬ߝߏ߬ߣߌ߲߬ߠߌ ߣߌ߫ ߟߊߡߍ߲߬ߛߍ߲߬ߢߊ߬ߟߌ ߘߐߙߐ߲ ߠߋ߬ ߞߊߡߊ߬ ߟߐ߲ߞߏ ߞߣߐ߫߹ ߕߎ߬ߡߊ ߛߌ߫ ߊ߬ ߞߎߘߡߊ ߟߎ߬ ߟߊߘߊ߲ߓߊ߮ ߣߴߊ߬ ߟߊߖߍ߲߬ߛߍ߲ߓߊ߮ ߟߎ߬ ߕߍ߫ ߡߌ߬ߣߊ߬ ߟߊ߫ ߝߋߎ߫ ߊ߬ ߞߊ߬ߙߊ߲߬ߓߊ߮ ߟߎ߬ ߣߌ߫ ߊ߬ ߟߊߓߊ߯ߙߟߊ ߟߎ߬ ߟߊ߫ ߝߊ߬ߡߎ߲߬ߠߌ߲ ߖߎ߯ ߛߌ߫ ߡߊ߬߹",
      textFr: "Bien que nous visions l'exactitude scientifique absolue dans nos publications et traductions, les articles fournis sur N'Ko ni Lonko le sont à titre informatif et éducatif. L'éditeur ne saurait être tenu responsable des erreurs d'interprétation ou de l'utilisation erronée des concepts scientifiques par les lecteurs."
    },
    {
      id: "juridiction",
      titleNko: "߆. ߛߙߊߕߌߦߊ ߣߌ߫ ߞߎ߬ߙߎ߲߬ߘߎ ߟߊߓߊ߯ߙߊߕߊ",
      titleFr: "6. Juridiction et Loi Applicable",
      tldrNko: "ߊ߬ ߞߘߐ ߜߍߘߐߕߊ: ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ ߟߊߞߊ߲ߘߊ ߟߋ߬ ߓߍ߫ ߞߍ߫ ߢߍߓߊ߮ ߘߌ߫ ߜߐ߬ߛߐ߲߬ߞߐ ߕߎ߬ߡߊ.",
      tldrFr: "En clair : L'éthique scientifique et la protection de la langue N'Ko priment en cas de litige.",
      textNko: "ߊ߬ ߟߐ߲߫ ߞߏ߫߸ ߛߙߊߕߌ ߣߌ߲߬ ߠߎ߬ ߓߌ߲ߓߌ߲ߣߍ߲߫ ߟߐ߲ߞߏ ߝߘߏ߬ߓߊ߬ ߖߏ߯ߦߊߟߌ ߣߌ߫ ߘߎߢߊ߫ ߤߊߞߍ ߟߊߞߊ߲ߘߊ ߟߋ߬ ߡߊ߬ ߛߊ߫ ߞߊ߬ ߓߟߐߓߐ ߝߙߍߕߍ ߕߞߌ߫ ߟߎ߬ ߟߊߕߊ߲߬ߞߊ߸ ߣߌ߲߫ ߕߍߓߍ߲ߓߊߟߌߦߊ ߣߊ߬ߘߊ߫ ߥߟߊ߫ ߓߌ߬ߟߊ߬ߒߘߐ߫ ߞߏ߫ ߞߍ߫ ߘߊ߫ ߛߊ߫߸ ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ ߟߊߞߊ߲ߘߊ ߟߋ߬ ߓߍ߫ ߞߍ߫ ߢߍߓߊ߮ ߘߌ߫ ߞߘߊߎ߫߹",
      textFr: "Ces conditions sont régies par l'éthique scientifique universelle et les lois internationales sur la protection du droit d'auteur numérique. En cas de litige, la volonté de préserver l'intégrité de la langue N'Ko et de son accès à la science primera."
    },
    {
      id: "originalite",
      titleNko: "߇. ߛߓߍߟߌ ߓߐߖߎ߲ ߣߌ߫ ߟߐ߲ߞߏ ߕߎ߬ߢߊ߬ߦߊ",
      titleFr: "7. Originalité et Intégrité Scientifique",
      tldrNko: "ߊ߬ ߞߘߐ ߜߍߘߐߕߊ: ߛߓߍߟߌ ߓߍ߯ ߦߋ߫ ߞߍ߫ ߞߎߘߊ߫ ߘߌ߫߸ ߞߊ߬ ߓߐ߫ ߦߙߐ߫ ߟߊߒߡߊ߫ ߘߐ߫߸ ߊ߬ ߣߌ߫ ߞߊ߬ ߕߊ߯ ߟߐ߲ߞߏ ߕߎ߬ߢߊ ߞߊ߲߬.",
      tldrFr: "En clair : Tout article soumis doit être 100% original, sourcé et scientifiquement exact.",
      textNko: "ߛߓߍߦߟߊ ߦߴߊ߬ ߟߊߛߙߋߦߊ߫ ߟߊ߫ ߞߏ߫ ߊ߬ ߟߊ߫ ߛߓߍߟߌ ߦߋ߫ ߓߐߖߎ߲߫ ߓߘߍ ߟߋ߬ ߘߌ߫߸ ߡߍ߲ ߘߐߞߏߟߏ߲ ߧߋ߫ ߛߏ߲߬ߧߊ߬ߟߌ ߣߌ߫ ߣߐ߬ߡߊ߬ߓߊ߯ߙߊ ߓߍ߯ ߟߊ߫. ߞߎ߲߬ߣߊ߬ߝߏߣߌ߲ ߠߎ߬ ߦߋ߫ ߞߍ߫ ߡߊߝߟߍ߫ ߕߊ ߣߌ߫ ߕߎ߬ߢߊ߬ ߜߍߟߍ߲ ߘߌ߫ ߞߊ߬ ߓߐ߫ ߦߟߌߡߊߛߙߋ߫ ߟߊߓߊ߲ߕߏߕߊ ߟߎ߬ ߘߐ߫. ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ ߕߍ߫ ߛߐ߲߬ ߟߐ߲ߞߏ߫ ߡߊߞߊߣߌ߲ ߣߌ߫ ߥߎߦߊ߫ ߟߊߘߊ߲ߣߍ߲ ߠߎ߬ ߡߊ߬ ߝߋߎ߫.",
      textFr: "L'auteur garantit que son manuscrit est une œuvre originale, exempte de tout plagiat. Les données présentées doivent être vérifiables, exactes et issues de sources fiables. N'Ko ni Lonko rejette catégoriquement les pseudo-sciences, la falsification de données et le vol de propriété intellectuelle."
    },
    {
      id: "licence",
      titleNko: "߈. ߟߊ߬ߖߍ߲߬ߛߍ߲߬ߠߌ߲ ߟߊߛߙߋߦߊ ߣߌ߫ ߤߊߞߍ",
      titleFr: "8. Licence de Publication et Droits",
      tldrNko: "ߊ߬ ߞߘߐ ߜߍߘߐߕߊ: ߌߟߋ ߟߋ߬ ߦߴߌ ߟߊ߫ ߛߓߍߟߌ ߕߌ߱ ߘߌ߫߸ ߞߏ߬ߣߌ߲߬ ߌ ߓߘߴߊ߲ ߛߙߋߦߊ ߊ߬ ߟߊߖߍ߲ߛߍ߲ ߘߐ߫߹ ߝߏߟߏ߲ߝߊߟߊ߲ ߣߌ߲߬ ߛߊ߲ߝߍ߬",
      tldrFr: "En clair : Vous restez propriétaire de votre texte, mais vous nous autorisez à le publier sur la plateforme.",
      textNko: "ߛߓߍߦߟߊ ߟߋ߬ ߦߴߊ߬ ߟߊ߫ ߓߊ߯ߙߊ ߦߟߌߡߦߊ ߤߊߞߍ ߓߍ߯ ߕߌ߱ ߘߌ߫߹ ߏ߬ ߞߐ߫߸ ߣߴߊ߬ ߞߊ߬ ߞߎߡߊ ߘߏ߫ ߟߊߖߍ߲ߛߍ߲߫߸ ߊ߬ ߓߘߊ߫ ߘߌ߬ߢߍ߬ ߞߊ߬ ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ ߟߊߘߤߊ߬ ߘߢߊ߫ ߝߊ߲߬ ߓߍ߯ ߘߐ߫ ߞߘߊߎ߫߸ ߛߴߊ߲ ߘߴߊ߬ ߟߊߖߍ߲ߛߍ߲߫ ߞߵߊ߬ ߘߐߓߍ߲߬ ߊ߲ ߠߊ߫ ߝߏߟߏ߲ߝߊߟߊ߲ ߞߊ߲߬.",
      textFr: "L'auteur conserve la pleine propriété intellectuelle de son œuvre. Toutefois, en soumettant un article, il accorde à N'Ko ni Lonko une licence perpétuelle, mondiale et non exclusive pour publier, formater et distribuer le texte sur notre infrastructure numérique afin d'enrichir le savoir universel."
    },
    {
      id: "rigueur",
      titleNko: "߉. ߛߓߍߟߌ ߘߐߜߍߘߍ߲ ߣߴߊ߬ ߡߊߝߟߍ",
      titleFr: "9. Rigueur Éditoriale et Modération",
      tldrNko: "ߊ߬ ߞߘߐ ߜߍߘߐߕߊ: ߊ߲ ߧߋ߫ ߛߓߍߟߌ ߓߍ߯ ߡߊߝߟߍ߫ ߟߊ߫ ߞߵߊ߬ ߘߐߓߍ߲߬ ߞߊ߬ ߣߊ߬ ߕߏ߫ ߊ߬ ߟߊߖߍ߲ߛߍ߲߫ ߠߊ߫ ߏ߬ ߞߐߝߍ߬߹",
      tldrFr: "En clair : Nous relisons, corrigeons et validons chaque article avant publication pour garantir l'excellence.",
      textNko: "ߞߊ߬ ߓߍ߲߬ ߊ߲ ߠߊ߫ ߢߊ߬ߒ߬ߞߐ߬ߓߊߟߌߦߊ ߛߊ߲ߡߊߦߊ ߡߊ߬߸ ߊ߲ ߠߊ߫ ߘߐ߬ߜߍ߬ߘߍ߲߬ߠߌ߲ ߘߍ߬ߘߊ ߤߊߞߍ ߦߴߊ߬ ߓߟߏ߫ ߞߊ߬ ߛߓߍߟߌ ߘߏ߫ ߟߊߕߊ߲߬ߞߌ߲߫߸ ߞߵߊ߬ ߡߊߦߟߍ߬ߡߊ߲߫ (ߒߞߏ ߛߓߍߟߌߢߊ ߣߴߊ߬ ߞߎߡߊߛߌ߲߮ ߘߐ߫) ߥߟߊ߫ ߞߵߊ߬ ߓߐ߫ ߦߋ߲߬ ߔߋߎ߫߸ ߣߴߊ߬ ߡߊ߫ ߓߍ߲߬ ߊ߲ ߠߊ߫ ߟߐ߲ߞߏ ߣߌ߫ ߞߊ߲ ߠߊߢߎ߲ߣߍ߲ ߛߙߊߕߌ ߟߎ߬ ߡߊ߬.",
      textFr: "Afin de maintenir l'excellence de notre standard mondial, notre comité de lecture se réserve le droit souverain de refuser, de corriger (orthographe, syntaxe N'Ko) ou de retirer tout article qui ne répondrait pas à notre charte d'exigence scientifique et linguistique."
    }
  ];

useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
      setScrollProgress(progress);

      // 🚀 Correction ESLint : On liste les ID en dur au lieu d'utiliser clauses.map
      const sections = ["acceptation", "mission", "propriete", "comportement", "limitation", "juridiction", "originalite", "licence", "rigueur"];
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
  }, []); // 🚀 Correction ESLint : Tableau des dépendances vide

  const scrollToSection = (id: string) => {
    triggerVibration();
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 150;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative text-white flex flex-col items-center justify-start px-6 pt-32 pb-24 selection:bg-[#fbbf24] selection:text-black overflow-hidden print:bg-white print:text-black print:p-0">
      
      {/* 🚀 LA PILULE DE VERRE DYNAMIQUE (Taille Affinée 1/10000) */}
      <button
        onClick={handleBack}
        className={`group fixed top-6 z-[9999] flex items-center gap-2 p-1 md:px-3 md:py-1.5 rounded-full bg-[#02040a]/40 backdrop-blur-md border border-white/10 shadow-lg hover:bg-[#02040a]/80 hover:border-[#fbbf24]/50 transition-all duration-500 touch-manipulation print:hidden ${
          isNko ? 'right-4 md:right-8' : 'left-4 md:left-8'
        }`}
        aria-label={isNko ? "ߛߊ߬ߦߌ߲߬" : "Retour en arrière"}
        dir={isNko ? "rtl" : "ltr"}
      >
        {/* L'Icône (Plus subtile, taille réduite) */}
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10 group-hover:bg-[#fbbf24] transition-colors duration-300 shrink-0 shadow-inner">
          <i className={`ph-bold ${isNko ? 'ph-arrow-right' : 'ph-arrow-left'} text-base text-gray-300 group-hover:text-black transition-colors`}></i>
        </div>
        
        {/* Le Texte (Taille réduite pour PC) */}
        <div className="hidden md:flex flex-col items-start">
          <span className={`font-bold text-[#fbbf24] text-xs md:text-sm leading-none ${isNko ? 'font-kigelia' : ''}`}>
            {isNko ? 'ߛߊ߬ߦߌ߲߬' : 'Retour'}
          </span>
        </div>

        {/* L'Indicateur Clavier (Échap + Backspace) */}
        <div className="hidden lg:flex items-center justify-center mx-1 px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-[9px] font-mono text-gray-500 group-hover:text-[#fbbf24] transition-colors">
          Esc / ⌫
        </div>
      </button>

      {/* 🚀 JAUGE DE PROGRESSION DE LECTURE */}
      <div className="fixed top-0 left-0 h-1 bg-[#fbbf24] z-50 print:hidden transition-all duration-300 ease-out shadow-[0_0_10px_rgba(251,191,36,0.8)]" style={{ width: `${scrollProgress}%` }}></div>

      {/* 🚀 L'AURA COSMIQUE */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] md:w-[700px] h-[350px] md:h-[700px] bg-blue-500 rounded-full blur-[130px] opacity-20 pointer-events-none animate-pulse duration-[7000ms] z-[-1] print:hidden"></div>

      <div className="relative z-10 max-w-7xl w-full mx-auto animate-in fade-in slide-in-from-bottom-10 duration-1000 fill-mode-forwards print:m-0 print:max-w-none">
        
        {/* EN-TÊTE JURIDIQUE INSTITUTIONNEL */}
        <div className="text-center mb-16 flex flex-col items-center print:mb-8">
            <div className="mb-6 relative group flex items-center justify-center p-4 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-[inset_0_0_20px_rgba(251,191,36,0.05)] print:hidden">
                <i className="ph-duotone ph-scales text-6xl text-[#fbbf24] drop-shadow-[0_0_15px_rgba(251,191,36,0.4)]"></i>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold text-[#fbbf24] mb-8 tracking-tight flex flex-col items-center print:text-black print:mb-4">
                <span className="block mb-4 leading-tight drop-shadow-lg font-kigelia print:drop-shadow-none">ߟߊߓߊ߯ߙߊߟߌ ߛߙߊߕߌ ߟߎ߬</span>
                <span className="text-white/60 text-base md:text-xl font-light uppercase tracking-[0.3em] border-y border-white/10 py-2 inline-block print:text-black print:border-black print:font-bold">
    Conditions d&apos;utilisation
</span>
            </h1>
            
            <div className="flex flex-col items-center gap-2">
                <p className="font-kigelia text-[#fbbf24] text-xl print:text-gray-800">ߟߊ߬ߞߎ߬ߘߊ߬ߟߌ ߟߊߓߊ߲ : ߞߏ߲ߞߏߜߍ ߂߀߂߆</p>
                <p className="text-gray-400 font-light text-xs md:text-sm tracking-widest uppercase print:text-gray-600">Dernière mise à jour : Février 2026</p>
            </div>
        </div>
{/* 🚀 NAVIGATION MOBILE (Swipeable Pills Bilingues 1/10000) */}
        <div className="lg:hidden sticky top-[80px] z-40 bg-[#02040a]/90 backdrop-blur-xl border-y border-white/10 -mx-6 px-6 py-4 mb-12 flex overflow-x-auto hide-scrollbar touch-pan-x shadow-[0_10px_30px_rgba(0,0,0,0.5)] print:hidden">
            <div className="flex gap-3">
                {clauses.map((clause) => (
                    <button
                        key={`mob-${clause.id}`}
                        onClick={() => scrollToSection(clause.id)}
                        className={`px-5 py-2 rounded-full border transition-all duration-300 touch-manipulation flex flex-col justify-center gap-1 shrink-0 ${
                            isNko ? 'items-end' : 'items-start'
                        } ${
                            activeSection === clause.id 
                            ? "bg-[#fbbf24] border-[#fbbf24] shadow-[0_0_15px_rgba(251,191,36,0.3)]" 
                            : "bg-white/5 border-white/10 hover:bg-white/10"
                        }`}
                        dir={isNko ? "rtl" : "ltr"}
                    >
                        {/* 🚀 BDI (Bi-Directional Isolation) empêche la ponctuation de briser le RTL */}
                        <span className={`font-kigelia text-sm whitespace-nowrap leading-none ${activeSection === clause.id ? "text-black font-bold" : "text-[#fbbf24] font-bold"}`} dir="rtl">
                            <bdi>{clause.titleNko}</bdi>
                        </span>
                        <span className={`text-[9px] uppercase tracking-widest whitespace-nowrap leading-none ${activeSection === clause.id ? "text-black/70 font-bold" : "text-white/60 font-light"}`} dir="ltr">
                            <bdi>{clause.titleFr}</bdi>
                        </span>
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
                        
                        <div className="mb-6 flex flex-col items-start border-b border-white/10 pb-6 print:border-black print:pb-2" dir="rtl">
                            <h2 className="font-kigelia text-3xl md:text-4xl text-[#fbbf24] mb-2 drop-shadow-md print:text-black print:drop-shadow-none">{clause.titleNko}</h2>
                            <span className="text-xs md:text-sm tracking-[0.2em] text-gray-400 uppercase font-bold print:text-gray-800" dir="ltr">{clause.titleFr}</span>
                        </div>
                        
                        <div className="flex flex-col gap-8 backdrop-blur-md bg-[#02040a]/60 p-8 md:p-12 rounded-[2rem] border border-white/5 shadow-xl hover:border-white/10 transition-colors print:bg-white print:border-none print:shadow-none print:p-0">
                            
                            {/* 🚀 LE TL;DR */}
                            <div className="flex flex-col gap-4 bg-white/5 border-l-2 border-[#fbbf24] p-5 rounded-r-xl print:bg-gray-100 print:border-l-gray-500">
                                <div className="flex flex-col items-start" dir="rtl">
                                    <div className="flex items-center gap-3 mb-2">
                                      <i className="ph-fill ph-info text-[#fbbf24] print:hidden text-xl"></i>
                                      <p className="font-kigelia text-xl text-white/90 print:text-black">{clause.tldrNko}</p>
                                    </div>
                                </div>
                                <div className="flex items-start text-left" dir="ltr">
                                  <p className="text-sm font-light text-gray-400 print:text-gray-700 italic">{clause.tldrFr}</p>
                                </div>
                            </div>

                            {/* BLOC N'KO */}
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
                                    {clause.textFr}
                                </p>
                            </div>
                        </div>
                    </section>
                ))}

                {/* 🚀 SIGNATURE INSTITUTIONNELLE */}
                <div className="mt-8 flex flex-col items-end border-t border-white/10 pt-12 print:border-black print:pt-6" dir="rtl">
                    <div className="flex items-center gap-3 mb-2 print:hidden">
                       <i className="ph-fill ph-scales text-[#fbbf24] text-2xl"></i>
                    </div>
                    <p className="font-kigelia text-xl text-[#fbbf24] mb-2 print:text-black">ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ — ߖߏ߯ߦߊߟߌ ߣߌ߫ ߞߎ߬ߙߎ߲߬ߘߎ ߕߏ߲߰ߘߊ</p>
                    <p className="text-xs tracking-[0.2em] text-white/50 uppercase font-bold print:text-gray-600" dir="ltr">N&apos;Ko ni Lonko — Département Juridique & Éditorial</p>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}