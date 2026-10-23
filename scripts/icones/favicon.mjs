/* eslint-disable no-console */ // outil en ligne de commande : son rôle est d'afficher un rapport
// ============================================================================
// N'KO NI LONKO — Icônes du site fabriquées depuis le logo (public/icon-512x512.png)
// ============================================================================
// Remplace l'icône par défaut de Next.js / Vercel (triangle noir), affichée jusqu'ici
// dans l'onglet et sur les cartes WhatsApp. Fabrique :
//   app/favicon.ico            16, 32 et 48 px (onglet, favoris ; les grandes tailles sont les PNG 192 et 512)
//   public/apple-touch-icon.png 180 px (écran d'accueil de l'iPhone)
//   public/icon-192x192.png     192 px, vrai PNG (c'était un JPEG nommé .png)
// Les petites icônes sont cadrées sur le logo (les étoiles isolées du fond sont ignorées)
// pour rester lisibles ; l'icône 192 garde l'image entière, comme l'icône 512.
// Usage : node scripts/icones/favicon.mjs   (à relancer si le logo change)
// ============================================================================
import { writeFileSync } from "node:fs";
import sharp from "sharp";
import { SOURCE_LOGO as SOURCE, reperageDuLogo } from "./logo.mjs";

// Zone du logo (outil partagé avec scripts/application/generer.mjs)
const { W, H, x0, y0, x1, y1 } = await reperageDuLogo(sharp, SOURCE);
// Carré centré sur le logo, avec une petite marge (12 %)
const cote = Math.min(W, H, Math.round(Math.max(x1 - x0, y1 - y0) * 1.12));
const left = Math.min(W - cote, Math.max(0, Math.round((x0 + x1 - cote) / 2)));
const top = Math.min(H - cote, Math.max(0, Math.round((y0 + y1 - cote) / 2)));
const cadre = { left, top, width: cote, height: cote };
const recadree = (taille) => sharp(SOURCE).extract(cadre).resize(taille, taille).png({ compressionLevel: 9 }).toBuffer();

// Fichier .ico : un en-tête, une entrée de 16 octets par taille, puis les images PNG
const TAILLES_ICO = [16, 32, 48];
const pngs = await Promise.all(TAILLES_ICO.map(recadree));
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
writeFileSync("public/apple-touch-icon.png", await recadree(180));
writeFileSync("public/icon-192x192.png", await sharp(SOURCE).resize(192, 192).png({ compressionLevel: 9 }).toBuffer());

console.log(`Logo repéré : (${x0}, ${y0}) → (${x1}, ${y1}) ; cadre ${cote} px à (${left}, ${top}).`);
console.log("Fabriqués : app/favicon.ico (16, 32, 48), public/apple-touch-icon.png (180), public/icon-192x192.png (192).");
