// ============================================================================
// N'KO NI LONKO — Image d'un passage choisi par le lecteur (A6), dessinée dans le navigateur
// ============================================================================
// Le navigateur lie les lettres N'Ko (même moteur que pour la page) : l'image est juste.
// Format 1080 × 1350 (WhatsApp, Instagram). Rien n'est envoyé : le lecteur partage ou enregistre.
// Aucun N'Ko écrit ici : le passage vient de l'article, le nom du site du dictionnaire N'Ko.
// ============================================================================

export type ParametresImage = {
  texte: string; // passage choisi
  nko: boolean; // le passage est en N'Ko (droite à gauche, police Kigelia)
  titreNko: string;
  titreFr: string | null;
  nomNko: string; // nom du site en N'Ko (app/messages/nko.json)
  guillemets?: boolean; // faux pour une définition du lexique (ce n'est pas une citation)
  enTete?: { nko: string; fr: string | null }; // en grand, en haut (ex. le terme du lexique)
};

// Libellé du bouton (article et lexique). N'Ko : L13 (rédaction, 23 octobre 2026 ; copié tel quel par programme)
export const PARTAGER_IMAGE = { nko: "ߊ߬ ߟߊߖߍ߲ߛߍ߲߫ ߖߌ߬ߦߊ߬ߓߍ ߞߍߢߊ ߘߐ߫", fr: "Partager en image" };

// Partage le fichier (téléphone : WhatsApp, Instagram…) ou, à défaut, le télécharge
export async function partagerImage(blob: Blob, nomFichier: string, adresse: string) {
  const fichier = new File([blob], nomFichier, { type: "image/png" });
  if (navigator.canShare?.({ files: [fichier] })) {
    await navigator.share({ files: [fichier], text: adresse }).catch(() => undefined);
    return;
  }
  const lien = document.createElement("a");
  lien.href = URL.createObjectURL(blob);
  lien.download = fichier.name;
  lien.click();
  setTimeout(() => URL.revokeObjectURL(lien.href), 1000);
}

const L = 1080, H = 1350, MARGE = 110;
const OR = "#fbbf24";

const chargerImage = (src: string) =>
  new Promise<HTMLImageElement>((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = ko; i.src = src; });

// Familles de polices du site (next/font, variables posées sur <body>) : Kigelia pour le N'Ko, Montserrat pour le français
function polices() {
  const style = getComputedStyle(document.body);
  const kigelia = style.getPropertyValue("--font-kigelia").trim() || "sans-serif";
  const francais = style.getPropertyValue("--font-fr").trim() || "sans-serif";
  return { kigelia, francais };
}

// Coupe un texte en lignes qui tiennent dans la largeur (les mots restent dans l'ordre du texte)
function couper(ctx: CanvasRenderingContext2D, texte: string, largeur: number) {
  const lignes: string[] = [];
  let ligne = "";
  for (const mot of texte.split(/\s+/).filter(Boolean)) {
    const essai = ligne ? `${ligne} ${mot}` : mot;
    if (ctx.measureText(essai).width > largeur && ligne) { lignes.push(ligne); ligne = mot; } else ligne = essai;
  }
  if (ligne) lignes.push(ligne);
  return lignes;
}

// Écrit des lignes à droite (N'Ko) ou à gauche (français) ; renvoie la hauteur utilisée
function ecrire(ctx: CanvasRenderingContext2D, lignes: string[], y: number, interligne: number, rtl: boolean) {
  ctx.direction = rtl ? "rtl" : "ltr";
  ctx.textAlign = rtl ? "right" : "left";
  lignes.forEach((l, i) => ctx.fillText(l, rtl ? L - MARGE : MARGE, y + i * interligne));
  return lignes.length * interligne;
}

