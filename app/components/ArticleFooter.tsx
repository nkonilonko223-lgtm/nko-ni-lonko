"use client";

/**
 * ==============================================================================
 * 📂 FICHIER : app/components/ArticleFooter.tsx
 * ------------------------------------------------------------------------------
 * 🎯 RÔLE : Espace Auteur, Tags, Newsletter et Articles liés (World Class).
 * 📳 SENSORIEL : Retour haptique natif sur les actions.
 * ✨ DESIGN 0.1/1000 : Badge E-E-A-T, Glow Réactif, Cascade (Staggered Reveal).
 * 🛡️ INGÉNIERIE : Dual-Stack Byline, Anti-Crash Image, Intersection Observer.
 * ==============================================================================
 */

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "./LanguageProvider";
import { urlFor } from "../../sanity/image";
import { PortableTextBlock } from "@portabletext/types";
import { Turnstile } from '@marsidev/react-turnstile';
import type { TurnstileInstance } from '@marsidev/react-turnstile';
import { langueTexte } from "./numero/titre";
import { ABONNEMENT_A_CONFIRMER, CHAMP_EMAIL } from "../lib/messages-lecteur";
import { TexteLangue, texteLangue } from "./application/Libelle";
import EtatFormulaire, { useVerification } from "./formulaires/EtatFormulaire";

// ==============================================================================
// 1. TYPAGE STRICT & UTILITAIRES
// ==============================================================================

interface SanityImageSource {
  asset: {
    _ref: string;
  };
}

function getSafeUrl(source: string | SanityImageSource | null | undefined): string | null {
  if (!source) return null;
  if (typeof source === 'string') {
    return source.startsWith('http') ? source : null;
  }
  try {
    const builder = urlFor(source);
    return builder ? builder.url() : null;
  } catch {
    return null;
  }
}

interface SocialLink {
  platform: string;
  url: string;
}

interface AuthorProps {
  name: string;
  nameNko?: string | null;
  role?: string;
  roleNko?: string | null; // 🚀 NOUVEAU
  image?: string | SanityImageSource | null;
  bio?: string | PortableTextBlock[] | null; 
  bioNko?: string | PortableTextBlock[] | null; // 🚀 NOUVEAU
  institution?: string | null; // 🚀 NOUVEAU : Affiliation
  orcid?: string | null;       // 🚀 NOUVEAU : Identifiant scientifique
  expertise?: string[];        // 🚀 NOUVEAU : Domaines d'expertise
  socials?: SocialLink[];
  slug?: string | null;        // page de l'auteur (/auteurs/<slug>)
}

interface RelatedArticleProps {
  title: string;
  slug: string;
  image?: string | SanityImageSource | null;
  category: string;
}
interface ReferenceProps {
  title: string;
  url?: string; // 🚀 1/1000 : Rend l'URL optionnelle pour les manuscrits et livres
}

interface ArticleFooterProps {
  lang: string;
  author?: AuthorProps;
  // Étiquettes : libellé et adresse (page de la discipline) ; sans adresse, simple texte
  tags?: { libelle: string; href?: string | null }[];
  relatedArticles?: RelatedArticleProps[];
  references?: ReferenceProps[]; // 🚀 NOUVEAU : Le tableau des references scientifiques
}

// ==============================================================================
// 2. COMPOSANT PRINCIPAL
// ==============================================================================

