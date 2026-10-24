import type { Metadata } from "next";
import Image from "next/image";
import LienLangue from "../../../components/LienLangue";
import { notFound } from "next/navigation";
import { TitreArticle } from "../../../components/numero/VueNumero";
import { sensDe } from "../../../components/numero/titre";
import { getAuteur, getLiensAuteurs, type Auteur } from "../../../lib/auteurs";
import { estLaRevue } from "../../../lib/citations";
import { jsonLd } from "../../../lib/jsonld";
import PiluleRetour from "../../../components/PiluleRetour";
import { COMPTE_X, IMAGE_PARTAGE_ACCUEIL } from "../../../lib/partage";
import { versionLangue } from "../../../lib/carte-partage";
import { langueDe } from "../../../lib/langue";
import messagesNko from "../../../messages/nko.json";

// ============================================================================
// N'KO NI LONKO — Page d'un auteur (ex. /auteurs/moustapha-camara), composant serveur
// ============================================================================
// Nom, rôle et biographie en N'Ko d'abord, puis en français ; ORCID ; réseaux (jamais WhatsApp) ;
// ses articles publiés. Données structurées « ProfilePage » pour Google.
// N'Ko de l'interface : seulement « Articles », repris du dictionnaire du site.
// ============================================================================

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nkonilonko.com";
const ARTICLES = { nko: messagesNko.nav.articles, fr: "Articles" };

const urlDe = (a: Auteur) => `${SITE_URL}/auteurs/${a.slug}`;
const titreDe = (a: Auteur) => (a.nameNko ? `${a.nameNko} · ${a.name}` : a.name);
const resumeDe = (a: Auteur) =>
  (a.bio || "").replace(/\s+/g, " ").trim().slice(0, 160) || `Les articles de ${a.name} dans la revue N'Ko ni Lonko.`;
const photo = (a: Auteur, cote: number) => (a.image?.url ? `${a.image.url}?w=${cote}&h=${cote}&fit=crop&auto=format` : null);

