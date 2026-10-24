/* eslint-disable no-console */ // outil en ligne de commande : son rôle est d'afficher un rapport
// ============================================================================
// N'KO NI LONKO — Logos du site, depuis le logo HD (scripts/logo/logo.mjs)
// ============================================================================
// Harmonisation des logos (feu vert du propriétaire, 24 octobre 2026) : le même logo partout,
// refait en haute définition depuis le Canva du propriétaire, avec les mêmes retouches fines.
// Fabrique :
//   public/icon-512x512.png, public/icon-192x192.png
//        le logo du site SANS FOND, cadrage d'origine (filigrane du pied de page, images de citation
//        et de partage, données Google, flux RSS) : il flotte sur le fond, sans carré noir
//   public/logo/logo-sceau.png
//        le même, sans fond, recadré serré autour du logo : sceaux du menu, de la fenêtre de langue
//        et de fin d'article (il remplit sa case, comme le faisait l'ancien carré noir)
//   public/logo/logo-impression.png
//        version grise pour le papier (en-tête des articles imprimés)
//   app/favicon.ico (16, 32, 48) et public/application/onglet-192.png
//        version SIMPLIFIÉE (la lettre sur fond bleu nuit) : onglet, favoris, résultats de Google,
//        petites cases du site (en-tête, pied de page) ; aucun logo détaillé ne se lit sous 48 px
// L'icône de l'application (et de l'iPhone) : scripts/application/generer.mjs.
// Usage : node scripts/icones/favicon.mjs   (à relancer si le logo change)
// ============================================================================
import { mkdirSync, writeFileSync } from "node:fs";
import { iconeOnglet, logoImpression, logoTransparent } from "../logo/logo.mjs";

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
// Même version simplifiée en 192 px : petites cases du site, écrans très fins, Google (multiple de 48 px)
writeFileSync("public/application/onglet-192.png", await iconeOnglet(192));
writeFileSync("public/icon-512x512.png", await logoTransparent(512));
writeFileSync("public/icon-192x192.png", await logoTransparent(192));
mkdirSync("public/logo", { recursive: true });
writeFileSync("public/logo/logo-sceau.png", await logoTransparent(384, { recadre: true }));
writeFileSync("public/logo/logo-impression.png", await logoImpression(256));

console.log("Fabriqués : app/favicon.ico (16, 32, 48), public/application/onglet-192.png (version simplifiée), " +
  "public/icon-512x512.png et icon-192x192.png (logo sans fond), public/logo/logo-sceau.png (sceaux), public/logo/logo-impression.png (papier).");
