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
import { urlFor } from "../../sanity/image";
import { PortableTextBlock } from "@portabletext/types";

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
  image?: string | SanityImageSource | null;
  bio?: string | PortableTextBlock[] | null; 
  institution?: string | null; // 🚀 NOUVEAU : Affiliation
  orcid?: string | null;       // 🚀 NOUVEAU : Identifiant scientifique
  expertise?: string[];        // 🚀 NOUVEAU : Domaines d'expertise
  socials?: SocialLink[];
}

interface RelatedArticleProps {
  title: string;
  slug: string;
  image?: string | SanityImageSource | null;
  category: string;
}

interface ArticleFooterProps {
  lang: string;
  author?: AuthorProps;
  tags?: string[];
  relatedArticles?: RelatedArticleProps[];
}

// ==============================================================================
// 2. COMPOSANT PRINCIPAL
// ==============================================================================

export default function ArticleFooter({ lang, author, tags, relatedArticles }: ArticleFooterProps) {
  const isNko = lang === 'nko';
  const dir = isNko ? "rtl" : "ltr";
  const alignClass = isNko ? "md:text-right" : "md:text-left";
  const authorFlex = isNko ? "md:flex-row-reverse" : "md:flex-row";

  // États du formulaire neuro-optimisé
  const [email, setEmail] = useState("");
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [isExploding, setIsExploding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // 🚀 AJOUT : État de chargement réseau
  
  // 🚀 ACTION C : État anti-crash pour l'image de l'auteur
  const [authorImageError, setAuthorImageError] = useState(false);

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
    setIsValidEmail(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
  };

 const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail || isSubmitting) return;

    triggerVibration();
    setIsSubmitting(true);

    try {
      // 🚀 LE VRAI BRANCHEMENT API (Front C)
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
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
      alert(error instanceof Error ? error.message : "Impossible de se connecter au serveur.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderBio = () => {
    if (author?.bio && typeof author.bio === 'string' && author.bio.trim().length > 0) {
      return author.bio;
    }
    return isNko 
      ? "ߟߐ߲ߞߏߕߌ߮ ߥߊߣߊ߫ ߓߟߏߡߊߞߊ߬ߟߋ߲߫ ߒߞߏ ߟߊ߫ ߕߊ߯ߢߍ ߞߊߡߊ߬." 
      : "Expert scientifique contribuant à la diffusion du savoir.";
  };

  return (
    <section className="max-w-5xl mx-auto px-4 md:px-6 pb-12 md:pb-20" dir={dir}>
      
      {/* 1. LES TAGS */}
      {tags && tags.length > 0 && (
        <div className={`flex flex-wrap gap-2 md:gap-3 mb-10 md:mb-16 ${isNko ? 'justify-end' : 'justify-start'}`}>
          {tags.map((tag, i) => (
            <span key={i} className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-white/10 text-xs md:text-sm text-gray-300 hover:border-[#fbbf24] hover:text-[#fbbf24] hover:shadow-[0_0_10px_rgba(251,191,36,0.2)] transition-all cursor-pointer bg-[#02040a] ${isNko ? 'font-kigelia' : ''}`}>
              # {tag}
            </span>
          ))}
        </div>
      )}

      {/* SÉPARATEUR */}
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mb-10 md:mb-16"></div>

   {/* 2. LA BIO AUTEUR (Profil Académique 1/1000) */}
      {author && (
        <div className={`flex flex-col ${authorFlex} items-center md:items-start gap-6 md:gap-8 mb-16 md:mb-24 p-6 md:p-8 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-sm shadow-xl transition-colors hover:border-white/10 group/author`}>
          
          {/* IMAGE AVEC AURA MAGNÉTIQUE ET SÉCURITÉ ANTI-CRASH */}
          <div className="relative w-24 h-24 md:w-28 md:h-28 shrink-0 flex items-center justify-center">
              <div className="absolute inset-0 bg-[#fbbf24]/20 rounded-full blur-xl scale-75 group-hover/author:scale-110 group-hover/author:bg-[#fbbf24]/40 transition-all duration-700"></div>
              
              {authorImageUrl && !authorImageError ? (
                <Image 
                  src={authorImageUrl} 
                  alt={author.name}
                  fill
                  sizes="(max-width: 768px) 96px, 112px"
                  className="object-cover rounded-full border-2 border-[#fbbf24]/30 relative z-10 transition-transform duration-500 group-hover/author:scale-105 shadow-2xl"
                  onError={() => setAuthorImageError(true)} 
                />
              ) : (
                <div className="w-full h-full rounded-full border-2 border-white/20 bg-slate-800 relative z-10 flex items-center justify-center text-slate-500 shadow-2xl">
                  <i className="ph-fill ph-user text-4xl"></i>
                </div>
              )}
          </div>
          
          {/* TEXTES & BADGES SCIENTIFIQUES */}
          <div className={`flex-1 text-center ${alignClass} w-full mt-2 md:mt-0`}>
            
            <div className={`flex flex-col gap-1 mb-2 ${isNko ? 'md:items-end' : 'md:items-start'}`}>
                <span className={`text-[#fbbf24] text-xs font-bold tracking-widest uppercase ${isNko ? 'font-kigelia' : ''}`}>
                 {isNko ? 'ߛߓߍߦߟߊ' : 'Auteur'}
                </span>
                
                {/* 🚀 L'INSTITUTION (Affiliation Académique) */}
                <div className={`flex items-center gap-2 text-gray-400 text-[10px] md:text-xs font-mono uppercase tracking-wider ${isNko ? 'flex-row-reverse' : ''}`}>
                  <span>{author.role}</span>
                  {author.institution && (
                    <>
                      <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                      <span className="text-[#fbbf24]/80 flex items-center gap-1">
                        <i className="ph-fill ph-buildings"></i>
                        {author.institution}
                      </span>
                    </>
                  )}
                </div>
            </div>

            {/* DUAL-STACK BYLINE ET BADGE ORCID */}
            <div className={`flex flex-col md:flex-row gap-3 items-center md:items-baseline justify-center md:justify-start mb-4 ${isNko ? 'md:flex-row-reverse' : ''}`}>
              
              <div className="flex flex-col items-center md:items-start gap-[2px]">
                <span className={`font-bold leading-none text-white transition-colors duration-300 group-hover/author:text-[#fbbf24] ${isNko ? 'font-kigelia text-2xl' : 'text-xl md:text-2xl'}`}>
                  {isNko ? (author.nameNko || author.name) : author.name}
                </span>
                {(author.nameNko || isNko) && (
                  <span className={`transition-colors duration-300 leading-none ${isNko ? 'text-sm text-gray-400 font-mono tracking-wide mt-1' : 'font-kigelia text-base text-[#fbbf24]/80 mt-1'}`}>
                    {isNko ? author.name : author.nameNko}
                  </span>
                )}
              </div>

              {/* 🚀 LE GRAAL : Le Badge ORCID cliquable */}
              <div className="flex items-center gap-2">
                <div className="relative group/badge flex items-center justify-center cursor-help">
                  <i className="ph-fill ph-seal-check text-[#fbbf24] text-lg drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]"></i>
                  <span className={`absolute bottom-full mb-2 w-max bg-black/90 border border-[#fbbf24]/30 text-gray-300 text-[10px] md:text-xs px-2 py-1 rounded opacity-0 group-hover/badge:opacity-100 transition-opacity pointer-events-none ${isNko ? 'font-kigelia' : ''}`}>
                    {isNko ? 'ߟߐ߲ߞߏߕߌ߮ ߡߊߛߙߍߘߍߦߊߣߍ߲' : 'Auteur Scientifique Vérifié'}
                  </span>
                </div>

                {author.orcid && (
                  <a 
                    href={`https://orcid.org/${author.orcid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#A6CE39]/10 border border-[#A6CE39]/30 hover:bg-[#A6CE39]/20 transition-colors group/orcid"
                    title="Voir le profil ORCID"
                  >
                    {/* Le logo officiel ORCID (Vert) */}
                    <div className="w-3.5 h-3.5 rounded-full bg-[#A6CE39] flex items-center justify-center text-black font-bold text-[8px]">iD</div>
                    <span className="text-[#A6CE39] font-mono text-[10px] group-hover/orcid:text-white transition-colors">ORCID</span>
                  </a>
                )}
              </div>
            </div>
            
            {/* LA BIOGRAPHIE */}
            <div className={`text-gray-300 md:text-gray-400 text-sm md:text-base leading-relaxed max-w-2xl mb-4 ${isNko ? 'font-kigelia mt-2' : ''}`}>
              {renderBio()}
            </div>

            {/* 🚀 L'EXPERTISE (Mots-clés Scientifiques) */}
            {author.expertise && author.expertise.length > 0 && (
              <div className={`flex flex-wrap gap-2 mt-4 justify-center ${isNko ? 'md:justify-end' : 'md:justify-start'}`}>
                {author.expertise.map((exp, idx) => (
                  <span key={idx} className={`px-2.5 py-1 rounded bg-white/5 border border-white/10 text-gray-400 text-[10px] md:text-xs tracking-wider uppercase ${isNko ? 'font-kigelia' : ''}`}>
                    {exp}
                  </span>
                ))}
              </div>
            )}

            {/* RÉSEAUX SOCIAUX */}
            {author.socials && author.socials.length > 0 && (
                <div className={`flex gap-6 md:gap-5 mt-6 justify-center ${isNko ? 'md:justify-end' : 'md:justify-start'}`}>
                    {author.socials.map((social, idx) => (
                        <a 
                          key={idx} 
                          href={social.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-gray-400 hover:text-[#fbbf24] hover:-translate-y-1 transition-all duration-300 text-2xl md:text-xl p-2 md:p-0 touch-manipulation"
                          aria-label={`Suivre sur ${social.platform}`}
                          onClick={triggerVibration}
                        >
                            <i className={`ph-fill ph-${social.platform === 'twitter' ? 'x-logo' : social.platform.toLowerCase() + '-logo'}`}></i>
                        </a>
                    ))}
                </div>
            )}
          </div>
        </div>
      )}
      {/* 3. NEWSLETTER CTA (Formulaire Vivant & Glow Réactif) */}
      <div className={`mb-16 md:mb-24 p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#fbbf24]/10 to-transparent border text-center relative overflow-hidden transition-all duration-700 ${
        isValidEmail 
        ? 'border-[#fbbf24]/60 shadow-[0_0_40px_rgba(251,191,36,0.15)]' // 🚀 ACTION B : Le Glow Réactif Persistant
        : 'border-[#fbbf24]/20 shadow-none'
      }`}>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#fbbf24] to-transparent opacity-50"></div>
          
          {!subscribed ? (
            <div className={`relative z-10 transition-all duration-300 ${isExploding ? 'scale-110 opacity-0 blur-sm' : 'scale-100 opacity-100'}`}>
                <h3 className={`text-lg md:text-xl font-bold text-white mb-4 ${isNko ? 'font-kigelia' : ''}`}>
                    {isNko ? 'ߕߏ߫ ߞߊ߬ ߟߐ߲ߞߏ ߞߣߐ߫ ߞߎ߲߬ߣߊߞߊ߬ߟߋ߲ ߞߎߘߡߊ߫ ߟߎ߬ ߟߊߛߐ߬ߘߐ߲߬ ߞߍ߬' : 'Restez informé de nos prochaines découvertes'}
                </h3>
                <form onSubmit={handleSubscribe} className="flex flex-col md:flex-row gap-3 max-w-md mx-auto relative">
                    <input 
                        type="email" 
                        required 
                        value={email}
                        onChange={handleEmailChange}
                        placeholder={isNko ? '@ߌ ߟߊ߫ ߞߘߎߡߊ...' : 'Votre email...'} 
                        aria-label={isNko ? 'Email' : 'Votre adresse email'}
                        className={`flex-1 bg-black/60 backdrop-blur-md border rounded-xl px-4 py-3 text-white focus:outline-none transition-all duration-300 placeholder:text-gray-500 ${
                          isValidEmail 
                          ? 'border-[#fbbf24] shadow-[inset_0_0_15px_rgba(251,191,36,0.2)]' // 🚀 Glow interne
                          : 'border-white/20 focus:border-[#fbbf24]/50'
                        } ${isNko ? 'text-right' : ''}`}
                    />
                  <button 
                        type="submit" 
                        disabled={!isValidEmail || isSubmitting}
                        className={`font-bold px-6 py-3 rounded-xl transition-all duration-500 whitespace-nowrap touch-manipulation flex items-center justify-center gap-2 ${
                          isValidEmail && !isSubmitting
                          ? 'bg-[#fbbf24] text-black hover:bg-white hover:scale-105 shadow-[0_0_20px_rgba(251,191,36,0.4)] active:scale-95 cursor-pointer' 
                          : 'bg-white/10 text-gray-500 cursor-not-allowed border border-white/5'
                        } ${isNko ? 'font-kigelia' : ''}`}
                    >
                        {isSubmitting ? (
                            <i className="ph-bold ph-spinner-gap text-xl animate-spin"></i>
                        ) : (
                            <>
                                <span>{isNko ? ' ߞߵߊ߬ ߡߊߝߘߎ߬' : 'S\'abonner'}</span>
                                <i className={`ph-bold ph-paper-plane-tilt transition-opacity duration-300 ${isValidEmail ? 'animate-pulse opacity-100' : 'opacity-50'}`}></i>
                            </>
                        )}
                    </button>
                </form>
            </div>
          ) : (
            <div className="py-6 flex flex-col items-center justify-center transition-all duration-500 scale-100">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#fbbf24] rounded-full blur-xl animate-pulse opacity-20"></div>
                  <i className="ph-fill ph-check-circle text-5xl text-[#fbbf24] mb-3 relative z-10 animate-bounce"></i>
                </div>
                <h3 className={`text-xl md:text-2xl font-bold text-white ${isNko ? 'font-kigelia' : ''}`}>
                    {isNko ? 'ߌ ߣߌ߫ ߗߋ߫߸ ߌ ߓߘߊ߫ ߛߙߍߘߍߦߊ߫.' : 'Merci ! Vous êtes inscrit.'}
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
                  href={`/article/${item.slug}`} 
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
                          alt={item.title} 
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
                      <span className={`text-[#fbbf24] text-xs font-bold uppercase tracking-wider mb-2 block ${isNko ? 'font-kigelia' : ''}`}>
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
            className="group relative flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-black/50 backdrop-blur-md border border-[#fbbf24]/30 text-gray-300 shadow-lg hover:bg-[#fbbf24]/10 hover:border-[#fbbf24] hover:text-white hover:shadow-[0_0_30px_rgba(251,191,36,0.2)] active:scale-95 transition-all duration-500 overflow-hidden touch-manipulation"
          >
              <i className="ph-bold ph-arrow-up text-[#fbbf24] text-lg transition-transform duration-500 group-hover:-translate-y-2"></i>
              <span className={`text-sm md:text-base font-bold uppercase tracking-widest ${isNko ? 'font-kigelia' : ''}`}>
                  {isNko ? 'ߊ߬ ߞߐߡߊߛߊߦߌ߫ ߛߊ߲ߝߍ߬' : 'Retour en haut'}
              </span>
          </button>
      </div>

    </section>
  );
}