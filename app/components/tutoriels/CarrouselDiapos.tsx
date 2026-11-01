"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent, type ReactNode } from "react";
import { toNkoDigits } from "../texte/outils";
import { DIAPO_PRECEDENTE, DIAPO_SUIVANTE } from "./textes";

// ============================================================================
// N'KO NI LONKO — Carrousel des diapositives d'un tutoriel (îlot client)
// ============================================================================
// Le défilement est celui du navigateur (scroll-snap) : le doigt marche avant même que le code arrive.
// Ce code ajoute les flèches, les points et le clavier. Les diapositives sont préparées par le serveur.
// En N'Ko, tout suit le sens de la page : la première diapositive est à droite, on avance vers la gauche.
// Aucun calcul ne dépend du signe de scrollLeft, qui change avec le sens : la position vient de l'écran.
// ============================================================================

type Props = {
  nombre: number;
  libelle: string; // titre de la vidéo : nom du groupe pour les lecteurs d'écran
  langue: "nqo" | "fr";
  children: ReactNode; // les <li> des diapositives
};

const rien = () => () => {};
const SEUIL_VISIBLE = 0.6; // une diapositive est « la diapositive en cours » à 60 % visible

export default function CarrouselDiapos({ nombre, libelle, langue, children }: Props) {
  const fr = langue === "fr";
  const rtl = !fr;
  const cadre = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  // Faux tant que le code n'est pas arrivé : les flèches restent éteintes, jamais de bouton mort
  const pret = useSyncExternalStore(rien, () => true, () => false);

  useEffect(() => {
    const el = cadre.current;
    if (!el) return;
    const diapos = Array.from(el.children);
    const observateur = new IntersectionObserver(
      (entrees) => {
        for (const e of entrees) if (e.intersectionRatio >= SEUIL_VISIBLE) setActive(diapos.indexOf(e.target));
      },
      { root: el, threshold: SEUIL_VISIBLE },
    );
    diapos.forEach((d) => observateur.observe(d));
    return () => observateur.disconnect();
  }, []);

  const aller = (i: number) => {
    const el = cadre.current;
    const cible = el?.children[i];
    if (!el || !cible) return;
    const a = cible.getBoundingClientRect();
    const b = el.getBoundingClientRect();
    el.scrollBy({
      left: rtl ? a.right - b.right : a.left - b.left,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  };

  const touche = (e: KeyboardEvent) => {
    const cibles: Record<string, number> = {
      [rtl ? "ArrowLeft" : "ArrowRight"]: Math.min(active + 1, nombre - 1),
      [rtl ? "ArrowRight" : "ArrowLeft"]: Math.max(active - 1, 0),
      Home: 0,
      End: nombre - 1,
    };
    if (!(e.key in cibles)) return;
    e.preventDefault();
    aller(cibles[e.key]);
  };

  const chiffre = (n: number) => (fr ? String(n) : toNkoDigits(n));
  const seule = nombre < 2;

  const fleche = (sens: "precedente" | "suivante") => {
    const suivante = sens === "suivante";
    const texte = suivante ? DIAPO_SUIVANTE : DIAPO_PRECEDENTE;
    const eteinte = !pret || (suivante ? active >= nombre - 1 : active <= 0);
    return (
      <button
        type="button"
        onClick={() => {
          if (!eteinte) aller(active + (suivante ? 1 : -1));
        }}
        aria-disabled={eteinte}
        aria-label={!fr && texte.nko ? texte.nko : texte.fr}
        lang={!fr && texte.nko ? "nqo" : "fr"}
        className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-full border border-white/15 bg-white/5 text-or transition-colors hover:border-or/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-or aria-disabled:cursor-default aria-disabled:border-white/10 aria-disabled:text-white/25"
      >
        <i className={`ph-bold ${suivante === rtl ? "ph-arrow-left" : "ph-arrow-right"} text-xl`} aria-hidden="true"></i>
      </button>
    );
  };

  return (
    <div role="group" aria-label={libelle} onKeyDown={touche} dir={rtl ? "rtl" : "ltr"}>
      <ul
        ref={cadre}
        role="list"
        tabIndex={seule ? undefined : 0}
        style={{ scrollbarWidth: "none" }}
        className="flex snap-x snap-mandatory items-start gap-3 overflow-x-auto overscroll-x-contain rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-or"
      >
        {children}
      </ul>

      {!seule && (
        <div className="mt-4 flex items-center justify-center gap-2 print:hidden">
          {fleche("precedente")}
          <ol role="list" className="flex min-w-0 flex-wrap items-center justify-center">
            {Array.from({ length: nombre }, (_, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => aller(i)}
                  disabled={!pret}
                  aria-current={i === active ? "true" : undefined}
                  aria-label={fr ? `Diapositive ${i + 1} sur ${nombre}` : `${chiffre(i + 1)} / ${chiffre(nombre)}`}
                  className="flex h-6 w-6 touch-manipulation items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-or"
                >
                  <span className={`h-2 rounded-full transition-all motion-reduce:transition-none ${i === active ? "w-5 bg-or" : "w-2 bg-white/30"}`} />
                </button>
              </li>
            ))}
          </ol>
          {fleche("suivante")}
        </div>
      )}

      {/* Annonce la diapositive en cours aux lecteurs d'écran */}
      {!seule && <p className="sr-only" aria-live="polite">{`${chiffre(active + 1)} / ${chiffre(nombre)}`}</p>}
    </div>
  );
}
