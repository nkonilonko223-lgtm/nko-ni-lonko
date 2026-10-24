/* eslint-disable no-console */ // outil en ligne de commande : son rôle est d'afficher un rapport
// ============================================================================
// N'KO NI LONKO — Icônes du site fabriquées depuis le logo (public/icon-512x512.png)
// ============================================================================
// Remplace l'icône par défaut de Next.js / Vercel (triangle noir), affichée jusqu'ici
// dans l'onglet et sur les cartes WhatsApp. Fabrique :
//   app/favicon.ico            16, 32 et 48 px (onglet, favoris) : version SIMPLIFIÉE du logo
//                              (les lettres seules sur fond bleu nuit, choix du propriétaire du
//                              24 octobre 2026 : aucun logo détaillé ne se lit à 16 px) ;
//                              dessin dans scripts/application/icone.mjs
//   public/application/onglet-192.png  la même en 192 px (Google, écrans très fins)
//   public/icon-192x192.png     192 px, le logo du site (menu, pied de page), vrai PNG
// L'icône de l'iPhone (public/apple-touch-icon.png) est celle de l'application :
// scripts/application/generer.mjs.
// Usage : node scripts/icones/favicon.mjs   (à relancer si le logo change)
// ============================================================================
import { writeFileSync } from "node:fs";
import sharp from "sharp";
import { SOURCE_LOGO as SOURCE } from "./logo.mjs";
import { iconeOnglet } from "../application/icone.mjs";

// Fichier .ico : un en-tête, une entrée de 16 octets par taille, puis les images PNG
const TAILLES_ICO = [16, 32, 48];
const pngs = await Promise.all(TAILLES_ICO.map(iconeOnglet));
const entete = Buffer.alloc(6 + 16 * pngs.length);
entete.writeUInt16LE(0, 0);
entete.writeUInt16LE(1, 2); // type 1 = icône
entete.writeUInt16LE(pngs.length, 4);
let position = entete.length;
pngs.forEach((png, i) => {
  const e = 6 + 16 * i;
  const t = TAILLES_ICO[i];
  entete.writeUInt8(t >= 256 ? 0 : t, e); // 0 veut dire 256
  entete.writeUInt8(t >= 256 ? 0 : t, e + 1);
  entete.writeUInt16LE(1, e + 4); // plans
  entete.writeUInt16LE(32, e + 6); // bits par pixel
  entete.writeUInt32LE(png.length, e + 8);
  entete.writeUInt32LE(position, e + 12);
  position += png.length;
});
writeFileSync("app/favicon.ico", Buffer.concat([entete, ...pngs]));
// Même version simplifiée en 192 px : onglets des écrans très fins, résultats de Google (qui
// prend l'icône de la page, multiple de 48 px)
writeFileSync("public/application/onglet-192.png", await iconeOnglet(192));
writeFileSync("public/icon-192x192.png", await sharp(SOURCE).resize(192, 192).png({ compressionLevel: 9 }).toBuffer());

console.log("Fabriqués : app/favicon.ico (16, 32, 48) et public/application/onglet-192.png (lettres du logo sur fond bleu nuit), public/icon-192x192.png (192).");
