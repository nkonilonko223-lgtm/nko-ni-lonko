// ============================================================================
// N'KO NI LONKO — Icône de l'application : le logo original sur fond bleu nuit (24 octobre 2026)
// ============================================================================
// Choix du propriétaire (24 octobre 2026, « Proposition ») : le logo ORIGINAL (public/icon-512x512.png),
// avec tous ses motifs, agrandi, sur un fond bleu nuit, retouché très finement, avec un léger halo.
// Le logo est sur fond noir, avec des lueurs : il est décomposé en deux couches
//   - « opaque » : les lettres et leur ombre (couleur pleine, bords adoucis d'origine conservés) ;
//   - « lumière » : vague, orbite, étoiles, lueurs, posées en mode « écran » (comme de la lumière :
//     le noir disparaît, les lueurs brillent sur le bleu).
// Retouches : lettres +12 % de couleur et +5 % d'éclat ; ombre 30 % vers un bleu nuit profond (sur
// un fond bleu, une ombre tire vers le bleu : le relief ressort) ; lumières +12 %.
// Onglet du navigateur (16 à 48 px) : version simplifiée, les lettres seules (aucun logo détaillé ne
// se lit à 16 px), mêmes couleurs, même fond.
// La source n'est jamais modifiée : public/icon-512x512.png reste le logo du site.
// Utilisé par scripts/application/generer.mjs (application) et scripts/icones/favicon.mjs (onglet).
// ============================================================================
import { createRequire } from "node:module";
import { join, resolve } from "node:path";
import { SOURCE_LOGO, reperageDuLogo } from "../icones/logo.mjs";

const PROJET = resolve(import.meta.dirname, "../..");
const sharp = createRequire(join(PROJET, "package.json"))("sharp");
const LOGO = join(PROJET, SOURCE_LOGO);
const NUIT = ["#16264a", "#050a18"]; // fond bleu nuit (centre → bords)

