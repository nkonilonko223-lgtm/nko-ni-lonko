import type { Libelle } from "./application/textes";
import { ACCUEIL, PAGE_ERREUR_TEXTE, PAGE_ERREUR_TITRE, REESSAYER } from "../lib/messages-lecteur";

// ============================================================================
// N'KO NI LONKO — Page d'erreur du site (31 octobre 2026)
// ============================================================================
// Montrée quand une page ne peut pas s'afficher (souvent un fichier qui n'arrive pas, sur un réseau
// faible) : sinon, le lecteur voit une page blanche en anglais. Tout le style est écrit ici, et
// les boutons sont du HTML simple : le reste du site est peut-être justement ce qui manque.
// « Réessayer » recharge vraiment la page, seul moyen de redemander le fichier manquant.
// ============================================================================

// N'Ko : d'abord la Kigelia du site (variable --font-kigelia, même fichier woff2 que partout, déjà
// sur l'appareil et gardé par public/sw.js). Le fichier .otf n'est qu'un secours : le site ne le
// charge jamais ailleurs, il manque donc quand le réseau manque.
const POLICE = `@font-face { font-family: "kigelia-erreur"; src: url("/fonts/Kigelia.otf") format("opentype"); font-display: swap; }`;
const POLICES_NKO = `var(--font-kigelia, "kigelia-erreur"), "kigelia-erreur", system-ui, sans-serif`;
const POLICES_FR = "system-ui, sans-serif";

function Texte({ texte, nko }: { texte: Libelle; nko: boolean }) {
  return nko && texte.nko
    ? <span lang="nqo" dir="rtl" style={{ fontFamily: POLICES_NKO }}>{texte.nko}</span>
    : <span lang="fr" dir="ltr" style={{ fontFamily: POLICES_FR }}>{texte.fr}</span>;
}

const BOUTON = { display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 48, padding: "0 24px", borderRadius: 999, fontSize: 16, fontWeight: 700, textDecoration: "none", cursor: "pointer" } as const;

export default function PageErreur({ nko }: { nko: boolean }) {
  return (
    <main style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24, textAlign: "center", background: "#0e1322", color: "#ebe5d8" }}>
      <style dangerouslySetInnerHTML={{ __html: POLICE }} />
      <h1 style={{ margin: 0, fontSize: 24, lineHeight: 1.35, color: "#f2b544" }}><Texte texte={PAGE_ERREUR_TITRE} nko={nko} /></h1>
      <p style={{ margin: 0, maxWidth: 420, fontSize: 16, lineHeight: 1.5 }}><Texte texte={PAGE_ERREUR_TEXTE} nko={nko} /></p>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12, marginTop: 8 }}>
        <button type="button" onClick={() => window.location.reload()} style={{ ...BOUTON, border: "none", background: "#f2b544", color: "#0e1322" }}>
          <Texte texte={REESSAYER} nko={nko} />
        </button>
        <a href={nko ? "/" : "/fr"} style={{ ...BOUTON, border: "1px solid #f2b544", color: "#f2b544" }}>
          <Texte texte={ACCUEIL} nko={nko} />
        </a>
      </div>
    </main>
  );
}