export async function fabriquerImageCitation(p: ParametresImage): Promise<Blob> {
  const { kigelia, francais } = polices();
  const policeTexte = p.nko ? kigelia : francais;
  await Promise.all([document.fonts.load(`700 60px ${kigelia}`), document.fonts.load(`700 30px ${francais}`), document.fonts.load(`500 28px ${francais}`)]).catch(() => undefined);

  const toile = document.createElement("canvas");
  toile.width = L; toile.height = H;
  const ctx = toile.getContext("2d");
  if (!ctx) throw new Error("Dessin impossible sur cet appareil");

  // Fond : nuit du site, motif africain atténué, cadre doré
  ctx.fillStyle = "#0e1322"; // bleu nuit du site (palette « Nuit du Mandé », app/globals.css)
  ctx.fillRect(0, 0, L, H);
  try {
    const motif = ctx.createPattern(await chargerImage("/arriere-plan.webp"), "repeat");
    if (motif) { ctx.globalAlpha = 0.1; ctx.fillStyle = motif; ctx.fillRect(0, 0, L, H); ctx.globalAlpha = 1; }
  } catch { /* motif indisponible : fond uni */ }
  ctx.strokeStyle = "rgba(251,191,36,0.35)";
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 40, L - 80, H - 80);

  // Titre de l'article (N'Ko d'abord, français dessous) : mesuré en premier, le passage prend la place qui reste
  ctx.font = `700 36px ${kigelia}`;
  const titreNko = couper(ctx, p.titreNko, L - 2 * MARGE).slice(0, 2);
  ctx.font = `500 28px ${francais}`;
  const titreFr = p.titreFr ? couper(ctx, p.titreFr, L - 2 * MARGE).slice(0, 2) : [];
  const hTitre = titreNko.length * 58 + titreFr.length * 40;

  // Zone utile : sous le haut du cadre, au-dessus du logo (guillemet + passage + filet + titre)
  const avecGuillemets = p.guillemets !== false && !p.enTete;
  const H_EN_TETE = p.enTete ? (p.enTete.fr ? 170 : 120) : 0;
  const HAUT = 100, BAS = 1090, H_GUILLEMET = (avecGuillemets ? 120 : 20) + H_EN_TETE, H_FILET = 100;
  const place = BAS - HAUT - H_GUILLEMET - H_FILET - hTitre;

  // Le passage : la plus grande taille qui tient (au plus 400 caractères, coupé après un mot entier)
  const passage = p.texte.length > 400 ? `${p.texte.slice(0, 400).replace(/\s+\S*$/, "")} …` : p.texte;
  const policePassage = (t: number) => `700 ${t}px ${policeTexte}`;
  let taille = 68, lignes: string[] = [], interligne = 0;
  do {
    taille -= 2;
    ctx.font = policePassage(taille);
    lignes = couper(ctx, passage, L - 2 * MARGE);
    interligne = taille * (p.nko ? 1.75 : 1.45);
  } while (lignes.length * interligne > place && taille > 30);
  const maxLignes = Math.floor(place / interligne);
  if (lignes.length > maxLignes) lignes = [...lignes.slice(0, maxLignes - 1), `${lignes[maxLignes - 1]} …`];
  const hPassage = lignes.length * interligne;

  // Le bloc entier est centré dans la zone utile
  let y = HAUT + (BAS - HAUT - (H_GUILLEMET + hPassage + H_FILET + hTitre)) / 2;

  // Guillemet doré, du côté où commence la lecture
  ctx.fillStyle = OR;
  ctx.font = `700 150px ${francais}`;
  ctx.direction = "ltr";
  ctx.textAlign = p.nko ? "right" : "left";
  if (avecGuillemets) ctx.fillText(p.nko ? "»" : "«", p.nko ? L - MARGE : MARGE, y + 110);
  // En-tête (ex. le terme du lexique) : N'Ko en or, centré, puis le français
  if (p.enTete) {
    // La plus grande taille (jusqu'au minimum) qui tient dans la largeur
    const ajuster = (texte: string, police: string, taille: number, minimum: number) => {
      for (; taille > minimum; taille -= 4) {
        ctx.font = `700 ${taille}px ${police}`;
        if (ctx.measureText(texte).width <= L - 2 * MARGE) return;
      }
      ctx.font = `700 ${minimum}px ${police}`;
    };
    ctx.textAlign = "center";
    ctx.direction = "rtl";
    ajuster(p.enTete.nko, kigelia, 76, 40);
    ctx.fillText(p.enTete.nko, L / 2, y + 80);
    if (p.enTete.fr) {
      ctx.direction = "ltr";
      ctx.fillStyle = "#ffffff";
      ajuster(p.enTete.fr, francais, 40, 24);
      ctx.fillText(p.enTete.fr, L / 2, y + 140);
    }
  }
  y += H_GUILLEMET;

  ctx.fillStyle = "#ffffff";
  ctx.font = policePassage(taille);
  ecrire(ctx, lignes, y + taille, interligne, p.nko);
  y += hPassage;

  // Filet, puis le titre (N'Ko en or, français en blanc atténué)
  ctx.fillStyle = OR;
  ctx.fillRect(p.nko ? L - MARGE - 120 : MARGE, y + 30, 120, 3);
  y += H_FILET;
  ctx.font = `700 36px ${kigelia}`;
  y += ecrire(ctx, titreNko, y, 58, true);
  if (titreFr.length) {
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.font = `500 28px ${francais}`;
    ecrire(ctx, titreFr, y, 40, false);
  }

  // Signature : logo, nom N'Ko du site, adresse
  try { ctx.drawImage(await chargerImage("/icon-512x512.png"), L / 2 - 50, H - 230, 100, 100); } catch { /* logo indisponible */ }
  ctx.direction = "rtl";
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.font = `700 38px ${kigelia}`;
  ctx.fillText(p.nomNko, L / 2, H - 92);
  ctx.direction = "ltr";
  ctx.fillStyle = OR;
  ctx.font = `700 24px ${francais}`;
  ctx.fillText("NKONILONKO.COM", L / 2, H - 58);

  return await new Promise<Blob>((ok, ko) => toile.toBlob((b) => (b ? ok(b) : ko(new Error("Image vide"))), "image/png"));
}
