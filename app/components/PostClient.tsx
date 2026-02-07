"use client";

import { useState } from "react";
import Link from "next/link";
import "../globals.css";

// --- TYPES ---
type PostData = {
  title: string;
  date: string;
  image: string;
  contentHtml: string;
};

// --- FONCTIONS UTILITAIRES ---
function toNkoDigits(str: string) {
  const nkoDigits = ['߀', '߁', '߂', '߃', '߄', '߅', '߆', '߇', '߈', '߉'];
  return str.replace(/[0-9]/g, (d) => nkoDigits[parseInt(d)]);
}

// --- DICTIONNAIRE & ICÔNES DE CLASSE MONDIALE 🌍 ---
const dictionary = {
  fr: {
    backText: "Retour",
    // Icône : Une flèche courbe élégante vers la gauche
    backIconClass: "ph-bold ph-arrow-u-up-left",
    
    footerText: "N'Ko ni Lonko © 2026",
    // Icône Footer : Un sceau de certification officiel
    footerIconClass: "ph-fill ph-seal-check",
    
    // Ce que le bouton affiche quand on est en FR (pour passer en N'Ko)
    langBtnText: "ߒߞߏ",
    // Icône : Globe orienté vers l'Afrique/Orient
    langBtnIconClass: "ph-fill ph-globe-hemisphere-east"
  },
  nqo: {
    backText: "ߞߐߛߊߦߌ߲",
    // Icône : La même flèche courbe, miroir vers la droite
    backIconClass: "ph-bold ph-arrow-u-up-right",
    
    footerText: "ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ © ߂߀߂߆",
    footerIconClass: "ph-fill ph-seal-check",
    
    // Ce que le bouton affiche quand on est en N'Ko (pour passer en FR)
    langBtnText: "FR",
    // Icône : Globe orienté vers l'Occident
    langBtnIconClass: "ph-fill ph-globe-hemisphere-west"
  }
};

export default function PostClient({ postData }: { postData: PostData }) {
  const [lang, setLang] = useState<"nqo" | "fr">("nqo");
  
  // On récupère les textes et icônes de la langue ACTUELLE
  const t = dictionary[lang];
  
  const displayDate = lang === "nqo" ? toNkoDigits(postData.date) : postData.date;
  const contentDirection = lang === "nqo" ? "rtl" : "ltr";
  
  const toggleLang = () => {
    setLang(prev => prev === "nqo" ? "fr" : "nqo");
  };

  return (
    <div className="min-h-screen bg-[#02040a] text-white selection:bg-[#fbbf24] selection:text-black">
      
      {/* --- HEADER PREMIUM --- */}
      {/* Ajout d'une ombre dorée subtile (shadow-md shadow-gold/10) */}
      <nav className="flex justify-between items-center px-6 py-4 border-b border-[#fbbf24]/20 bg-[#02040a]/80 backdrop-blur-xl sticky top-0 z-50 shadow-md shadow-[#fbbf24]/5 flex-row">
        
        {/* COTÉ GAUCHE : BOUTON RETOUR "MAGIQUE" */}
        <Link href="/" className="group flex items-center gap-3 no-underline transition-all duration-300">
            {/* Conteneur de l'icône avec effet de survol */}
            <div className={`flex items-center justify-center w-10 h-10 rounded-full bg-[#fbbf24]/10 border border-[#fbbf24]/30 text-[#fbbf24] transition-all duration-300 group-hover:bg-[#fbbf24] group-hover:text-black group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(251,191,36,0.5)] ${lang === 'nqo' ? 'order-last' : 'order-first'}`}>
                <i className={`${t.backIconClass} text-xl`}></i>
            </div>
            {/* Texte avec effet de fondu */}
            <span className="text-[#fbbf24] font-bold text-lg opacity-90 group-hover:opacity-100 transition-opacity">
                {t.backText}
            </span>
        </Link>

        {/* COTÉ DROIT : ACTIONS BLINDÉES */}
        <div className="flex items-center gap-6" dir="ltr" style={{ direction: 'ltr' }}>
            
            {/* BOUTON CHANGER LANGUE "SCEAU IMPÉRIAL" */}
            <div className="z-10">
                <button 
                    onClick={toggleLang}
                    // Design pilule lumineuse, dégradé subtil, ombre portée dorée
                    className={`group relative flex items-center gap-2 bg-gradient-to-r from-[#fbbf24]/10 to-[#d97706]/10 hover:from-[#fbbf24] hover:to-[#d97706] border border-[#fbbf24]/50 pl-3 pr-4 py-2 rounded-full transition-all duration-300 cursor-pointer shadow-[0_0_10px_rgba(251,191,36,0.1)] hover:shadow-[0_0_20px_rgba(251,191,36,0.4)] active:scale-95 ${lang === 'nqo' ? 'font-sans' : ''}`}
                >
                    {/* Icône Globe qui tourne au survol */}
                    <i className={`${t.langBtnIconClass} text-xl text-[#fbbf24] group-hover:text-black transition-colors group-hover:rotate-12 duration-300`}></i>
                    
                    {/* Texte du bouton */}
                    <span className="text-sm font-extrabold text-[#fbbf24] group-hover:text-black transition-colors whitespace-nowrap">
                        {t.langBtnText}
                    </span>
                </button>
            </div>

            {/* DATE STYLISÉE */}
            <div className="z-10 hidden md:block"> {/* Caché sur petit mobile pour gagner de la place */}
                <span className="flex items-center gap-2 text-gray-400 text-sm border border-[#fbbf24]/20 bg-[#fbbf24]/5 px-4 py-2 rounded-full whitespace-nowrap shadow-sm">
                    <i className="ph-bold ph-calendar-blank text-[#fbbf24]"></i> {/* Petite icône calendrier */}
                    <span>{displayDate}</span>
                </span>
            </div>
        </div>
      </nav>

      {/* --- CONTENU (Inchangé, il est déjà top) --- */}
      <main className="py-12">
        <div className="w-full px-6 flex flex-col items-center">
            <h1 
                className="max-w-[850px] w-full text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-[#fbbf24] mb-10 leading-tight mx-auto" 
                style={{ textAlign: 'center', margin: '0 auto 40px auto' }} 
            >
                {postData.title}
            </h1>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '60px' }}>
                <div style={{ width: '700px', maxWidth: '100%', height: '400px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', position: 'relative' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={postData.image} alt={postData.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
            </div>
        </div>
        <div 
            className="article-content"
            dir={contentDirection}
            style={{ textAlign: lang === 'nqo' ? 'right' : 'left', direction: contentDirection }}
            dangerouslySetInnerHTML={{ __html: postData.contentHtml || "" }} 
        />
      </main>

      {/* --- FOOTER "OFFICIEL" --- */}
      <footer className="relative mt-20 pt-12 pb-8 border-t border-[#fbbf24]/30 bg-gradient-to-t from-[#02040a] to-[#0f172a]" dir={contentDirection}>
        {/* Effet de lueur doré en bas */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-[#fbbf24] blur-xl opacity-30"></div>
        
        <div className="flex flex-col items-center justify-center gap-3 text-center">
            {/* Icône du Sceau Impérial */}
            <i className={`${t.footerIconClass} text-3xl text-[#fbbf24] opacity-80 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]`}></i>
            
            {/* Texte du Copyright */}
            <p className="text-gray-400 text-lg font-medium tracking-wider">
                {t.footerText}
            </p>
        </div>
      </footer>
    </div>
  );
}