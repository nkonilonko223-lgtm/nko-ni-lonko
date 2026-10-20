/* eslint-disable no-console */ // outil en ligne de commande : son rôle est d'afficher un rapport
// ============================================================================
// N'KO NI LONKO — Garde du N'Ko dans le code (règle absolue 6), lecture seule
// ============================================================================
// 1. Tout passage N'Ko des fichiers suivis par Git doit être en Unicode NFC (sinon : code 1).
// 2. Avec --depuis <commit> : liste les passages N'Ko AJOUTÉS, RETIRÉS ou MODIFIÉS depuis ce
//    commit, fichier par fichier. Ce n'est pas une erreur (le N'Ko de la rédaction est copié
//    dans le code) : le propriétaire vérifie que chaque changement vient bien de la rédaction.
//    Sur GitHub, chaque cas devient un avertissement visible dans l'onglet « Actions ».
// Aucun caractère N'Ko écrit ici : la plage est donnée par ses numéros (0x07c0 à 0x07ff).
//
// Usage : node scripts/verifier-nko-code.mts [--depuis <commit>]
// ============================================================================

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const EXTENSIONS = /\.(ts|tsx|mts|mjs|js|json|md|css|txt|ipynb)$/;
const git = (...args: string[]) =>
  execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
const surGitHub = process.env.GITHUB_ACTIONS === 'true';
const estNko = (c: string) => { const k = c.codePointAt(0) ?? 0; return k >= 0x07c0 && k <= 0x07ff; };
const LIANTS = new Set([' ', String.fromCharCode(0xa0), String.fromCharCode(0x202f), '.', ',', ':', ';', '!', '?', '«', '»', '(', ')', '-', "'", '/']);

// Passages N'Ko d'un texte : lettres N'Ko, et ce qui les relie sur une même ligne (espaces, ponctuation)
function passages(texte: string): string[] {
  const resultat: string[] = [];
  let courant = '';
  let attente = '';
  for (const c of texte) {
    if (estNko(c)) { courant += attente + c; attente = ''; }
    else if (courant && LIANTS.has(c)) attente += c;
    else if (courant) { resultat.push(courant); courant = ''; attente = ''; }
  }
  if (courant) resultat.push(courant);
  return resultat;
}

const signaler = (niveau: 'error' | 'warning', fichier: string, message: string) =>
  console.log(surGitHub ? `::${niveau} file=${fichier}::${message}` : `${niveau === 'error' ? '✗' : '!'} ${fichier} : ${message}`);

const fichiers = git('ls-files').split('\n').filter((f) => EXTENSIONS.test(f));

// 1. NFC
let nonNfc = 0;
let total = 0;
for (const fichier of fichiers) {
  let texte: string;
  try { texte = readFileSync(fichier, 'utf8'); } catch { continue; }
  for (const p of passages(texte)) {
    total++;
    if (p !== p.normalize('NFC')) { nonNfc++; signaler('error', fichier, "passage N'Ko non normalisé (NFC)"); }
  }
}
console.log(`NFC : ${total - nonNfc}/${total} passages N'Ko justes dans ${fichiers.length} fichiers.`);

// 2. Changements depuis un commit
const i = process.argv.indexOf('--depuis');
if (i > 0 && process.argv[i + 1]) {
  const depuis = process.argv[i + 1];
  const changes = git('diff', '--name-only', depuis, 'HEAD').split('\n').filter((f) => EXTENSIONS.test(f));
  let nombre = 0;
  for (const fichier of changes) {
    let avant = '';
    let apres = '';
    try { avant = git('show', `${depuis}:${fichier}`); } catch { /* fichier nouveau */ }
    try { apres = readFileSync(fichier, 'utf8'); } catch { /* fichier supprimé */ }
    const pAvant = new Set(passages(avant));
    const pApres = new Set(passages(apres));
    const ajoutes = [...pApres].filter((p) => !pAvant.has(p)).length;
    const retires = [...pAvant].filter((p) => !pApres.has(p)).length;
    if (ajoutes || retires) {
      nombre++;
      signaler('warning', fichier, `N'Ko changé depuis ${depuis.slice(0, 7)} : ${ajoutes} passage(s) ajouté(s) ou modifié(s), ${retires} retiré(s) ou modifié(s). Vérifier qu'il vient de la rédaction, sans modification.`);
    }
  }
  console.log(`Depuis ${depuis.slice(0, 7)} : ${changes.length} fichier(s) changé(s), N'Ko changé dans ${nombre}.`);
}

process.exit(nonNfc ? 1 : 0);