export default function ArticleFooter({ lang, author, tags, relatedArticles, references }: ArticleFooterProps) {
  const { lien } = useLanguage();
  const isNko = lang === 'nko';
  const dir = isNko ? "rtl" : "ltr";
  const alignClass = isNko ? "md:text-right" : "md:text-left";
  // 🚀 FIX 1/1000 : Le dir="rtl" s'occupe de l'inversion nativement. On garde un flex normal.
  const authorFlex = "md:flex-row";

  // États du formulaire neuro-optimisé
  const [email, setEmail] = useState("");
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [isExploding, setIsExploding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // 🚀 AJOUT : État de chargement réseau
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null); // 🛡️ ÉTAT DU SÉSAME CLOUDFLARE
  // Turnstile créé seulement au premier contact avec le formulaire (18 octobre 2026)
  const [protectionActive, setProtectionActive] = useState(false);
  const activerProtection = useCallback(() => setProtectionActive(true), []);
  
  // 🚀 ACTION C : État anti-crash pour l'image de l'auteur
  const [authorImageError, setAuthorImageError] = useState(false);
  const turnstileRef = useRef<TurnstileInstance>(null);
  const verification = useVerification(protectionActive, turnstileToken);
  const [erreurEnvoi, setErreurEnvoi] = useState(""); // réponse d'erreur du serveur (bilingue), sous le formulaire

  // 🚀 ACTION A : Le radar d'apparition en cascade (Intersection Observer)
  const [cardsVisible, setCardsVisible] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCardsVisible(true);
          observer.disconnect(); // On ne déclenche l'animation qu'une seule fois
        }
      },
      { threshold: 0.2 } // Déclenche quand 20% de la grille est visible
    );

    if (gridRef.current) {
      observer.observe(gridRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const authorImageUrl = author?.image ? getSafeUrl(author.image) : null;

  const triggerVibration = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }
  }, []);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setErreurEnvoi("");
    setIsValidEmail(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
  };

 const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    // 🛡️ SÉCURITÉ STRICTE : Exigence du jeton Cloudflare
    if (!isValidEmail || isSubmitting || !turnstileToken) return;

    triggerVibration();
    setIsSubmitting(true);

    try {
      // 🚀 LE VRAI BRANCHEMENT API (Front C)
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, turnstileToken }), // 🛡️ INJECTION DU SÉSAME
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Une erreur est survenue");
      }

      // 🟢 SUCCÈS : Déclenchement de l'animation d'explosion 1/1000
      setIsExploding(true);
      setTimeout(() => {
        setSubscribed(true);
        setEmail("");
        setIsExploding(false);
      }, 400);

    } catch (error) {
      console.error("❌ Erreur Newsletter:", error);
      setErreurEnvoi(error instanceof Error ? error.message : "Impossible de se connecter au serveur.");
    } finally {
      setIsSubmitting(false);
      // 🛡️ Réarmement Turnstile pour le prochain essai
      if (turnstileRef.current) {
        turnstileRef.current.reset();
        setTurnstileToken(null);
      }
    }
  };

