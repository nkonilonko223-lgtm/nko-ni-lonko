import type { Metadata } from "next";
import PiluleRetour from "../../components/PiluleRetour";
import { AUCUN_TUTORIEL, DESCRIPTION, SERIE, TUTORIELS } from "../../components/tutoriels/textes";
import VueTutoriel from "../../components/tutoriels/VueTutoriel";
import { versionLangue } from "../../lib/carte-partage";
import { jsonLd } from "../../lib/jsonld";
import { adresse, langueDe } from "../../lib/langue";
import { COMPTE_X, IMAGE_PARTAGE_ACCUEIL } from "../../lib/partage";
import { dureeIso, getTutoriels, type Tutoriel } from "../../lib/tutoriels";

// ============================================================================
// N'KO NI LONKO — Tutoriels vidéo « Bien utiliser N'Ko ni Lonko » (/tutoriels, /fr/tutoriels)
// ============================================================================
// Données : app/lib/tutoriels.ts. Affichage d'un tutoriel : app/components/tutoriels/VueTutoriel.tsx.
// Sans vidéo publiée : page sans index pour Google, et aucun lien vers elle (app/lib/tutoriels.ts).
// ============================================================================

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nkonilonko.com";
const bilingue = (t: { nko: string; fr: string }) => [t.nko, t.fr].filter(Boolean).join(" | ");
const TITRE = bilingue(TUTORIELS);
const TEXTE_DESCRIPTION = bilingue(DESCRIPTION);

const METADONNEES: Metadata = {
  title: TITRE,
  description: TEXTE_DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/tutoriels` },
  openGraph: {
    title: TITRE,
    description: TEXTE_DESCRIPTION,
    url: `${SITE_URL}/tutoriels`,
    siteName: "N'Ko ni Lonko",
    locale: "nqo",
    alternateLocale: ["fr_FR"],
    type: "website",
    images: [IMAGE_PARTAGE_ACCUEIL],
  },
  twitter: { card: "summary_large_image", title: TITRE, description: TEXTE_DESCRIPTION, images: [IMAGE_PARTAGE_ACCUEIL], creator: COMPTE_X, site: COMPTE_X },
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const langue = langueDe((await params).lang);
  const vide = (await getTutoriels()).length === 0;
  return versionLangue({ ...METADONNEES, ...(vide ? { robots: { index: false, follow: true } } : {}) }, langue, { chemin: "/tutoriels" });
}

// Une vidéo n'est décrite à Google que si ses renseignements sont complets
type VideoComplete = Tutoriel & { youtubeId: string; duree: string; publishedAt: string; miniature: { url: string } };
const complete = (t: Tutoriel): t is VideoComplete => !!(t.youtubeId && t.duree && t.publishedAt && t.miniature?.url);

export default async function PageTutoriels({ params }: { params: Promise<{ lang: string }> }) {
  const langue = langueDe((await params).lang);
  const fr = langue === "fr";
  const tutoriels = await getTutoriels();
  const url = adresse(langue, "/tutoriels");
  const videos = tutoriels.filter(complete);

  // Données Google : la page réunit des vidéos, chacune décrite dans la langue de la version
  const donneesGoogle = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#page`,
        "url": url,
        "name": fr ? TUTORIELS.fr : TUTORIELS.nko || TUTORIELS.fr,
        "inLanguage": fr ? "fr" : "nqo",
        "isPartOf": { "@id": `${SITE_URL}/#website` },
        "about": { "@id": `${SITE_URL}/#revue` },
        "hasPart": videos.map((v) => ({ "@id": `${url}#video-${v.numero}` })),
      },
      ...videos.map((v) => ({
        "@type": "VideoObject",
        "@id": `${url}#video-${v.numero}`,
        "name": fr ? v.titre?.fr || v.titre?.nko : v.titre?.nko || v.titre?.fr,
        "description": fr ? v.resume?.fr || v.resume?.nko : v.resume?.nko || v.resume?.fr,
        "thumbnailUrl": v.miniature.url,
        "uploadDate": v.publishedAt,
        "duration": dureeIso(v.duree),
        "embedUrl": `https://www.youtube-nocookie.com/embed/${v.youtubeId}`,
      })),
    ],
  };

  return (
    <main className="min-h-screen bg-void px-4 pb-20 pt-20 text-white md:pt-36">
      {videos.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(donneesGoogle) }} />}
      <PiluleRetour />
      <header className="mx-auto mb-8 max-w-3xl text-center md:mb-12">
        <h1 className="flex flex-col items-center gap-1">
          {TUTORIELS.nko && <span lang="nqo" dir="rtl" className="font-kigelia text-4xl font-bold text-or md:text-5xl">{TUTORIELS.nko}</span>}
          {/* Espace invisible à l'écran : sans lui, le texte brut repris par Google colle le N'Ko au français */}
          {" "}
          <span lang="fr" dir="ltr" className={TUTORIELS.nko ? "text-xs uppercase tracking-widest text-white/60" : "text-3xl font-bold text-or md:text-4xl"}>{TUTORIELS.fr}</span>
        </h1>
        <p className="mt-3 flex flex-col items-center gap-1">
          {SERIE.nko && <span lang="nqo" dir="rtl" className="font-kigelia text-lg text-white/80">{SERIE.nko}</span>}
          {/* Espace invisible à l'écran : sans lui, le texte brut repris par Google colle le N'Ko au français */}
          {" "}
          <span lang="fr" dir="ltr" className="text-sm text-white/70">{SERIE.fr}</span>
        </p>
      </header>

      {tutoriels.length === 0 ? (
        <p className="mx-auto flex max-w-xl flex-col items-center gap-2 text-center text-white/60">
          {AUCUN_TUTORIEL.nko && <span lang="nqo" dir="rtl" className="font-kigelia text-xl">{AUCUN_TUTORIEL.nko}</span>}
          {/* Espace invisible à l'écran : sans lui, le texte brut repris par Google colle le N'Ko au français */}
          {" "}
          <span lang="fr" dir="ltr">{AUCUN_TUTORIEL.fr}</span>
        </p>
      ) : (
        <ol role="list" className="mx-auto max-w-5xl space-y-14 [&>li+li]:border-t [&>li+li]:border-white/10 [&>li+li]:pt-14 md:space-y-20 md:[&>li+li]:pt-20">
          {tutoriels.map((tutoriel, i) => (
            <li key={tutoriel._id}>
              <VueTutoriel tutoriel={tutoriel} langue={langue} premier={i === 0} />
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
