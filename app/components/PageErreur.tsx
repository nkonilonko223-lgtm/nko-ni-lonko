import type { Libelle } from "./application/textes";
import { ACCUEIL, NOM_REVUE, PAGE_ERREUR_TEXTE, PAGE_ERREUR_TITRE, REESSAYER } from "../lib/messages-lecteur";

// ============================================================================
// N'KO NI LONKO — Page d'erreur du site (31 octobre 2026)
// ============================================================================
// Montrée quand une page ne peut pas s'afficher (souvent un fichier qui n'arrive pas, sur un réseau
// faible) : sinon, le lecteur voit une page blanche en anglais. Même esprit que la fenêtre de langue
// (palette « Nuit du Mandé », docs/DESIGN.md). Tout le style et les icônes sont écrits ici, et les
// boutons sont du HTML simple : le reste du site est peut-être justement ce qui manque.
// « Réessayer » recharge vraiment la page, seul moyen de redemander le fichier manquant.
// ============================================================================

// N'Ko : d'abord la Kigelia du site (variable --font-kigelia, même fichier woff2 que partout, déjà
// sur l'appareil et gardé par public/sw.js). Le fichier .otf n'est qu'un secours : le site ne le
// charge jamais ailleurs, il manque donc quand le réseau manque.
const POLICES_NKO = `var(--font-kigelia, "kigelia-erreur"), "kigelia-erreur", system-ui, sans-serif`;
const POLICES_FR = "var(--font-fr, system-ui), system-ui, sans-serif";

const STYLE = `
@font-face { font-family: "kigelia-erreur"; src: url("/fonts/Kigelia.otf") format("opentype"); font-display: swap; }
.erreur-bouton { transition: transform .2s ease, box-shadow .2s ease, background-color .2s ease; }
.erreur-bouton:hover { transform: translateY(-1px); }
.erreur-bouton:active { transform: scale(.97); }
.erreur-bouton:focus-visible { outline: 2px solid #ebe5d8; outline-offset: 3px; }
.erreur-secondaire:hover { background-color: rgba(242, 181, 68, .12); }
@media (prefers-reduced-motion: no-preference) {
  .erreur-carte { animation: erreur-arrivee .6s cubic-bezier(.23, 1, .32, 1) both; }
  .erreur-orbite { transform-origin: 50% 50%; animation: erreur-tour 18s linear infinite; }
  .erreur-halo { animation: erreur-souffle 4s ease-in-out infinite; }
}
@keyframes erreur-arrivee { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@keyframes erreur-tour { to { transform: rotate(360deg); } }
@keyframes erreur-souffle { 50% { opacity: .55; } }
`;

function Texte({ texte, nko }: { texte: Libelle; nko: boolean }) {
  return nko && texte.nko
    ? <span lang="nqo" dir="rtl" style={{ fontFamily: POLICES_NKO }}>{texte.nko}</span>
    : <span lang="fr" dir="ltr" style={{ fontFamily: POLICES_FR }}>{texte.fr}</span>;
}

