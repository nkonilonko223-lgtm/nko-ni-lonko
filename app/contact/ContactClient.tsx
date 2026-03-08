"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Turnstile } from '@marsidev/react-turnstile'; // 🚀 IMPORT DU BOUCLIER CLOUDFLARE
import type { TurnstileInstance } from '@marsidev/react-turnstile'; // 🚀 TYPAGE STRICT

export default function ContactClient() {
  // 🚀 ÉTATS DU FORMULAIRE & INTELLIGENCE SENSORIELLE
  const [formData, setFormData] = useState({ name: "", email: "", message: "", botField: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // 🚀 CORRECTION LINTER : Initialisation douce
  const [isOnline, setIsOnline] = useState(true); 
  const [isValidEmail, setIsValidEmail] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [formLoadTime, setFormLoadTime] = useState<number>(0);

  // 🚀 ÉTAT DU COFFRE-FORT CLOUDFLARE
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);

  // ⏱️ DÉMARRAGE DU CHRONOMÈTRE BIOMÉTRIQUE
  useEffect(() => {
    setFormLoadTime(Date.now());
  }, []);

  // 🚀 ÉCOUTE DU RÉSEAU (Conscience hors-ligne)
  useEffect(() => {
    // On met à jour l'état uniquement si on est VRAIMENT hors-ligne au moment du montage client.
    // L'utilisation d'une petite temporisation (setTimeout de 0) décale l'action après le premier rendu,
    // ce qui supprime l'erreur "synchronous setState" d'ESLint.
    const checkInitialNetwork = setTimeout(() => {
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            setIsOnline(false);
        }
    }, 0);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearTimeout(checkInitialNetwork);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 🚀 RETOUR HAPTIQUE
  const triggerVibration = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
  }, []);

  const triggerSuccessVibration = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([30, 50, 30]);
  }, []);

  const socialLinks = [
    { icon: "youtube-logo", href: "https://youtube.com/@nkonilonko", label: "YouTube" },
    { icon: "whatsapp-logo", href: "https://wa.me/22300000000", label: "WhatsApp" },
    { icon: "instagram-logo", href: "https://instagram.com/nkonilonko", label: "Instagram" },
    { icon: "facebook-logo", href: "https://facebook.com/nkonilonko", label: "Facebook" },
    { icon: "telegram-logo", href: "https://t.me/nkonilonko", label: "Telegram" }
  ];

  // 🚀 GESTION DES CHAMPS & VALIDATION TEMPS RÉEL
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setIsValidEmail(emailRegex.test(value));
    }
  };

  // 🚀 ÉLASTICITÉ COGNITIVE (Auto-resize)
  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleChange(e);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; 
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // 🚀 VERROUILLAGE ABSOLU : On exige le Jeton Cloudflare avant d'autoriser le clic
    if (!isOnline || !formData.name || !isValidEmail || !formData.message || !turnstileToken) {
      if (!turnstileToken) alert("ߡߊ߬ߞߐ߬ߣߐ߲߬ߠߌ߲ ߞߍ߫ ߣߍ߲ߞߍ߫ / Analyse de sécurité en cours, veuillez patienter une seconde.");
      return;
    }

    triggerVibration();
    setIsSubmitting(true);

    const timeToFill = Date.now() - formLoadTime;

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
          botField: formData.botField, 
          timeToFill: timeToFill,      
          turnstileToken: turnstileToken, // 🚀 ENVOI DU JETON MILITAIRE AU SERVEUR
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Une erreur est survenue");
      }

      // 🟢 SUCCÈS TOTAL
      setIsSubmitting(false);
      setIsSuccess(true);
      triggerSuccessVibration();
      setFormData({ name: "", email: "", message: "", botField: "" });
      setIsValidEmail(false);
      
      // 🚀 RÉARMEMENT DU BOUCLIER
      setTurnstileToken(null);
      turnstileRef.current?.reset();
      
      if (textareaRef.current) textareaRef.current.style.height = "auto";

      setTimeout(() => setIsSuccess(false), 5000);

    } catch (error) {
      // 🔴 GESTION D'ERREUR ÉLÉGANTE
      console.error("Erreur d'envoi:", error);
      setIsSubmitting(false);
      
      // 🚀 RÉARMEMENT DU BOUCLIER EN CAS D'ÉCHEC
      setTurnstileToken(null);
      turnstileRef.current?.reset();
      
      alert(error instanceof Error ? error.message : "Une erreur de connexion est survenue.");
    }
  };

  // 🚀 ACCESSIBILITÉ "POWER USER" (Ctrl + Entrée) - LA FONCTION RESTAURÉE
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit();
    }
  };


  return (
    <div className="relative text-white flex flex-col items-center justify-center px-6 pt-32 pb-24 text-center selection:bg-[#fbbf24] selection:text-black">
      
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-[#fbbf24] rounded-full blur-[120px] opacity-10 pointer-events-none animate-pulse duration-[5000ms] z-[-1]"></div>

      <div className="relative z-10 max-w-6xl w-full mx-auto flex flex-col items-center animate-in fade-in slide-in-from-bottom-10 duration-1000 fill-mode-forwards">
        
        <div className="mb-8 relative group">
            <div className="absolute inset-0 bg-[#fbbf24] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
            <i className="ph-duotone ph-envelope-simple-open text-6xl md:text-8xl text-[#fbbf24] relative z-10 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]"></i>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-[#fbbf24] mb-16 tracking-tight font-sans text-center">
            <span className="block mb-2 md:mb-4 leading-tight drop-shadow-lg font-kigelia">ߊ߲ ߟߊߛߐ߬ߘߐ߲߬</span>
            <span className="text-white/80 text-base md:text-xl font-light uppercase tracking-[0.3em] border-y border-white/10 py-2 inline-block">
                Contactez-nous
            </span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 w-full">
            
            {/* ========================================== */}
            {/* 1. CARTE D'INFORMATIONS BILINGUE */}
            {/* ========================================== */}
            <div className="backdrop-blur-xl bg-[#02040a]/60 p-8 md:p-12 rounded-[2rem] border border-white/10 shadow-2xl flex flex-col justify-between text-left transition-colors hover:border-white/20">
                <div>
                    <div className="mb-10 flex flex-col items-start" dir="rtl">
                        <h2 className="font-kigelia text-2xl text-[#fbbf24] mb-1 opacity-90">ߊ߲ ߟߊߛߐ߬ߘߐ߲߬ ߢߊ ߟߎ߬</h2>
                        <span className="text-[10px] tracking-[0.2em] text-gray-400 uppercase font-bold" dir="ltr">Informations de contact</span>
                    </div>

                    <div className="space-y-8">
                        <div className="flex items-start gap-5 group cursor-default">
                            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-[#fbbf24] group-hover:text-[#fbbf24] transition-colors duration-300">
                                <i className="ph-fill ph-map-pin text-2xl text-[#fbbf24] group-hover:scale-110 transition-transform duration-300"></i>
                            </div>
                            <div className="flex flex-col items-start">
                                <h3 className="font-kigelia text-white font-bold text-xl mb-0" dir="rtl">ߊ߲ ߠߊ߫ ߡߊ߬ߞߍ߬ߦߙߐ</h3>
                                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Notre Siège</span>
                                <p className="text-gray-400 font-light leading-relaxed text-sm group-hover:text-gray-200 transition-colors">Bamako, Mali<br/>Afrique de l&apos;Ouest</p>
                            </div>
                        </div>
                        
                        <a href="mailto:contact@nkonilonko.com" onClick={triggerVibration} className="flex items-start gap-5 group cursor-pointer touch-manipulation">
                            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-[#fbbf24] group-hover:bg-[#fbbf24]/10 transition-all duration-300">
                                <i className="ph-fill ph-envelope-simple text-2xl text-[#fbbf24] group-hover:scale-110 transition-transform duration-300"></i>
                            </div>
                            <div className="flex flex-col items-start">
                                <h3 className="font-kigelia text-white font-bold text-xl mb-0" dir="rtl">ߢߎߡߍߙߋ߲ߞߏ߲ߘߏ</h3>
                                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Email Direct</span>
                                <p className="text-[#fbbf24] font-light text-sm group-hover:underline decoration-[#fbbf24] underline-offset-4">contact@nkonilonko.com</p>
                            </div>
                        </a>
                    </div>
                </div>
                
                <div className="mt-12 pt-8 border-t border-white/10">
                    <div className="mb-6 flex flex-col items-start" dir="rtl">
                        <h3 className="font-kigelia text-xl text-white mb-1">ߓߟߐߟߐ ߞߙߏߝߏ ߟߎ߬</h3>
                        <span className="text-[10px] tracking-[0.2em] text-gray-500 uppercase font-bold" dir="ltr">Réseaux Officiels</span>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        {socialLinks.map((link, i) => (
                            <a 
                              key={i} 
                              href={link.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={link.label}
                              onClick={triggerVibration}
                              className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-gray-400 hover:text-[#fbbf24] hover:border-[#fbbf24] hover:bg-[#fbbf24]/10 transition-all shadow-lg hover:shadow-[0_0_15px_rgba(251,191,36,0.2)] touch-manipulation"
                            >
                                <i className={`ph-fill ph-${link.icon} text-xl`}></i>
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* ========================================== */}
            {/* 2. LE FORMULAIRE ACTIF (0.01% Elite) */}
            {/* ========================================== */}
            <div className="backdrop-blur-xl bg-[#02040a]/80 p-8 md:p-12 rounded-[2rem] border-t-2 border-[#fbbf24] shadow-[0_10px_30px_rgba(251,191,36,0.1)] relative overflow-hidden transition-colors hover:border-white/20 flex flex-col">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#fbbf24] rounded-full blur-[80px] opacity-10 pointer-events-none"></div>
                
                {/* 🚀 BADGE HORS-LIGNE */}
                {!isOnline && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/20 border border-red-500/50 text-red-200 text-xs px-3 py-1.5 rounded-full flex items-center gap-2 animate-in slide-in-from-top-4">
                    <i className="ph-bold ph-wifi-x"></i> Mode hors-ligne
                  </div>
                )}

                {isSuccess ? (
                    <div className="relative z-10 flex flex-col items-center justify-center flex-1 text-center py-12 animate-in zoom-in duration-500">
                        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
                            <i className="ph-bold ph-check text-5xl text-green-400"></i>
                        </div>
                        <h3 className="font-kigelia text-3xl text-white mb-2">ߌ ߣߌ߫ ߗߋ߫</h3>
                        <p className="text-gray-400 text-lg">Votre message a été envoyé avec succès.</p>
                    </div>
                ) : (
                    <form className="relative z-10 flex flex-col gap-6 flex-1" onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
                        <div className="flex flex-col text-left">
                            <label className="flex flex-col mb-2 items-start" dir="rtl">
                                <span className="font-kigelia text-xl text-[#fbbf24]">ߕߐ߮</span>
                                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold" dir="ltr">Nom Complet</span>
                            </label>
                            <input 
                                type="text" 
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                dir="auto"
                                disabled={isSubmitting || !isOnline}
                                placeholder="ߌ ߕߐ߮ ߘߝߊߣߍ߲ • Votre nom complet" 
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#fbbf24] focus:ring-1 focus:ring-[#fbbf24] transition-all font-light disabled:opacity-50"
                            />
                        </div>

                        <div className="flex flex-col text-left relative">
                            <label className="flex flex-col mb-2 items-start" dir="rtl">
                                <span className="font-kigelia text-xl text-[#fbbf24]">ߢߎߡߍߙߋ߲ߞߏ߲ߘߏ</span>
                                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold" dir="ltr">Adresse Email</span>
                            </label>
                            <div className="relative">
                              <input 
                                  type="email" 
                                  name="email"
                                  value={formData.email}
                                  onChange={handleChange}
                                  required
                                  dir="auto"
                                  disabled={isSubmitting || !isOnline}
                                  placeholder="ߌ ߟߊ߫ ߢߎߡߍߙߋ߲ߞߏ߲ߘߏ • votre@email.com" 
                                  className={`w-full bg-white/5 border rounded-xl px-5 py-4 text-white placeholder:text-gray-600 focus:outline-none transition-all font-light disabled:opacity-50 pr-12 ${
                                    formData.email.length > 0 && isValidEmail 
                                      ? 'border-green-500/50 focus:border-green-500 focus:ring-1 focus:ring-green-500' 
                                      : 'border-white/10 focus:border-[#fbbf24] focus:ring-1 focus:ring-[#fbbf24]'
                                  }`}
                              />
                              {/* 🚀 VALIDATION EMAIL TEMPS RÉEL */}
                              {formData.email.length > 0 && isValidEmail && (
                                <i className="ph-bold ph-check text-green-400 absolute right-4 top-1/2 -translate-y-1/2 text-xl animate-in zoom-in"></i>
                              )}
                            </div>
                        </div>

                        <div className="flex flex-col text-left">
                            <label className="flex flex-col mb-2 items-start" dir="rtl">
                                <span className="font-kigelia text-xl text-[#fbbf24]">ߗߋߛߓߍ</span>
                                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold" dir="ltr">Votre Message</span>
                            </label>
                            {/* 🚀 ÉLASTICITÉ COGNITIVE */}
                            <textarea 
                                ref={textareaRef}
                                name="message"
                                value={formData.message}
                                onChange={handleTextareaInput}
                                required
                                rows={3}
                                dir="auto"
                                disabled={isSubmitting || !isOnline}
                                placeholder="ߌ ߟߊ߫ ߗߋߛߓߍ ߛߓߍ߫ ߦߊ߲߬... • Écrivez votre message ici..." 
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#fbbf24] focus:ring-1 focus:ring-[#fbbf24] transition-all resize-none font-light disabled:opacity-50 min-h-[120px] max-h-[400px]"
                            ></textarea>
                        </div>
                        
                        {/* 🪤 HONEYPOT INVISIBLE (Le piège fatal pour les robots spammeurs) */}
                        <div aria-hidden="true" className="absolute opacity-0 -z-50 pointer-events-none h-0 w-0 overflow-hidden">
                            <input 
                              type="text" 
                              name="botField" 
                              tabIndex={-1} 
                              value={formData.botField} 
                              onChange={handleChange} 
                              autoComplete="off" 
                            />
                        </div>

                        {/* 🛡️ GÉNÉRATEUR DE JETON CLOUDFLARE INVISIBLE */}
                        <div className="hidden">
                           <Turnstile
                             siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
                             ref={turnstileRef}
                             onSuccess={(token) => setTurnstileToken(token)}
                             onError={() => setTurnstileToken(null)}
                             onExpire={() => setTurnstileToken(null)}
                           />
                        </div>
                        
                        <button 
                            type="submit"
                            disabled={isSubmitting || !isOnline || !isValidEmail || !formData.name || !formData.message || !turnstileToken}
                            className={`group mt-auto relative w-full py-4 rounded-xl transition-all duration-500 flex flex-col items-center justify-center overflow-hidden touch-manipulation ${
                              isSubmitting 
                                ? 'bg-white/10 text-gray-400 cursor-wait' 
                                : !isOnline || !isValidEmail || !formData.name || !formData.message || !turnstileToken
                                  ? 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'
                                  : 'bg-[#fbbf24] text-black hover:bg-white shadow-[0_0_20px_rgba(251,191,36,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]'
                            }`}
                        >
                            {isSubmitting ? (
                                <i className="ph-bold ph-spinner-gap text-3xl animate-spin"></i>
                            ) : (
                                <>
                                  <div className="flex items-center gap-3 transform group-hover:-translate-y-1 transition-transform duration-300" dir="rtl">
                                      <i className="ph-bold ph-paper-plane-tilt text-xl group-hover:-translate-x-1 group-hover:-translate-y-1 transition-transform duration-300 rotate-y-180"></i>
                                      <span className="font-kigelia text-2xl font-bold">ߊ߬ ߗߋ߫</span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1 transform group-hover:translate-y-0 transition-all duration-300 opacity-70">
                                    <span className="text-[10px] uppercase tracking-widest font-bold">
                                        Envoyer le message
                                    </span>
                                    {/* 🚀 INDICATEUR POWER USER */}
                                    <span className="hidden md:inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-black/20 text-[8px] font-mono border border-black/10">
                                      Ctrl + ↵
                                    </span>
                                  </div>
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}