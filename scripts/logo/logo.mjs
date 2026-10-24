// ============================================================================
// N'KO NI LONKO — Tous les logos, depuis les sources HD (24 octobre 2026)
// ============================================================================
// Sources (scripts/logo/sources/, fabriquées par construire-sources.mjs depuis le Canva du
// propriétaire) : decor-2000.png (vague, orbite, étoiles, sur fond noir), lettre-2000.png
// (la lettre, dégradé violet → or), ombre-2000.png (son ombre). Les couches séparées permettent
// de poser le logo sur n'importe quel fond sans le « détacher » de son noir.
// Retouches très fines, partout (choix du propriétaire, 24 octobre 2026) : lettre +12 % de
// couleur et +5 % d'éclat, lumières +12 %. Sur le fond bleu nuit de l'icône, l'ombre tire vers
// le bleu (30 %) : le relief ressort ; sur le noir du site, elle garde sa couleur d'origine.
// Utilisé par scripts/icones/favicon.mjs (logo du site, onglet) et scripts/application/generer.mjs
// (icône de l'application, écrans de démarrage).
// ============================================================================
import { createRequire } from "node:module";
import { join, resolve } from "node:path";
import { reperageDuLogo } from "../icones/logo.mjs";

const PROJET = resolve(import.meta.dirname, "../..");
const sharp = createRequire(join(PROJET, "package.json"))("sharp");
const SOURCES = join(PROJET, "scripts/logo/sources");
const M = 2000; // taille des sources
const NUIT = ["#16264a", "#050a18"]; // fond bleu nuit de l'icône (centre → bords)
const OMBRE_BLEUTEE = "#4a423e"; // #665648 mêlé à 30 % d'un bleu nuit profond (#0a1226)

// --- Couches retouchées (faites une fois) -----------------------------------------------------
let couches;
async function lesCouches() {
  if (couches) return couches;
  const decor = await sharp(join(SOURCES, "decor-2000.png")).removeAlpha().linear(1.12, 0).png().toBuffer();
  const lettre = await sharp(join(SOURCES, "lettre-2000.png")).modulate({ saturation: 1.12, brightness: 1.05 }).png().toBuffer();
  const ombre = await sharp(join(SOURCES, "ombre-2000.png")).png().toBuffer();
  const alphaOmbre = await sharp(ombre).extractChannel(3).raw().toBuffer();
  const ombreBleutee = await sharp({ create: { width: M, height: M, channels: 3, background: OMBRE_BLEUTEE } })
    .joinChannel(alphaOmbre, { raw: { width: M, height: M, channels: 1 } }).png().toBuffer();
  // Logo complet sur son fond noir (logo du site) et repérage : centre et « rayon » (point le plus éloigné)
  const surNoir = await sharp(decor).composite([{ input: ombre }, { input: lettre }]).png().toBuffer();
  // Repérage sur une copie réduite à 512 px (en 2000 px, les petites étoiles du fond sont assez
  // grosses pour passer pour une partie du logo), puis ramené à l'échelle 2000
  const r512 = await reperageDuLogo(sharp, await sharp(surNoir).resize(512, 512, { kernel: "lanczos3" }).png().toBuffer());
  const e = M / 512;
  const reperage = { x0: r512.x0 * e, y0: r512.y0 * e, x1: r512.x1 * e, y1: r512.y1 * e, rayon: r512.rayon * e };
  // Boîte de la lettre seule (version simplifiée de l'onglet)
  const a = await sharp(lettre).extractChannel(3).raw().toBuffer();
  let x0 = M, y0 = M, x1 = 0, y1 = 0;
  for (let i = 0; i < M * M; i++) if (a[i] > 127) { const x = i % M, y = (i / M) | 0; x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  couches = { decor, lettre, ombre, ombreBleutee, surNoir, reperage, boiteLettre: { x0, y0, x1, y1 } };
  return couches;
}

const fondNuit = (T, halo) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${T}" height="${T}"><defs>` +
  `<radialGradient id="g" cx="0.5" cy="0.36" r="0.78"><stop offset="0" stop-color="${NUIT[0]}"/><stop offset="1" stop-color="${NUIT[1]}"/></radialGradient>` +
  `<radialGradient id="h" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#2b4a8f" stop-opacity="0.55"/><stop offset="1" stop-color="#2b4a8f" stop-opacity="0"/></radialGradient>` +
  `</defs><rect width="${T}" height="${T}" fill="url(#g)"/>${halo ? `<circle cx="${T / 2}" cy="${T / 2}" r="${T * 0.42}" fill="url(#h)"/>` : ""}</svg>`);

