/* eslint-disable no-console */ // outil en ligne de commande : son rôle est d'afficher un rapport
// ============================================================================
// N'KO NI LONKO — Sources HD du logo (24 octobre 2026)
// ============================================================================
// Le logo original est dans le Canva du propriétaire (« Votre texte de paragraphe », page 1,
// 2000 × 2000 px) : une image de décor (vague, orbite, étoiles) et la lettre N'Ko U+07D2, en texte,
// avec des effets Canva (dégradé, ombre) que Canva n'exporte PAS. Ce programme refait la lettre et
// son ombre à l'identique, en 2000 px, et écrit les trois couches dans scripts/logo/sources/ :
//   decor-2000.png   le décor exporté de Canva (copié tel quel) ;
//   lettre-2000.png  la lettre, dégradé violet → or (transparente autour) ;
//   ombre-2000.png   son ombre décalée (transparente autour).
// La lettre est dessinée dans la police Ebrima (Windows) : sa forme recouvre celle du logo à
// 98,6 %. Elle est copiée par programme (première lettre du nom N'Ko de la revue, public/manifest.json),
// jamais tapée. Placement, dégradé et ombre ont été MESURÉS sur l'ancien logo 512 px (24 octobre
// 2026 : le logo refait, réduit à 512 px, en diffère de 0,79 sur 255 en moyenne).
//
// Usage (une fois, ou si le logo change dans Canva) :
//   node scripts/logo/construire-sources.mjs <export PNG 2000 px de la page 1 du Canva>
// Ensuite : node scripts/icones/favicon.mjs puis node scripts/application/generer.mjs
// ============================================================================
import { spawn } from "node:child_process";
import { copyFileSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const PROJET = resolve(import.meta.dirname, "../..");
const sharp = createRequire(join(PROJET, "package.json"))("sharp");
const SOURCES = join(PROJET, "scripts/logo/sources");
const M = 2000;
// Mesures (pixels de la page 2000 × 2000) faites sur l'ancien logo
const BOITE_LETTRE = { x: 472.7, y: 457.1, w: 660.2, h: 884.7 }; // boîte de la lettre
const DECALAGE_OMBRE = 14 * (M / 512); // 14 px à 512, vers la droite et vers le bas
const COULEUR_OMBRE = "#665648";
const DEGRADE = ["#80359b", "#eabe3f"]; // de gauche à droite, sur la largeur de la lettre
const EBRIMA = "C:/Windows/Fonts/ebrima.ttf";

const exportCanva = process.argv[2];
if (!exportCanva || !existsSync(exportCanva)) throw new Error("Indiquer l'export PNG (2000 px) de la page 1 du Canva du logo.");
if (!existsSync(EBRIMA)) throw new Error(`Police Ebrima introuvable (${EBRIMA}).`);
const { width, height } = await sharp(exportCanva).metadata();
if (width !== M || height !== M) throw new Error(`L'export doit faire ${M} × ${M} px (reçu ${width} × ${height}).`);
const lettre = [...JSON.parse(readFileSync(join(PROJET, "public/manifest.json"), "utf8")).name][0];
if (lettre.codePointAt(0) !== 0x07d2) throw new Error("Première lettre du nom N'Ko inattendue : rien n'est écrit.");

// 1. La lettre dessinée par Chrome dans la police Ebrima, blanc sur noir, en très grand
const C = 2800;
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const port = 9400 + Math.floor(Math.random() * 400);
const profil = mkdtempSync(join(tmpdir(), "logo-"));
const chrome = spawn("C:/Program Files/Google/Chrome/Application/chrome.exe",
  ["--headless=new", "--disable-gpu", "--allow-file-access-from-files", `--remote-debugging-port=${port}`, `--user-data-dir=${profil}`, "about:blank"], { stdio: "ignore" });
let glyphe;
try {
  let v;
  for (let i = 0; i < 60 && !v; i++) { await pause(250); try { v = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json(); } catch { /* démarrage */ } }
  if (!v) throw new Error("Chrome ne répond pas");
  const ws = new WebSocket(v.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener("open", r, { once: true }));
  let id = 0;
  const attente = new Map();
  ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (m.id && attente.has(m.id)) { attente.get(m.id)(m); attente.delete(m.id); } });
  const envoyer = (method, params = {}, sessionId) => new Promise((r) => { const n = ++id; attente.set(n, r); ws.send(JSON.stringify({ id: n, method, params, ...(sessionId ? { sessionId } : {}) })); });
  const page = join(profil, "lettre.html");
  writeFileSync(page, `<!doctype html><html><head><meta charset="utf-8"><style>@font-face{font-family:P;src:url('${pathToFileURL(EBRIMA).href}')}
    html,body{margin:0;width:${C}px;height:${C}px;background:#000}div{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:1700px/1 P;color:#fff}</style>
    </head><body><div>&#x${lettre.codePointAt(0).toString(16)};</div></body></html>`);
  const { result: { targetId } } = await envoyer("Target.createTarget", { url: "about:blank" });
  const { result: { sessionId: s } } = await envoyer("Target.attachToTarget", { targetId, flatten: true });
  await envoyer("Emulation.setDeviceMetricsOverride", { width: C, height: C, deviceScaleFactor: 1, mobile: false }, s);
  await envoyer("Page.enable", {}, s);
  await envoyer("Page.navigate", { url: pathToFileURL(page).href }, s);
  await pause(2000);
  const png = Buffer.from((await envoyer("Page.captureScreenshot", { format: "png" }, s)).result.data, "base64");
  ws.close();
  const g = await sharp(png).greyscale().raw().toBuffer();
  let x0 = C, y0 = C, x1 = 0, y1 = 0;
  for (let i = 0; i < C * C; i++) if (g[i] > 127) { const x = i % C, y = (i / C) | 0; x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  if (x0 < 5 || y0 < 5 || x1 > C - 5 || y1 > C - 5) throw new Error("Lettre coupée");
  glyphe = await sharp(png).extract({ left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 }).greyscale().png().toBuffer();
} finally {
  chrome.kill();
  await pause(300);
  try { rmSync(profil, { recursive: true, force: true }); } catch { /* dossier gardé un instant */ }
}

