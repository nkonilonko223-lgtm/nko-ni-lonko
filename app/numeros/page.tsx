import type { Metadata } from "next";
import { carteSansMelange } from "../lib/carte-partage";
import Image from "next/image";
import Link from "next/link";
import { dateFr, dateNko } from "../components/numero/VueNumero";
import { TEXTES_NUMEROS, numeroFr, numeroNko, saisonFr, saisonNko } from "../components/numero/textes";
import { getNumeros } from "../lib/numeros";
import { positionDuCadrage } from "../lib/point-interet";
import PiluleRetour from "../components/PiluleRetour";
import { COMPTE_X, IMAGE_PARTAGE_ACCUEIL } from "../lib/partage";

// ============================================================================
// N'KO NI LONKO — Archive des numéros (/numeros), du plus récent au plus ancien
// ============================================================================

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nkonilonko.com";
const TITRE = `${TEXTES_NUMEROS.lesNumeros.nko} | ${TEXTES_NUMEROS.lesNumeros.fr}`;
const DESCRIPTION = "Tous les numéros de la revue mensuelle N'Ko ni Lonko, en N'Ko et en français.";

export const metadata: Metadata = carteSansMelange({
  title: TITRE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/numeros` },
  openGraph: {
    title: TITRE,
    description: DESCRIPTION,
    url: `${SITE_URL}/numeros`,
    siteName: "N'Ko ni Lonko",
    locale: "nqo",
    alternateLocale: ["fr_FR"],
    type: "website",
    images: [IMAGE_PARTAGE_ACCUEIL],
  },
  twitter: { card: "summary_large_image", title: TITRE, description: DESCRIPTION, images: [IMAGE_PARTAGE_ACCUEIL], creator: COMPTE_X, site: COMPTE_X },
});

export default async function PageNumeros() {
  const numeros = await getNumeros();

  return (
    <main className="min-h-screen bg-[#02040a] px-4 pb-20 pt-28 text-white md:pt-36">
      <PiluleRetour />
      <header className="mx-auto mb-12 max-w-5xl text-center">
        <h1 className="flex flex-col items-center gap-1">
          <span lang="nqo" dir="rtl" className="font-kigelia text-4xl font-bold text-[#fbbf24] md:text-5xl">{TEXTES_NUMEROS.lesNumeros.nko}</span>
          <span lang="fr" className="text-xs uppercase tracking-widest text-white/60">{TEXTES_NUMEROS.lesNumeros.fr}</span>
        </h1>
      </header>

      {numeros.length === 0 ? (
        <p className="mx-auto flex max-w-xl flex-col items-center gap-2 text-center text-white/60">
          <span lang="nqo" dir="rtl" className="font-kigelia text-xl">{TEXTES_NUMEROS.aucunNumero.nko}</span>
          <span lang="fr">{TEXTES_NUMEROS.aucunNumero.fr}</span>
        </p>
      ) : (
        <ul className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {numeros.map((numero, i) => (
            <li key={numero.slug}>
              <Link
                href={`/numeros/${numero.slug}`}
                className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition-colors hover:border-[#fbbf24]/50"
              >
                <span className="relative block aspect-[3/4] w-full bg-white/5">
                  {numero.couverture?.url && (
                    <Image
                      src={numero.couverture.url}
                      alt={numero.couverture.alt?.trim() || ""}
                      fill
                      priority={i === 0}
                      sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      style={{ objectPosition: positionDuCadrage(numero.couverture.hotspot) }}
                    />
                  )}
                </span>
                <span className="block p-4 text-center">
                  <span lang="nqo" dir="rtl" className="block font-kigelia text-xl text-[#fbbf24]">
                    {numeroNko(numero.numero)}
                    {typeof numero.saison === "number" && ` · ${saisonNko(numero.saison)}`}
                  </span>
                  <span lang="fr" className="mt-1 block text-xs uppercase tracking-widest text-white/60">
                    {numeroFr(numero.numero)}
                    {typeof numero.saison === "number" && ` · ${saisonFr(numero.saison)}`}
                  </span>
                  {numero.titleNko && <span lang="nqo" dir="rtl" className="mt-3 block font-kigelia text-lg font-bold text-white">{numero.titleNko}</span>}
                  {numero.titleFr && <span lang="fr" dir="ltr" className="mt-1 block text-sm text-white/80">{numero.titleFr}</span>}
                  <span className="mt-3 block text-xs text-white/50">
                    <span lang="nqo" dir="rtl" className="font-kigelia">{dateNko(numero.publishedAt)}</span>
                    <span aria-hidden="true"> · </span>
                    <span lang="fr" dir="ltr">{dateFr(numero.publishedAt)}</span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