// Une couche (déjà à la bonne taille) posée dans une toile T × T, coin en (left, top), le reste découpé.
// En deux temps : sharp découpe AVANT d'agrandir la toile si on enchaîne les deux.
async function placer(image, T, left, top) {
  const etendu = await sharp(image).extend({ top: T, left: T, bottom: T, right: T, background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  return sharp(etendu).extract({ left: T - left, top: T - top, width: T, height: T }).png().toBuffer();
}

// Logo du site : le logo complet sur son fond noir, même cadrage que l'original (carré plein)
export async function logoSurNoir(taille) {
  const { surNoir } = await lesCouches();
  return sharp(surNoir).resize(taille, taille, { kernel: "lanczos3" }).removeAlpha().png({ compressionLevel: 9 }).toBuffer();
}

// Logo du site SANS FOND (carré transparent, même cadrage) : la lettre et son ombre restent
// pleines ; les lumières deviennent transparentes là où elles étaient noires (transparence =
// luminosité, couleur ramenée à sa pleine valeur). Le logo « flotte » sur le site, sans bloc noir,
// et n'imprime pas de carré noir sur le papier.
// « recadre » : carré serré autour du logo (côté = 2,1 × rayon), pour les sceaux du site : sans le
// carré noir d'avant, le cadrage d'origine (grandes marges) faisait paraître le logo plus petit.
export async function logoTransparent(taille, { recadre = false } = {}) {
  const { decor, lettre, ombre, reperage: r } = await lesCouches();
  const rgb = await sharp(decor).removeAlpha().raw().toBuffer();
  const rvba = Buffer.alloc(M * M * 4);
  for (let i = 0; i < M * M; i++) {
    const a = Math.max(rgb[i * 3], rgb[i * 3 + 1], rgb[i * 3 + 2]);
    for (let c = 0; c < 3; c++) rvba[i * 4 + c] = a ? Math.min(255, Math.round((rgb[i * 3 + c] * 255) / a)) : 0;
    rvba[i * 4 + 3] = a;
  }
  const lumieres = await sharp(rvba, { raw: { width: M, height: M, channels: 4 } }).png().toBuffer();
  let image = await sharp(lumieres).composite([{ input: ombre }, { input: lettre }]).png().toBuffer();
  if (recadre) {
    const c = Math.round(2.1 * r.rayon);
    image = await placer(image, c, Math.round(c / 2 - (r.x0 + r.x1) / 2), Math.round(c / 2 - (r.y0 + r.y1) / 2));
  }
  return sharp(image).resize(taille, taille, { kernel: "lanczos3" }).png({ compressionLevel: 9 }).toBuffer();
}

// Logo pour l'IMPRESSION (papier blanc, sans fond) : lettre en noir doux, ombre en gris clair,
// lumières en gris moyen. Un filtre « gris + contraste » sur le logo en couleurs ferait disparaître
// l'or (il devient blanc sur le papier).
export async function logoImpression(taille) {
  const { decor, lettre, ombre } = await lesCouches();
  const teinter = async (alpha, couleur) => sharp({ create: { width: M, height: M, channels: 3, background: couleur } })
    .joinChannel(alpha, { raw: { width: M, height: M, channels: 1 } }).png().toBuffer();
  const luminosite = await sharp(decor).removeAlpha().greyscale().linear(1.3, 0).extractChannel(0).raw().toBuffer();
  const lumieres = await teinter(luminosite, "#7a7a7a");
  const ombreGrise = await teinter(await sharp(ombre).extractChannel(3).raw().toBuffer(), "#b8b8b8");
  const lettreNoire = await teinter(await sharp(lettre).extractChannel(3).raw().toBuffer(), "#1f1f1f");
  const image = await sharp(lumieres).composite([{ input: ombreGrise }, { input: lettreNoire }]).png().toBuffer();
  return sharp(image).resize(taille, taille, { kernel: "lanczos3" }).png({ compressionLevel: 9 }).toBuffer();
}

// Logo seul, recadré en carré autour de son centre (côté = 2 × rayon), sur fond noir (écrans de démarrage)
export async function logoRecadre(cote) {
  const { surNoir, reperage: r } = await lesCouches();
  const c = Math.round(2 * r.rayon), cx = (r.x0 + r.x1) / 2, cy = (r.y0 + r.y1) / 2;
  const carre = await placer(surNoir, c, Math.round(c / 2 - cx), Math.round(c / 2 - cy));
  return sharp(carre).flatten({ background: "#000000" }).resize(cote, cote, { kernel: "lanczos3" }).png().toBuffer();
}

// Icône de l'application (« Proposition ») : le logo agrandi sur fond bleu nuit, léger halo.
// « part » : distance du centre au point le plus éloigné du logo (pointe de l'orbite), en part du
// côté : 0,47 = grande (iPhone, ordinateur) ; 0,40 = « masquable » (Android : cercle sûr de 40 %).
export async function iconeApplication({ taille, part }) {
  const { decor, lettre, ombreBleutee, reperage: r } = await lesCouches();
  const T = Math.max(taille, 1024); // composée en grand, puis réduite
  const k = (part * T) / r.rayon;
  const cote = Math.round(M * k);
  const left = Math.round(T / 2 - ((r.x0 + r.x1) / 2) * k), top = Math.round(T / 2 - ((r.y0 + r.y1) / 2) * k);
  const taillee = async (img) => placer(await sharp(img).resize(cote, cote, { kernel: "lanczos3" }).png().toBuffer(), T, left, top);
  const image = await sharp(fondNuit(T, true)).composite([
    { input: await taillee(decor), blend: "screen" }, // les lumières brillent sur le bleu, le noir disparaît
    { input: await taillee(ombreBleutee) },
    { input: await taillee(lettre) },
  ]).png().toBuffer();
  // Icône pleine, sans transparence (recommandation d'Apple ; Android : « masquable » pleine)
  return sharp(image).resize(taille, taille, { kernel: "lanczos3" }).removeAlpha().png({ compressionLevel: 9 }).toBuffer();
}

// Version simplifiée (onglet du navigateur, petites cases du site, jusqu'à 48 px) : la lettre
// seule, grande, sur le fond bleu nuit, coins arrondis. Un logo détaillé ne se lit pas à 16 px.
export async function iconeOnglet(taille) {
  const { lettre, boiteLettre: b } = await lesCouches();
  const T = 512;
  const k = (0.8 * T) / (b.y1 - b.y0 + 1);
  const cote = Math.round(M * k);
  const left = Math.round(T / 2 - ((b.x0 + b.x1) / 2) * k), top = Math.round(T / 2 - ((b.y0 + b.y1) / 2) * k);
  // Un peu plus d'éclat qu'en grand : le violet reste lisible sur le bleu en très petit
  const l = await sharp(lettre).resize(cote, cote, { kernel: "lanczos3" }).modulate({ brightness: 1.12 }).png().toBuffer();
  const coins = Buffer.from(`<svg width="${T}" height="${T}"><rect width="${T}" height="${T}" rx="${T * 0.22}" fill="#fff"/></svg>`);
  const image = await sharp(fondNuit(T, false)).composite([{ input: await placer(l, T, left, top) }]).png().toBuffer();
  const arrondie = await sharp(image).ensureAlpha().composite([{ input: coins, blend: "dest-in" }]).png().toBuffer();
  return sharp(arrondie).resize(taille, taille, { kernel: "lanczos3" }).png({ compressionLevel: 9 }).toBuffer();
}
