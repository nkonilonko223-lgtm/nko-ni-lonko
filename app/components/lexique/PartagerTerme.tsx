"use client";

// ============================================================================
// N'KO NI LONKO — « Partager en image » sur la fiche d'un terme (/lexique/[slug])
// ============================================================================
// Même dessin que le partage d'un passage d'article (app/components/texte/imageCitation.ts) :
// le terme en grand (N'Ko puis français), sa définition (N'Ko d'abord, sinon française),
// le nom du dictionnaire. Dessiné dans le navigateur du lecteur : rien n'est envoyé.
// Aucun N'Ko écrit ici : tout vient de la fiche et des textes de la rédaction.
// ============================================================================

import { useState } from "react";
import { useLanguage } from "../LanguageProvider";
import { fabriquerImageCitation, partagerImage, PARTAGER_IMAGE } from "../texte/imageCitation";
import { TEXTES_LEXIQUE } from "./textes";
import messagesNko from "../../messages/nko.json";

type Props = { termeNko?: string; termeFr?: string; definitionNko?: string; definitionFr?: string; url: string; slug: string };

export default function PartagerTerme({ termeNko, termeFr, definitionNko, definitionFr, url, slug }: Props) {
  const { lang } = useLanguage();
  const [enCours, setEnCours] = useState(false);
  const texte = definitionNko || definitionFr;
  if (!texte || !(termeNko || termeFr)) return null;

  const partager = async () => {
    if (navigator.vibrate) navigator.vibrate(50);
    setEnCours(true);
    try {
      const blob = await fabriquerImageCitation({
        texte,
        nko: !!definitionNko,
        enTete: { nko: termeNko || termeFr || "", fr: termeNko ? termeFr || null : null },
        titreNko: TEXTES_LEXIQUE.dictionnaire.nko,
        titreFr: TEXTES_LEXIQUE.dictionnaire.fr,
        nomNko: messagesNko.metadata.siteName,
        guillemets: false,
      });
      await partagerImage(blob, `nko-ni-lonko-${slug}.png`, url);
    } catch (err) {
      console.error("Image du terme impossible", err);
    } finally {
      setEnCours(false);
    }
  };

  const libelle = lang === "nko" && PARTAGER_IMAGE.nko
    ? <span lang="nqo" dir="rtl" className="font-kigelia">{PARTAGER_IMAGE.nko}</span>
    : <span lang="fr" dir="ltr" className="font-fr">{PARTAGER_IMAGE.fr}</span>;

  return (
    <div className="mb-8">
      <button
        type="button"
        onClick={partager}
        disabled={enCours}
        className="flex items-center gap-2 rounded-full border border-[#fbbf24]/40 px-5 py-2.5 text-sm text-[#fbbf24] transition-colors hover:bg-[#fbbf24]/10 disabled:opacity-50"
      >
        <i className="ph-bold ph-image" aria-hidden="true"></i>
        {libelle}
      </button>
    </div>
  );
}