// 🚀 1/1000 : L'Extracteur Bio Bilingue Simultané (Dogme 1 Absolu)
  const renderBio = () => {
    // 1. Outil interne d'extraction de texte (Zéro Any)
    const extractText = (data: string | PortableTextBlock[] | null | undefined) => {
      if (!data) return "";
      if (typeof data === 'string') return data;
      if (Array.isArray(data)) {
        return data.map(block => {
          const children = block.children as Array<{ text?: string }> | undefined;
          return children?.map(c => c.text || '').join('') || '';
        }).join(' ');
      }
      return "";
    };

    const bioNkoText = extractText(author?.bioNko);
    const bioFrText = extractText(author?.bio);

    // 2. Sécurité : Si les deux champs sont vides
    if (!bioNkoText && !bioFrText) {
      return (
        <p dir={isNko ? "rtl" : "ltr"} className={`text-gray-400 text-sm md:text-base leading-relaxed max-w-2xl mb-4 ${isNko ? 'font-kigelia text-right' : 'font-sans text-left'}`}>
          {isNko ? "ߟߐ߲ߞߏߕߌ߮ ߥߊߣߊ߫ ߓߟߏߡߊߞߊ߬ߟߋ߲߫ ߒߞߏ ߟߊ߫ ߕߊ߯ߢߍ ߞߊߡߊ߬." : "Expert scientifique contribuant à la diffusion du savoir."}
        </p>
      );
    }

    // 👑 3. L'AFFICHAGE IMPÉRIAL (N'Ko en Majesté, Français en Support)
    return (
      <div className="flex flex-col gap-3 w-full max-w-2xl mb-4">
        {bioNkoText && (
          <p 
            dir="rtl" 
            className="text-gray-200 text-base md:text-lg leading-relaxed font-kigelia text-right"
          >
            {bioNkoText}
          </p>
        )}
        {bioFrText && (
          <p 
            dir="ltr" 
            className="text-gray-400 text-xs md:text-sm leading-relaxed font-sans text-left"
          >
            {bioFrText}
          </p>
        )}
      </div>
    );
  };
  return (
    <section className="max-w-5xl mx-auto px-4 md:px-6 pb-12 md:pb-20" dir={dir}>
      
      {/* 1. LES TAGS */}
      {tags && tags.length > 0 && (
        <div className={`flex flex-wrap gap-2 md:gap-3 mb-10 md:mb-16 ${isNko ? 'justify-end' : 'justify-start'}`}>
          {/* 23 octobre 2026 : l'étiquette avait l'air d'un bouton (main, or au survol) mais ne
              menait nulle part ; c'est maintenant un vrai lien vers la page de la discipline */}
          {tags.map((tag, i) => tag.href ? (
            <Link key={i} href={tag.href} className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-white/10 text-xs md:text-sm text-gray-300 hover:border-or hover:text-or hover:shadow-[0_0_10px_rgba(251,191,36,0.2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-or transition-all bg-void ${isNko ? 'font-kigelia' : ''}`}>
              # {tag.libelle}
            </Link>
          ) : (
            <span key={i} className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-white/10 text-xs md:text-sm text-gray-300 bg-void ${isNko ? 'font-kigelia' : ''}`}>
              # {tag.libelle}
            </span>
          ))}
        </div>
      )}

     {/* SÉPARATEUR */}
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mb-10 md:mb-16"></div>

      {/* 🚀 1/1000 : SMART REFERENCES (Grille Adaptative Numérique vs Physique) */}
      {references && references.length > 0 && (
        <div className="mb-12 md:mb-16 p-6 md:p-8 rounded-[2rem] border border-white/5 bg-void shadow-[inset_0_0_40px_rgba(251,191,36,0.02)] relative overflow-hidden group/refs">
          
          {/* Lueur d'arrière-plan */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-or/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none transition-all duration-1000 group-hover/refs:bg-or/10"></div>

        {/* h2 : section de la page, après « À lire aussi » (h2) ; un h4 sautait deux niveaux */}
        <h2 className={`text-or font-bold mb-6 md:mb-8 flex items-center justify-start gap-3 text-lg md:text-xl relative z-10 ${isNko ? 'font-kigelia text-2xl md:text-3xl' : ''}`}>
            <i className="ph-fill ph-books text-2xl drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]"></i>
            {isNko ? "ߦߌߟߡߊ ߟߎ߬ ߣߌ߫ ߓߐߛߎ߲ ߠߎ߬" : "Sources & Références"}
          </h2>
          
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            {references.map((ref: ReferenceProps, idx: number) => {
              // 🚀 BIDI ENGINE 1/1000 : Auto-détection de la langue pour chaque source
              const isRefNko = /[\u07C0-\u07FF]/.test(ref.title);
              
              return (
              <li key={idx} className="h-full">
                {ref.url ? (
                  /* 🌐 CARTE NUMÉRIQUE (Cliquable & Lumineuse) */
                  <a 
                    href={ref.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={`flex items-start gap-3 p-4 h-full rounded-2xl bg-white/5 border border-white/10 hover:border-or/40 hover:bg-or/5 transition-all duration-300 group/link shadow-lg hover:shadow-[0_5px_20px_rgba(251,191,36,0.15)] active:scale-[0.98] touch-manipulation ${isRefNko ? 'flex-row-reverse text-right' : 'text-left'}`}
                    dir={isRefNko ? "rtl" : "ltr"}
                    onClick={triggerVibration}
                  >
                    <div className="mt-0.5 p-2 rounded-full bg-surface/60 border border-white/10 group-hover/link:border-or/50 group-hover/link:bg-or/20 transition-colors shrink-0">
                      <i className="ph-bold ph-link text-or text-sm md:text-base"></i>
                    </div>
                    <span className={`text-sm md:text-base text-gray-300 group-hover/link:text-white leading-snug transition-colors ${isRefNko ? 'font-kigelia' : ''}`}>{ref.title}</span>
                  </a>
                ) : (
                  /* 📚 CARTE PHYSIQUE (Manuscrit/Livre - Plaque de Musée) */
                  <div 
                    className={`flex items-start gap-3 p-4 h-full rounded-2xl bg-surface/60 border border-white/5 shadow-inner ${isRefNko ? 'flex-row-reverse text-right' : 'text-left'}`}
                    dir={isRefNko ? "rtl" : "ltr"}
                  >
                    <div className="mt-0.5 p-2 rounded-full bg-white/5 border border-white/10 shrink-0">
                      <i className="ph-fill ph-book-open text-gray-400 text-sm md:text-base"></i>
                    </div>
                    <span className={`text-sm md:text-base text-gray-400 leading-snug ${isRefNko ? 'font-kigelia' : ''}`}>{ref.title}</span>
                  </div>
                )}
              </li>
            )})}
          </ul>
        </div>
      )}

     {/* 2. LA BIO AUTEUR (Deep Glassmorphism 1/1000) */}
      {author && (
        <div className={`relative flex flex-col ${authorFlex} items-center md:items-start gap-6 md:gap-8 mb-16 md:mb-24 p-8 md:p-10 rounded-[2.5rem] bg-void border border-white/5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-700 hover:border-white/10 hover:shadow-[0_20px_50px_-10px_rgba(251,191,36,0.1)] group/author`}>
          
          {/* Lueur interne magique */}
          <div className="absolute inset-0 bg-gradient-to-br from-or/5 via-transparent to-transparent opacity-0 group-hover/author:opacity-100 transition-opacity duration-1000 pointer-events-none"></div>
          {/* IMAGE (Aura Magnétique) */}
          <div className="relative w-24 h-24 md:w-32 md:h-32 shrink-0 flex items-center justify-center">
              <div className="absolute inset-0 bg-or/10 rounded-full blur-xl scale-75 group-hover/author:scale-110 transition-all duration-700"></div>
              
              {authorImageUrl && !authorImageError ? (
                <Image 
                  src={authorImageUrl} 
                  alt={author.name}
                  fill
quality={75} // 🚀 3G MAX : AVIF/WebP à 75 = identique à JPEG 85, ~20% plus léger pour West Africa
                  sizes="(max-width: 768px) 192px, 256px"
                  className="object-cover rounded-full border border-or/50 relative z-10 transition-transform duration-500 group-hover/author:scale-105 shadow-xl"
                  onError={() => setAuthorImageError(true)} 
                />
              ) : (
                <div className="w-full h-full rounded-full border border-white/20 bg-slate-800 relative z-10 flex items-center justify-center text-slate-500 shadow-xl">
                  <i className="ph-fill ph-user text-4xl"></i>
                </div>
              )}
          </div>
          
          {/* CONTENU TEXTUEL (L'alignement natif RTL gère la droite automatiquement) */}
          <div className="flex-1 flex flex-col w-full items-start text-start">
            
           {/* Top : L'Étiquette et le Rôle Dynamique (Dogme 1 : Dual-Stack) */}
            <div className="flex flex-col gap-1.5 mb-2 items-start text-start">
                
                {/* 1. L'Étiquette Impériale Fixe (Hiérarchie N'Ko & Séparateur) */}
                <div className="flex items-center gap-2.5">
                  <span className="text-or text-base md:text-[17px] font-bold tracking-wide font-kigelia drop-shadow-sm">
                    ߛߓߍߦߟߊ
                  </span>
                  
                  {/* Le séparateur vertical (World Class) */}
                  <span className="w-[1.5px] h-3.5 bg-or/40 rounded-full"></span>
                  
                  <span className="text-or/70 text-[10px] font-bold tracking-widest uppercase font-sans mt-0.5">
                    Auteur
                  </span>
                </div>
                
                {/* 2. Le Rôle (100% Dynamique depuis Sanity, Zéro texte en dur) */}
                {(author.roleNko || author.role || author.institution) && (
                  <div className="flex flex-wrap items-center gap-2 text-gray-400 mt-1">
                    
                    {/* Rôle N'Ko (Prioritaire) */}
                    {author.roleNko && (
                      <span dir="rtl" className="font-kigelia text-sm text-gray-200">
                        {author.roleNko}
                      </span>
                    )}
                    
                    {/* Séparateur élégant si les deux langues sont présentes */}
                    {author.roleNko && author.role && (
                      <span className="text-white/20 text-xs">|</span>
                    )}

                    {/* Rôle Français (Secondaire) */}
                    {author.role && (
                      <span dir="ltr" className="font-mono text-[10px] md:text-xs uppercase tracking-wider">
                        {author.role}
                      </span>
                    )}

                    {/* Institution */}
                    {author.institution && (
                      <>
                        {(author.roleNko || author.role) && <span className="w-1 h-1 bg-white/20 rounded-full mx-1"></span>}
                        <span className="flex items-center gap-1.5 text-gray-400 font-mono text-[10px] md:text-xs uppercase tracking-wider">
                          <i className="ph-fill ph-buildings text-sm"></i>{author.institution}
                        </span>
                      </>
                    )}
                  </div>
                )}
            </div>

            {/* Nom + Badge Certifié */}
            <div className="flex flex-col gap-1 mb-3 items-start text-start">
              <div className="flex items-center gap-2">
                <h3 className={`font-bold leading-none text-white transition-colors duration-300 group-hover/author:text-or ${isNko ? 'font-kigelia text-2xl md:text-3xl' : 'text-xl md:text-2xl'}`}>
                  {/* Le nom mène à la page de l'auteur (biographie, tous ses articles) */}
                  {author.slug ? (
                    <Link href={lien(`/auteurs/${author.slug}`)} className="hover:text-or hover:underline underline-offset-4">
                      {isNko ? (author.nameNko || author.name) : author.name}
                    </Link>
                  ) : (isNko ? (author.nameNko || author.name) : author.name)}
                </h3>
                <i className="ph-fill ph-seal-check text-or text-lg"></i>
              </div>
              
              {(author.nameNko || isNko) && (
                <span className={`text-gray-400 leading-none ${isNko ? 'text-sm font-mono tracking-wide mt-1' : 'font-kigelia text-base mt-1'}`}>
                  {isNko ? author.name : author.nameNko}
                </span>
              )}
            </div>

            {/* ORCID BADGE */}
            {author.orcid && (
               <a 
                 href={`https://orcid.org/${author.orcid}`}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="flex items-center gap-1.5 px-2 py-0.5 mb-3 rounded-full bg-[#A6CE39]/10 border border-[#A6CE39]/30 hover:bg-[#A6CE39]/20 transition-colors w-max"
               >
                 <div className="w-3.5 h-3.5 rounded-full bg-[#A6CE39] flex items-center justify-center text-black font-bold text-[8px]">iD</div>
                 <span className="text-[#A6CE39] font-mono text-[10px]">ORCID</span>
               </a>
            )}
            
            {/* LA BIOGRAPHIE INTELLIGENTE */}
            <div className="w-full">
              {renderBio()}
            </div>

            {/* L'EXPERTISE */}
            {author.expertise && author.expertise.length > 0 && (
              <div className={`flex flex-wrap gap-2 mt-2 ${isNko ? 'justify-end' : 'justify-start'}`}>
                {author.expertise.map((exp: string, idx: number) => (
                  <span key={idx} className={`px-2 py-1 rounded bg-white/5 border border-white/10 text-gray-400 text-[10px] tracking-wider uppercase ${isNko ? 'font-kigelia' : ''}`}>
                    {exp}
                  </span>
                ))}
              </div>
            )}

            {/* 🚀 RÉSEAUX SOCIAUX MAJESTUEUX (Glassmorphism & Taille XXL) */}
            {author.socials && author.socials.length > 0 && (
                <div className={`flex flex-wrap gap-4 mt-6 ${isNko ? 'justify-end' : 'justify-start'}`}>
                    {author.socials.map((social: { platform: string; url: string }, idx: number) => (
                        <a 
                          key={idx} 
                          href={social.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-or hover:bg-or/10 hover:border-or/50 hover:shadow-[0_0_20px_rgba(251,191,36,0.3)] transition-all duration-300 group touch-manipulation"
                          aria-label={`Suivre sur ${social.platform}`}
                          onClick={triggerVibration}
                        >
                            <i className={`ph-fill ph-${social.platform === 'twitter' ? 'x-logo' : social.platform.toLowerCase() + '-logo'} text-2xl group-hover:scale-110 transition-transform`}></i>
                        </a>
                    ))}
                </div>
            )}
          </div>
        </div>
      )}

           {/* 3. NEWSLETTER CTA (Formulaire Vivant & Glow Réactif) */}
      <div className={`mb-16 md:mb-24 p-6 md:p-8 rounded-3xl bg-gradient-to-br from-or/10 to-transparent border text-center relative overflow-hidden transition-all duration-700 ${
        isValidEmail 
        ? 'border-or/60 shadow-[0_0_40px_rgba(251,191,36,0.15)]' // 🚀 ACTION B : Le Glow Réactif Persistant
        : 'border-or/20 shadow-none'
      }`}>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-or to-transparent opacity-50"></div>
          
          {!subscribed ? (
            <div className={`relative z-10 transition-all duration-300 ${isExploding ? 'scale-110 opacity-0 blur-sm' : 'scale-100 opacity-100'}`}>
                <h3 className={`text-lg md:text-xl font-bold text-white mb-4 ${isNko ? 'font-kigelia' : ''}`}>
                    {isNko ? 'ߕߏ߫ ߞߊ߬ ߟߐ߲ߞߏ ߞߣߐ ߞߎ߲߬ߣߊ߬ߞߊ߬ߟߋ߲߬ ߞߎߘߊ߫ ߟߎ߬ ߟߊߛߐ߬ߘߐ߲߬ ߞߍ߬' : 'Restez informé de nos prochaines découvertes'}
                </h3>
               {/* 🚀 1/1000 : Formulaire Magnétique */}
                <form onSubmit={handleSubscribe} onFocusCapture={activerProtection} onPointerDownCapture={activerProtection} className="flex flex-col md:flex-row gap-3 max-w-md mx-auto relative group/form">
                    {/* 🛡️ INJECTION INVISIBLE DU RADAR CLOUDFLARE (au premier contact seulement) */}
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
                    
                    <input 
                        type="email" 
                        required 
                        value={email}
                        onChange={handleEmailChange}
                        placeholder={texteLangue(CHAMP_EMAIL, isNko)} 
                        aria-label={texteLangue(CHAMP_EMAIL, isNko)}
                        className={`flex-1 bg-surface/60 backdrop-blur-md border rounded-xl px-4 py-3 text-white outline-none transition-all duration-500 placeholder:text-gray-500 shadow-inner group-focus-within/form:shadow-[0_0_30px_rgba(251,191,36,0.1)] ${
                          isValidEmail 
                          ? 'border-or shadow-[inset_0_0_15px_rgba(251,191,36,0.2)]' 
                          : 'border-white/10 focus:border-or/60'
                        } ${isNko ? 'text-right placeholder:font-kigelia' : ''}`}
                    />
                  <button 
                        type="submit" 
                        disabled={!isValidEmail || isSubmitting || !turnstileToken}
                        className={`font-bold px-6 py-3 rounded-xl transition-all duration-500 whitespace-nowrap touch-manipulation flex items-center justify-center gap-2 relative overflow-hidden ${
                          isValidEmail && !isSubmitting && turnstileToken
                          ? 'bg-[#fbbf24] text-black hover:bg-blanc hover:scale-105 shadow-[0_0_20px_rgba(251,191,36,0.4)] active:scale-95 cursor-pointer' 
                          : 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5'
                        } ${isNko ? 'font-kigelia' : ''}`}
                    >
                        {isSubmitting ? (
                            <i className="ph-bold ph-spinner-gap text-xl animate-spin"></i>
                        ) : (
                            <>
                                <span className="relative z-10">{isNko ? ' ߞߵߊ߬ ߡߊߝߘߎ߬' : 'S\'abonner'}</span>
                                <i className={`ph-bold ph-paper-plane-tilt relative z-10 transition-transform duration-300 ${isValidEmail ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}></i>
                            </>
                        )}
                    </button>
                </form>
                <div className="text-start">
                  <EtatFormulaire email={email} emailValide={isValidEmail} jeton={turnstileToken} echec={verification.echec} onReessayer={verification.reessayer} nko={isNko} />
                  {erreurEnvoi && <p role="alert" className="mt-2 text-sm text-red-400">{erreurEnvoi}</p>}
                </div>
            </div>
          ) : (
            <div role="status" className="py-6 flex flex-col items-center justify-center transition-all duration-500 scale-100">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#fbbf24] rounded-full blur-xl animate-pulse opacity-20"></div>
                  <i className="ph-fill ph-envelope-simple text-5xl text-or mb-3 relative z-10" aria-hidden="true"></i>
                </div>
                {/* Pas encore abonné : l'e-mail de confirmation reste à ouvrir (31 octobre 2026) */}
                <h3 className="text-lg md:text-xl font-bold leading-snug text-white">
                    <TexteLangue texte={ABONNEMENT_A_CONFIRMER} nko={isNko} />
                </h3>
            </div>
          )}
      </div>

      {/* 4. LIRE ENSUITE (Reflet Magnétique, Isolation Z-Index & Apparition en Cascade) */}
      {relatedArticles && relatedArticles.length > 0 && (
        <div className="reveal isolate">
          <div className={`flex items-center gap-4 mb-8 md:mb-12 ${isNko ? 'flex-row-reverse' : 'flex-row'}`}>
             <h3 className={`text-xl md:text-3xl font-bold text-white flex items-center ${alignClass}`}>
                {isNko ? (
                  <><span className="inline-block w-8 md:w-12 h-[2px] bg-[#fbbf24] align-middle ml-4"></span>ߣߌ߲߬ ߝߣߊ߫ ߘߐߜߍ߫</>
                ) : (
                  <>Sur le même sujet<span className="inline-block w-8 md:w-12 h-[2px] bg-[#fbbf24] align-middle ml-4"></span></>
                )}
             </h3>
          </div>
          
          {/* 🚀 ACTION A : La Grille Observe sa visibilité */}
          <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {relatedArticles.map((item, idx) => {
              const itemImageUrl = getSafeUrl(item.image);
              return (
                <Link 
                  href={lien(`/article/${item.slug}`)} 
                  key={idx} 
                  onClick={triggerVibration}
                  // 🚀 ACTION A : Le délai de la cascade est calculé ici (idx * 150ms)
                  className={`group block transition-all duration-[800ms] hover:-translate-y-2 ease-out ${
                    cardsVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'
                  }`}
                  style={{ transitionDelay: cardsVisible ? `${idx * 150}ms` : '0ms' }}
                >
                  <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-4 border border-white/10 shadow-lg group-hover:shadow-[0_10px_30px_rgba(251,191,36,0.15)] group-hover:border-white/20 transition-all duration-500">
                    
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out z-20 pointer-events-none skew-x-12"></div>

                    {itemImageUrl ? (
                        <Image 
                          src={itemImageUrl} 
                          alt={item.title} lang={langueTexte(item.title)} 
                          fill 
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full bg-slate-900/80" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:opacity-80 transition-opacity duration-500 z-10"></div>
                  </div>
                  
                  <div className={isNko ? "text-right" : "text-left"}>
                      <span className={`text-or text-xs font-bold uppercase tracking-wider mb-2 block ${isNko ? 'font-kigelia' : ''}`}>
                      {item.category}
                      </span>
                      <h4 className={`text-gray-200 font-bold text-lg leading-snug group-hover:text-white transition-colors duration-300 ${isNko ? 'font-kigelia' : ''}`}>
                      {item.title}
                      </h4>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. BOUTON RETOUR EN HAUT */}
      <div className="mt-16 md:mt-24 flex justify-center pb-8">
          <button 
            onClick={() => {
              triggerVibration();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="group relative flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-surface/60 backdrop-blur-md border border-or/30 text-gray-300 shadow-lg hover:bg-or/10 hover:border-or hover:text-white hover:shadow-[0_0_30px_rgba(251,191,36,0.2)] active:scale-95 transition-all duration-500 overflow-hidden touch-manipulation"
          >
              <i className="ph-bold ph-arrow-up text-or text-lg transition-transform duration-500 group-hover:-translate-y-2"></i>
              <span className={`text-sm md:text-base font-bold uppercase tracking-widest ${isNko ? 'font-kigelia' : ''}`}>
                  {isNko ? 'ߊ߬ ߞߐߡߊߛߊߦߌ߫ ߛߊ߲ߝߍ߬' : 'Retour en haut'}
              </span>
          </button>
      </div>

    </section>
  );
}