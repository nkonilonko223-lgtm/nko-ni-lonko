/* eslint-disable no-console */ // outil en ligne de commande : son rôle est d'afficher un rapport
// ============================================================================
// N'KO NI LONKO — Icônes Phosphor auto-hébergées (sous-ensemble) — 18 octobre 2026
// ============================================================================
// Produit app/icones-phosphor.css et public/icones/*.woff2 avec SEULEMENT les icônes
// utilisées par le site (dans les 4 épaisseurs : normale, gras, plein, bicolore).
// Remplace le script unpkg + jsdelivr qui chargeait ~1 500 icônes (6 feuilles de style,
// polices de 130 à 165 Ko). Le code HTML ne change pas : <i class="ph-bold ph-…">.
//
// À relancer après l'ajout d'une NOUVELLE icône dans le code :
//   PYTHON=<python avec fontTools et brotli> node scripts/icones/generer-icones.mjs
//   (pip install fonttools brotli)
// Source : @phosphor-icons/web 2.1.2 (licence MIT), fichiers vérifiés par empreinte SHA-256.
// ============================================================================

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const RACINE = process.cwd();
const PYTHON = process.env.PYTHON || "python";
const BASE = "https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.2/";

// [dossier, feuille de style, police, empreinte CSS, empreinte police]
const EPAISSEURS = [
  ["regular", "style.css", "Phosphor.woff2", "873761b8711147dc516b6102936e9ad005f3a3015349efcde1a496f0326f1051", "c2ea45ea05ff5c7df1936770c104725f2a68f43fd343f35f3da23a30b27de32a"],
  ["bold", "style.css", "Phosphor-Bold.woff2", "c8a32df67f8bd57f70c6371e15ec232df25ddeba3eb9060d7aaa68101a6ce240", "2153b52cea9e06fc0cc8496048be485b381a0f8bf130adea5a9756fc8f100b87"],
  ["fill", "style.css", "Phosphor-Fill.woff2", "555980683a582c1910a954648b4ae38f58d76e797f02bfdc2c5e817901e6d4fc", "660bd6045c0e0d9756cddb8ba2ece3aad855df7d4a170ef23f7b1c0bf511c430"],
  ["duotone", "style.css", "Phosphor-Duotone.woff2", "fc6d37f7f0f7ffdcdf714c54181fdd27911969e4737d3151b972d4b806e5ae5d", "93d163cd4b1f07736d34bfef80803646ab0322efa947a98e3973a1450e3d20cc"],
];
const LICENCE_SHA = "687fbe52d0eb5c2353eca27a4037e889145ee0b584d3b1abf67581c4a4a4e47c";

const sha256 = (b) => createHash("sha256").update(b).digest("hex");
async function telecharger(chemin, empreinte) {
  const b = Buffer.from(await (await fetch(BASE + chemin)).arrayBuffer());
  if (sha256(b) !== empreinte) throw new Error(`Empreinte inattendue pour ${chemin} : fichier refusé`);
  return b;
}

