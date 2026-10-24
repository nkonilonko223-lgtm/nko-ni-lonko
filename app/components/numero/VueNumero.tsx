import Image from "next/image";
import LienLangue from "../LienLangue";
import type { ArticleDuSommaire, Numero, RubriqueCourte } from "../../lib/numeros";
import { TEXTES_NUMEROS, chiffresNko, numeroFr, numeroNko, saisonFr, saisonNko } from "./textes";
import { contientNko, sensDe, separerTitre } from "./titre";
import { positionDuCadrage } from "../../lib/point-interet";
import TelechargerNumero from "../application/TelechargerNumero";

// ============================================================================
// N'KO NI LONKO — Affichage d'un numéro (composant serveur, sans JavaScript)
// ============================================================================
// Reçoit seulement des données : la page /numeros/[slug] les lit dans Sanity,
// un essai local peut lui donner des données factices.
// N'Ko d'abord, de droite à gauche ; chaque bloc porte dir ET lang.
// ============================================================================

type Libelle = { nko: string; fr: string };


// Dates : chiffres N'Ko (comme le reste du site) et français
export const dateNko = (iso: string) => {
  const d = new Date(iso);
  return chiffresNko(`${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}/${d.getUTCFullYear()}`);
};
export const dateFr = (iso: string) =>
  new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(iso));

// Libellé sur deux lignes : N'Ko (or) puis français (petit)
function LibelleBloc({ texte }: { texte: Libelle }) {
  return (
    <span className="flex flex-col items-center gap-0.5">
      {texte.nko && <span lang="nqo" dir="rtl" className="font-kigelia text-xl text-or">{texte.nko}</span>}
      <span lang="fr" className="font-sans text-[11px] uppercase tracking-widest text-white/50">{texte.fr}</span>
    </span>
  );
}

// Libellé sur une ligne : N'Ko · français (liens)
export function LibelleEnLigne({ texte }: { texte: Libelle }) {
  return (
    <span className="inline-flex flex-wrap items-baseline justify-center gap-x-2">
      {texte.nko && <span lang="nqo" dir="rtl" className="font-kigelia text-base">{texte.nko}</span>}
      {texte.nko && <span aria-hidden="true" className="text-white/30">·</span>}
      <span lang="fr" className="text-sm">{texte.fr}</span>
    </span>
  );
}

function Surtitre({ rubrique }: { rubrique?: RubriqueCourte | null }) {
  if (!rubrique?.titleNko && !rubrique?.titleFr) return null;
  return (
    <span className="mb-1 flex flex-wrap items-baseline gap-x-2">
      {rubrique.titleNko && <span lang="nqo" dir="rtl" className="font-kigelia text-sm text-or">{rubrique.titleNko}</span>}
      {rubrique.titleFr && <span lang="fr" className="text-[10px] uppercase tracking-widest text-white/50">{rubrique.titleFr}</span>}
    </span>
  );
}

// Titre N'Ko puis titre français (coupé seulement sur une parenthèse finale contenant du latin)
export function TitreArticle({ titre, grand }: { titre: string; grand?: boolean }) {
  const { nko, fr } = separerTitre(titre);
  const sens = sensDe(nko);
  return (
    <>
      <span
        {...sens}
        className={`block font-bold text-white transition-colors group-hover:text-or ${sens.lang === "nqo" ? "font-kigelia" : ""} ${grand ? "text-2xl md:text-3xl" : "text-lg md:text-xl"}`}
      >
        {nko}
      </span>
      {fr && <span lang="fr" dir="ltr" className={`mt-1 block text-white/70 ${grand ? "text-base" : "text-sm"}`}>{fr}</span>}
    </>
  );
}

