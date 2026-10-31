"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_SCRIPT_ID } from "@marsidev/react-turnstile";
import { TexteLangue } from "../application/Libelle";
import { ADRESSE_A_REVOIR, REESSAYER, VERIFICATION_ECHEC, VERIFICATION_EN_COURS } from "../../lib/messages-lecteur";

// ============================================================================
// N'KO NI LONKO — Pourquoi le bouton d'envoi reste gris (31 octobre 2026)
// ============================================================================
// Lettre (pied de page, fin d'article) et contact : une ligne sous le formulaire dit ce qui se
// passe. Adresse à revoir, vérification anti-robot en cours, ou échec avec « Réessayer ».
// ============================================================================

const ATTENTE_ECHEC = 30_000; // sans réponse de l'anti-robot après 30 s : réseau trop faible ou bloqué
const ATTENTE_ADRESSE = 1_200; // le message d'adresse attend une pause dans la frappe

// Suit la vérification anti-robot. « cle » est à passer au composant Turnstile : la changer le recrée.
export function useVerification(actif: boolean, jeton: string | null) {
  const [echoue, setEchoue] = useState(false);
  const [cle, setCle] = useState(0);

  useEffect(() => {
    if (!actif || jeton || echoue) return;
    const minuteur = setTimeout(() => setEchoue(true), ATTENTE_ECHEC);
    return () => clearTimeout(minuteur);
  }, [actif, jeton, echoue, cle]);

  const signalerEchec = useCallback(() => setEchoue(true), []);
  const reessayer = useCallback(() => {
    // Script de Cloudflare jamais arrivé : retiré, pour qu'il soit redemandé
    if (!("turnstile" in window)) document.getElementById(DEFAULT_SCRIPT_ID)?.remove();
    setEchoue(false);
    setCle((c) => c + 1);
  }, []);

  return { echec: echoue && !jeton, signalerEchec, reessayer, cle };
}

export default function EtatFormulaire({ email, emailValide, jeton, echec, onReessayer, nko }: {
  email: string;
  emailValide: boolean;
  jeton: string | null;
  echec: boolean;
  onReessayer: () => void;
  nko: boolean;
}) {
  const [adresseArretee, setAdresseArretee] = useState("");
  useEffect(() => {
    const minuteur = setTimeout(() => setAdresseArretee(email), ATTENTE_ADRESSE);
    return () => clearTimeout(minuteur);
  }, [email]);
  const adresseFausse = Boolean(email) && !emailValide && adresseArretee === email;

  return (
    <div role="status" className="text-sm leading-snug">
      {adresseFausse && (
        <p className="mt-2 flex items-start gap-2 text-or">
          <i className="ph-bold ph-warning-circle mt-0.5 shrink-0" aria-hidden="true"></i>
          <TexteLangue texte={ADRESSE_A_REVOIR} nko={nko} />
        </p>
      )}
      {emailValide && !jeton && !echec && (
        <p className="mt-2 flex items-start gap-2 text-white/70">
          <i className="ph-bold ph-spinner mt-0.5 shrink-0 animate-spin" aria-hidden="true"></i>
          <TexteLangue texte={VERIFICATION_EN_COURS} nko={nko} />
        </p>
      )}
      {echec && (
        <div className="mt-2 text-red-400">
          <p className="flex items-start gap-2">
            <i className="ph-fill ph-warning-circle mt-0.5 shrink-0" aria-hidden="true"></i>
            <TexteLangue texte={VERIFICATION_ECHEC} nko={nko} />
          </p>
          <button type="button" onClick={onReessayer} className="mt-1 min-h-11 rounded-full border border-or/50 px-4 font-bold text-or transition-colors hover:bg-or/10">
            <TexteLangue texte={REESSAYER} nko={nko} />
          </button>
        </div>
      )}
    </div>
  );
}