// --- Décomposition du logo (faite une fois) ---------------------------------------------------
let decomposition;
async function decomposer() {
  if (decomposition) return decomposition;
  const { data: rgb, info } = await sharp(LOGO).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, N = W * W;
  // Couleurs : cyan (vague, orbite, étoile), lettres (violet → or, vives), ombre (brune, terne)
  const lettre = new Uint8Array(N), ombre = new Uint8Array(N);
  for (let i = 0; i < N; i++) {
    const r = rgb[i * 3], g = rgb[i * 3 + 1], b = rgb[i * 3 + 2];
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min, v = max / 255, s = max ? d / max : 0;
    if (v < 0.18) continue;
    let h = 0;
    if (d) h = (((max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4) * 60) + 360) % 360;
    if (h > 160 && h < 215 && s > 0.25) continue; // cyan : couche lumière
    if (s > 0.28 && v > 0.5) lettre[i] = 1;
    else if (v > 0.25 && s > 0.1) ombre[i] = 1;
  }
  // Couche opaque = lettres et ombre, sans les petits morceaux (poussières, reflets de l'étoile)
  const opaque = new Uint8Array(N);
  for (let i = 0; i < N; i++) if (lettre[i] || ombre[i]) opaque[i] = 1;
  const id = new Int32Array(N).fill(-1), tailles = [];
  for (let i = 0; i < N; i++) {
    if (!opaque[i] || id[i] >= 0) continue;
    const n = tailles.length, pile = [i];
    id[i] = n;
    let t = 0;
    while (pile.length) {
      const p = pile.pop(), x = p % W, y = (p / W) | 0;
      t++;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy, q = ny * W + nx;
        if (nx >= 0 && nx < W && ny >= 0 && ny < W && opaque[q] && id[q] < 0) { id[q] = n; pile.push(q); }
      }
    }
    tailles.push(t);
  }
  for (let i = 0; i < N; i++) if (opaque[i] && tailles[id[i]] < 300) opaque[i] = 0;

  // Cœur (couleur sûre) puis bord : la couleur du cœur est propagée sur 3 px ; la couverture d'un
  // pixel du bord = sa luminosité / celle du cœur voisin (le fond d'origine est noir)
  const lum = (i) => Math.max(rgb[i * 3], rgb[i * 3 + 1], rgb[i * 3 + 2]);
  const coeur = new Uint8Array(N);
  for (let y = 1; y < W - 1; y++) for (let x = 1; x < W - 1; x++) {
    const i = y * W + x;
    if (opaque[i] && opaque[i - 1] && opaque[i + 1] && opaque[i - W] && opaque[i + W]) coeur[i] = 1;
  }
  const couleur = new Float32Array(N * 3), connu = new Uint8Array(N);
  for (let i = 0; i < N; i++) if (coeur[i]) { for (let c = 0; c < 3; c++) couleur[i * 3 + c] = rgb[i * 3 + c]; connu[i] = 1; }
  for (let passe = 0; passe < 3; passe++) {
    const nouveaux = [];
    for (let y = 1; y < W - 1; y++) for (let x = 1; x < W - 1; x++) {
      const i = y * W + x;
      if (connu[i]) continue;
      const v = [i - 1, i + 1, i - W, i + W].filter((j) => connu[j]);
      if (v.length) nouveaux.push([i, v]);
    }
    for (const [i, v] of nouveaux) {
      for (let c = 0; c < 3; c++) couleur[i * 3 + c] = v.reduce((s, j) => s + couleur[j * 3 + c], 0) / v.length;
      connu[i] = 2;
    }
  }
  const alpha = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    if (coeur[i]) alpha[i] = 1;
    else if (connu[i] === 2) {
      const ref = Math.max(couleur[i * 3], couleur[i * 3 + 1], couleur[i * 3 + 2]);
      alpha[i] = opaque[i] ? Math.min(1, Math.max(0.6, lum(i) / ref)) : Math.min(1, lum(i) / ref) * 0.9;
    }
  }
  const estOmbre = (i) => ombre[i] && !lettre[i];

  // Couche opaque retouchée (RVBA) et couche lumière retouchée (RVB) ; « lettresSeules » : sans l'ombre
  const opaqueRVBA = Buffer.alloc(N * 4), lettresRVBA = Buffer.alloc(N * 4), lumiere = Buffer.alloc(N * 3);
  for (let i = 0; i < N; i++) {
    let [r, g, b] = [couleur[i * 3], couleur[i * 3 + 1], couleur[i * 3 + 2]];
    if (estOmbre(i)) { r = r * 0.7 + 10 * 0.3; g = g * 0.7 + 18 * 0.3; b = b * 0.7 + 38 * 0.3; }
    else {
      const m = (r + g + b) / 3;
      r = (m + (r - m) * 1.12) * 1.05; g = (m + (g - m) * 1.12) * 1.05; b = (m + (b - m) * 1.12) * 1.05;
    }
    const a = Math.round(alpha[i] * 255);
    for (const [c, v] of [[0, r], [1, g], [2, b]]) {
      opaqueRVBA[i * 4 + c] = lettresRVBA[i * 4 + c] = Math.max(0, Math.min(255, Math.round(v)));
    }
    opaqueRVBA[i * 4 + 3] = a;
    lettresRVBA[i * 4 + 3] = estOmbre(i) ? 0 : a;
    // Lumière = image d'origine moins la part des lettres, × (1 − couverture) : pas de liseré clair
    for (let c = 0; c < 3; c++) {
      lumiere[i * 3 + c] = Math.max(0, Math.min(255, (rgb[i * 3 + c] - alpha[i] * couleur[i * 3 + c]) * (1 - alpha[i]) * 1.12));
    }
  }
  // Boîte des lettres seules (pour la version de l'onglet)
  let x0 = W, y0 = W, x1 = 0, y1 = 0;
  for (let i = 0; i < N; i++) if (lettre[i] && opaque[i]) { const x = i % W, y = (i / W) | 0; x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  const logo = await reperageDuLogo(sharp, LOGO);
  decomposition = { W, opaqueRVBA, lettresRVBA, lumiere, lettres: { x0, y0, x1, y1 }, logo };
  return decomposition;
}

