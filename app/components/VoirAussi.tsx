import Image from "next/image";
import Link from "next/link";
import type { Voisin } from "../lib/voir-aussi";
import { TitreArticle } from "./numero/VueNumero";

// ============================================================================
// N'KO NI LONKO — « À lire aussi » (composant serveur, fin de la page article)
// ============================================================================
// Jusqu'à 3 articles proches (app/lib/voir-aussi.ts). Caché à l'impression.
// Libellé N'Ko « À lire aussi » à demander à la rédaction : vide pour l'instant (français seul).
// ============================================================================

const A_LIRE_AUSSI = { nko: "", fr: "À lire aussi" };

export default function VoirAussi({ articles }: { articles: Voisin[] }) {
  if (!articles.length) return null;
  return (
    <section aria-labelledby="a-lire-aussi" className="mx-auto max-w-5xl px-4 pb-12 print:hidden">
      <h2 id="a-lire-aussi" className="mb-5 flex flex-col items-center gap-0.5">
        {A_LIRE_AUSSI.nko && <span lang="nqo" dir="rtl" className="font-kigelia text-xl text-[#fbbf24]">{A_LIRE_AUSSI.nko}</span>}
        <span lang="fr" className="text-[11px] uppercase tracking-widest text-white/50">{A_LIRE_AUSSI.fr}</span>
      </h2>
      <ul className="grid gap-4 md:grid-cols-3">
        {articles.map((a) => (
          <li key={a.slug}>
            <Link
              href={`/article/${a.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition-colors hover:border-[#fbbf24]/50"
            >
              {a.image?.url && (
                <span className="relative aspect-[16/9] w-full overflow-hidden">
                  <Image src={a.image.url} alt={a.image.alt || ""} fill sizes="(min-width: 768px) 320px, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                </span>
              )}
              <span className="flex-1 p-4 text-start">
                <TitreArticle titre={a.title} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
