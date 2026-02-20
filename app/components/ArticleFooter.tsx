"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { urlFor } from "../../sanity/image";
// ✅ AJOUT : Import du type officiel pour éviter le 'any'
import { PortableTextBlock } from "@portabletext/types";

// ==============================================================================
// 1. TYPAGE STRICT & UTILITAIRES
// ==============================================================================

interface SanityImageSource {
  asset: {
    _ref: string;
  };
}

// Fonction intelligente : gère URL directe (string) OU objet Sanity
function getSafeUrl(source: string | SanityImageSource | null | undefined): string | null {
  if (!source) return null;
  
  // Si c'est déjà une URL (cas venant de ArticleClient)
  if (typeof source === 'string') {
    return source.startsWith('http') ? source : null;
  }

  // Si c'est un objet Sanity
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
  // ✅ CORRECTION MAGISTRALE : Typage strict (String OU Tableau de blocs Sanity)
  // Plus de 'any', le linter sera content.
  bio?: string | PortableTextBlock[] | null; 
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

  // État pour la Newsletter
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  // Gestion sécurisée de l'image auteur
  const authorImageUrl = author?.image ? getSafeUrl(author.image) : null;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  // Logique d'affichage de la bio (Fallback si vide ou format complexe non supporté ici)
  const renderBio = () => {
    // On vérifie strictement que c'est une string avant de l'afficher
    if (author?.bio && typeof author.bio === 'string' && author.bio.trim().length > 0) {
      return author.bio;
    }
    // Fallback par défaut si pas de bio ou si c'est du PortableText (qu'on n'affiche pas ici pour simplifier le footer)
    return isNko 
      ? "ߟߐ߲ߞߏߕߌ߮ ߥߊߣߊ߫ ߓߟߏߡߊߞߊ߬ߟߋ߲߫ ߒߞߏ ߟߊ߫ ߕߊ߯ߢߍ ߞߊߡߊ߬." 
      : "Expert scientifique contribuant à la diffusion du savoir.";
  };

  return (
    // ✨ OPTIMISATION : Padding réduit sur mobile (px-4) pour maximiser l'espace
    <section className="max-w-5xl mx-auto px-4 md:px-6 pb-12 md:pb-20" dir={dir}>
      
      {/* 1. LES TAGS */}
      {tags && tags.length > 0 && (
        <div className={`flex flex-wrap gap-2 md:gap-3 mb-10 md:mb-16 ${isNko ? 'justify-end' : 'justify-start'}`}>
          {tags.map((tag, i) => (
            <span key={i} className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-white/10 text-xs md:text-sm text-gray-300 hover:border-[#fbbf24] hover:text-[#fbbf24] transition-all cursor-pointer bg-[#02040a] ${isNko ? 'font-kigelia' : ''}`}>
              # {tag}
            </span>
          ))}
        </div>
      )}

      {/* SÉPARATEUR */}
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mb-10 md:mb-16"></div>

      {/* 2. LA BIO AUTEUR */}
      {author && (
        <div className={`flex flex-col ${authorFlex} items-center md:items-start gap-6 md:gap-8 mb-16 md:mb-24 p-6 md:p-8 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-sm shadow-xl`}>
          
          {/* IMAGE */}
          {authorImageUrl && (
            <div className="relative w-20 h-20 md:w-24 md:h-24 shrink-0">
                <Image 
                  src={authorImageUrl} 
                  alt={author.name}
                  fill
                  // ✨ OPTIMISATION : Sizes pour performance
                  sizes="(max-width: 768px) 80px, 96px"
                  className="object-cover rounded-full border-2 border-[#fbbf24]/30"
                />
            </div>
          )}
          
          {/* TEXTES */}
          <div className={`flex-1 text-center ${alignClass} w-full`}>
            
            <div className={`flex flex-col gap-1 mb-2 ${isNko ? 'md:items-end' : 'md:items-start'}`}>
                <span className={`text-[#fbbf24] text-xs font-bold tracking-widest uppercase ${isNko ? 'font-kigelia' : ''}`}>
                 {isNko ? 'ߛߓߍߦߟߊ' : 'Auteur'}
                </span>
                {author.role && (
                    <span className="text-gray-400 text-[10px] md:text-xs font-mono uppercase tracking-wider">
                        {author.role}
                    </span>
                )}
            </div>

            <h3 className="text-xl md:text-2xl font-bold text-white mb-3 flex flex-col md:flex-row gap-2 items-center md:items-baseline justify-center md:justify-start">
                <span>{author.name}</span>
                {author.nameNko && (
                    <span className="text-[#fbbf24] font-kigelia text-lg md:text-xl opacity-80">
                        / {author.nameNko}
                    </span>
                )}
            </h3>
            
            {/* BIO */}
            <div className={`text-gray-300 md:text-gray-400 text-sm md:text-base leading-relaxed max-w-2xl mb-4 ${isNko ? 'font-kigelia' : ''}`}>
              {renderBio()}
            </div>

            {/* RÉSEAUX SOCIAUX */}
            {author.socials && author.socials.length > 0 && (
                // ✨ OPTIMISATION : Gap augmenté pour éviter les clics erronés sur mobile
                <div className={`flex gap-6 md:gap-4 mt-6 md:mt-4 justify-center ${isNko ? 'md:justify-end' : 'md:justify-start'}`}>
                    {author.socials.map((social, idx) => (
                        <a 
                          key={idx} 
                          href={social.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-gray-400 hover:text-[#fbbf24] transition-colors text-2xl md:text-xl p-2 md:p-0 touch-manipulation"
                          aria-label={`Suivre sur ${social.platform}`}
                        >
                            <i className={`ph-fill ph-${social.platform === 'twitter' ? 'x-logo' : social.platform.toLowerCase() + '-logo'}`}></i>
                        </a>
                    ))}
                </div>
            )}
          </div>
        </div>
      )}

      {/* 3. NEWSLETTER CTA */}
      <div className="mb-16 md:mb-24 p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#fbbf24]/10 to-transparent border border-[#fbbf24]/20 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#fbbf24] to-transparent opacity-50"></div>
          
          {!subscribed ? (
            <>
                <h3 className={`text-lg md:text-xl font-bold text-white mb-4 ${isNko ? 'font-kigelia' : ''}`}>
                    {isNko ? 'ߕߏ߫ ߞߊ߬ ߟߐ߲ߞߏ ߞߣߐ߫ ߞߎ߲߬ߣߊ߬ߘߊ߬ߟߌ ߞߎߘߊ߫ ߟߎ߬ ߟߊߛߐ߬ߘߐ߲߬ ߞߍ߬' : 'Restez informé de nos prochaines découvertes'}
                </h3>
                <form onSubmit={handleSubscribe} className="flex flex-col md:flex-row gap-3 max-w-md mx-auto">
                    <input 
                        type="email" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={isNko ? '@ߌ ߟߊ߫ ߞߘߎߡߊ...' : 'Votre email...'} 
                        aria-label={isNko ? 'Email' : 'Votre adresse email'}
                        className={`flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#fbbf24] focus:ring-1 focus:ring-[#fbbf24] transition-all ${isNko ? 'text-right' : ''}`}
                    />
                    <button 
                        type="submit" 
                        className={`bg-[#fbbf24] text-black font-bold px-6 py-3 rounded-xl hover:bg-white hover:scale-105 transition-all shadow-lg shadow-[#fbbf24]/20 active:scale-95 whitespace-nowrap touch-manipulation ${isNko ? 'font-kigelia' : ''}`}
                    >
                        {isNko ? 'ߞߵߊ߬ ߡߊߝߘߏ߬' : 'S\'abonner'}
                    </button>
                </form>
            </>
          ) : (
            <div className="py-4 animate-in fade-in zoom-in duration-300">
                <i className="ph-fill ph-check-circle text-4xl text-green-400 mb-2 inline-block"></i>
                <h3 className={`text-xl font-bold text-white ${isNko ? 'font-kigelia' : ''}`}>
                    {isNko ? 'ߌ ߣߌ߫ ߗߋ߫߸ ߌ ߓߘߊ߫ ߛߙߍߘߍߦߊ߫.' : 'Merci ! Vous êtes inscrit.'}
                </h3>
            </div>
          )}
      </div>

      {/* 4. LIRE ENSUITE */}
      {relatedArticles && relatedArticles.length > 0 && (
        <div className="reveal">
          <div className={`flex items-center gap-4 mb-6 md:mb-10 ${isNko ? 'flex-row-reverse' : 'flex-row'}`}>
             <h3 className={`text-xl md:text-3xl font-bold text-white w-full ${alignClass}`}>
                <span className="inline-block w-8 h-[2px] bg-[#fbbf24] align-middle mx-3"></span>
                {isNko ? 'ߣߌ߲߬ ߝߣߊ߫ ߘߐߜߍ߫' : 'Sur le même sujet'}
             </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedArticles.map((item, idx) => {
              const itemImageUrl = getSafeUrl(item.image);
              return (
                <Link href={`/article/${item.slug}`} key={idx} className="group block">
                  <div className="relative h-48 w-full rounded-xl overflow-hidden mb-4 border border-white/10">
                    {itemImageUrl ? (
                        <Image 
                          src={itemImageUrl} 
                          alt={item.title} 
                          fill 
                          // ✨ OPTIMISATION : Tailles adaptatives pour réduire le poids
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full bg-slate-900/50" />
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all"></div>
                  </div>
                  <div className={isNko ? "text-right" : "text-left"}>
                      <span className={`text-[#fbbf24] text-xs font-bold uppercase tracking-wider mb-2 block ${isNko ? 'font-kigelia' : ''}`}>
                      {item.category}
                      </span>
                      <h4 className={`text-white font-bold text-lg leading-snug group-hover:text-[#fbbf24] transition-colors ${isNko ? 'font-kigelia' : ''}`}>
                      {item.title}
                      </h4>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* 🚀 5. BOUTON RETOUR EN HAUT */}
      <div className="mt-12 md:mt-20 flex justify-center pb-8">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            // ✨ OPTIMISATION : Padding généreux pour le tactile
            className="group relative flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-b from-gray-800 to-gray-950 border border-[#fbbf24]/40 text-gray-300 shadow-lg hover:border-[#fbbf24] hover:text-white hover:shadow-[0_0_15px_rgba(251,191,36,0.15)] active:scale-95 transition-all duration-300 overflow-hidden touch-manipulation"
          >
              <i className="ph-bold ph-arrow-up text-[#fbbf24] animate-bounce"></i>
              <span className={`text-sm font-bold uppercase tracking-widest ${isNko ? 'font-kigelia' : ''}`}>
                  {isNko ? 'ߊ߬ ߞߐߡߊߛߊߦߌ߫ ߛߊ߲ߝߍ߬' : 'Retour en haut'}
              </span>
          </button>
      </div>

    </section>
  );
}