/* eslint-disable no-console */ // outil en ligne de commande : son rôle est d'afficher un rapport
// ============================================================================
// N'KO NI LONKO — PDF d'un numéro (Lot 2)
// ============================================================================
// Google Chrome ouvre la version imprimable du numéro (/numeros/<slug>/imprimer), charge
// toutes les images et les polices (lettres N'Ko liées), puis enregistre un PDF A4.
// Rien n'est écrit dans Sanity. Le PDF est rangé dans public/pdf/ et la liste
// app/lib/pdf-numeros.json, lue par la page du numéro (lien « Télécharger le PDF »).
//
// Usage (depuis la racine du projet, numéro PUBLIÉ et en ligne) :
//   node scripts/pdf-numero/generer.mjs --numero 3
//   Options : --site <adresse> (par défaut https://www.nkonilonko.com ; ex. http://localhost:3000)
//             --adresse <page complète> et --essai <dossier> (essai : PDF dans ce dossier seulement)
// Le nom du fichier contient une empreinte du contenu : une nouvelle version a une nouvelle adresse.
// ============================================================================
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const PROJET = resolve(import.meta.dirname, '../..');
const DOSSIER = join(PROJET, 'public/pdf');
const LISTE = join(PROJET, 'app/lib/pdf-numeros.json');
const SAUT = String.fromCharCode(10);
const CHROME = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find((c) => c && existsSync(c));
if (!CHROME) throw new Error('Chrome ou Edge introuvable (indiquer son chemin dans CHROME_PATH).');

const args = process.argv.slice(2);
const option = (nom) => { const i = args.indexOf(nom); return i >= 0 ? args[i + 1] : undefined; };
const numero = Number(option('--numero'));
if (!Number.isInteger(numero) || numero < 1) throw new Error('Usage : node scripts/pdf-numero/generer.mjs --numero <n> [--site <adresse>]');
const slug = String(numero).padStart(3, '0');
const site = (option('--site') || 'https://www.nkonilonko.com').replace(/[/]$/, '');
const adresse = option('--adresse') || `${site}/numeros/${slug}/imprimer`;
const essai = option('--essai');

const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const PORT = 9400 + Math.floor(Math.random() * 400);
const profil = mkdtempSync(join(tmpdir(), 'pdf-numero-'));
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profil}`, 'about:blank'], { stdio: 'ignore' });
try {
  let cibles;
  for (let i = 0; i < 60 && !cibles; i++) { await pause(250); try { cibles = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json(); } catch { /* démarrage */ } }
  if (!cibles) throw new Error('Chrome ne répond pas');
  const ws = new WebSocket(cibles.find((c) => c.type === 'page').webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r, { once: true }));
  let id = 0;
  const attente = new Map();
  ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && attente.has(m.id)) { attente.get(m.id)(m); attente.delete(m.id); } });
  const envoyer = (method, params = {}) => new Promise((r) => { const n = ++id; attente.set(n, r); ws.send(JSON.stringify({ id: n, method, params })); });
  const evaluer = async (expression) => (await envoyer('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result.result?.value;
  await envoyer('Page.enable');
  // Langue choisie d'avance (sinon l'écran « choix de la langue » s'afficherait)
  await envoyer('Page.navigate', { url: new URL(adresse).origin + '/robots.txt' });
  await pause(2000);
  await evaluer(`localStorage.setItem("preferred-lang", "nko")`);
  await envoyer('Page.navigate', { url: adresse });
  await pause(4000);
  const etat = await evaluer(`(async () => {
    if (document.title.includes("404") || !document.querySelector(".impression")) return { ok: false };
    // Images chargées tout de suite (pas de chargement différé), puis attente de toutes les images et polices
    document.querySelectorAll('img[loading="lazy"]').forEach((i) => { i.loading = "eager"; });
    for (let y = 0; y < document.documentElement.scrollHeight; y += 800) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
    await Promise.all([...document.images].map((i) => i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; })));
    await document.fonts.ready;
    const manquantes = [...document.images].filter((i) => !i.naturalWidth).length;
    return { ok: true, images: document.images.length, manquantes, articles: document.querySelectorAll(".impression article").length };
  })()`);
  if (!etat?.ok) throw new Error(`Page introuvable ou vide : ${adresse} (numéro publié et en ligne ?)`);
  if (etat.manquantes) console.warn(`⚠ ${etat.manquantes} image(s) non chargée(s) sur ${etat.images}`);
  await envoyer('Emulation.setEmulatedMedia', { media: 'print' });
  const pdf = await envoyer('Page.printToPDF', { printBackground: true, preferCSSPageSize: true, generateTaggedPDF: true, generateDocumentOutline: true });
  if (!pdf.result?.data) throw new Error('Chrome n\'a pas produit de PDF : ' + JSON.stringify(pdf.error || {}));
  ws.close();
  const octets = Buffer.from(pdf.result.data, 'base64');
  const nom = `nko-ni-lonko-n${slug}-${createHash('sha256').update(octets).digest('hex').slice(0, 8)}.pdf`;
  const sortie = essai ? resolve(essai) : DOSSIER;
  mkdirSync(sortie, { recursive: true });
  writeFileSync(join(sortie, nom), octets);
  const mo = (octets.length / 1024 / 1024).toFixed(1);
  console.log(`✓ ${nom} · ${mo} Mo · ${etat.articles} article(s) · ${etat.images} image(s)`);
  if (octets.length > 25 * 1024 * 1024) console.warn('⚠ Plus de 25 Mo : lourd pour WhatsApp et les téléphones.');
  if (!essai) {
    for (const ancien of readdirSync(DOSSIER)) if (ancien !== nom && new RegExp(`^nko-ni-lonko-n${slug}-[0-9a-f]{8}[.]pdf$`).test(ancien)) rmSync(join(DOSSIER, ancien));
    const liste = existsSync(LISTE) ? JSON.parse(readFileSync(LISTE, 'utf8')) : {};
    liste[slug] = { fichier: nom, octets: octets.length };
    writeFileSync(LISTE, JSON.stringify(Object.fromEntries(Object.keys(liste).sort().map((k) => [k, liste[k]])), null, 2) + SAUT);
    console.log('Liste à jour : app/lib/pdf-numeros.json');
  }
} finally {
  chrome.kill();
  await pause(500);
  try { rmSync(profil, { recursive: true, force: true }); } catch { /* verrou Windows */ }
}
