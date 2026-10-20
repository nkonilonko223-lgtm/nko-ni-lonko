// ============================================================================
// N'KO NI LONKO — « Ma bibliothèque » : les articles sauvegardés par le lecteur (signet)
// ============================================================================
// Gardés dans SON navigateur seulement (localStorage), jamais envoyés au serveur.
// Valeur : les adresses des articles (« /article/<slug> »), dans l'ordre où ils ont été sauvegardés.
// Lecture prudente : une valeur abîmée ou un stockage bloqué (navigation privée) donne une liste vide.
// ============================================================================

export const CLE_SIGNETS = "nko_bookmarks";
const CHANGEMENT = "nko-signets"; // prévient les autres composants de la même page

// Valeur brute (texte) : « instantané » stable pour useSyncExternalStore
export function signetsBruts(): string {
  try {
    return localStorage.getItem(CLE_SIGNETS) || "[]";
  } catch {
    return "[]";
  }
}

export function analyserSignets(brut: string): string[] {
  try {
    const valeur: unknown = JSON.parse(brut);
    return Array.isArray(valeur) ? valeur.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export const lireSignets = () => analyserSignets(signetsBruts());

export function ecrireSignets(signets: string[]) {
  try {
    localStorage.setItem(CLE_SIGNETS, JSON.stringify(signets));
  } catch {
    return; // stockage bloqué : le signet ne sera pas gardé
  }
  window.dispatchEvent(new Event(CHANGEMENT));
}

// Abonnement aux changements : autre onglet (« storage ») ou même page (CHANGEMENT)
export function abonnerSignets(rappel: () => void) {
  window.addEventListener("storage", rappel);
  window.addEventListener(CHANGEMENT, rappel);
  return () => {
    window.removeEventListener("storage", rappel);
    window.removeEventListener(CHANGEMENT, rappel);
  };
}