// 1) Icônes utilisées dans le code (y compris les noms construits)
const fichiers = [];
const parcourir = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) parcourir(p); else if (/[.]tsx?$/.test(f)) fichiers.push(p); } };
parcourir(join(RACINE, "app"));
const EPAISSEURS_CLASSES = new Set(["ph-bold", "ph-fill", "ph-duotone", "ph-thin", "ph-light", "ph-regular"]);
const icones = new Set();
for (const f of fichiers) {
  const t = readFileSync(f, "utf8");
  for (const m of t.matchAll(/(?<![a-z0-9-])ph-[a-z0-9]+(?:-[a-z0-9]+)*/g)) if (!EPAISSEURS_CLASSES.has(m[0])) icones.add(m[0].slice(3));
  for (const m of t.matchAll(/icon: ?["']([a-z0-9-]+)["']/g)) icones.add(m[1].replace(/^ph-/, ""));
}
// Logos des réseaux des auteurs : « ph-<plateforme>-logo » (liste fermée du schéma auteur)
const auteur = readFileSync(join(RACINE, "sanity/schemas/author.ts"), "utf8");
const blocPlateformes = auteur.slice(auteur.indexOf("name: 'platform'"), auteur.indexOf("name: 'url'"));
for (const m of blocPlateformes.matchAll(/value: '([a-z]+)'/g)) icones.add(`${m[1]}-logo`);

// 2) Pour chaque épaisseur : règles gardées, sous-ensemble de la police
const regle = new RegExp("([^{}]+)[{]([^{}]*)[}]", "g");
const selecteurIcone = new RegExp("^[.]ph(-bold|-fill|-duotone)?[.]ph-([a-z0-9-]+):(before|after)$");
const travail = mkdtempSync(join(tmpdir(), "icones-"));
const sortieCss = [];
const absentes = new Set(icones);
mkdirSync(join(RACINE, "public/icones"), { recursive: true });
try {
  for (const [dossier, css, police, shaCss, shaPolice] of EPAISSEURS) {
    const texte = (await telecharger(`src/${dossier}/${css}`, shaCss)).toString("utf8");
    writeFileSync(join(travail, police), await telecharger(`src/${dossier}/${police}`, shaPolice));
    const gardees = [];
    const codes = new Set();
    for (const [, selecteurBrut, corps] of texte.matchAll(regle)) {
      const selecteur = selecteurBrut.trim();
      if (selecteur === "@font-face") {
        const famille = (corps.match(/font-family: ?"([^"]+)"/) || [])[1];
        gardees.push(`@font-face {\n  font-family: "${famille}";\n  src: url("/icones/${police}") format("woff2");\n  font-weight: normal;\n  font-style: normal;\n  font-display: block;\n}`);
        continue;
      }
      const m = selecteur.match(selecteurIcone);
      if (!m) {
        if (/^[.]ph(-bold|-fill|-duotone)?$/.test(selecteur)) gardees.push(`${selecteur} {${corps}}`); // classe de base
        continue;
      }
      if (!icones.has(m[2])) continue;
      absentes.delete(m[2]);
      gardees.push(`${selecteur} {${corps}}`);
      const debut = corps.indexOf('content: "') + 'content: "'.length;
      const valeur = corps.slice(debut, corps.indexOf('"', debut));
      codes.add(parseInt(valeur.charCodeAt(0) === 92 ? valeur.slice(1) : valeur, 16));
    }
    const unicodes = [...codes].map((c) => "U+" + c.toString(16).toUpperCase()).join(",");
    execFileSync(PYTHON, ["-m", "fontTools.subset", join(travail, police), `--unicodes=${unicodes}`, "--flavor=woff2",
      `--output-file=${join(RACINE, "public/icones", police)}`], { stdio: "inherit" });
    sortieCss.push(`/* ---- ${dossier} : ${codes.size} glyphes ---- */\n` + gardees.join("\n"));
    console.log(`${dossier.padEnd(8)} ${String(codes.size).padStart(3)} glyphes, police ${statSync(join(RACINE, "public/icones", police)).size} octets (origine ${statSync(join(travail, police)).size})`);
  }
  writeFileSync(join(RACINE, "public/icones/LICENSE-phosphor.txt"), await telecharger("LICENSE", LICENCE_SHA));
} finally {
  rmSync(travail, { recursive: true, force: true });
}

const entete = `/* ============================================================================
   Icônes Phosphor 2.1.2 (licence MIT, public/icones/LICENSE-phosphor.txt), AUTO-HÉBERGÉES.
   FICHIER GÉNÉRÉ par scripts/icones/generer-icones.mjs — ne pas modifier à la main :
   relancer le générateur après l'ajout d'une nouvelle icône dans le code.
   ${icones.size} icônes trouvées dans le code.
   ============================================================================ */\n`;
writeFileSync(join(RACINE, "app/icones-phosphor.css"), entete + sortieCss.join("\n\n") + "\n", "utf8");
console.log(`Icônes trouvées dans le code : ${icones.size}`);
console.log(`Absentes de Phosphor (n'ont jamais pu s'afficher) : ${[...absentes].join(", ") || "aucune"}`);
