"use client";

// ============================================================================
// N'KO NI LONKO — Dictionnaire interactif (recherche + index alphabétique)
// ============================================================================
// Recherche instantanée dans les termes et les définitions (N'Ko et français),
// insensible aux tons N'Ko et aux accents. Adresse partageable (?q=…).
// Touche « / » pour aller dans la recherche. Index des lettres N'Ko et A–Z.
// Aucun compteur visible (le nombre de résultats n'est lu qu'aux lecteurs d'écran).
// ============================================================================

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { AIDE_RECHERCHE, TEXTES_LEXIQUE } from "./textes";
import { normaliser } from "./normaliser";

export interface TermeDictionnaire {
  termeNko?: string;
  termeFr?: string;
  definitionNko?: string;
  definitionFr?: string;
  domaine?: string;
  slug: string;
}

const premiereLettre = (texte?: string) => normaliser(texte).charAt(0);

function Carte({ t }: { t: TermeDictionnaire }) {
  return (
    <li>
      <Link
        href={`/lexique/${t.slug}`}
        className="block h-full rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-colors hover:border-blue-400/50 hover:bg-blue-400/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
      >
        <span lang="nqo" dir="rtl" className="block font-kigelia text-lg font-bold text-blue-300">{t.termeNko}</span>
        <span lang="fr" dir="ltr" className="block font-sans text-sm text-white/80">{t.termeFr}</span>
        {t.domaine && (
          <span lang="nqo" dir="rtl" className="mt-2 block font-kigelia text-xs text-[#fbbf24]/80">{t.domaine}</span>
        )}
      </Link>
    </li>
  );
}

