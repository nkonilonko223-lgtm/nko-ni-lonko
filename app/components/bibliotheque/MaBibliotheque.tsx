"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useLanguage } from "../LanguageProvider";
import { abonnerSignets, analyserSignets, ecrireSignets, lisibleHorsLigne, prevenirLectureHorsLigne, signetsBruts } from "../../lib/bibliotheque";
import { sensDe, separerTitre } from "../numero/titre";
import messagesNko from "../../messages/nko.json";

// ============================================================================
// N'KO NI LONKO — « Ma bibliothèque » (îlot client de la page /bibliotheque)
// ============================================================================
// Reçoit la fiche courte de chaque article publié ; montre seulement ceux que le lecteur a
// sauvegardés (le plus récent d'abord). Un article retiré du site disparaît de la liste.
// Libellés N'Ko à demander à la rédaction : vides pour l'instant (seul le français s'affiche).
// Le N'Ko de « Numéros » est repris du dictionnaire du site (app/messages/nko.json).
// ============================================================================

export type ArticleSauvegardable = {
  title: string;
  slug: string;
  publishedAt?: string;
  category?: string;
  image?: { alt?: string; url?: string } | null;
};

type Libelle = { nko: string; fr: string };

const TEXTES = {
  titre: { nko: "", fr: "Ma bibliothèque" },
  explication: { nko: "", fr: "Les articles sauvegardés avec le signet restent sur cet appareil. Rien n'est envoyé." },
  vide: { nko: "", fr: "Aucun article sauvegardé pour l'instant. Touchez le signet d'un article pour le retrouver ici." },
  retirer: { nko: "", fr: "Retirer de ma bibliothèque" },
  horsLigne: { nko: "", fr: "Lisible sans connexion" },
  numeros: { nko: messagesNko.nav.numeros, fr: "Numéros" },
} satisfies Record<string, Libelle>;

const serveur = () => null; // côté serveur, la liste n'est pas connue : rien n'est affiché

export default function MaBibliotheque({ articles }: { articles: ArticleSauvegardable[] }) {
  const { lang } = useLanguage();
  const enNko = lang === "nko";
  const brut = useSyncExternalStore(abonnerSignets, signetsBruts, serveur);

  // N'Ko si la rédaction l'a fourni (et si le lecteur lit en N'Ko), sinon français
  const libelle = (l: Libelle, classe = "") =>
    enNko && l.nko
      ? <span lang="nqo" dir="rtl" className={`font-kigelia ${classe}`}>{l.nko}</span>
      : <span lang="fr" dir="ltr" className={`font-fr ${classe}`}>{l.fr}</span>;

  const parChemin = new Map(articles.map((a) => [`/article/${a.slug}`, a]));
  const sauvegardes = brut === null
    ? null
    : [...new Set(analyserSignets(brut))].reverse().flatMap((chemin) => {
        const article = parChemin.get(chemin);
        return article ? [{ chemin, article }] : [];
      });

  const retirer = (chemin: string) => {
    if (brut === null) return;
    ecrireSignets(analyserSignets(brut).filter((c) => c !== chemin));
    prevenirLectureHorsLigne("oublier", chemin);
  };

  // Lecture hors ligne (public/sw.js) : quels articles sont gardés sur l'appareil ? Ceux qui
  // ne le sont pas encore (sauvegardés avant le service worker) sont demandés, si connecté.
  const [horsLigne, setHorsLigne] = useState<Set<string>>(() => new Set());
  const chemins = sauvegardes?.map((s) => s.chemin).join("|") ?? "";
  useEffect(() => {
    if (!chemins) return;
    let actif = true;
    (async () => {
      const gardes = new Set<string>();
      for (const chemin of chemins.split("|")) {
        if (await lisibleHorsLigne(chemin)) gardes.add(chemin);
        else if (navigator.onLine) prevenirLectureHorsLigne("garder", chemin);
      }
      if (actif) setHorsLigne(gardes);
    })();
    return () => { actif = false; };
  }, [chemins]);

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-10 flex flex-col items-center gap-3 text-center">
        <i className="ph-duotone ph-books text-5xl text-[#fbbf24]" aria-hidden="true"></i>
        <h1 className="text-3xl font-bold text-[#fbbf24] md:text-4xl">{libelle(TEXTES.titre)}</h1>
        <p className="max-w-xl text-sm text-white/60">{libelle(TEXTES.explication)}</p>
      </header>

      {sauvegardes !== null && sauvegardes.length === 0 && (
        <div className="mx-auto flex max-w-xl flex-col items-center gap-6 rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center text-white/70">
          <i className="ph-bold ph-bookmark-simple text-4xl text-white/40" aria-hidden="true"></i>
          <p>{libelle(TEXTES.vide)}</p>
          <Link href="/numeros" className="rounded-full border border-[#fbbf24]/50 px-5 py-2 text-[#fbbf24] transition-colors hover:bg-[#fbbf24]/10">
            {libelle(TEXTES.numeros, enNko ? "text-lg" : "")}
          </Link>
        </div>
      )}

      {sauvegardes !== null && sauvegardes.length > 0 && (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sauvegardes.map(({ chemin, article }) => {
            const { nko, fr } = separerTitre(article.title);
            const sens = sensDe(nko);
            return (
              <li key={chemin} className="relative">
                <Link
                  href={chemin}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition-colors hover:border-[#fbbf24]/50"
                >
                  <span className="relative block aspect-[16/9] w-full bg-white/5">
                    {article.image?.url && (
                      <Image src={article.image.url} alt={article.image.alt || ""} fill sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    )}
                  </span>
                  <span className="flex-1 p-4 text-start">
                    <span {...sens} className={`block text-lg font-bold text-white transition-colors group-hover:text-[#fbbf24] ${sens.lang === "nqo" ? "font-kigelia" : ""}`}>{nko}</span>
                    {fr && <span lang="fr" dir="ltr" className="mt-1 block font-fr text-sm text-white/70">{fr}</span>}
                    {horsLigne.has(chemin) && (
                      <span className="mt-3 flex items-center gap-1.5 text-xs text-green-400">
                        <i className="ph-fill ph-check-circle" aria-hidden="true"></i>
                        {libelle(TEXTES.horsLigne)}
                      </span>
                    )}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => retirer(chemin)}
                  aria-label={enNko && TEXTES.retirer.nko ? TEXTES.retirer.nko : TEXTES.retirer.fr}
                  title={enNko && TEXTES.retirer.nko ? TEXTES.retirer.nko : TEXTES.retirer.fr}
                  className="absolute end-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white/70 backdrop-blur transition-colors hover:text-white"
                >
                  <i className="ph-bold ph-x" aria-hidden="true"></i>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
