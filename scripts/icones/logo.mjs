// ============================================================================
// N'KO NI LONKO — Où est le logo dans une image ? (outil partagé)
// ============================================================================
// Zone du logo : pixels lumineux ayant au moins 3 voisins lumineux, réunis en formes d'un seul
// tenant ; seules les GRANDES formes comptent (lettre, vague, orbite) : les petites étoiles du
// fond, même brillantes, sont ignorées. Utilisé par scripts/logo/logo.mjs (tous les logos).
// ============================================================================

// Rend la taille de l'image, le rectangle du logo (x0, y0) → (x1, y1) et son « rayon » : distance
// entre le centre du rectangle et le point du logo le plus éloigné (icônes rondes d'Android)
export async function reperageDuLogo(sharp, source) {
  const { data, info } = await sharp(source).removeAlpha().greyscale().raw().toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;
  const lumineux = (x, y) => data[y * W + x] >= 70;
  const garde = new Uint8Array(W * H);
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      if (!lumineux(x, y)) continue;
      let voisins = 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) if (lumineux(x + dx, y + dy)) voisins++;
      if (voisins >= 3) garde[y * W + x] = 1;
    }
  }
  // Formes d'un seul tenant ; on garde celles d'au moins 2 % de la plus grande
  const forme = new Int32Array(W * H).fill(-1);
  const formes = [];
  for (let i = 0; i < W * H; i++) {
    if (!garde[i] || forme[i] >= 0) continue;
    const n = formes.length, pile = [i], pixels = [];
    forme[i] = n;
    while (pile.length) {
      const p = pile.pop(), x = p % W, y = (p / W) | 0;
      pixels.push(p);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy, q = ny * W + nx;
        if (nx >= 0 && ny >= 0 && nx < W && ny < H && garde[q] && forme[q] < 0) { forme[q] = n; pile.push(q); }
      }
    }
    formes.push(pixels);
  }
  const plusGrande = Math.max(0, ...formes.map((f) => f.length));
  let x0 = W, y0 = H, x1 = 0, y1 = 0;
  const points = [];
  for (const f of formes) {
    if (f.length < plusGrande * 0.02) continue;
    for (const p of f) {
      const x = p % W, y = (p / W) | 0;
      x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
      points.push(p);
    }
  }
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  let rayon = 0;
  for (const p of points) rayon = Math.max(rayon, Math.hypot((p % W) - cx, ((p / W) | 0) - cy));
  return { W, H, x0, y0, x1, y1, rayon };
}
