"use client";

// ============================================================================
// N'KO NI LONKO — Terme du lexique dans le texte d'un article
// ============================================================================
// Le mot est souligné en pointillé. Au toucher (téléphone) : fiche qui monte du
// bas de l'écran. Au clic (ordinateur) : bulle à côté du mot, qui ne déborde
// jamais de l'écran. Fermeture : ✕, Échap, clic à côté. Accessible au clavier.
// La fenêtre est rendue dans <body> (portail) pour ne jamais être coupée.
// ============================================================================

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { TEXTES_LEXIQUE } from "./textes";

export interface TermeLexiqueData {
  termeNko?: string;
  termeFr?: string;
  definitionNko?: string;
  definitionFr?: string;
  slug?: string;
}

const LARGEUR_BULLE = 320;

export default function TermeLexique({
  terme,
  nko,
  children,
}: {
  terme?: TermeLexiqueData | null;
  nko: boolean;
  children: React.ReactNode;
}) {
  const [ouvert, setOuvert] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number; auDessus: boolean } | null>(null);
  const motRef = useRef<HTMLSpanElement>(null);
  const fenetreRef = useRef<HTMLDivElement>(null);
  const id = useId();

  const fermer = useCallback(() => {
    setOuvert(false);
    motRef.current?.focus();
  }, []);

  const ouvrir = useCallback(() => {
    const estMobile = window.matchMedia("(max-width: 767px)").matches;
    setMobile(estMobile);
    if (!estMobile && motRef.current) {
      const r = motRef.current.getBoundingClientRect();
      const left = Math.min(
        Math.max(12, r.left + r.width / 2 - LARGEUR_BULLE / 2),
        window.innerWidth - LARGEUR_BULLE - 12
      );
      const auDessus = r.bottom > window.innerHeight * 0.6;
      setPosition({ top: auDessus ? r.top - 8 : r.bottom + 8, left, auDessus });
    }
    setOuvert(true);
  }, []);

  useEffect(() => {
    if (!ouvert) return;
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === "Escape") fermer();
    };
    const surClic = (e: MouseEvent | TouchEvent) => {
      const cible = e.target as Node;
      if (!fenetreRef.current?.contains(cible) && !motRef.current?.contains(cible)) setOuvert(false);
    };
    const surDefilement = () => {
      if (!mobile) setOuvert(false);
    };
    document.addEventListener("keydown", surTouche);
    document.addEventListener("mousedown", surClic);
    document.addEventListener("touchstart", surClic, { passive: true });
    window.addEventListener("scroll", surDefilement, { passive: true });
    fenetreRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", surTouche);
      document.removeEventListener("mousedown", surClic);
      document.removeEventListener("touchstart", surClic);
      window.removeEventListener("scroll", surDefilement);
    };
  }, [ouvert, mobile, fermer]);

  // Terme introuvable (supprimé ou non relié) : on affiche simplement le texte
  if (!terme || (!terme.termeNko && !terme.termeFr)) return <>{children}</>;

  const titre = nko ? terme.termeNko || terme.termeFr : terme.termeFr || terme.termeNko;
  const definition = nko ? terme.definitionNko || terme.definitionFr : terme.definitionFr || terme.definitionNko;
  const t = (cle: keyof typeof TEXTES_LEXIQUE) => (nko ? TEXTES_LEXIQUE[cle].nko : TEXTES_LEXIQUE[cle].fr);

  const contenu = (
    <div
      ref={fenetreRef}
      id={`${id}-fenetre`}
      role="dialog"
      aria-modal={mobile ? true : undefined}
      aria-labelledby={`${id}-titre`}
      tabIndex={-1}
      dir={nko ? "rtl" : "ltr"}
      lang={nko ? "nqo" : "fr"}
      className={
        mobile
          ? "fixed inset-x-0 bottom-0 z-[100000] max-h-[70vh] overflow-y-auto rounded-t-2xl border-t border-blue-400/30 bg-[#0b1121] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-20px_50px_rgba(0,0,0,0.6)] outline-none animate-in slide-in-from-bottom duration-300"
          : "fixed z-[100000] rounded-xl border border-blue-400/30 bg-[#0b1121]/95 p-4 shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl outline-none animate-in fade-in duration-200"
      }
      style={
        !mobile && position
          ? { top: position.top, left: position.left, width: LARGEUR_BULLE, transform: position.auDessus ? "translateY(-100%)" : undefined }
          : undefined
      }
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <p id={`${id}-titre`} className={`${nko ? "font-kigelia text-lg" : "font-sans text-base"} font-bold text-blue-300`}>
          {titre}
        </p>
        <button
          type="button"
          onClick={fermer}
          aria-label={t("fermer")}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          <i className="ph-bold ph-x" aria-hidden="true"></i>
        </button>
      </div>
      <p className={nko ? "font-kigelia text-[15px] leading-[1.85] text-gray-200" : "font-sans text-sm leading-relaxed text-gray-200"}>
        {definition}
      </p>
      {terme.slug && (
        <Link
          href={`/lexique/${terme.slug}`}
          className={`mt-3 inline-block text-blue-300 underline underline-offset-4 hover:text-white ${nko ? "font-kigelia text-sm" : "font-sans text-xs"}`}
        >
          {t("voirDansLeLexique")}
        </Link>
      )}
    </div>
  );

  return (
    <>
      <span
        ref={motRef}
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        aria-expanded={ouvert}
        aria-controls={ouvert ? `${id}-fenetre` : undefined}
        onClick={() => (ouvert ? setOuvert(false) : ouvrir())}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (ouvert) setOuvert(false);
            else ouvrir();
          }
        }}
        className="cursor-pointer rounded-sm underline decoration-blue-400/70 decoration-dotted decoration-2 underline-offset-[6px] transition-colors hover:text-blue-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 print:no-underline"
      >
        {children}
      </span>
      {ouvert && typeof document !== "undefined" && (
        <>
          {mobile &&
            createPortal(
              <div className="fixed inset-0 z-[99999] bg-black/50 animate-in fade-in duration-200" aria-hidden="true" onClick={() => setOuvert(false)} />,
              document.body
            )}
          {createPortal(contenu, document.body)}
        </>
      )}
    </>
  );
}
