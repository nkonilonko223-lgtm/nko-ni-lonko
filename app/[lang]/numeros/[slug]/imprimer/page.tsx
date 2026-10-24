import type { Metadata } from "next";
import { notFound } from "next/navigation";
import VueImpression from "../../../../components/numero/VueImpression";
import { numeroFr } from "../../../../components/numero/textes";
import { getLiensNumeros, getNumeroComplet } from "../../../../lib/numeros";
import { langueDe } from "../../../../lib/langue";

// ============================================================================
// N'KO NI LONKO — Version imprimable d'un numéro (source du PDF), ex. /numeros/003/imprimer
// ============================================================================
// Couverture, sommaire et articles en entier, au format A4 (numéro de page en bas).
// Pas pour Google (noindex) : l'adresse de référence reste /numeros/003.
// PDF : node scripts/pdf-numero/generer.mjs --numero 3
// ============================================================================

export async function generateStaticParams() {
  return (await getLiensNumeros()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${numeroFr(Number(slug))} — version imprimable`,
    robots: { index: false, follow: true },
    alternates: { canonical: `/numeros/${slug}` },
  };
}

// Mise en page A4 : couverture sans marge, numéro de page en bas des autres pages
const PAGE = `
@page { size: A4; margin: 16mm 15mm 18mm; @bottom-center { content: "N'Ko ni Lonko · " counter(page) " / " counter(pages); font: 8pt Helvetica, Arial, sans-serif; color: #888; } }
@page :first { margin: 0; @bottom-center { content: none; } }
@media print {
  html, body { background: #fff !important; }
  .impression { max-width: none !important; }
  .impression .couverture { height: 297mm; break-after: page; }
}
@media screen {
  .impression { margin-block: 2rem; padding: 0 0 3rem; }
  .impression > :not(.couverture) { padding-inline: 15mm; }
  .impression .couverture { min-height: 90vh; }
}`;

export default async function PageImpression({ params }: { params: Promise<{ slug: string; lang: string }> }) {
  const { slug, lang } = await params;
  const numero = await getNumeroComplet(slug);
  if (!numero) notFound();
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PAGE }} />
      <VueImpression numero={numero} langue={langueDe(lang)} />
    </>
  );
}
