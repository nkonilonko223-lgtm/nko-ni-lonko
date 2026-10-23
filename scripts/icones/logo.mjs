// ============================================================================
// N'KO NI LONKO — Où est le logo dans public/icon-512x512.png ? (outil partagé)
// ============================================================================
// Zone du logo : pixels lumineux ayant au moins 3 voisins lumineux (une étoile isolée du fond
// n'en a pas). Utilisé par scripts/icones/favicon.mjs (petites icônes du site) et
// scripts/application/generer.mjs (icônes de l'application, écrans de démarrage).
// ============================================================================

export const SOURCE_LOGO = "public/icon-512x512.png";

// Rend la taille de l'image, le rectangle du logo (x0, y0) → (x1, y1) et son « rayon » : distance
// entre le centre du rectangle et le point du logo le plus éloigné (icônes rondes d'Android)
export async function reperageDuLogo(sharp, source = SOURCE_LOGO) {
  const { data, info } = await sharp(source).removeAlpha().greyscale().raw().toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;
  const lumineux = (x, y) => data[y * W + x] >= 70;
  const points = [];
  let x0 = W, y0 = H, x1 = 0, y1 = 0;
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      if (!lumineux(x, y)) continue;
      let voisins = 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) if (lumineux(x + dx, y + dy)) voisins++;
      if (voisins < 3) continue;
      x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
      points.push([x, y]);
    }
  }
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  const rayon = Math.max(...points.map(([x, y]) => Math.hypot(x - cx, y - cy)));
  return { W, H, x0, y0, x1, y1, rayon };
}
