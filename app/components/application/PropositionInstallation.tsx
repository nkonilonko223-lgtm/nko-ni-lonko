"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useLanguage } from "../LanguageProvider";
import { abonnerInstallation, dejaInstallee, installer, modeInstallation, modeInstallationServeur } from "../../lib/installation";
import GuideIphone from "./GuideIphone";
import { TexteLangue, texteLangue } from "./Libelle";
import { INSTALLER, INSTALLER_APPLICATION, INSTALLER_POURQUOI, PLUS_TARD } from "./textes";

// ============================================================================
// N'KO NI LONKO — Proposition d'installer l'application (sous les articles)
// ============================================================================
// Discrète et au bon moment, jamais à la première visite :
//   - seulement sur un article, à partir du 2ᵉ article différent lu sur cet appareil ;
//   - quand le lecteur a lu la moitié de l'article ;
//   - jamais si l'application est installée, et pas avant 2 mois après « Plus tard ».
// Carte en bas de l'écran, au-dessus de la barre d'outils de l'article ; rien ne bloque la lecture.
// Chrome, Edge… : la fenêtre d'installation du navigateur. iPhone, iPad : le guide.
// Gardé dans le navigateur du lecteur seulement : articles lus (20 au plus), date de « Plus tard ».
// ============================================================================

const CLE_LUS = "nko_articles_lus";
const CLE_PLUS_TARD = "nko_installation_plus_tard";
const DELAI_PLUS_TARD = 60 * 24 * 60 * 60 * 1000; // 2 mois
const ARTICLE = /^\/(?:fr\/)?article\/([a-z0-9-]+)\/?$/;

function articlesLus(): string[] {
  try {
    const valeur: unknown = JSON.parse(localStorage.getItem(CLE_LUS) || "[]");
    return Array.isArray(valeur) ? valeur.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

// Ajoute l'article à la liste (sans doublon) et rend la liste
function noterArticle(slug: string): string[] {
  const lus = articlesLus();
  if (lus.includes(slug)) return lus;
  const nouvelle = [...lus, slug].slice(-20);
  try { localStorage.setItem(CLE_LUS, JSON.stringify(nouvelle)); } catch { /* stockage bloqué */ }
  return nouvelle;
}

function plusTardRecent(): boolean {
  try {
    return Date.now() - Number(localStorage.getItem(CLE_PLUS_TARD) || 0) < DELAI_PLUS_TARD;
  } catch {
    return true; // stockage bloqué : on ne pourrait pas retenir « Plus tard », on ne propose rien
  }
}

export default function PropositionInstallation() {
  const pathname = usePathname();
  const { lang } = useLanguage();
  const nko = lang === "nko";
  const mode = useSyncExternalStore(abonnerInstallation, modeInstallation, modeInstallationServeur);
  const proposable = mode === "fenetre" || mode === "guide";
  // Page sur laquelle la carte a été montrée : elle disparaît d'elle-même sur une autre page
  const [montreeSur, setMontreeSur] = useState<string | null>(null);

  useEffect(() => {
    const slug = ARTICLE.exec(window.location.pathname)?.[1];
    if (!slug) return;
    const lus = noterArticle(slug);
    if (!proposable || lus.length < 2 || plusTardRecent() || dejaInstallee()) return;
    const verifier = () => {
      const fin = document.documentElement.scrollHeight - window.innerHeight;
      if (fin > 0 && window.scrollY / fin >= 0.5) {
        setMontreeSur(pathname);
        window.removeEventListener("scroll", verifier);
      }
    };
    window.addEventListener("scroll", verifier, { passive: true });
    return () => window.removeEventListener("scroll", verifier);
  }, [pathname, proposable]);

  const plusTard = () => {
    try { localStorage.setItem(CLE_PLUS_TARD, String(Date.now())); } catch { /* stockage bloqué */ }
    setMontreeSur(null);
  };
  const installerMaintenant = () => {
    setMontreeSur(null);
    void installer();
  };

  return (
    <>
      {proposable && montreeSur === pathname && (
        <div
          role="region"
          data-proposition-installation=""
          aria-label={texteLangue(INSTALLER_APPLICATION, nko)}
          className="fixed inset-x-3 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-[9990] mx-auto max-w-md rounded-2xl border border-[#fbbf24]/30 bg-[#0b1121]/95 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl print:hidden motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-500 md:bottom-6"
        >
          <div className="flex items-center gap-3">
            <Image src="/icon-192x192.png" alt="" width={48} height={48} className="h-12 w-12 shrink-0 rounded-xl" />
            <p className="min-w-0 flex-1 text-start">
              <TexteLangue texte={INSTALLER_APPLICATION} nko={nko} className="block font-bold text-white" />
              <TexteLangue texte={INSTALLER_POURQUOI} nko={nko} className="mt-0.5 block text-sm leading-snug text-white/70" />
            </p>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button type="button" onClick={plusTard} className="min-h-11 rounded-full px-4 text-sm text-white/70 transition-colors hover:text-white">
              <TexteLangue texte={PLUS_TARD} nko={nko} />
            </button>
            <button
              type="button"
              onClick={installerMaintenant}
              className="flex min-h-11 items-center gap-2 rounded-full bg-[#fbbf24] px-5 text-sm font-bold text-black transition-colors hover:bg-white"
            >
              <i className="ph-bold ph-download-simple" aria-hidden="true"></i>
              <TexteLangue texte={INSTALLER} nko={nko} />
            </button>
          </div>
        </div>
      )}
      <GuideIphone />
    </>
  );
}
