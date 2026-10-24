import type { ArticleComplet, NumeroComplet } from "../../lib/numeros";
import messagesNko from "../../messages/nko.json";
import CustomPortableText from "../CustomPortableText";
import { TEXTES_NUMEROS, chiffresNko, numeroFr, numeroNko, saisonFr, saisonNko } from "./textes";
import { sensDe, separerTitre } from "./titre";
import { dateFr, dateNko } from "./VueNumero";

// ============================================================================
// N'KO NI LONKO — Version imprimable d'un numéro (composant serveur, → PDF)
// ============================================================================
// Une couverture, le sommaire, puis chaque article en entier (même moteur de texte que le
// site : CustomPortableText), en noir sur blanc, au format A4. Le PDF est fabriqué par
// scripts/pdf-numero/generer.mjs (rendu Chrome : lettres N'Ko liées).
// N'Ko d'abord, de droite à gauche ; chaque bloc porte dir ET lang. Aucun N'Ko écrit ici :
// données de Sanity et libellés de la rédaction (textes.ts).
// ============================================================================

const image = (url: string, largeur: number) => `${url}?w=${largeur}&fm=jpg&q=75`;

function Titre({ titre }: { titre: string }) {
  const { nko, fr } = separerTitre(titre);
  const sens = sensDe(nko);
  return (
    <h2 className="text-center">
      <span {...sens} className={`block text-3xl font-bold leading-snug text-black ${sens.lang === "nqo" ? "font-kigelia" : ""}`}>{nko}</span>
      {fr && <span lang="fr" dir="ltr" className="mt-1 block text-lg font-semibold text-[#a16207]">{fr}</span>}
    </h2>
  );
}

function Article({ article, marque }: { article: ArticleComplet; marque?: { nko: string; fr: string } | null }) {
  const r = article.rubrique;
  const auteurs = (article.auteurs || []).filter((a) => a.name || a.nameNko);
  return (
    <article className="break-before-page">
      <p className="mb-3 flex flex-wrap items-baseline justify-center gap-x-3 text-center text-[#a16207]">
        {marque && <span lang="nqo" dir="rtl" className="font-kigelia text-base">{marque.nko}</span>}
        {marque && <span lang="fr" className="text-[10px] uppercase tracking-widest">{marque.fr}</span>}
        {marque && (r?.titleNko || r?.titleFr) && <span aria-hidden="true">·</span>}
        {r?.titleNko && <span lang="nqo" dir="rtl" className="font-kigelia text-base">{r.titleNko}</span>}
        {r?.titleFr && <span lang="fr" className="text-[10px] uppercase tracking-widest">{r.titleFr}</span>}
      </p>
      <Titre titre={article.title} />
      {auteurs.length > 0 && (
        <p className="mt-2 flex flex-wrap justify-center gap-x-3 text-center text-sm text-neutral-600">
          {auteurs.map((a, i) => (
            <span key={i}>
              {a.nameNko && <span lang="nqo" dir="rtl" className="font-kigelia">{a.nameNko}</span>}
              {a.nameNko && a.name && " · "}
              {a.name && <span lang="fr" dir="ltr">{a.name}</span>}
            </span>
          ))}
        </p>
      )}
      {article.image?.url && (
        <figure className="mt-6 break-inside-avoid">
          {/* eslint-disable-next-line @next/next/no-img-element -- impression : image chargée tout de suite (pas de chargement différé) */}
          <img src={image(article.image.url, 1400)} alt={article.image.alt || ""} className="w-full rounded-lg" />
          {(article.image.captionNko || article.image.caption || article.image.source) && (
            <figcaption className="mt-2 flex flex-col gap-1 text-center text-xs text-neutral-600">
              {article.image.captionNko && <span lang="nqo" dir="rtl" className="font-kigelia text-sm">{article.image.captionNko}</span>}
              {article.image.caption && <span lang="fr" dir="ltr" className="italic">{article.image.caption}</span>}
              {article.image.source && <span dir="ltr" translate="no" className="text-[10px]">{article.image.source}</span>}
            </figcaption>
          )}
        </figure>
      )}
      <div className="article-content mt-8 text-[11pt]">
        <CustomPortableText value={article.body || []} />
      </div>
    </article>
  );
}

