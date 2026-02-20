import Link from "next/link";
import { Metadata } from "next";

// 1. SEO WORLD CLASS (Conservé et Sécurisé)
// On garde ceci car c'est vital pour que Google comprenne la page.
export const metadata: Metadata = {
  title: "À Propos | N'Ko ni Lonko",
  description: "Notre mission : vulgariser la science (Astronomie, Physique, Biologie) en langue N'Ko pour le partage du savoir universel.",
  openGraph: {
    title: "À Propos de N'Ko ni Lonko",
    description: "Science et Savoir pour tous.",
    images: ["/images/og-default.jpg"],
  },
};

export default function About() {
  return (
    <div className="min-h-screen relative text-white flex flex-col items-center justify-center p-6 text-center overflow-hidden selection:bg-[#fbbf24] selection:text-black">
      
      {/* 🌌 FOND COSMIQUE + GRAIN */}
      <div className="fixed inset-0 z-[-1]">
         <div className="absolute inset-0 bg-[#02040a]"></div> 
         <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-[#02040a] to-[#02040a]"></div>
         {/* Texture Grain */}
         <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
      </div>

      {/* CERCLE LUMINEUX */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#fbbf24] rounded-full blur-[120px] opacity-10 pointer-events-none animate-pulse duration-[5000ms]"></div>

      {/* CONTENU PRINCIPAL */}
      {/* ✅ AMÉLIORATION : Utilisation de 'animate-in' natif (Tailwind) au lieu de <style jsx> */}
      {/* C'est plus performant et évite les bugs de Server Component */}
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center animate-in fade-in slide-in-from-bottom-10 duration-1000 fill-mode-forwards">

        {/* Icône Totem */}
        <div className="mb-10 relative group">
            <div className="absolute inset-0 bg-[#fbbf24] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
            <i className="ph-duotone ph-scroll text-7xl md:text-8xl text-[#fbbf24] relative z-10 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]"></i>
        </div>

        {/* Titre Bilingue */}
        <h1 className="text-4xl md:text-7xl font-extrabold text-[#fbbf24] mb-12 tracking-tight font-sans">
            <span className="block mb-4 md:mb-6 leading-tight drop-shadow-lg">ߞߊ߲߬ߞߎߡߊ</span>
            <span className="text-white/80 text-lg md:text-2xl font-light uppercase tracking-[0.3em] border-y border-white/10 py-2 inline-block">
                À Propos de nous
            </span>
        </h1>

        {/* Carte de Contenu */}
        {/* ✅ AMÉLIORATION RTL : 'text-start' gère automatiquement Gauche (FR) et Droite (N'Ko) */}
        <div className="backdrop-blur-xl bg-white/5 p-8 md:p-12 rounded-[2rem] border border-white/10 shadow-2xl hover:border-[#fbbf24]/30 transition-colors duration-500 group text-start md:text-center">
            
            {/* Mission N'Ko */}
            <p dir="rtl" className="text-2xl md:text-4xl text-[#fbbf24] leading-loose font-medium mb-8 drop-shadow-md">
            ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ ߦߋ߫ ߓߟߐߟߐ߫ ߝߏߟߏ߲ߝߊߟߊ߲ ߟߋ߬ ߘߌ߫ ߡߌ߲ ߟߊߘߊ߲ߠߍ߲ ߝߘߏ߬ߓߊ߬ ߟߐ߲ߞߏ ߟߎ߬ ߕߌߙߌ߲ߠߌ߲ ߞߊߡߊ߬ ߡߊ߲߬ߘߋ߲߬ ߞߊ߲ ߘߐ߫.
            </p>

            {/* Séparateur Diamant */}
            <div className="flex items-center justify-center gap-4 opacity-30 my-8">
                <div className="h-[1px] w-12 bg-[#fbbf24]"></div>
                <div className="w-2 h-2 rotate-45 bg-[#fbbf24]"></div>
                <div className="h-[1px] w-12 bg-[#fbbf24]"></div>
            </div>

            {/* Mission FR */}
            <p className="font-light text-lg md:text-xl text-gray-300 leading-relaxed">
            <strong className="text-white font-bold">N&apos;Ko ni Lonko</strong> est une plateforme d&apos;avant-garde dédiée à la vulgarisation scientifique.
            <br className="hidden md:block" />
            Notre mission est de briser la barrière de la langue pour rendre l&apos;astronomie, la physique et la biologie accessibles au peuple Mandingue et au monde entier.
            </p>

        </div>

        {/* Boutons d'Action */}
        <div className="mt-16 flex flex-col md:flex-row items-center gap-6">
            <Link 
                href="/" 
                className="group relative px-8 py-4 rounded-full bg-[#fbbf24] text-black font-bold text-sm tracking-widest uppercase hover:bg-white transition-all duration-300 shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] flex items-center gap-3"
            >
                <i className="ph-bold ph-house text-lg"></i>
                <span>Retour à l&apos;accueil</span>
            </Link>

            {/* Réseaux Sociaux */}
            <div className="flex gap-4">
                {['twitter-logo', 'facebook-logo', 'envelope'].map((icon, i) => (
                    <button key={i} className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-gray-400 hover:text-[#fbbf24] hover:border-[#fbbf24] hover:bg-white/5 transition-all">
                        <i className={`ph-fill ph-${icon} text-xl`}></i>
                    </button>
                ))}
            </div>
        </div>

      </div>
      
      {/* Copyright discret */}
      <div className="absolute bottom-6 text-white/10 text-[10px] md:text-xs font-mono uppercase tracking-widest">
        Designed for Science • © 2026
      </div>

    </div>
  );
}