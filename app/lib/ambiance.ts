// ============================================================================
// N'KO NI LONKO — Ambiance de lecture des articles (novembre 2026)
// ============================================================================
// Nuit (les couleurs du site), Papier (crème, encre brune), Jour (blanc cassé, encre grise).
// Les couleurs sont dans app/globals.css (html[data-ambiance]) ; ici, seulement le choix du
// lecteur, gardé dans SON navigateur (rien n'est envoyé). Sans choix : l'ambiance de son
// téléphone (clair → Jour, sombre → Nuit). Seulement sur les articles : ArticleTools la pose
// en arrivant et la retire en partant (les autres pages restent en Nuit).
// ============================================================================

export const AMBIANCES = ["nuit", "papier", "jour"] as const;
export type Ambiance = (typeof AMBIANCES)[number];

const CLE = "nko_ambiance";
// Couleur de la barre du navigateur : le fond de chaque ambiance (app/globals.css)
const BARRE: Record<Ambiance, string> = { nuit: "#0e1322", papier: "#f4ecda", jour: "#fbfaf7" };

const estAmbiance = (a: unknown): a is Ambiance => AMBIANCES.includes(a as Ambiance);

/** Le choix gardé par le lecteur, sinon celui de son téléphone */
export function ambianceDuLecteur(): Ambiance {
  try {
    const a = localStorage.getItem(CLE);
    if (estAmbiance(a)) return a;
  } catch { /* stockage bloqué */ }
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "jour" : "nuit";
}

/** Pose l'ambiance sur la page (null : retour aux couleurs du site) */
export function appliquerAmbiance(a: Ambiance | null) {
  const html = document.documentElement;
  if (a && a !== "nuit") html.setAttribute("data-ambiance", a);
  else html.removeAttribute("data-ambiance");
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", BARRE[a ?? "nuit"]);
}

export function garderAmbiance(a: Ambiance) {
  try { localStorage.setItem(CLE, a); } catch { /* stockage bloqué */ }
}

// La même chose AVANT l'affichage (petit script de la page article) : la page ne change pas de
// couleur sous les yeux du lecteur au premier chargement
export const SCRIPT_AMBIANCE =
  `try{var a=localStorage.getItem(${JSON.stringify(CLE)});` +
  `if(${JSON.stringify(AMBIANCES)}.indexOf(a)<0)a=matchMedia("(prefers-color-scheme: light)").matches?"jour":"nuit";` +
  `if(a!=="nuit"){document.documentElement.setAttribute("data-ambiance",a);` +
  `var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",${JSON.stringify(BARRE)}[a])}}catch(e){}`;
