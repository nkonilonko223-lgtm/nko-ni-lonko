import { adresseDiapo, type Diapo, type Tutoriel } from "../../lib/tutoriels";
import type { Langue } from "../../lib/langue";
import { chiffresNko } from "../numero/textes";
import CarrouselDiapos from "./CarrouselDiapos";
import FacadeVideo from "./FacadeVideo";
import { LIRE_VIDEO } from "./textes";

// ============================================================================
// N'KO NI LONKO — Un tutoriel de la page /tutoriels (composant serveur)
// ============================================================================
// Numéro, titre et résumé (N'Ko d'abord), la vidéo, puis les diapositives des étapes. Chaque bloc porte
// lang ET dir. Téléphone : tout en colonne. Ordinateur : la vidéo sur le côté où la lecture commence.
// ============================================================================

// Légende en texte, sous l'image : l'image reste sans description (alt vide), sinon elle serait lue deux fois
function DiapoEtape({ diapo }: { diapo: Diapo & { image: { url: string } } }) {
  const { url } = diapo.image;
  return (
    <li className="w-[86%] shrink-0 snap-start lg:w-[72%]">
      <figure>
        {/* eslint-disable-next-line @next/next/no-img-element -- deux tailles exactes en WebP, servies par Sanity */}
        <img
          loading="lazy"
          decoding="async"
          src={adresseDiapo(url, 1080)}
          srcSet={`${adresseDiapo(url, 540)} 540w, ${adresseDiapo(url, 1080)} 1080w`}
          sizes="(min-width: 480px) 400px, 86vw"
          width={1080}
          height={1350}
          alt=""
          className="aspect-[4/5] h-auto w-full rounded-2xl border border-white/10 bg-white/5 object-cover"
        />
        <figcaption className="mt-3 text-center">
          {diapo.legende?.nko && <span lang="nqo" dir="rtl" className="block text-balance font-kigelia text-lg text-white">{diapo.legende.nko}</span>}
          {diapo.legende?.fr && <span lang="fr" dir="ltr" className="mt-1 block text-balance font-fr text-sm text-white/70">{diapo.legende.fr}</span>}
        </figcaption>
      </figure>
    </li>
  );
}

export default function VueTutoriel({ tutoriel, langue, premier }: { tutoriel: Tutoriel; langue: Langue; premier: boolean }) {
  const { numero, titre, resume, youtubeId, duree, miniature, diapos } = tutoriel;
  const fr = langue === "fr";
  const nom = (fr ? titre?.fr || titre?.nko : titre?.nko || titre?.fr) ?? "";
  const etapes = (diapos ?? []).filter((d): d is Diapo & { image: { url: string } } => !!d?.image?.url);
  // Lecteur d'écran : « Lire la vidéo : titre » ; le N'Ko de « Lire la vidéo » pas encore fourni : le titre seul
  const lire = fr ? LIRE_VIDEO.fr : LIRE_VIDEO.nko;

  return (
    <article id={`video-${numero}`} className="grid scroll-mt-24 gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:gap-x-12">
      <header className="min-w-0 text-center lg:col-start-2">
        <span
          aria-hidden="true"
          className={`mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-or/40 bg-or/10 text-or ${fr ? "text-lg font-bold" : "font-kigelia text-xl"}`}
        >
          {fr ? numero : chiffresNko(String(numero))}
        </span>
        <h2>
          {titre?.nko && <span lang="nqo" dir="rtl" className="block text-balance font-kigelia text-2xl font-bold text-white md:text-3xl">{titre.nko}</span>}
          {titre?.fr && <span lang="fr" dir="ltr" className="mt-1 block text-balance font-fr text-base font-medium text-white/80 md:text-lg">{titre.fr}</span>}
        </h2>
        {resume?.nko && <p lang="nqo" dir="rtl" className="mt-4 font-kigelia text-lg text-white/80">{resume.nko}</p>}
        {resume?.fr && <p lang="fr" dir="ltr" className="mt-2 font-fr text-sm leading-relaxed text-white/70">{resume.fr}</p>}
      </header>

      {youtubeId && (
        <div className="min-w-0 lg:col-start-1 lg:row-span-2 lg:row-start-1">
          <FacadeVideo
            youtubeId={youtubeId}
            titre={nom}
            libelle={lire ? `${lire} : ${nom}` : nom}
            langueLibelle={fr || !titre?.nko ? "fr" : "nqo"}
            miniature={miniature}
            duree={duree ? (fr ? duree : chiffresNko(duree)) : null}
            langue={langue}
            prioritaire={premier}
          />
        </div>
      )}

      {etapes.length > 0 && (
        // Largeur limitée : une seule diapositive à la fois, sinon le point en cours serait ambigu
        <div className="mx-auto w-full min-w-0 max-w-[420px] lg:col-start-2 lg:max-w-none">
          <CarrouselDiapos nombre={etapes.length} libelle={nom} langue={langue}>
            {etapes.map((diapo) => <DiapoEtape key={diapo._key} diapo={diapo} />)}
          </CarrouselDiapos>
        </div>
      )}
    </article>
  );
}
