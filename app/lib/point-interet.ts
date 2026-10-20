// ============================================================================
// N'KO NI LONKO — Point d'intérêt (« hotspot ») choisi dans le Studio → cadrage des couvertures
// ============================================================================
// Le site remplit chaque cadre (object-fit: cover) et coupe ce qui dépasse : par défaut il garde
// le CENTRE. Si la rédaction a placé le point d'intérêt sur l'image dans le Studio (un visage,
// des personnages…), le cadrage suit ce point : il reste visible quel que soit le format du cadre
// (carte 16:10, page du numéro sur téléphone, vignette carrée, archive en portrait…).
// Sans point d'intérêt : rien ne change (centre).
// ============================================================================

export type PointInteret = { x?: number; y?: number } | null | undefined;

const valide = (p: PointInteret): p is { x: number; y: number } =>
  !!p && typeof p.x === "number" && typeof p.y === "number";
const borne = (v: number) => Math.min(1, Math.max(0, v));

// Valeur CSS « object-position » (ex. « 25% 60% »), ou undefined pour garder le centre
export function positionDuCadrage(p: PointInteret): string | undefined {
  if (!valide(p)) return undefined;
  const pourcent = (v: number) => `${Math.round(borne(v) * 1000) / 10}%`;
  return `${pourcent(p.x)} ${pourcent(p.y)}`;
}

// Paramètres du service d'images de Sanity pour un recadrage fixe (ex. image de partage 1200×630)
export function parametresPointInteret(p: PointInteret): string {
  if (!valide(p)) return "";
  return `&crop=focalpoint&fp-x=${borne(p.x).toFixed(3)}&fp-y=${borne(p.y).toFixed(3)}`;
}