// Emblème : une orbite autour du logo. Sans réseau et sans copie du logo, la première lettre du nom
// de la revue reste visible dessous (le logo est cette même lettre)
function Embleme() {
  return (
    <div aria-hidden="true" style={{ position: "relative", width: 112, height: 112 }}>
      <div className="erreur-halo" style={{ position: "absolute", inset: -8, borderRadius: "50%", background: "radial-gradient(circle, rgba(242,181,68,.34), transparent 68%)" }} />
      <svg className="erreur-orbite" viewBox="0 0 112 112" style={{ position: "absolute", inset: 0 }} fill="none">
        <circle cx="56" cy="56" r="54" stroke="#f2b544" strokeOpacity=".3" strokeDasharray="2 7" strokeLinecap="round" />
        <circle cx="56" cy="2" r="3.5" fill="#f2b544" />
      </svg>
      <div style={{ position: "absolute", inset: 14, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", borderRadius: 24, border: "1px solid rgba(242,181,68,.35)", background: "linear-gradient(160deg, #1d2740, #111829)", boxShadow: "inset 0 0 20px rgba(242,181,68,.1), 0 10px 30px rgba(0,0,0,.45)" }}>
        <span style={{ fontFamily: POLICES_NKO, fontSize: 44, lineHeight: 1, color: "#f2b544" }}>{Array.from(NOM_REVUE.nko)[0]}</span>
        {/* eslint-disable-next-line @next/next/no-img-element -- pas d'optimiseur d'images ici : le fichier direct, ou rien */}
        <img src="/application/onglet-192.png" alt="" width={84} height={84} onError={(e) => { e.currentTarget.style.display = "none"; }} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    </div>
  );
}

const BOUTON = { display: "inline-flex", flex: "1 1 150px", alignItems: "center", justifyContent: "center", gap: 10, minHeight: 52, padding: "0 22px", borderRadius: 999, fontSize: 16, fontWeight: 700, textDecoration: "none", cursor: "pointer", boxSizing: "border-box" } as const;

export default function PageErreur({ nko }: { nko: boolean }) {
  return (
    <main dir={nko ? "rtl" : "ltr"} style={{ position: "relative", minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 16px", boxSizing: "border-box", textAlign: "center", color: "#ebe5d8", background: "radial-gradient(120% 60% at 50% -5%, rgba(242,181,68,.2), transparent 62%), radial-gradient(100% 50% at 50% 108%, rgba(62,92,170,.24), transparent 65%), #0e1322" }}>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className="erreur-carte" style={{ width: "100%", maxWidth: 440, display: "flex", flexDirection: "column", alignItems: "center", padding: "36px 24px 28px", boxSizing: "border-box", borderRadius: 28, border: "1px solid rgba(242,181,68,.24)", background: "linear-gradient(180deg, rgba(29,39,64,.82), rgba(17,24,41,.82))", boxShadow: "0 30px 80px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.06)" }}>
        <Embleme />
        <p style={{ margin: "18px 0 0", display: "flex", flexDirection: "column", gap: 4 }}>
          <span lang="nqo" dir="rtl" style={{ fontFamily: POLICES_NKO, fontSize: 24, lineHeight: 1.5, color: "#f2b544" }}>{NOM_REVUE.nko}</span>
          <span lang="fr" dir="ltr" style={{ fontFamily: POLICES_FR, fontSize: 12, fontWeight: 600, letterSpacing: ".18em", textTransform: "uppercase", color: "#b5ad9c" }}>{NOM_REVUE.fr}</span>
        </p>
        <div aria-hidden="true" style={{ width: 72, height: 2, margin: "20px 0", borderRadius: 2, background: "linear-gradient(90deg, transparent, #f2b544, transparent)" }} />
        <h1 style={{ margin: 0, fontSize: 25, fontWeight: 800, lineHeight: 1.3, color: "#fff7e8" }}><Texte texte={PAGE_ERREUR_TITRE} nko={nko} /></h1>
        <p style={{ margin: "12px 0 0", maxWidth: 340, fontSize: 16, lineHeight: 1.6, color: "#c9c3b4" }}><Texte texte={PAGE_ERREUR_TEXTE} nko={nko} /></p>
        <div style={{ width: "100%", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12, marginTop: 26 }}>
          <button type="button" className="erreur-bouton" onClick={() => window.location.reload()} style={{ ...BOUTON, border: "none", color: "#0e1322", background: "linear-gradient(135deg, #f8cc70, #f2b544 55%, #dd9c34)", boxShadow: "0 10px 28px rgba(242,181,68,.3)" }}>
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36" /><path d="M21 3v6h-6" /></svg>
            <Texte texte={REESSAYER} nko={nko} />
          </button>
          <a href={nko ? "/" : "/fr"} className="erreur-bouton erreur-secondaire" style={{ ...BOUTON, border: "1px solid rgba(242,181,68,.55)", color: "#f2b544" }}>
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10v9.5h13V10" /></svg>
            <Texte texte={ACCUEIL} nko={nko} />
          </a>
        </div>
      </div>
    </main>
  );
}
