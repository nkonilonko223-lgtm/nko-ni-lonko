"use client";

import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "../components/LanguageProvider";

export default function OfflinePage() {
  const { lang } = useLanguage();
  const isNko = lang === 'nko';
  const [isRetrying, setIsRetrying] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  const handleRetry = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
    setIsRetrying(true);

    // 🛡️ Vérification réseau avant rechargement
    setTimeout(() => {
      if (navigator.onLine) {
        setIsOnline(true);
        setTimeout(() => window.location.reload(), 500);
      } else {
        setIsRetrying(false);
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }
      }
    }, 1000);
  };

  return (
    <div
      className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center"
      dir={isNko ? "rtl" : "ltr"}
    >
      {/* Icône dynamique avec lueur */}
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-[#fbbf24]/20 blur-xl rounded-full"></div>
        {isOnline ? (
          <i className="ph-bold ph-wifi-high text-6xl text-green-400 relative z-10 animate-pulse"></i>
        ) : (
          <i className="ph-bold ph-wifi-slash text-6xl text-[#fbbf24] relative z-10 animate-pulse"></i>
        )}
      </div>

      {/* Titre bilingue */}
      <h1 className={`text-3xl md:text-5xl font-bold text-white mb-6 ${isNko ? 'font-kigelia' : ''}`}>
        {isOnline
          ? (isNko ? 'ߓߌ߬ߟߊ߬ߢߐ߲߰ߡߊ ߓߘߊ߫ ߛߋ߫' : 'Connexion rétablie !')
          : (isNko ? 'ߓߌ߬ߟߊ߬ߢߐ߲߰ߡߊ ߕߍ߫ ߦߋ߲߬' : 'Aucune connexion internet')
        }
      </h1>

      {/* Message explicatif */}
      <p className={`text-gray-400 max-w-md mb-12 text-lg leading-relaxed ${isNko ? 'font-kigelia' : ''}`}>
        {isOnline
          ? (isNko ? 'ߌ ߘߌ߫ ߟߊߝߍ߬ ߞߎ߲߬ ߕߎ߲߯...' : 'Redirection en cours...')
          : isNko
            ? 'ߌ ߟߊ߫ ߓߌ߬ߟߊ߬ߢߐ߲߰ߡߊ ߓߘߊ߫ ߕߍ߰߹ ߞߏ߬ߣߌ߲߬ ߌ ߘߌ߫ ߛߋ߫ ߞߐߛߊߦߌ߫ ߟߊ߫ ߝߙߍ ߞߣߐ߫߸ ߞߊ߬ ߞߎߡߘߊ߫ ߓߊߛߌ߰ߣߍ߲ ߠߎ߬ ߞߊ߬ߙߊ߲߬.'
            : "Votre connexion a été interrompue. Vous pouvez tout de même retourner à l'accueil pour explorer les articles déjà sauvegardés sur votre appareil."
        }
      </p>

      {/* Boutons d'action */}
      {!isOnline && (
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">

          {/* Bouton Réessayer avec vérification réseau */}
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className={`flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#fbbf24] text-black font-bold hover:bg-white transition-colors shadow-lg shadow-[#fbbf24]/20 active:scale-95 touch-manipulation disabled:opacity-70 disabled:cursor-wait ${isNko ? 'font-kigelia' : ''}`}
          >
            <i className={`ph-bold ph-arrows-clockwise text-xl ${isRetrying ? 'animate-spin' : ''}`}></i>
            {isRetrying
              ? (isNko ? 'ߢߌ߬ߣߌ߲߬ߞߊ߬ߟߌ...' : 'Vérification...')
              : (isNko ? 'ߊ߬ ߡߊߝߍߣߍ߲߫ ߕߎ߲߯' : 'Réessayer')
            }
          </button>

          {/* Lien vers l'accueil */}
          <Link
            href="/"
            className={`flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:border-[#fbbf24] hover:bg-white/10 transition-colors active:scale-95 touch-manipulation ${isNko ? 'font-kigelia' : ''}`}
          >
            <i className={`ph-bold ${isNko ? 'ph-arrow-right' : 'ph-arrow-left'} text-xl`}></i>
            {isNko ? 'ߞߐߛߊߦߌ߫ ߝߙߍ ߞߣߐ߫' : "Retour à l'accueil"}
          </Link>

        </div>
      )}
    </div>
  );
}