export async function generateStaticParams() {
  return (await getLiensAuteurs()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { slug, lang } = await params;
  const auteur = await getAuteur(slug);
  if (!auteur) return { title: "Auteur" };
  const url = urlDe(auteur);
  const titre = titreDe(auteur);
  const description = resumeDe(auteur);
  const image = auteur.image?.url
    ? { url: `${auteur.image.url}?w=1200&h=630&fit=crop&fm=jpg&q=80`, width: 1200, height: 630, alt: auteur.name }
    : IMAGE_PARTAGE_ACCUEIL;
  // Deux versions (B6) : nom N'Ko / nom français, biographie de la langue de la version
  return versionLangue({
    title: titre,
    description,
    alternates: { canonical: url },
    openGraph: { title: titre, description, url, siteName: "N'Ko ni Lonko", locale: "nqo", alternateLocale: ["fr_FR"], type: "profile", images: [image] },
    twitter: { card: "summary_large_image", title: titre, description, images: [image], creator: COMPTE_X, site: COMPTE_X },
  }, langueDe(lang), { chemin: `/auteurs/${slug}`, resumeNko: auteur.bioNko, resumeFr: description });
}

export default async function PageAuteur({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const auteur = await getAuteur(slug);
  if (!auteur) notFound();

  const url = urlDe(auteur);
  const orcid = auteur.orcid ? `https://orcid.org/${auteur.orcid}` : null;
  const profil = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": url,
    url,
    inLanguage: ["nqo", "fr"],
    mainEntity: {
      "@type": estLaRevue(auteur.name) ? "Organization" : "Person",
      "@id": `${url}#auteur`,
      name: auteur.name,
      ...(auteur.nameNko ? { alternateName: auteur.nameNko } : {}),
      ...(auteur.bio ? { description: auteur.bio } : {}),
      ...(auteur.image?.url ? { image: auteur.image.url } : {}),
      ...(auteur.role ? { jobTitle: auteur.role } : {}),
      ...(auteur.institution ? { affiliation: { "@type": "Organization", name: auteur.institution } } : {}),
      ...(orcid ? { identifier: { "@type": "PropertyValue", propertyID: "ORCID", value: orcid } } : {}),
      sameAs: [...(orcid ? [orcid] : []), ...auteur.socials.map((s) => s.url)],
    },
  };
  const filAriane = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "N'Ko ni Lonko", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: auteur.name, item: url },
    ],
  };
  const image = photo(auteur, 320);

  return (
    <main className="min-h-screen bg-void px-4 pb-20 pt-28 text-white md:pt-36">
      <PiluleRetour />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(profil) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(filAriane) }} />

      <article className="mx-auto max-w-3xl">
        <header className="flex flex-col items-center gap-4 text-center">
          {image && (
            <Image src={image} alt={auteur.image?.alt?.trim() || auteur.name} width={160} height={160} priority className="h-32 w-32 rounded-full border-2 border-or/40 object-cover md:h-40 md:w-40" />
          )}
          <h1 className="flex flex-col items-center gap-1">
            {auteur.nameNko && <span lang="nqo" dir="rtl" className="font-kigelia text-4xl font-bold text-or md:text-5xl">{auteur.nameNko}</span>}
            <span lang="fr" dir="ltr" className={`font-fr ${auteur.nameNko ? "text-lg text-white/70" : "text-4xl font-bold text-or"}`}>{auteur.name}</span>
          </h1>

          {(auteur.roleNko || auteur.role || auteur.institution) && (
            <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-white/60">
              {auteur.roleNko && <span lang="nqo" dir="rtl" className="font-kigelia text-lg">{auteur.roleNko}</span>}
              {auteur.role && <span lang="fr" dir="ltr" className="font-fr text-xs uppercase tracking-widest">{auteur.role}</span>}
              {auteur.institution && (
                <span lang="fr" dir="ltr" className="flex items-center gap-1.5 font-fr text-xs uppercase tracking-widest">
                  <i className="ph-fill ph-buildings" aria-hidden="true"></i>{auteur.institution}
                </span>
              )}
            </p>
          )}

          {(orcid || auteur.socials.length > 0) && (
            <div className="flex flex-wrap items-center justify-center gap-3">
              {orcid && (
                <a href={orcid} target="_blank" rel="noopener noreferrer" dir="ltr" className="flex items-center gap-1.5 rounded-full border border-[#A6CE39]/30 bg-[#A6CE39]/10 px-3 py-1 font-fr text-xs text-[#A6CE39] transition-colors hover:bg-[#A6CE39]/20">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#A6CE39] text-[9px] font-bold text-black">iD</span>
                  ORCID
                </a>
              )}
              {auteur.socials.map((s) => (
                <a
                  key={s.url}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.platform}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 transition-colors hover:border-or/50 hover:text-or"
                >
                  <i className={`ph-fill ph-${s.platform === "twitter" ? "x" : s.platform.toLowerCase()}-logo text-xl`} aria-hidden="true"></i>
                </a>
              ))}
            </div>
          )}
        </header>

        {(auteur.bioNko || auteur.bio) && (
          <section className="mt-10 space-y-6 rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
            {auteur.bioNko && <p lang="nqo" dir="rtl" className="whitespace-pre-line text-right font-kigelia text-xl leading-loose text-white/90">{auteur.bioNko}</p>}
            {auteur.bio && <p lang="fr" dir="ltr" className="whitespace-pre-line text-left font-fr text-base leading-relaxed text-white/70">{auteur.bio}</p>}
          </section>
        )}

        {auteur.expertise && auteur.expertise.length > 0 && (
          <ul className="mt-6 flex flex-wrap justify-center gap-2">
            {auteur.expertise.map((e) => {
              const sens = sensDe(e);
              return (
                <li key={e} {...sens} className={`rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/70 ${sens.lang === "nqo" ? "font-kigelia" : "font-fr"}`}>{e}</li>
              );
            })}
          </ul>
        )}

        {auteur.articles.length > 0 && (
          <section aria-labelledby="articles-de-l-auteur" className="mt-14">
            <h2 id="articles-de-l-auteur" className="mb-6 flex flex-col items-center gap-0.5">
              <span lang="nqo" dir="rtl" className="font-kigelia text-2xl text-or">{ARTICLES.nko}</span>
              <span lang="fr" className="font-fr text-[11px] uppercase tracking-widest text-gray-500">{ARTICLES.fr}</span>
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2">
              {auteur.articles.map((a, i) => (
                <li key={a.slug}>
                  <LienLangue href={`/article/${a.slug}`} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition-colors hover:border-or/50">
                    {a.image?.url && (
                      <span className="relative aspect-[16/9] w-full overflow-hidden">
                        <Image src={a.image.url} alt={a.image.alt?.trim() || ""} fill priority={i < 2} sizes="(min-width: 640px) 360px, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                      </span>
                    )}
                    <span className="flex-1 p-4 text-start">
                      <TitreArticle titre={a.title} />
                    </span>
                  </LienLangue>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </main>
  );
}