export default function DictionnaireInteractif({ termes }: { termes: TermeDictionnaire[] }) {
  // ?q= lu dans l'adresse (adresse partageable) ; vide côté serveur
  const qAdresse = useSyncExternalStore(
    () => () => {},
    () => new URLSearchParams(window.location.search).get("q") ?? "",
    () => ""
  );
  const [saisie, setSaisie] = useState<string | null>(null);
  const recherche = saisie ?? qAdresse;
  const setRecherche = setSaisie;
  const [lettreFr, setLettreFr] = useState("");
  const champRef = useRef<HTMLInputElement>(null);

  // Mise à jour de l'adresse sans recharger la page (seulement quand le lecteur tape)
  useEffect(() => {
    if (saisie === null) return;
    const url = new URL(window.location.href);
    if (saisie) url.searchParams.set("q", saisie);
    else url.searchParams.delete("q");
    window.history.replaceState(null, "", url.toString());
  }, [saisie]);

  // Touche « / » : aller dans le champ de recherche
  useEffect(() => {
    const surTouche = (e: KeyboardEvent) => {
      const cible = e.target as HTMLElement;
      if (e.key === "/" && cible.tagName !== "INPUT" && cible.tagName !== "TEXTAREA") {
        e.preventDefault();
        champRef.current?.focus();
      }
    };
    document.addEventListener("keydown", surTouche);
    return () => document.removeEventListener("keydown", surTouche);
  }, []);

  const index = useMemo(
    () =>
      termes.map((t) => ({
        t,
        texte: normaliser([t.termeNko, t.termeFr, t.definitionNko, t.definitionFr].join(" ")),
      })),
    [termes]
  );

  const q = normaliser(recherche);
  const resultats = useMemo(() => {
    if (q) return index.filter((e) => e.texte.includes(q)).map((e) => e.t);
    if (lettreFr) {
      return termes
        .filter((t) => premiereLettre(t.termeFr) === lettreFr)
        .sort((a, b) => normaliser(a.termeFr).localeCompare(normaliser(b.termeFr), "fr"));
    }
    return termes;
  }, [q, lettreFr, index, termes]);

  // Lettres présentes (N'Ko : ordre du lexique ; latin : A–Z)
  const lettresNko = useMemo(() => [...new Set(termes.map((t) => premiereLettre(t.termeNko)).filter(Boolean))], [termes]);
  const lettresFr = useMemo(
    () => [...new Set(termes.map((t) => premiereLettre(t.termeFr)).filter((l) => l >= "a" && l <= "z"))].sort(),
    [termes]
  );

  // Vue par défaut : sections par lettre N'Ko
  const sections = useMemo(() => {
    const groupes = new Map<string, TermeDictionnaire[]>();
    for (const t of termes) {
      const l = premiereLettre(t.termeNko) || "#";
      groupes.set(l, [...(groupes.get(l) || []), t]);
    }
    return [...groupes.entries()];
  }, [termes]);

  const filtreActif = Boolean(q || lettreFr);

  return (
    <div>
      {/* Recherche */}
      <div role="search" className="mb-6">
        <label htmlFor="recherche-lexique" className="sr-only">
          {TEXTES_LEXIQUE.rechercher.fr}
        </label>
        <div className="relative">
          <i className="ph-bold ph-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-white/40" aria-hidden="true"></i>
          <input
            ref={champRef}
            id="recherche-lexique"
            type="search"
            dir="auto"
            value={recherche}
            onChange={(e) => {
              setRecherche(e.target.value);
              setLettreFr("");
            }}
            placeholder={AIDE_RECHERCHE}
            className="w-full rounded-full border border-white/15 bg-white/5 py-3 pl-11 pr-12 text-white placeholder:text-white/40 focus:border-blue-400/60 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
          />
          <kbd className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 rounded border border-white/20 px-1.5 text-xs text-white/40 md:block">/</kbd>
        </div>
        <p className="sr-only" aria-live="polite" lang="fr">
          {filtreActif ? `${resultats.length} résultat${resultats.length > 1 ? "s" : ""}` : ""}
        </p>
      </div>

      {/* Index des lettres */}
      {!q && (
        <nav aria-label="Index alphabétique" className="mb-10 space-y-3">
          <div dir="rtl" className="flex flex-wrap justify-center gap-1.5">
            {lettresNko.map((l) => (
              <a
                key={l}
                href={`#lettre-${l.codePointAt(0)}`}
                onClick={() => setLettreFr("")}
                lang="nqo"
                className="flex h-9 min-w-9 items-center justify-center rounded-lg border border-white/10 px-2 font-kigelia text-lg text-blue-300 hover:border-blue-400/50 hover:bg-blue-400/10"
              >
                {l}
              </a>
            ))}
          </div>
          <div dir="ltr" className="flex flex-wrap justify-center gap-1.5">
            {lettresFr.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLettreFr(lettreFr === l ? "" : l)}
                aria-pressed={lettreFr === l}
                className={`h-8 min-w-8 rounded-lg border px-2 font-sans text-sm uppercase ${
                  lettreFr === l ? "border-blue-400 bg-blue-400/20 text-white" : "border-white/10 text-white/70 hover:border-blue-400/50"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </nav>
      )}

      {/* Résultats */}
      {filtreActif ? (
        resultats.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {resultats.map((t) => (
              <Carte key={t.slug} t={t} />
            ))}
          </ul>
        ) : (
          <p className="py-10 text-center text-white/50">
            {TEXTES_LEXIQUE.aucunResultat.nko && (
              <span lang="nqo" dir="rtl" className="mb-1 block font-kigelia">{TEXTES_LEXIQUE.aucunResultat.nko}</span>
            )}
            <span lang="fr">{TEXTES_LEXIQUE.aucunResultat.fr}</span>
          </p>
        )
      ) : (
        sections.map(([lettre, liste]) => (
          <section key={lettre} id={`lettre-${lettre.codePointAt(0)}`} className="mb-10 scroll-mt-24">
            <h2 lang="nqo" dir="rtl" className="mb-4 border-b border-white/10 pb-2 font-kigelia text-2xl font-bold text-[#fbbf24]">
              {lettre}
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {liste.map((t) => (
                <Carte key={t.slug} t={t} />
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
