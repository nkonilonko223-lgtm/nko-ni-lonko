"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "../LanguageProvider";
import { sensDe } from "../numero/titre";
import { TexteLangue } from "./Libelle";
import { DISPONIBLE_APPAREIL, MA_BIBLIOTHEQUE, NUMEROS_TELECHARGES, PAGES_RECENTES, type Libelle } from "./textes";

// ============================================================================
// N'KO NI LONKO — Page « pas de connexion » : ce que l'on peut lire sur cet appareil
// ============================================================================
// Liste, dans la langue de la page, les copies gardées par le service worker (public/sw.js) :
// numéros téléchargés, « Ma bibliothèque », pages lues récemment (8 au plus). Titre lu dans la
// copie elle-même. Liens ordinaires (<a>) : le service worker sert la copie sans connexion.
// Rien n'est envoyé : la liste est faite dans le navigateur du lecteur.
// ============================================================================

type Entree = { chemin: string; titre: string };
type Listes = { numeros: Entree[]; bibliotheque: Entree[]; recentes: Entree[] };

const enFrancais = (chemin: string) => chemin === "/fr" || chemin.startsWith("/fr/");

// Titre de la page gardée (sans « | nom de la revue »)
async function titreDe(reponse: Response): Promise<string> {
  const brut = /<title[^>]*>([^<]*)<\/title>/i.exec(await reponse.text())?.[1] ?? "";
  const texte = new DOMParser().parseFromString(brut, "text/html").documentElement.textContent ?? "";
  return texte.split(" | ")[0].trim();
}

// Pages d'un cache, dans la langue lue ; « recentes » : les dernières gardées d'abord
async function pagesDe(nom: string, fr: boolean, garder: (chemin: string) => boolean, { recentes = false, max = Infinity } = {}): Promise<Entree[]> {
  const cache = await caches.open(nom);
  const cles = (await cache.keys()).filter((c) => {
    const chemin = new URL(c.url).pathname;
    return enFrancais(chemin) === fr && garder(chemin);
  });
  const choisies = (recentes ? cles.reverse() : cles).slice(0, max);
  const entrees: Entree[] = [];
  for (const cle of choisies) {
    const reponse = await cache.match(cle);
    const chemin = new URL(cle.url).pathname;
    if (reponse) entrees.push({ chemin, titre: (await titreDe(reponse)) || chemin });
  }
  return entrees;
}

async function lister(fr: boolean): Promise<Listes> {
  const noms = await caches.keys();
  const cachesNumeros = noms.filter((n) => n.startsWith("nko-numero-") && n.endsWith(fr ? "-fr" : "-nqo"));
  const numeros = (await Promise.all(cachesNumeros.map((n) => pagesDe(n, fr, (c) => /\/numeros\/[0-9]{3}$/.test(c))))).flat();
  // Articles des numéros téléchargés : déjà accessibles par leur numéro
  const dejaListes = new Set<string>();
  for (const n of cachesNumeros) for (const c of await (await caches.open(n)).keys()) dejaListes.add(new URL(c.url).pathname);
  const bibliotheque = noms.includes("nko-bibliotheque") ? await pagesDe("nko-bibliotheque", fr, (c) => c.includes("/article/")) : [];
  for (const e of bibliotheque) dejaListes.add(e.chemin);
  const recentes = noms.includes("nko-pages")
    ? await pagesDe("nko-pages", fr, (c) => !c.endsWith("/offline") && !dejaListes.has(c), { recentes: true, max: 8 })
    : [];
  return { numeros, bibliotheque, recentes };
}

function Liste({ titre, icone, entrees, nko }: { titre: Libelle; icone: string; entrees: Entree[]; nko: boolean }) {
  if (!entrees.length) return null;
  return (
    <div className="mb-6">
      <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-[#fbbf24]">
        <i className={`ph-bold ${icone}`} aria-hidden="true"></i>
        <TexteLangue texte={titre} nko={nko} />
      </h3>
      <ul className="space-y-2">
        {entrees.map((e) => {
          const sens = sensDe(e.titre);
          return (
            <li key={e.chemin}>
              <a
                href={e.chemin}
                {...sens}
                className={`block rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-start text-white/90 transition-colors hover:border-[#fbbf24]/50 ${sens.lang === "nqo" ? "font-kigelia text-lg" : ""}`}
              >
                {e.titre}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function DisponibleHorsLigne() {
  const { lang } = useLanguage();
  const nko = lang === "nko";
  const [listes, setListes] = useState<Listes | null>(null);

  useEffect(() => {
    if (!("caches" in window)) return;
    let actif = true;
    lister(!nko).then((l) => { if (actif) setListes(l); }, () => undefined);
    return () => { actif = false; };
  }, [nko]);

  if (!listes || !(listes.numeros.length || listes.bibliotheque.length || listes.recentes.length)) return null;
  return (
    <section aria-labelledby="disponible-appareil" className="mt-14 w-full max-w-md">
      <h2 id="disponible-appareil" className="mb-5 text-xl font-bold text-white">
        <TexteLangue texte={DISPONIBLE_APPAREIL} nko={nko} />
      </h2>
      <Liste titre={NUMEROS_TELECHARGES} icone="ph-books" entrees={listes.numeros} nko={nko} />
      <Liste titre={MA_BIBLIOTHEQUE} icone="ph-bookmark-simple" entrees={listes.bibliotheque} nko={nko} />
      <Liste titre={PAGES_RECENTES} icone="ph-book-open" entrees={listes.recentes} nko={nko} />
    </section>
  );
}