// --- Composition ------------------------------------------------------------------------------
const fondSvg = (T, halo) => `<svg xmlns="http://www.w3.org/2000/svg" width="${T}" height="${T}"><defs>` +
  `<radialGradient id="g" cx="0.5" cy="0.36" r="0.78"><stop offset="0" stop-color="${NUIT[0]}"/><stop offset="1" stop-color="${NUIT[1]}"/></radialGradient>` +
  `<radialGradient id="h" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#2b4a8f" stop-opacity="0.55"/><stop offset="1" stop-color="#2b4a8f" stop-opacity="0"/></radialGradient>` +
  `</defs><rect width="${T}" height="${T}" fill="url(#g)"/>${halo ? `<circle cx="${T / 2}" cy="${T / 2}" r="${T * 0.42}" fill="url(#h)"/>` : ""}</svg>`;

// Pose une couche (agrandie) dans la toile T × T, coin en (left, top), le reste découpé.
// En deux temps : sharp découpe AVANT d'agrandir la toile si on enchaîne les deux.
async function placer(image, T, left, top) {
  const etendu = await sharp(image).extend({ top: T, left: T, bottom: T, right: T, background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  return sharp(etendu).extract({ left: T - left, top: T - top, width: T, height: T }).png().toBuffer();
}

// Icône de l'application (PNG, carré plein). « part » : distance du centre au point le plus éloigné
// du logo (pointe de l'orbite), en part du côté : 0,47 = grande (iPhone, ordinateur) ; 0,40 =
// « masquable » (Android découpe l'icône : l'orbite reste entière dans le cercle sûr de 40 %).
export async function iconeApplication({ taille, part }) {
  const { W, opaqueRVBA, lumiere, logo } = await decomposer();
  const T = Math.max(taille, 512); // composée en grand, puis réduite : bords plus fins
  const k = (part * T) / logo.rayon;
  const cote = Math.round(W * k);
  const cx = (logo.x0 + logo.x1) / 2, cy = (logo.y0 + logo.y1) / 2;
  const left = Math.round(T / 2 - cx * k), top = Math.round(T / 2 - cy * k);
  const op = await sharp(opaqueRVBA, { raw: { width: W, height: W, channels: 4 } }).resize(cote, cote, { kernel: "lanczos3" }).sharpen({ sigma: 0.6 }).png().toBuffer();
  const lu = await sharp(lumiere, { raw: { width: W, height: W, channels: 3 } }).resize(cote, cote, { kernel: "lanczos3" }).png().toBuffer();
  const image = await sharp(Buffer.from(fondSvg(T, true))).composite([
    { input: await placer(lu, T, left, top), blend: "screen" },
    { input: await placer(op, T, left, top) },
  ]).png().toBuffer();
  // Icône pleine, sans transparence (recommandation d'Apple ; Android : « masquable » pleine)
  return sharp(image).resize(taille, taille, { kernel: "lanczos3" }).removeAlpha().png({ compressionLevel: 9 }).toBuffer();
}

// Onglet du navigateur : les lettres seules (sans ombre ni lumières), grandes, sur le fond bleu
// nuit, coins arrondis
export async function iconeOnglet(taille) {
  const { W, lettresRVBA, lettres } = await decomposer();
  const T = 256;
  const k = (0.8 * T) / (lettres.y1 - lettres.y0 + 1);
  const cote = Math.round(W * k);
  const cx = (lettres.x0 + lettres.x1) / 2, cy = (lettres.y0 + lettres.y1) / 2;
  const left = Math.round(T / 2 - cx * k), top = Math.round(T / 2 - cy * k);
  // Un peu plus d'éclat qu'en grand : le violet reste lisible sur le bleu en très petit
  const l = await sharp(lettresRVBA, { raw: { width: W, height: W, channels: 4 } }).resize(cote, cote, { kernel: "lanczos3" }).modulate({ brightness: 1.12 }).png().toBuffer();
  const coins = Buffer.from(`<svg width="${T}" height="${T}"><rect width="${T}" height="${T}" rx="${T * 0.22}" fill="#fff"/></svg>`);
  const image = await sharp(Buffer.from(fondSvg(T, false))).composite([{ input: await placer(l, T, left, top) }]).png().toBuffer();
  const arrondie = await sharp(image).ensureAlpha().composite([{ input: coins, blend: "dest-in" }]).png().toBuffer();
  return sharp(arrondie).resize(taille, taille, { kernel: "lanczos3" }).png({ compressionLevel: 9 }).toBuffer();
}