export default function VueImpression({ numero }: { numero: NumeroComplet }) {
  const { sommaire } = numero;
  const saison = typeof numero.saison === "number" ? numero.saison : null;
  const marqueDe = (a: ArticleComplet) => (a._id === numero.editoRef ? TEXTES_NUMEROS.edito : a._id === numero.aLaUneRef ? TEXTES_NUMEROS.aLaUne : null);

  return (
    <main className="impression mx-auto max-w-[180mm] bg-white text-black">
      {/* 1. Couverture (pleine page, fond sombre comme le site) */}
      <section className="couverture relative flex flex-col items-center justify-end overflow-hidden bg-[#02040a] px-10 pb-16 text-center text-white">
        {numero.couverture?.url ? (
          // eslint-disable-next-line @next/next/no-img-element -- impression : image chargée tout de suite
          <img src={image(numero.couverture.url, 1600)} alt={numero.couverture.alt || ""} className="absolute inset-0 h-full w-full object-cover opacity-80" />
        ) : (
          // Sans couverture : le motif du site (symboles africains et molécules), atténué
          <span className="absolute inset-0 opacity-20" style={{ backgroundImage: "url(/arriere-plan.webp)", backgroundSize: "240px" }} aria-hidden="true" />
        )}
        <span className="absolute inset-0 bg-gradient-to-t from-[#02040a] via-[#02040a]/50 to-transparent" aria-hidden="true" />
        <div className="relative">
          <p lang="nqo" dir="rtl" className="font-kigelia text-2xl text-[#fbbf24]">
            {numeroNko(numero.numero)}
            {saison !== null && ` · ${saisonNko(saison)}`} · {dateNko(numero.publishedAt)}
          </p>
          <p lang="fr" dir="ltr" className="mt-1 text-xs uppercase tracking-[0.3em] text-white/70">
            {numeroFr(numero.numero)}
            {saison !== null && ` · ${saisonFr(saison)}`} · {dateFr(numero.publishedAt)}
          </p>
          {numero.titleNko && <h1 lang="nqo" dir="rtl" className="mt-6 font-kigelia text-5xl font-bold leading-tight">{numero.titleNko}</h1>}
          {numero.titleFr && <p lang="fr" dir="ltr" className="mt-2 text-2xl text-white/85">{numero.titleFr}</p>}
          <p className="mt-10 font-kigelia text-3xl font-bold" lang="nqo" dir="rtl">{messagesNko.metadata.siteName}</p>
          <p lang="fr" dir="ltr" className="mt-1 text-xs uppercase tracking-[0.4em] text-[#fbbf24]">N&apos;Ko ni Lonko · nkonilonko.com</p>
        </div>
      </section>

      {/* 2. Sommaire */}
      <section className="break-before-page">
        <h2 className="mb-8 flex flex-col items-center gap-1 text-center">
          <span lang="nqo" dir="rtl" className="font-kigelia text-3xl text-[#a16207]">{TEXTES_NUMEROS.sommaire.nko}</span>
          <span lang="fr" className="text-xs uppercase tracking-widest text-neutral-500">{TEXTES_NUMEROS.sommaire.fr}</span>
        </h2>
        <ol className="space-y-5">
          {sommaire.map((article, i) => {
            const { nko, fr } = separerTitre(article.title);
            const sens = sensDe(nko);
            return (
              <li key={article._id} className="flex items-baseline gap-4 border-b border-neutral-200 pb-4">
                <span className="w-14 shrink-0 text-center text-[#a16207]">
                  <span lang="nqo" dir="rtl" className="block font-kigelia text-xl">{chiffresNko(String(i + 1))}</span>
                  <span lang="fr" className="block text-[10px]">{i + 1}</span>
                </span>
                <span className="min-w-0 flex-1 text-start">
                  <span {...sens} className={`block text-xl font-bold ${sens.lang === "nqo" ? "font-kigelia" : ""}`}>{nko}</span>
                  {fr && <span lang="fr" dir="ltr" className="block text-sm text-neutral-600">{fr}</span>}
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      {/* 3. Les articles, en entier */}
      {sommaire.map((article) => (
        <Article key={article._id} article={article} marque={marqueDe(article)} />
      ))}
    </main>
  );
}
