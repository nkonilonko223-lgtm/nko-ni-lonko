// ============================================================================
// N'KO NI LONKO — Installation de l'application : état partagé (navigateur seulement)
// ============================================================================
// Chrome, Edge, Samsung Internet (Android, ordinateur) : l'événement « beforeinstallprompt »
// permet d'ouvrir la fenêtre d'installation au bon moment. Il n'arrive qu'UNE fois, tôt : il est
// retenu ici dès le chargement du site (module importé par LectureHorsLigne, dans le gabarit) et
// sert à tous les boutons « Installer » (menu de l'accueil, proposition sous les articles). Avant,
// seul l'accueil l'écoutait : arrivé par un article, le lecteur ne voyait jamais le bouton.
// iPhone et iPad : pas d'événement. L'application s'ajoute par « Partager → Sur l'écran
// d'accueil » : le site montre un guide (components/application/GuideIphone.tsx).
// Rien n'est envoyé : seuls « déjà installée », « plus tard » et les articles lus sont gardés
// dans le navigateur du lecteur.
// ============================================================================

type EvenementInstallation = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

// « installee » : on est DANS l'application (ou elle vient d'être installée) ;
// « fenetre » : le navigateur peut ouvrir sa fenêtre d'installation ; « guide » : iPhone / iPad ;
// « aucun » : rien à proposer (navigateur sans installation, serveur)
export type ModeInstallation = "installee" | "fenetre" | "guide" | "aucun";

const CLE_INSTALLEE = "nko_application_installee";
let evenement: EvenementInstallation | null = null;
let installeeIci = false;
let guideOuvert = false;
const abonnes = new Set<() => void>();
const prevenir = () => abonnes.forEach((rappel) => rappel());

const memoriserInstallee = () => {
  try { localStorage.setItem(CLE_INSTALLEE, "1"); } catch { /* stockage bloqué */ }
};

const dansApplication = () =>
  window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault(); // pas de bandeau automatique : le site propose au bon moment
    evenement = e as EvenementInstallation;
    prevenir();
  });
  window.addEventListener("appinstalled", () => {
    evenement = null;
    installeeIci = true;
    memoriserInstallee();
    prevenir();
  });
  // Ouverte depuis l'icône : retenu, pour ne plus proposer l'installation dans le navigateur
  if (dansApplication()) memoriserInstallee();
}

// iPhone, iPad (qui se présente comme un Mac à écran tactile), iPod
export const estIphone = () =>
  /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

export function modeInstallation(): ModeInstallation {
  if (installeeIci || dansApplication()) return "installee";
  if (evenement) return "fenetre";
  if (estIphone()) return "guide";
  return "aucun";
}
export const modeInstallationServeur = (): ModeInstallation => "aucun";

// L'application a-t-elle déjà été installée depuis ce navigateur (Android : même mémoire) ?
export function dejaInstallee(): boolean {
  try { return localStorage.getItem(CLE_INSTALLEE) === "1"; } catch { return false; }
}

export function abonnerInstallation(rappel: () => void) {
  abonnes.add(rappel);
  return () => { abonnes.delete(rappel); };
}

// Ouvre la fenêtre d'installation du navigateur, ou le guide sur iPhone / iPad
export async function installer(): Promise<void> {
  if (evenement) {
    const e = evenement;
    evenement = null; // la fenêtre ne s'ouvre qu'une fois par événement
    prevenir();
    await e.prompt();
    if ((await e.userChoice).outcome === "accepted") {
      installeeIci = true;
      memoriserInstallee();
      prevenir();
    }
    return;
  }
  if (estIphone()) {
    guideOuvert = true;
    prevenir();
  }
}

export const guideEstOuvert = () => guideOuvert;
export const guideFermeServeur = () => false;
export function fermerGuide() {
  guideOuvert = false;
  prevenir();
}
