"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLanguage } from "../LanguageProvider";
import { ecranDuLecteur } from "../../lib/bibliotheque";
import { TexteBilingue } from "./Libelle";
import { DISPONIBLE, ERREUR_CONNEXION, REPRENDRE, RETIRER, TELECHARGEMENT, TELECHARGER_NUMERO, TELECHARGER_POURQUOI } from "./textes";

// ============================================================================
// N'KO NI LONKO — « Télécharger le numéro » (page d'un numéro)
// ============================================================================
// Garde sur l'appareil la page du numéro et tous ses articles, avec leurs images, dans la langue
// lue : le numéro se lit ensuite sans connexion (avion, village sans réseau, forfait épuisé).
// Le service worker (public/sw.js) garde chaque page dans le cache du numéro
// (nko-numero-<numéro>-<langue>) ; cette page lui envoie les adresses UNE PAR UNE et montre
// l'avancement. Interrompu (page fermée, réseau perdu) : « Reprendre » saute ce qui est déjà gardé.
// Le navigateur est prié de ne pas effacer ces copies pour faire de la place (storage.persist).
// Rien n'est envoyé : tout reste sur l'appareil. Sans service worker (développement) : rien.
// ============================================================================

type Etat =
  | { type: "inconnu" } // avant la vérification : rien d'affiché (même rendu que le serveur)
  | { type: "indisponible" }
  | { type: "absent" }
  | { type: "partiel" }
  | { type: "encours"; fait: number; total: number }
  | { type: "complet"; octets: number }
  | { type: "erreur" };

const tailleFr = (octets: number) => ` (${(octets / 1024 / 1024).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} Mo)`;

// Place prise par le numéro : ses pages et ses images (les fichiers du site sont communs)
async function tailleDuCache(nom: string): Promise<number> {
  const cache = await caches.open(nom);
  let total = 0;
  for (const cle of await cache.keys()) {
    const r = await cache.match(cle);
    if (!r) continue;
    const longueur = Number(r.headers.get("content-length"));
    total += longueur > 0 ? longueur : (await r.blob()).size;
  }
  return total;
}

// Une page à garder ; réponse du service worker par un canal dédié (3 minutes au plus)
function demander(sw: ServiceWorker, message: object): Promise<boolean> {
  return new Promise((resolve) => {
    const canal = new MessageChannel();
    const minuterie = setTimeout(() => resolve(false), 180_000);
    canal.port1.onmessage = (e: MessageEvent<{ ok?: boolean }>) => {
      clearTimeout(minuterie);
      resolve(e.data?.ok === true);
    };
    sw.postMessage(message, [canal.port2]);
  });
}

const BOUTON = "inline-flex min-h-11 items-center gap-2 rounded-full border border-[#fbbf24]/50 px-5 text-[#fbbf24] transition-colors hover:bg-[#fbbf24]/10";

export default function TelechargerNumero({ numero, chemins }: { numero: string; chemins: string[] }) {
  const { lang, lien } = useLanguage();
  const nomCache = `nko-numero-${numero}-${lang === "fr" ? "fr" : "nqo"}`;
  const adresses = useMemo(() => chemins.map((c) => lien(c)), [chemins, lien]);
  const [etat, setEtat] = useState<Etat>({ type: "inconnu" });

  // Au chargement : rien, une partie, ou tout le numéro déjà sur cet appareil ?
  useEffect(() => {
    let actif = true;
    const verifier = async (): Promise<Etat> => {
      if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator) || !("caches" in window)) return { type: "indisponible" };
      if (!(await caches.has(nomCache))) return { type: "absent" };
      const cache = await caches.open(nomCache);
      const gardees = await Promise.all(adresses.map((a) => cache.match(window.location.origin + a)));
      return gardees.every(Boolean) ? { type: "complet", octets: await tailleDuCache(nomCache) } : { type: "partiel" };
    };
    verifier().then((e) => { if (actif) setEtat(e); }, () => { if (actif) setEtat({ type: "indisponible" }); });
    return () => { actif = false; };
  }, [nomCache, adresses]);

  const telecharger = useCallback(async () => {
    const total = adresses.length;
    setEtat({ type: "encours", fait: 0, total });
    try {
      await navigator.storage?.persist?.(); // ne pas effacer ces copies pour faire de la place
    } catch { /* refusé : les copies restent tant que l'appareil a de la place */ }
    const sw = await Promise.race([
      navigator.serviceWorker.ready.then((r) => r.active),
      new Promise<null>((r) => setTimeout(() => r(null), 15_000)),
    ]);
    if (!sw) return setEtat({ type: "erreur" });
    const cache = await caches.open(nomCache);
    const ecran = ecranDuLecteur();
    for (let i = 0; i < total; i++) {
      // Déjà gardée (téléchargement repris) : sautée
      if (!(await cache.match(window.location.origin + adresses[i]))) {
        const ok = await demander(sw, { type: "telecharger", chemin: adresses[i], cache: nomCache, ecran });
        if (!ok) return setEtat({ type: "erreur" });
      }
      setEtat({ type: "encours", fait: i + 1, total });
    }
    setEtat({ type: "complet", octets: await tailleDuCache(nomCache) });
  }, [adresses, nomCache]);

  const retirer = async () => {
    await caches.delete(nomCache);
    setEtat({ type: "absent" });
  };

  if (etat.type === "inconnu" || etat.type === "indisponible") return null;

  return (
    <div className="text-center" data-telecharger-numero={etat.type}>
      {(etat.type === "absent" || etat.type === "partiel" || etat.type === "erreur") && (
        <>
          {etat.type === "erreur" && (
            <p role="alert" className="mb-3 text-sm text-red-300">
              <TexteBilingue texte={ERREUR_CONNEXION} />
            </p>
          )}
          <button type="button" onClick={telecharger} className={BOUTON}>
            <i className={`ph-bold ${etat.type === "absent" ? "ph-download-simple" : "ph-arrows-clockwise"}`} aria-hidden="true"></i>
            <TexteBilingue texte={etat.type === "absent" ? TELECHARGER_NUMERO : REPRENDRE} />
          </button>
          <p className="mt-2 text-white/50">
            <TexteBilingue texte={TELECHARGER_POURQUOI} />
          </p>
        </>
      )}

      {etat.type === "encours" && (
        <div role="status" className="mx-auto max-w-sm">
          <p className="text-white/80">
            <TexteBilingue texte={TELECHARGEMENT} suiteFr={` ${etat.fait} / ${etat.total}`} />
          </p>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={etat.total}
            aria-valuenow={etat.fait}
            aria-label={TELECHARGEMENT.fr}
            className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"
          >
            <div className="h-full rounded-full bg-[#fbbf24] transition-[width] duration-300" style={{ width: `${(etat.fait / etat.total) * 100}%` }} />
          </div>
        </div>
      )}

      {etat.type === "complet" && (
        <>
          <p className="inline-flex items-center gap-2 text-emerald-300">
            <i className="ph-fill ph-check-circle text-xl" aria-hidden="true"></i>
            <TexteBilingue texte={DISPONIBLE} suiteFr={tailleFr(etat.octets)} />
          </p>
          <p>
            <button type="button" onClick={retirer} className="mt-1 min-h-11 px-3 text-white/60 underline-offset-4 transition-colors hover:text-white hover:underline">
              <TexteBilingue texte={RETIRER} />
            </button>
          </p>
        </>
      )}
    </div>
  );
}
