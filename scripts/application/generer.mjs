/* eslint-disable no-console */ // outil en ligne de commande : son rôle est d'afficher un rapport
// ============================================================================
// N'KO NI LONKO — Fichiers de l'application du site (23 octobre 2026)
// ============================================================================
// Fabrique, depuis le logo (public/icon-512x512.png, jamais modifié) et les textes du site :
//   public/manifest.json, public/manifest-fr.json
//        « carte d'identité » de l'application, en N'Ko (adresses sans préfixe) et en français (/fr)
//   public/application/icone-192.png, -512.png, public/apple-touch-icon.png (180)
//        icône de l'application (choix du propriétaire, 24 octobre 2026 : le logo original agrandi
//        sur fond bleu nuit, scripts/application/icone.mjs) : iPhone, ordinateur, Android
//   public/application/icone-masquable-192.png, -512.png
//        même icône, version Android « masquable » : le téléphone la découpe (rond, goutte…), le
//        logo (pointe de l'orbite comprise) reste entier dans la zone sûre (cercle de 80 %)
//   public/application/raccourci-*.png
//        raccourcis (appui long sur l'icône) : Numéros, Lexique, Ma bibliothèque
//   public/application/demarrage/*.png + app/lib/ecrans-demarrage.json
//        écrans de démarrage de l'iPhone et de l'iPad (sinon : écran blanc à l'ouverture)
//   avec --captures [adresse] : public/application/captures/*.webp
//        captures du site montrées dans la fenêtre d'installation (Android, ordinateur) ;
//        sans l'option, les captures déjà faites sont gardées
// N'Ko jamais tapé : nom et description repris du manifeste N'Ko existant (rédaction), libellés
// repris de app/components/application/textes.ts. Rien n'est écrit dans Sanity.
//
// Usage : node scripts/application/generer.mjs [--captures [adresse]] [--article <slug>]
//   (adresse par défaut : https://www.nkonilonko.com ; article : le dernier publié)
// ============================================================================
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { SOURCE_LOGO, reperageDuLogo } from "../icones/logo.mjs";
import { iconeApplication } from "./icone.mjs";

const PROJET = resolve(import.meta.dirname, "../..");
const sharp = createRequire(join(PROJET, "package.json"))("sharp");
const T = await import(pathToFileURL(join(PROJET, "app/components/application/textes.ts")).href);
const FOND = "#02040a";
const OR = "#fbbf24";
const DOSSIER = join(PROJET, "public/application");
const LOGO = join(PROJET, SOURCE_LOGO);
const pause = (ms) => new Promise((r) => setTimeout(r, ms));

const args = process.argv.slice(2);
const option = (nom) => { const i = args.indexOf(nom); return i >= 0 ? args[i + 1] : undefined; };
const avecCaptures = args.includes("--captures");
const adresseCaptures = (option("--captures") && !option("--captures").startsWith("--") ? option("--captures") : "https://www.nkonilonko.com").replace(/[/]$/, "");
for (const d of ["", "demarrage", "captures"]) mkdirSync(join(DOSSIER, d), { recursive: true });

// --- Google Chrome sans fenêtre, piloté (raccourcis et captures) ---------------------------
const CHROME = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
].find((c) => c && existsSync(c));
if (!CHROME) throw new Error("Chrome ou Edge introuvable (indiquer son chemin dans CHROME_PATH).");

