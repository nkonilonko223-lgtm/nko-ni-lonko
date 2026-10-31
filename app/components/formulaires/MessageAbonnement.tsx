"use client";

import { useEffect, useState } from "react";
import { TexteLangue, texteLangue } from "../application/Libelle";
import { TEXTES_LEXIQUE } from "../lexique/textes";
import { ABONNEMENT_A_CONFIRMER } from "../../lib/messages-lecteur";

// ============================================================================
// N'KO NI LONKO — Message « Presque fini ! » de la lettre (31 octobre 2026)
// ============================================================================
// Le même au pied de page et en fin d'article : le lecteur n'est pas encore abonné, l'e-mail de
// confirmation reste à ouvrir. Il reste 20 s, puis s'efface en fondu de 0,5 s ; la croix le ferme tout
// de suite, et le formulaire l'efface dès qu'on tape une adresse. Toucher l'écran ne le ferme pas.
// La croix reste à droite dans les deux langues, comme celles du menu et de la visionneuse.
// ============================================================================

const DUREE = 20_000;
const FONDU = 500;

// « onFermer » : à garder stable (useCallback), sinon le compte à rebours repartirait
export default function MessageAbonnement({ nko, onFermer }: { nko: boolean; onFermer: () => void }) {
  const [fondu, setFondu] = useState(false);

  useEffect(() => {
    const debut = setTimeout(() => setFondu(true), DUREE);
    const fin = setTimeout(onFermer, DUREE + FONDU);
    return () => {
      clearTimeout(debut);
      clearTimeout(fin);
    };
  }, [onFermer]);

  const enveloppe = <i className="ph-bold ph-envelope-simple mt-0.5 shrink-0 text-base" aria-hidden="true"></i>;

  return (
    <div dir="ltr" data-message-abonnement className={`mt-2 flex items-start gap-2 text-sm font-medium text-green-400 transition-opacity duration-500 ${fondu ? "opacity-0" : "opacity-100"}`}>
      {!nko && enveloppe}
      <p className={`min-w-0 flex-1 ${nko ? "text-right text-base" : "text-left"}`}>
        <TexteLangue texte={ABONNEMENT_A_CONFIRMER} nko={nko} className="leading-snug" />
      </p>
      {nko && enveloppe}
      <button
        type="button"
        onClick={onFermer}
        aria-label={texteLangue(TEXTES_LEXIQUE.fermer, nko)}
        className="-my-3 -mr-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-green-400/80 transition-colors hover:bg-white/10 hover:text-white"
      >
        <i className="ph-bold ph-x" aria-hidden="true"></i>
      </button>
    </div>
  );
}