function Entree({ article, une }: { article: ArticleDuSommaire; une?: boolean }) {
  const resume = article.excerpt ? sensDe(article.excerpt) : null;
  return (
    <LienLangue
      href={`/article/${article.slug}`}
      className={`group flex gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition-colors hover:border-or/50 ${une ? "flex-col md:p-6" : "items-start"}`}
    >
      {article.image?.url && (
        <span className={`relative shrink-0 overflow-hidden rounded-xl ${une ? "aspect-[16/9] w-full" : "h-20 w-20 md:h-28 md:w-28"}`}>
          <Image src={article.image.url} alt={article.image.alt?.trim() || ""} fill sizes={une ? "(min-width: 768px) 720px, 100vw" : "112px"} className="object-cover" style={{ objectPosition: positionDuCadrage(article.image.hotspot) }} />
        </span>
      )}
      <span className="min-w-0 flex-1 text-start">
        <Surtitre rubrique={article.rubrique} />
        <TitreArticle titre={article.title} grand={une} />
        {article.excerpt && resume && (
          <span {...resume} className={`mt-2 block text-sm leading-relaxed text-white/60 ${resume.lang === "nqo" ? "font-kigelia" : ""} ${une ? "" : "line-clamp-3"}`}>
            {article.excerpt}
          </span>
        )}
      </span>
    </LienLangue>
  );
}

// PDF du numéro (scripts/pdf-numero/generer.mjs) ; libellé N'Ko : L3 (rédaction, 23 octobre 2026 ; copié tel quel par programme)
const TELECHARGER_PDF: Libelle = { nko: "ߘߐ߬ߛߙߋ «ߔߋ.ߘߋ.ߍߝ» ߟߊߖߌ߰", fr: "Télécharger le PDF" };
const tailleFr = (octets: number) => `${(octets / 1024 / 1024).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} Mo`;