// 2. Transparence de la lettre (et de l'ombre, décalée) dans la page 2000 × 2000.
// En deux temps : sharp découpe AVANT d'agrandir la toile si on enchaîne les deux.
async function transparence({ x, y, w, h }) {
  const g = await sharp(glyphe).resize(Math.round(w), Math.round(h), { kernel: "lanczos3", fit: "fill" }).extractChannel(0).raw().toBuffer();
  const etendu = await sharp(g, { raw: { width: Math.round(w), height: Math.round(h), channels: 1 } })
    .extend({ top: M, left: M, bottom: M, right: M, background: "#000000" }).extractChannel(0).raw().toBuffer({ resolveWithObject: true });
  return sharp(etendu.data, { raw: { width: etendu.info.width, height: etendu.info.height, channels: 1 } })
    .extract({ left: Math.round(M - x), top: Math.round(M - y), width: M, height: M }).extractChannel(0).raw().toBuffer();
}
const couleur = async (svg) => sharp(Buffer.from(svg)).removeAlpha().raw().toBuffer();
const rvba = (rgb, alpha) => sharp(rgb, { raw: { width: M, height: M, channels: 3 } }).joinChannel(alpha, { raw: { width: M, height: M, channels: 1 } }).png({ compressionLevel: 9 });
const b = BOITE_LETTRE;
await rvba(await couleur(`<svg xmlns="http://www.w3.org/2000/svg" width="${M}" height="${M}"><defs><linearGradient id="g" gradientUnits="userSpaceOnUse" x1="${b.x}" y1="0" x2="${b.x + b.w}" y2="0"><stop offset="0" stop-color="${DEGRADE[0]}"/><stop offset="1" stop-color="${DEGRADE[1]}"/></linearGradient></defs><rect width="${M}" height="${M}" fill="url(#g)"/></svg>`),
  await transparence(b)).toFile(join(SOURCES, "lettre-2000.png"));
await rvba(await couleur(`<svg xmlns="http://www.w3.org/2000/svg" width="${M}" height="${M}"><rect width="${M}" height="${M}" fill="${COULEUR_OMBRE}"/></svg>`),
  await transparence({ ...b, x: b.x + DECALAGE_OMBRE, y: b.y + DECALAGE_OMBRE })).toFile(join(SOURCES, "ombre-2000.png"));
copyFileSync(exportCanva, join(SOURCES, "decor-2000.png"));
console.log("Écrits : scripts/logo/sources/decor-2000.png, lettre-2000.png, ombre-2000.png");