async function ouvrirChrome() {
  const port = 9400 + Math.floor(Math.random() * 400);
  const profil = mkdtempSync(join(tmpdir(), "application-"));
  const chrome = spawn(CHROME, ["--headless=new", "--disable-gpu", "--hide-scrollbars", `--remote-debugging-port=${port}`, `--user-data-dir=${profil}`, "about:blank"], { stdio: "ignore" });
  let version;
  for (let i = 0; i < 60 && !version; i++) { await pause(250); try { version = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json(); } catch { /* démarrage */ } }
  if (!version) throw new Error("Chrome ne répond pas");
  const ws = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener("open", r, { once: true }));
  let id = 0;
  const attente = new Map();
  const ecouteurs = new Set();
  ws.addEventListener("message", (e) => {
    const m = JSON.parse(e.data);
    if (m.id && attente.has(m.id)) { attente.get(m.id)(m); attente.delete(m.id); } else for (const f of ecouteurs) f(m);
  });
  const envoyer = (method, params = {}, sessionId) => new Promise((r) => {
    const n = ++id; attente.set(n, r); ws.send(JSON.stringify({ id: n, method, params, ...(sessionId ? { sessionId } : {}) }));
  });
  // Nouvel onglet aux dimensions demandées ; « ouvrir » attend la fin du chargement
  const onglet = async ({ largeur, hauteur, echelle = 1, mobile = false }) => {
    const { result: { targetId } } = await envoyer("Target.createTarget", { url: "about:blank" });
    const { result: { sessionId } } = await envoyer("Target.attachToTarget", { targetId, flatten: true });
    await envoyer("Page.enable", {}, sessionId);
    await envoyer("Emulation.setDeviceMetricsOverride", { width: largeur, height: hauteur, deviceScaleFactor: echelle, mobile }, sessionId);
    if (mobile) await envoyer("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 }, sessionId);
    const ouvrir = async (url) => {
      const charge = new Promise((r) => {
        const f = (m) => { if (m.sessionId === sessionId && m.method === "Page.loadEventFired") { ecouteurs.delete(f); r(); } };
        ecouteurs.add(f);
        setTimeout(() => { ecouteurs.delete(f); r(); }, 45000);
      });
      await envoyer("Page.navigate", { url }, sessionId);
      await charge;
    };
    const evaluer = async (expression) => (await envoyer("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }, sessionId)).result?.result?.value;
    const photo = async () => Buffer.from((await envoyer("Page.captureScreenshot", { format: "png" }, sessionId)).result.data, "base64");
    const fermer = () => envoyer("Target.closeTarget", { targetId });
    return { sessionId, ouvrir, evaluer, photo, fermer };
  };
  const quitter = async () => {
    ws.close();
    chrome.kill();
    await pause(500);
    try { rmSync(profil, { recursive: true, force: true }); } catch { /* Chrome garde parfois le dossier quelques instants */ }
  };
  return { envoyer, onglet, quitter };
}

// --- 1. Icône de l'application ---------------------------------------------------------------
// Grande (iPhone, ordinateur) : la pointe de l'orbite à 47 % du côté. Masquable (Android, qui
// découpe l'icône en rond, goutte…) : à 40 %, dans le cercle sûr. Voir scripts/application/icone.mjs.
for (const taille of [192, 512]) {
  writeFileSync(join(DOSSIER, `icone-${taille}.png`), await iconeApplication({ taille, part: 0.47 }));
  writeFileSync(join(DOSSIER, `icone-masquable-${taille}.png`), await iconeApplication({ taille, part: 0.4 }));
}
writeFileSync(join(PROJET, "public/apple-touch-icon.png"), await iconeApplication({ taille: 180, part: 0.47 }));
console.log("Icône de l'application : 192 et 512 px (grande et masquable), iPhone 180 px.");

// --- Repérage du logo (écrans de démarrage) ------------------------------------------------
const { x0, y0, x1, y1, rayon } = await reperageDuLogo(sharp, LOGO);
// Carré centré sur le logo, de côté « cote » (pixels de l'image d'origine), complété de noir
// (le fond du logo) s'il dépasse les bords
async function carreDuLogo(cote) {
  const P = Math.ceil(cote);
  const etendu = await sharp(LOGO).flatten({ background: "#000000" }).extend({ top: P, bottom: P, left: P, right: P, background: "#000000" }).toBuffer();
  return sharp(etendu).extract({
    left: Math.round((x0 + x1) / 2 + P - cote / 2),
    top: Math.round((y0 + y1) / 2 + P - cote / 2),
    width: Math.round(cote),
    height: Math.round(cote),
  });
}
// --- 2. Écrans de démarrage de l'iPhone et de l'iPad ----------------------------------------
// Sans eux, une application ajoutée à l'écran d'accueil s'ouvre sur un écran BLANC (le site est
// sombre). Une image par taille d'écran : fond du site et logo au centre.
// [largeur, hauteur en points, densité, appareils]
const ECRANS = [
  [440, 956, 3, "iPhone 16 Pro Max, 17 Pro Max"],
  [430, 932, 3, "iPhone 14 Pro Max, 15 Plus, 15 Pro Max, 16 Plus"],
  [428, 926, 3, "iPhone 12 Pro Max, 13 Pro Max, 14 Plus"],
  [420, 912, 3, "iPhone Air"],
  [414, 896, 3, "iPhone XS Max, 11 Pro Max"],
  [414, 896, 2, "iPhone XR, 11"],
  [414, 736, 3, "iPhone 6 Plus à 8 Plus"],
  [402, 874, 3, "iPhone 16 Pro, 17, 17 Pro"],
  [393, 852, 3, "iPhone 14 Pro, 15, 15 Pro, 16"],
  [390, 844, 3, "iPhone 12, 13, 14, 16e"],
  [375, 812, 3, "iPhone X, XS, 11 Pro, 12 mini, 13 mini"],
  [375, 667, 2, "iPhone 6 à 8, SE (2ᵉ et 3ᵉ générations)"],
  [1032, 1376, 2, "iPad Pro 13 pouces (M4)"],
  [1024, 1366, 2, "iPad Pro 12,9 pouces, iPad Air 13 pouces"],
  [834, 1210, 2, "iPad Pro 11 pouces (M4)"],
  [834, 1194, 2, "iPad Pro 11 pouces, iPad Air 11 pouces"],
  [834, 1112, 2, "iPad Pro 10,5 pouces, iPad Air (3ᵉ génération)"],
  [820, 1180, 2, "iPad Air (4ᵉ et 5ᵉ générations), iPad (10ᵉ génération)"],
  [810, 1080, 2, "iPad (7ᵉ à 9ᵉ générations)"],
  [768, 1024, 2, "iPad mini (jusqu'à la 5ᵉ génération), iPad 9,7 pouces"],
  [744, 1133, 2, "iPad mini (6ᵉ génération et suivantes)"],
];
const logoSeul = await (await carreDuLogo(2 * rayon)).png().toBuffer();
const ecrans = [];
for (const [l, h, d, appareils] of ECRANS) {
  const orientations = l >= 700 ? ["portrait", "landscape"] : ["portrait"]; // iPad : les deux sens
  for (const orientation of orientations) {
    const [lp, hp] = orientation === "portrait" ? [l * d, h * d] : [h * d, l * d];
    const cote = Math.round(Math.min(lp, hp) * 0.36);
    // « screen » : le fond noir du logo se fond dans le fond du site
    const logo = await sharp(logoSeul).resize(cote, cote).toBuffer();
    const png = await sharp({ create: { width: lp, height: hp, channels: 3, background: FOND } })
      .composite([{ input: logo, left: Math.round((lp - cote) / 2), top: Math.round((hp - cote) / 2), blend: "screen" }])
      .png({ palette: true, quality: 95, effort: 10, compressionLevel: 9 }) // 4 fois plus léger, sans différence visible
      .toBuffer();
    const nom = `${lp}x${hp}.png`;
    writeFileSync(join(DOSSIER, "demarrage", nom), png);
    ecrans.push({
      url: `/application/demarrage/${nom}`,
      media: `(device-width: ${l}px) and (device-height: ${h}px) and (-webkit-device-pixel-ratio: ${d}) and (orientation: ${orientation})`,
      appareils,
    });
  }
}
writeFileSync(join(PROJET, "app/lib/ecrans-demarrage.json"), JSON.stringify(ecrans, null, 2) + "\n", "utf8");
console.log(`Écrans de démarrage : ${ecrans.length} images (iPhone, iPad portrait et paysage) + app/lib/ecrans-demarrage.json.`);

// --- 3. Raccourcis (appui long sur l'icône) -------------------------------------------------
// Icône Phosphor du site (police auto-hébergée), dorée sur le fond bleu nuit de l'icône, dans la zone sûre.
const css = readFileSync(join(PROJET, "app/icones-phosphor.css"), "utf8");
const glyphe = (icone) => {
  const m = css.match(new RegExp(`[.]ph-bold[.]${icone}:before \\{\\s*content: "\\\\([0-9a-f]+)"`));
  if (!m) throw new Error(`icône absente de app/icones-phosphor.css : ${icone}`);
  return m[1];
};
const RACCOURCIS = [
  { nom: "numeros", icone: "ph-books", texte: T.NUMEROS, chemin: "/numeros" },
  { nom: "lexique", icone: "ph-book-open", texte: T.LEXIQUE, chemin: "/lexique" },
  { nom: "bibliotheque", icone: "ph-bookmark-simple", texte: T.MA_BIBLIOTHEQUE, chemin: "/bibliotheque" },
];
const police = readFileSync(join(PROJET, "public/icones/Phosphor-Bold.woff2")).toString("base64");
const chrome = await ouvrirChrome();
try {
  for (const r of RACCOURCIS) {
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>
      @font-face { font-family: "PhosphorBold"; src: url(data:font/woff2;base64,${police}) format("woff2"); }
      html, body { margin: 0; width: 192px; height: 192px; background: radial-gradient(circle at 50% 36%, #16264a, #050a18 78%); }
      body { display: flex; align-items: center; justify-content: center; }
      i { font-family: "PhosphorBold"; font-style: normal; font-size: 92px; line-height: 1; color: ${OR}; }
    </style></head><body><i>&#x${glyphe(r.icone)};</i></body></html>`;
    const o = await chrome.onglet({ largeur: 192, hauteur: 192 });
    await o.ouvrir(`data:text/html;base64,${Buffer.from(html).toString("base64")}`);
    if (!(await o.evaluer(`document.fonts.ready.then(() => document.fonts.check('92px "PhosphorBold"'))`))) throw new Error(`police d'icônes non chargée (${r.nom})`);
    writeFileSync(join(DOSSIER, `raccourci-${r.nom}.png`), await sharp(await o.photo()).png({ compressionLevel: 9 }).toBuffer());
    await o.fermer();
  }
  console.log(`Raccourcis : ${RACCOURCIS.map((r) => r.nom).join(", ")} (192 px).`);

  // --- 4. Captures du site (option --captures) ---------------------------------------------
  // Téléphone : 360 × 740 points × 3 = 1080 × 2220 ; ordinateur : 1280 × 720 × 1,5 = 1920 × 1080.
  // Animations réduites (prefers-reduced-motion) et choix de langue déjà fait (pas de fenêtre).
  if (avecCaptures) {
    const REQUETE = '*[_type == "article" && !(_id in path("drafts.**")) && defined(mainImage)] | order(publishedAt desc)[0].slug.current';
    const slug = option("--article")
      || (await (await fetch(`https://yfsyhc2p.apicdn.sanity.io/v2025-02-19/data/query/production?query=${encodeURIComponent(REQUETE)}`)).json()).result;
    // « defilement » : la capture montre la page plus bas (en hauteurs d'écran)
    const PAGES = [
      { nom: "1-accueil", chemin: "/", formats: ["etroit", "large"] },
      { nom: "2-article", chemin: `/article/${slug}`, formats: ["etroit", "large"] },
      { nom: "3-lecture", chemin: `/article/${slug}`, defilement: 1.3, formats: ["etroit"] },
    ];
    const FORMATS = { etroit: { largeur: 360, hauteur: 740, echelle: 3, mobile: true }, large: { largeur: 1280, hauteur: 720, echelle: 1.5, mobile: false } };
    for (const f of readdirSync(join(DOSSIER, "captures"))) rmSync(join(DOSSIER, "captures", f));
    for (const langue of ["nqo", "fr"]) {
      for (const p of PAGES) {
        for (const format of p.formats) {
          const o = await chrome.onglet(FORMATS[format]);
          await chrome.envoyer("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] }, o.sessionId);
          // Choix de langue déjà fait ; pas de bouton « Installer » sur la capture (Chrome le propose ici)
          await chrome.envoyer("Page.addScriptToEvaluateOnNewDocument", {
            source: `try { localStorage.setItem("preferred-lang", ${JSON.stringify(langue === "fr" ? "fr" : "nko")}); } catch (e) {}
              window.addEventListener("beforeinstallprompt", (e) => e.stopImmediatePropagation(), true);`,
          }, o.sessionId);
          await o.ouvrir(adresseCaptures + (langue === "fr" ? (p.chemin === "/" ? "/fr" : `/fr${p.chemin}`) : p.chemin));
          await o.evaluer("document.fonts.ready.then(() => new Promise((r) => setTimeout(r, 6000)))");
          await o.evaluer(`window.scrollTo(0, Math.round(innerHeight * ${p.defilement || 0}))`);
          await o.evaluer("new Promise((r) => setTimeout(r, 2000))");
          const nom = `${langue}-${format}-${p.nom}.webp`;
          writeFileSync(join(DOSSIER, "captures", nom), await sharp(await o.photo()).webp({ quality: 80 }).toBuffer());
          await o.fermer();
          console.log(`Capture : ${nom}`);
        }
      }
    }
  }
} finally {
  await chrome.quitter();
}

// --- 5. Manifestes (N'Ko et français) -------------------------------------------------------
// Deux applications distinctes (« id » différent) : chacune s'ouvre dans sa langue et garde ses
// libellés ; aucune ne peut remplacer l'autre lors d'une mise à jour. Pas d'orientation imposée
// (tablettes en paysage, critère d'accessibilité WCAG 1.3.4).
const actuel = JSON.parse(readFileSync(join(PROJET, "public/manifest.json"), "utf8"));
// Légendes des captures (manifeste français ; le N'Ko viendra de la rédaction, s'il est demandé)
const LEGENDES = {
  "1-accueil": "Accueil de la revue",
  "2-article": "Un article, en N'Ko et en français",
  "3-lecture": "La lecture : le N'Ko d'abord, puis le français",
};
const captures = async (langue) => {
  const liste = [];
  for (const format of ["etroit", "large"]) {
    for (const f of readdirSync(join(DOSSIER, "captures")).filter((n) => n.startsWith(`${langue}-${format}-`)).sort()) {
      const { width, height } = await sharp(join(DOSSIER, "captures", f)).metadata();
      const nom = f.replace(`${langue}-${format}-`, "").replace(".webp", "");
      liste.push({
        src: `/application/captures/${f}`,
        sizes: `${width}x${height}`,
        type: "image/webp",
        form_factor: format === "etroit" ? "narrow" : "wide",
        ...(langue === "fr" && LEGENDES[nom] ? { label: LEGENDES[nom] } : {}),
      });
    }
  }
  return liste;
};
const ICONES = [
  { src: "/application/icone-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
  { src: "/application/icone-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
  { src: "/application/icone-masquable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
  { src: "/application/icone-masquable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
];
const manifeste = async (langue) => {
  const fr = langue === "fr";
  const prefixe = fr ? "/fr" : "";
  return {
    id: fr ? "/fr" : "/",
    name: fr ? "N'Ko ni Lonko" : actuel.name,
    short_name: fr ? "N'Ko ni Lonko" : actuel.short_name,
    description: fr ? "Revue scientifique bilingue N'Ko – français. Lecture en plein écran, même sans connexion." : actuel.description,
    lang: fr ? "fr" : "nqo",
    dir: fr ? "ltr" : "rtl",
    start_url: fr ? "/fr" : "/",
    scope: "/",
    display: "standalone",
    background_color: FOND,
    theme_color: FOND,
    categories: ["education", "magazines", "news"],
    // Un lien ou un raccourci ouvert alors que l'application l'est déjà : même fenêtre
    launch_handler: { client_mode: ["navigate-existing", "auto"] },
    icons: ICONES,
    shortcuts: RACCOURCIS.map((r) => ({
      name: fr ? r.texte.fr : r.texte.nko,
      url: prefixe + r.chemin,
      icons: [
        { src: `/application/raccourci-${r.nom}.png`, sizes: "192x192", type: "image/png", purpose: "any" },
        { src: `/application/raccourci-${r.nom}.png`, sizes: "192x192", type: "image/png", purpose: "maskable" },
      ],
    })),
    screenshots: await captures(fr ? "fr" : "nqo"),
  };
};
for (const [langue, fichier] of [["nqo", "manifest.json"], ["fr", "manifest-fr.json"]]) {
  const m = await manifeste(langue);
  for (const s of m.shortcuts) if (!s.name) throw new Error(`raccourci sans nom (${langue}) : ${s.url}`);
  writeFileSync(join(PROJET, "public", fichier), JSON.stringify(m, null, 2) + "\n", "utf8");
  console.log(`public/${fichier} : ${m.icons.length} icônes, ${m.shortcuts.length} raccourcis, ${m.screenshots.length} captures.`);
}
