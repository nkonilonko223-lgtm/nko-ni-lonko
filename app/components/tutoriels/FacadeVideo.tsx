"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { positionDuCadrage } from "../../lib/point-interet";
import type { ImageTutoriel } from "../../lib/tutoriels";

// ============================================================================
// N'KO NI LONKO — Vidéo d'un tutoriel (îlot client) : la miniature, puis le lecteur au toucher
// ============================================================================
// Avant le toucher, rien ne part vers YouTube : ni lecteur, ni image, ni donnée. Au toucher, le lecteur
// youtube-nocookie.com remplace le bouton. Pas de lecture automatique (paramètre « autoplay » absent) :
// YouTube s'ouvre, puis c'est la personne qui lance la vidéo. Rien n'est posé sur le lecteur (règle de YouTube) :
// une fois ouvert, il passe au-dessus du bouton « Retour », qui est fixe.
// Le bouton est un vrai lien : touché avant que le code soit arrivé (réseau lent), il ouvre la vidéo sur
// YouTube au lieu de ne rien faire. Sous le cadre, le logo cliquable de YouTube : il dit d'où vient la vidéo
// (règle de YouTube) et reste une sortie si le lecteur n'arrive pas (forfait épuisé, Wi-Fi sans internet).
// Miniature en largeur : affichée entière au milieu du cadre, sur le fond du cadre.
// ============================================================================

// Un seul lecteur ouvert à la fois : deux vidéos joueraient ensemble, et chaque lecteur pèse sur un petit téléphone
let fermerLePrecedent: (() => void) | null = null;

type Props = {
  youtubeId: string;
  titre: string; // titre de la vidéo, dans la langue de la page
  libelle: string; // ce que lit un lecteur d'écran sur le bouton
  langueLibelle: "nqo" | "fr";
  libelleYoutube: string; // ce que lit un lecteur d'écran sur le logo de YouTube
  langueYoutube: "nqo" | "fr";
  miniature?: ImageTutoriel | null;
  duree?: string | null; // déjà dans les chiffres de la page
  langue: "nqo" | "fr";
  prioritaire?: boolean; // première vidéo de la page : son image est demandée d'abord
};

export default function FacadeVideo({ youtubeId, titre, libelle, langueLibelle, libelleYoutube, langueYoutube, miniature, duree, langue, prioritaire }: Props) {
  const [lecture, setLecture] = useState(false);
  const [lecteurPret, setLecteurPret] = useState(false);
  const lecteur = useRef<HTMLIFrameElement>(null);
  const paysage = !!miniature?.largeur && !!miniature?.hauteur && miniature.largeur > miniature.hauteur;
  const surYoutube = `https://www.youtube.com/watch?v=${youtubeId}`;

  // Le bouton a disparu : le clavier continue dans le lecteur
  useEffect(() => {
    if (lecture) lecteur.current?.focus();
  }, [lecture]);

  return (
    // La largeur suit aussi la hauteur de l'écran : téléphone tourné ou petit portable, le lecteur tient en entier
    <div className="mx-auto w-full max-w-[min(420px,max(200px,calc(100svh*9/16)))] print:hidden">
      <div data-video className={`relative aspect-[9/16] w-full overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-2xl ${lecture ? "z-[10000]" : ""}`}>
        {miniature?.url && (
          <Image
            src={miniature.url}
            alt=""
            fill
            priority={prioritaire}
            sizes="(min-width: 480px) 420px, 100vw"
            className={paysage ? "object-contain" : "object-cover"}
            style={paysage ? undefined : { objectPosition: positionDuCadrage(miniature.hotspot) }}
          />
        )}

        {lecture ? (
          <>
            {/* Le rond tourne à la place du bouton. Le lecteur reste invisible tant qu'il n'est pas prêt : son fond noir arrive d'abord et cacherait le rond */}
            {!lecteurPret && (
              <span className="absolute inset-0 flex items-end justify-center pb-[22%]" aria-hidden="true">
                <span className="flex h-20 w-20 items-center justify-center">
                  <span className="h-12 w-12 animate-spin rounded-full border-4 border-or border-t-transparent motion-reduce:animate-none" />
                </span>
              </span>
            )}
            <iframe
              ref={lecteur}
              src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&playsinline=1`}
              title={titre}
              lang={langue}
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              onLoad={() => setLecteurPret(true)}
              className={`absolute inset-0 h-full w-full border-0 ${lecteurPret ? "" : "opacity-0"}`}
            />
          </>
        ) : (
          <a
            href={surYoutube}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={libelle}
            lang={langueLibelle}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // nouvel onglet : le lien fait son travail
              e.preventDefault();
              fermerLePrecedent?.();
              fermerLePrecedent = () => {
                setLecture(false);
                setLecteurPret(false);
              };
              setLecture(true);
            }}
            // Le bouton en bas du milieu : au centre, il cacherait le titre écrit sur la miniature
            className="group absolute inset-0 flex touch-manipulation items-end justify-center pb-[22%] focus-visible:outline-none"
          >
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#fbbf24] shadow-[0_0_40px_rgba(251,191,36,0.5)] transition-transform duration-300 group-hover:scale-110 group-focus-visible:ring-4 group-focus-visible:ring-white motion-reduce:transition-none">
              {/* Dessiné ici et non tiré de la police d'icônes : sur réseau lent, le bouton n'est jamais un disque vide */}
              <svg viewBox="0 0 24 24" className="h-10 w-10 translate-x-0.5 fill-black" aria-hidden="true"><path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l11-6.86a1 1 0 0 0 0-1.7l-11-6.86A1 1 0 0 0 8 5.14z" /></svg>
            </span>
            {duree && (
              <span
                lang={langue}
                dir={langue === "fr" ? "ltr" : "rtl"}
                className={`absolute bottom-3 end-3 flex h-7 items-center rounded-lg bg-black/75 px-2 text-blanc ${langue === "fr" ? "text-sm" : "font-kigelia text-base"}`}
              >
                {duree}
              </span>
            )}
          </a>
        )}
      </div>

      <a
        href={surYoutube}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={libelleYoutube}
        lang={langueYoutube}
        className="mx-auto mt-1 flex h-11 w-16 touch-manipulation items-center justify-center rounded-full text-white/60 transition-colors hover:text-or focus-visible:outline focus-visible:outline-2 focus-visible:outline-or"
      >
        <i className="ph-fill ph-youtube-logo text-3xl" aria-hidden="true"></i>
      </a>
    </div>
  );
}
