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
// YouTube s'ouvre, puis c'est la personne qui lance la vidéo. Rien n'est posé sur le lecteur (règle de YouTube).
// Le bouton est un vrai lien : touché avant que le code soit arrivé (réseau lent), il ouvre la vidéo sur
// YouTube au lieu de ne rien faire.
// Miniature en largeur : affichée entière au milieu du cadre, sur son propre fond flou (image minuscule
// agrandie : aucun filtre à calculer pour le téléphone).
// ============================================================================

// Un seul lecteur ouvert à la fois : deux vidéos joueraient ensemble, et chaque lecteur pèse sur un petit téléphone
let fermerLePrecedent: (() => void) | null = null;

type Props = {
  youtubeId: string;
  titre: string; // titre de la vidéo, dans la langue de la page
  libelle: string; // ce que lit un lecteur d'écran sur le bouton
  langueLibelle: "nqo" | "fr";
  miniature?: ImageTutoriel | null;
  duree?: string | null; // déjà dans les chiffres de la page
  langue: "nqo" | "fr";
  prioritaire?: boolean; // première vidéo de la page : son image est demandée d'abord
};

export default function FacadeVideo({ youtubeId, titre, libelle, langueLibelle, miniature, duree, langue, prioritaire }: Props) {
  const [lecture, setLecture] = useState(false);
  const [lecteurPret, setLecteurPret] = useState(false);
  const lecteur = useRef<HTMLIFrameElement>(null);
  const paysage = !!miniature?.largeur && !!miniature?.hauteur && miniature.largeur > miniature.hauteur;

  // Le bouton a disparu : le clavier continue dans le lecteur
  useEffect(() => {
    if (lecture) lecteur.current?.focus();
  }, [lecture]);

  return (
    <div className="relative mx-auto aspect-[9/16] w-full max-w-[420px] overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-2xl print:hidden">
      {paysage && miniature?.lqip && (
        // eslint-disable-next-line @next/next/no-img-element -- image minuscule déjà dans la page : aucun optimiseur à appeler
        <img src={miniature.lqip} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
      )}
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
          {!lecteurPret && (
            <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
              <span className="h-12 w-12 animate-spin rounded-full border-4 border-or border-t-transparent motion-reduce:animate-none" />
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
            className="absolute inset-0 h-full w-full border-0"
          />
        </>
      ) : (
        <a
          href={`https://www.youtube.com/watch?v=${youtubeId}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={libelle}
          lang={langueLibelle}
          onClick={(e) => {
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
            <i className="ph-fill ph-play translate-x-0.5 text-4xl text-black" aria-hidden="true"></i>
          </span>
          {/* La vidéo vient de YouTube : le lecteur le sait avant de toucher (règle de YouTube, sans texte à traduire) */}
          <i className="ph-fill ph-youtube-logo absolute bottom-3 start-3 rounded-lg bg-black/75 px-1.5 py-0.5 text-xl text-blanc" aria-hidden="true"></i>
          {duree && (
            <span
              lang={langue}
              dir={langue === "fr" ? "ltr" : "rtl"}
              className={`absolute bottom-3 end-3 rounded-lg bg-black/75 px-2 py-0.5 text-blanc ${langue === "fr" ? "text-sm" : "font-kigelia text-base"}`}
            >
              {duree}
            </span>
          )}
        </a>
      )}
    </div>
  );
}