export default function VueNumero({ numero, pdf }: { numero: Numero; pdf?: { fichier: string; octets: number } | null }) {
  const { sommaire } = numero;
  const edito = sommaire.find((a) => a._id === numero.editoRef);
  const une = sommaire.find((a) => a._id === numero.aLaUneRef);
  const couverture = numero.couverture?.url ? numero.couverture : null;
  const saison = typeof numero.saison === "number" ? numero.saison : null;

  return (
    <main className="min-h-screen bg-void pb-20 text-white">
      <header className="relative">
        {couverture?.url && (
          <figure className="relative h-[55vh] min-h-80 w-full overflow-hidden md:h-[70vh]">
            <Image
              src={couverture.url}
              alt={couverture.alt?.trim() || ""}
              fill
              priority
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: positionDuCadrage(couverture.hotspot) }}
              placeholder={couverture.lqip ? "blur" : "empty"}
              blurDataURL={couverture.lqip}
            />
            <span className="absolute inset-0 bg-gradient-to-t from-void via-void/40 to-transparent" aria-hidden="true" />
          </figure>
        )}
        {/* Le texte remonte sur la couverture ; sa hauteur minimale égale ce chevauchement,
            pour que la suite de la page ne passe jamais sous l'image */}
        <div className={`relative mx-auto max-w-4xl px-4 text-center ${couverture ? "-mt-40 min-h-40 md:-mt-56 md:min-h-56" : "pt-28 md:pt-36"}`}>
          <p lang="nqo" dir="rtl" className="font-kigelia text-lg text-or md:text-xl">
            {numeroNko(numero.numero)}
            {saison !== null && ` · ${saisonNko(saison)}`} · {dateNko(numero.publishedAt)}
          </p>
          <p lang="fr" dir="ltr" className="mt-1 text-xs uppercase tracking-widest text-white/60">
            {numeroFr(numero.numero)}
            {saison !== null && ` · ${saisonFr(saison)}`} · {dateFr(numero.publishedAt)}
          </p>
          <h1 className="mt-5">
            {numero.titleNko && <span lang="nqo" dir="rtl" className="block font-kigelia text-4xl font-bold leading-tight md:text-6xl">{numero.titleNko}</span>}
            {numero.titleFr && (
              <span lang="fr" dir="ltr" className={`block ${numero.titleNko ? "mt-2 text-xl text-white/80 md:text-2xl" : "text-4xl font-bold md:text-6xl"}`}>
                {numero.titleFr}
              </span>
            )}
            {!numero.titleNko && !numero.titleFr && (
              <>
                <span lang="nqo" dir="rtl" className="block font-kigelia text-4xl font-bold md:text-6xl">{numeroNko(numero.numero)}</span>
                <span lang="fr" dir="ltr" className="mt-2 block text-xl text-white/80">{numeroFr(numero.numero)}</span>
              </>
            )}
          </h1>
          {(couverture?.captionNko || couverture?.caption) && (
            <p className="mt-4 flex flex-col gap-1 text-xs text-white/50">
              {couverture.captionNko && <span lang="nqo" dir="rtl" className="font-kigelia text-sm">{couverture.captionNko}</span>}
              {couverture.caption && <span lang="fr" dir="ltr">{couverture.caption}</span>}
            </p>
          )}
          {/* Crédit de la couverture, en petit : N'Ko d'abord (si la rédaction l'a fourni), puis français */}
          {(couverture?.sourceNko || couverture?.source) && (
            <p dir="rtl" className="mt-2 flex flex-wrap items-baseline justify-center gap-x-2 text-[10px] text-white/40 md:text-xs">
              {couverture.sourceNko && <span lang="nqo" className="font-kigelia text-xs md:text-sm">{couverture.sourceNko}</span>}
              {couverture.source && <span lang="fr" dir="ltr" translate="no">{couverture.source}</span>}
            </p>
          )}
        </div>
      </header>

      <div className="mx-auto mt-12 max-w-3xl space-y-14 px-4">
        {edito && (
          <section aria-labelledby="titre-edito" className="rounded-2xl border border-or/30 bg-or/[0.04] p-6 text-center">
            <h2 id="titre-edito" className="mb-4">
              <LibelleBloc texte={TEXTES_NUMEROS.edito} />
            </h2>
            {edito.excerpt && (
              <p {...sensDe(edito.excerpt)} className={`text-lg leading-relaxed text-white/85 ${contientNko(edito.excerpt) ? "font-kigelia" : ""}`}>
                {edito.excerpt}
              </p>
            )}
            <LienLangue href={`/article/${edito.slug}`} className="mt-5 inline-flex min-h-11 items-center rounded-full border border-or/50 px-5 text-or transition-colors hover:bg-or/10">
              <LibelleEnLigne texte={TEXTES_NUMEROS.lireArticle} />
            </LienLangue>
          </section>
        )}

        {une && (
          <section aria-labelledby="titre-une">
            <h2 id="titre-une" className="mb-4">
              <LibelleBloc texte={TEXTES_NUMEROS.aLaUne} />
            </h2>
            <Entree article={une} une />
          </section>
        )}

        <section aria-labelledby="titre-sommaire">
          <h2 id="titre-sommaire" className="mb-4">
            <LibelleBloc texte={TEXTES_NUMEROS.sommaire} />
          </h2>
          <ol className="space-y-3">
            {sommaire.map((article) => (
              <li key={article._id}>
                <Entree article={article} />
              </li>
            ))}
          </ol>
        </section>

        {/* Lecture sans connexion : le numéro entier, avec ses images, gardé sur l'appareil */}
        <TelechargerNumero numero={numero.slug} chemins={[`/numeros/${numero.slug}`, ...sommaire.map((a) => `/article/${a.slug}`)]} />

        {pdf && (
          <p className="text-center">
            <a
              href={`/pdf/${pdf.fichier}`}
              download
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-or/50 px-5 text-or transition-colors hover:bg-or/10"
            >
              <i className="ph-bold ph-download-simple" aria-hidden="true"></i>
              <LibelleEnLigne texte={{ nko: TELECHARGER_PDF.nko, fr: `${TELECHARGER_PDF.fr} (${tailleFr(pdf.octets)})` }} />
            </a>
          </p>
        )}

        <p className="text-center">
          <LienLangue href="/numeros" className="inline-flex min-h-11 items-center rounded-full border border-white/20 px-5 text-white/80 transition-colors hover:border-or hover:text-or">
            <LibelleEnLigne texte={TEXTES_NUMEROS.tousLesNumeros} />
          </LienLangue>
        </p>
      </div>
    </main>
  );
}
