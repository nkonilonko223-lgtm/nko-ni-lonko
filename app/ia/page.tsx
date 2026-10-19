import type { Metadata } from "next";
import Link from "next/link";
import { COMPTE_X, IMAGE_PARTAGE_ACCUEIL } from "../lib/partage";

// ============================================================================
// N'KO NI LONKO — Politique d'usage de l'intelligence artificielle (/ia)
// ============================================================================
// TEXTE PROPOSÉ LE 19 OCTOBRE 2026, À VALIDER PAR LE PROPRIÉTAIRE avant la mise en ligne.
// Composant serveur, sans JavaScript. Seulement des faits vrais aujourd'hui (voir CLAUDE.md,
// docs/PLAN-LOT-2.md, docs/DONNEES-CORPUS.md, app/robots.ts).
// Version N'Ko : à fournir par la rédaction (titre N'Ko vide pour l'instant, le français s'affiche seul).
// ============================================================================

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nkonilonko.com";
const TITRE = { nko: "", fr: "Usage de l'intelligence artificielle" };
const DESCRIPTION =
  "Comment N'Ko ni Lonko utilise l'intelligence artificielle : des textes écrits et relus par des humains, aucun N'Ko écrit par une IA, un futur modèle de traduction entraîné seulement sur nos textes publiés, et vos données jamais utilisées.";

export const metadata: Metadata = {
  title: `${TITRE.fr} | N'Ko ni Lonko`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/ia` },
  openGraph: { title: TITRE.fr, description: DESCRIPTION, url: `${SITE_URL}/ia`, siteName: "N'Ko ni Lonko", images: [IMAGE_PARTAGE_ACCUEIL], locale: "fr_FR", type: "website" },
  twitter: { card: "summary_large_image", title: TITRE.fr, description: DESCRIPTION, images: [IMAGE_PARTAGE_ACCUEIL], creator: COMPTE_X, site: COMPTE_X },
};

const SECTIONS: { titre: string; texte: string[] }[] = [
  {
    titre: "Notre principe",
    texte: [
      "Les textes de N'Ko ni Lonko sont écrits, traduits et relus par des humains : la rédaction et les auteurs. L'intelligence artificielle (IA) est un outil à leur service, jamais un auteur.",
    ],
  },
  {
    titre: "Ce que l'IA fait chez nous",
    texte: [
      "Aide technique : saisie des textes dans notre outil de publication et contrôles automatiques (écriture N'Ko correcte, liens, images). Tout est relu et validé par la rédaction avant d'être publié.",
      "Le N'Ko n'est jamais écrit par une IA : chaque mot N'Ko publié sur ce site vient de la rédaction.",
      "Les images sont libres de droits ; leur source et leur licence sont indiquées.",
    ],
  },
  {
    titre: "Notre futur modèle de traduction",
    texte: [
      "Nous préparons un outil de traduction N'Ko ↔ français, entraîné uniquement sur les textes publiés de la revue et sur son dictionnaire.",
      "Ses traductions ne seront jamais publiées sans relecture humaine. Les données d'entraînement restent privées : elles ne sont ni vendues, ni partagées.",
    ],
  },
  {
    titre: "Vos données",
    texte: [
      "Les données des lecteurs (adresses des abonnés à la lettre, messages du formulaire de contact) ne servent jamais à entraîner une IA.",
    ],
  },
  {
    titre: "Les robots d'IA des autres entreprises",
    texte: [
      "Nous demandons aux robots qui collectent des textes pour entraîner des IA (OpenAI, Google, Anthropic, Common Crawl, Apple, Meta…) de ne pas utiliser notre site, par le fichier robots.txt. Les moteurs de recherche restent les bienvenus.",
    ],
  },
  {
    titre: "Les auteurs",
    texte: [
      "L'usage des textes des auteurs pour entraîner notre outil de traduction est encadré par le pacte des auteurs (clause « IA ») : usage limité à la revue, données privées, droit de retrait.",
    ],
  },
];

export default function PageIa() {
  return (
    <main className="min-h-screen bg-[#02040a] px-4 py-16 text-white md:py-24">
      <article className="mx-auto max-w-3xl">
        <header className="mb-12 text-center">
          <h1 className="flex flex-col items-center gap-2">
            {TITRE.nko && <span lang="nqo" dir="rtl" className="font-kigelia text-3xl font-bold text-[#fbbf24] md:text-4xl">{TITRE.nko}</span>}
            <span lang="fr" dir="ltr" className="text-2xl font-bold md:text-4xl">{TITRE.fr}</span>
          </h1>
          <p lang="fr" className="mt-3 text-sm text-white/50">Mise à jour : 19 octobre 2026</p>
          <div className="mx-auto mt-6 h-1 w-16 rounded-full bg-[#fbbf24]/60" />
        </header>
        <div lang="fr" dir="ltr" className="space-y-10">
          {SECTIONS.map((s) => (
            <section key={s.titre}>
              <h2 className="mb-3 text-lg font-bold text-[#fbbf24] md:text-xl">{s.titre}</h2>
              {s.texte.map((p) => (
                <p key={p} className="mb-3 leading-relaxed text-white/80">{p}</p>
              ))}
            </section>
          ))}
          <section>
            <h2 className="mb-3 text-lg font-bold text-[#fbbf24] md:text-xl">Une question ?</h2>
            <p className="leading-relaxed text-white/80">
              Écrivez-nous depuis la page <Link href="/contact" className="text-[#fbbf24] underline underline-offset-4">Contact</Link>. Voir aussi notre{" "}
              <Link href="/privacy" className="text-[#fbbf24] underline underline-offset-4">politique de confidentialité</Link>.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
