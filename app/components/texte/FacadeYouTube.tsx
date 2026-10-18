"use client";

// ============================================================================
// N'KO NI LONKO — Vidéo YouTube du texte (îlot client, 18 octobre 2026)
// ============================================================================
// 🚀 LE MASQUE YOUTUBE (Facade Pattern pour 100% de perf) : une miniature, et le lecteur
// YouTube n'est chargé qu'au clic. Seule partie interactive ; le reste du texte est
// préparé par le serveur (CustomPortableText).
// ============================================================================

import { useState } from "react";
import Image from "next/image";

export default function FacadeYouTube({ videoId }: { videoId: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  return (
    <div 
      className="my-8 md:my-12 relative w-full aspect-video rounded-xl md:rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#02040a] print:hidden group cursor-pointer" 
      onClick={() => setIsPlaying(true)}
      role="button"
      aria-label="Lire la vidéo scientifique"
    >
      {!isPlaying ? (
        <>
          <Image 
            src={thumbnailUrl} 
            alt="Miniature de la vidéo" 
            fill 
            className="object-cover opacity-60 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" 
            sizes="(max-width: 768px) 100vw, 800px" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-[#fbbf24] rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(251,191,36,0.6)] group-hover:scale-110 transition-transform duration-300">
              <i className="ph-fill ph-play text-black text-3xl md:text-4xl translate-x-1"></i>
            </div>
          </div>
        </>
      ) : (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title="Lecteur Vidéo Scientifique"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0 animate-in fade-in duration-500"
        />
      )}
    </div>
  );
}
