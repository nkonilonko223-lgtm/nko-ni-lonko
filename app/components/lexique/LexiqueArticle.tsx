// ============================================================================
// N'KO NI LONKO — Lexique en fin d'article (tous les termes utilisés)
// ============================================================================

import Link from "next/link";
import { TEXTES_LEXIQUE } from "./textes";
import type { TermeLexiqueData } from "./TermeLexique";

export default function LexiqueArticle({ termes }: { termes: TermeLexiqueData[] }) {
  if (!termes || termes.length === 0) return null;

  return (
    <section
      id="lexique"
      aria-labelledby="lexique-titre"
      className="max-w-3xl mx-auto px-4 md:px-6 pb-12 md:pb-16 print:break-before-page"
    >
      <div className="border-t border-blue-400/30 pt-8 mb-6 text-center">
        <h2 id="lexique-titre" className="flex flex-col items-center gap-1">
          <span lang="nqo" dir="rtl" className="font-kigelia text-2xl font-bold text-blue-300 print:text-black">
            {TEXTES_LEXIQUE.lexique.nko}
          </span>
          <span lang="fr" dir="ltr" className="font-sans text-xs uppercase tracking-[0.3em] text-white/50 print:text-gray-600">
            {TEXTES_LEXIQUE.lexique.fr}
          </span>
        </h2>
      </div>

      <ul className="space-y-6">
        {termes.map((terme) => (
          <li
            key={terme.slug || terme.termeFr}
            id={terme.slug ? `terme-${terme.slug}` : undefined}
            className="rounded-xl border border-white/10 bg-white/[0.02] p-4 md:p-5 print:border-gray-300"
          >
            {(terme.termeNko || terme.definitionNko) && (
              <div lang="nqo" dir="rtl" className="mb-3">
                <p className="font-kigelia text-lg font-bold text-blue-300 print:text-black">{terme.termeNko}</p>
                <p className="font-kigelia text-[15px] leading-[1.85] text-gray-200 print:text-black">{terme.definitionNko}</p>
              </div>
            )}
            {(terme.termeFr || terme.definitionFr) && (
              <div lang="fr" dir="ltr">
                <p className="font-sans text-base font-bold text-blue-300 print:text-black">{terme.termeFr}</p>
                <p className="font-sans text-sm leading-relaxed text-gray-300 print:text-black">{terme.definitionFr}</p>
              </div>
            )}
            {terme.slug && (
              <Link
                href={`/lexique/${terme.slug}`}
                className="mt-3 inline-flex items-center gap-2 text-xs text-blue-300 underline underline-offset-4 hover:text-white print:hidden"
              >
                <span lang="nqo" className="font-kigelia text-sm">{TEXTES_LEXIQUE.voirDansLeLexique.nko}</span>
                <span aria-hidden="true">·</span>
                <span lang="fr">{TEXTES_LEXIQUE.voirDansLeLexique.fr}</span>
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
