/* eslint-disable no-console */ // outil en ligne de commande : son rôle est d'afficher un rapport
// ============================================================================
// N'KO NI LONKO — Lettre d'information d'un numéro (Lot 2)
// ============================================================================
// Fabrique l'e-mail d'un numéro PUBLIÉ (N'Ko d'abord, puis français) et, SEULEMENT si on le demande
// explicitement, l'envoie aux abonnés confirmés (Resend). Rien n'est écrit dans Sanity.
// N'Ko JAMAIS retapé : titres, résumés et rubriques lus dans les données ; numéro et saison par
// numeroNko / saisonNko ; libellés « Sommaire », « Édito », « À la une », « Lire l'article » de la
// rédaction (app/components/numero/textes.ts) ; « Se désabonner » lu dans app/desabonnement/page.tsx.
// Un libellé N'Ko absent reste VIDE (seul le français s'affiche) : voir la liste à demander dans le rapport.
//
// Usage (depuis la racine du projet) :
//   1. Aperçu, sans aucun envoi ni clé :
//      node scripts/lettre/envoyer.mts --numero 3 --apercu <fichier.html>
//      (+ --export <sauvegarde.tar.gz> pour préparer avec les brouillons ; jamais pour un envoi)
//   2. Essai : UNE lettre à une adresse (clé RESEND_API_KEY) :
//      node scripts/lettre/envoyer.mts --numero 3 --essai <adresse>
//   3. Envoi à tous les abonnés confirmés (clés RESEND_API_KEY et SANITY_API_READ_TOKEN) :
//      node scripts/lettre/envoyer.mts --numero 3 --tous                 → affiche seulement le nombre de destinataires
//      node scripts/lettre/envoyer.mts --numero 3 --tous --confirmer 3   → ENVOIE (lots de 100, reprise sans doublon pendant 24 h)
// Les clés sont lues dans l'environnement ou, à défaut, dans .env.local (jamais affichées).
// Chaque lettre a son lien de désinscription personnel et la désinscription « en un clic »
// des messageries (en-têtes List-Unsubscribe, RFC 8058, traitée par /api/unsubscribe).
// ============================================================================
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const PROJET = resolve(import.meta.dirname, '../..');
const SITE = 'https://www.nkonilonko.com';
const EXPEDITEUR = `"N'Ko ni Lonko" <newsletter@nkonilonko.com>`;
const REPONSE = 'contact@nkonilonko.com';
const SAUT = String.fromCharCode(10);
const JETON = '__JETON_ABONNE__'; // remplacé par le jeton de chaque abonné
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// --- Options ------------------------------------------------------------------------
const args = process.argv.slice(2);
const option = (nom: string) => { const i = args.indexOf(nom); return i >= 0 ? args[i + 1] : undefined; };
const numeroDemande = Number(option('--numero'));
const apercu = option('--apercu');
const essai = option('--essai');
const tous = args.includes('--tous');
const confirmation = option('--confirmer');
const cheminExport = option('--export');
const arreter = (message: string) => { console.error(message); process.exit(1); }; // avant toute requête réseau seulement
// Après une requête réseau, ne jamais appeler process.exit (Node plante sous Windows) : on rend un code
const erreur = (message: string) => { console.error(message); return 1; };
if (!Number.isInteger(numeroDemande) || numeroDemande < 1) arreter('Usage : --numero <n> avec --apercu <fichier.html>, --essai <adresse> ou --tous [--confirmer <n>]');
if ([apercu, essai, tous].filter(Boolean).length !== 1) arreter('Choisir UN mode : --apercu, --essai ou --tous');
if (cheminExport && !apercu) arreter('Refusé : une sauvegarde contient des brouillons ; elle sert à l\'aperçu, jamais à un envoi.');

// --- Textes du site (jamais recopiés à la main) ------------------------------------------
type Bilingue = { nko: string; fr: string };
const importer = async <T,>(fichier: string) => (await import(pathToFileURL(join(PROJET, fichier)).href)) as T;
const { separerTitre } = await importer<{ separerTitre: (t: string) => { nko: string; fr: string | null } }>('app/components/numero/titre.ts');
const T = await importer<{
  TEXTES_NUMEROS: Record<'sommaire' | 'edito' | 'aLaUne' | 'lireArticle', Bilingue>;
  numeroNko: (n: number) => string; numeroFr: (n: number) => string;
  saisonNko: (s: number) => string; saisonFr: (s: number) => string;
}>('app/components/numero/textes.ts');
const valeurDe = (fichier: string, apres: string, cle: string) => {
  const source = readFileSync(join(PROJET, fichier), 'utf8');
  const ligne = source.slice(source.indexOf(apres)).split(SAUT).find((l) => l.trim().startsWith(cle + ': "'));
  if (!ligne) throw new Error(`Texte introuvable : ${cle} dans ${fichier}`);
  return ligne.split('"')[1];
};
const NOM: Bilingue = { nko: valeurDe('app/page.tsx', 'openGraph:', 'title').split(' | ')[0], fr: "N'Ko ni Lonko" };
const DESABONNER: Bilingue = { nko: valeurDe('app/desabonnement/page.tsx', 'TEXTES_NKO', 'titre'), fr: 'Se désabonner' };
// Libellés N'Ko : L4 et L5 (rédaction, 23 octobre 2026 ; copié tel quel par programme)
const LIRE_NUMERO: Bilingue = { nko: "ߝߙߍߕߍ ߞߊ߬ߙߊ߲߬ ߓߟߐߟߐ ߛߊ߲ߝߍ߬", fr: 'Lire le numéro en ligne' };
const POURQUOI: Bilingue = { nko: "ߊߟߎ߫ ߦߋ߫ ߛߓߍ ߣߌ߲߬ ߟߊߛߐ߬ߘߐ߲߬ ߠߊ߫߸ ߓߊߏ߬ ߊߟߎ߫ ߡߊߝߘߎ߬ߣߍ߲ ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ ߡߊ߬ ߟߋ߬߹", fr: "Vous recevez cette lettre parce que vous êtes abonné(e) à N'Ko ni Lonko." };
for (const t of [NOM, DESABONNER, ...Object.values(T.TEXTES_NUMEROS)]) {
  if (t.nko !== t.nko.normalize('NFC')) throw new Error('Libellé N\'Ko non NFC');
}

// --- Données du numéro ----------------------------------------------------------------------
type Article = { _id: string; title?: string; excerpt?: string; slug?: string; image?: string; rubrique?: { titleNko?: string; titleFr?: string } | null };
type Numero = { numero: number; saison?: number; titleNko?: string; titleFr?: string; excerpt?: string; slug: string; couverture?: string; couvertureAlt?: string; editoRef?: string; aLaUneRef?: string; sommaire: (Article | null)[] };

async function numeroPublie(n: number): Promise<Numero | null> {
  const requete = `*[_type == "numero" && numero == $n && !(_id in path("drafts.**"))][0]{
    numero, saison, titleNko, titleFr, excerpt, "slug": slug.current,
    "couverture": couverture.asset->url, "couvertureAlt": couverture.alt,
    "editoRef": edito._ref, "aLaUneRef": aLaUne._ref,
    "sommaire": sommaire[]->{ _id, title, excerpt, "slug": slug.current, "image": mainImage.asset->url, "rubrique": rubrique->{ titleNko, titleFr } }
  }`;
  const r = await fetch(`https://yfsyhc2p.apicdn.sanity.io/v2024-01-01/data/query/production?query=${encodeURIComponent(requete)}&$n=${n}`);
  if (!r.ok) throw new Error(`API Sanity : ${r.status}`);
  return ((await r.json()) as { result: Numero | null }).result;
}

type Doc = Record<string, unknown> & { _id: string; _type: string };
function numeroDeLaSauvegarde(chemin: string, n: number): Numero | null {
  // Archive « tar » : même lecture que scripts/verifier-import.mts ; le brouillon l'emporte
  const tar = gunzipSync(readFileSync(chemin));
  const texte = (b: Buffer) => { const fin = b.indexOf(0); return b.subarray(0, fin < 0 ? b.length : fin).toString('utf8'); };
  let docs: Doc[] = [];
  for (let pos = 0, nomPax = ''; pos + 512 <= tar.length;) {
    const entete = tar.subarray(pos, pos + 512);
    if (entete.every((o) => o === 0)) break;
    const nom = nomPax || texte(entete.subarray(0, 100));
    const taille = parseInt(texte(entete.subarray(124, 136)).trim() || '0', 8);
    const type = String.fromCharCode(entete[156]);
    const donnees = tar.subarray(pos + 512, pos + 512 + taille);
    nomPax = '';
    if (type === 'x' || type === 'L') {
      const contenu = texte(donnees);
      nomPax = type === 'L' ? contenu : (contenu.split(SAUT).find((l) => l.includes(' path=')) || '').split(' path=')[1] || '';
    } else if (nom.endsWith('data.ndjson')) {
      docs = donnees.toString('utf8').split(SAUT).filter((l) => l.trim()).map((l) => JSON.parse(l) as Doc);
      break;
    }
    pos += 512 + Math.ceil(taille / 512) * 512;
  }
  const derniers = new Map<string, Doc>();
  for (const d of docs) { const id = d._id.replace(/^drafts[.]/, ''); if (!derniers.has(id) || d._id.startsWith('drafts.')) derniers.set(id, d); }
  const ref = (v: unknown) => (v as { _ref?: string } | undefined)?._ref;
  const image = (v: unknown) => { const f = (v as { _sanityAsset?: string } | undefined)?._sanityAsset?.split('/images/')[1]; return f ? `https://cdn.sanity.io/images/yfsyhc2p/production/${f}` : undefined; };
  const num = [...derniers.values()].find((d) => d._type === 'numero' && d.numero === n);
  if (!num) return null;
  const sommaire = ((num.sommaire as { _ref: string }[]) || []).map((r) => {
    const a = derniers.get(r._ref);
    if (!a) return null;
    const rub = derniers.get(ref(a.rubrique) || '');
    return { _id: r._ref, title: a.title as string, excerpt: a.excerpt as string, slug: (a.slug as { current?: string })?.current, image: image(a.mainImage), rubrique: rub ? { titleNko: rub.titleNko as string, titleFr: rub.titleFr as string } : null };
  });
  return {
    numero: n, saison: num.saison as number, titleNko: num.titleNko as string, titleFr: num.titleFr as string, excerpt: num.excerpt as string,
    slug: (num.slug as { current: string }).current, couverture: image(num.couverture), couvertureAlt: (num.couverture as { alt?: string } | undefined)?.alt,
    editoRef: ref(num.edito), aLaUneRef: ref(num.aLaUne), sommaire,
  };
}

async function principal(): Promise<number> {
const numero = cheminExport ? numeroDeLaSauvegarde(cheminExport, numeroDemande) : await numeroPublie(numeroDemande);
if (!numero) return erreur(`Numéro ${numeroDemande} introuvable${cheminExport ? ' dans la sauvegarde' : ' (pas encore publié ?)'}.`);
const n = numero;
const articles = n.sommaire.filter((a): a is Article & { slug: string; title: string } => !!a?.slug && !!a.title);
if (!articles.length) return erreur('Aucun article publié dans le sommaire de ce numéro.');
for (const t of [n.titleNko, n.titleFr, ...articles.flatMap((a) => [a.title, a.excerpt, a.rubrique?.titleNko])]) {
  if (t && t !== t.normalize('NFC')) return erreur('Texte non NFC dans les données (à corriger dans Sanity, jamais ici).');
}

// --- Modèle (HTML et texte) -------------------------------------------------------------------
const echapper = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const nkoStyle = "font-family:'Kigelia',system-ui,sans-serif;direction:rtl";
const frStyle = 'font-family:Helvetica,Arial,sans-serif;direction:ltr';
const ligneNko = (t: string | undefined, style: string) => (t ? `<div dir="rtl" lang="nqo" style="${nkoStyle};${style}">${echapper(t)}</div>` : '');
const ligneFr = (t: string | null | undefined, style: string) => (t ? `<div dir="ltr" lang="fr" style="${frStyle};${style}">${echapper(t)}</div>` : '');
const image = (url: string | undefined, alt: string) =>
  url ? `<img src="${echapper(url)}?w=1120&h=630&fit=crop&fm=jpg&q=78" width="560" alt="${echapper(alt)}" style="display:block;width:100%;max-width:560px;height:auto;border-radius:12px;border:0">` : '';
const lienArticle = (slug: string) => `${SITE}/article/${slug}`;
const lienNumero = `${SITE}/numeros/${n.slug}`;
const desabonnement = `${SITE}/desabonnement?token=${JETON}`;

const sujet = [T.numeroNko(n.numero), n.titleNko].filter(Boolean).join(' — ') + ' | ' + [T.numeroFr(n.numero), n.titleFr].filter(Boolean).join(' — ');
const blocArticle = (a: Article & { slug: string; title: string }) => {
  const titre = separerTitre(a.title);
  const marque = a._id === n.editoRef ? T.TEXTES_NUMEROS.edito : a._id === n.aLaUneRef ? T.TEXTES_NUMEROS.aLaUne : null;
  const etiquette = [marque, a.rubrique ? { nko: a.rubrique.titleNko || '', fr: a.rubrique.titleFr || '' } : null].filter((x): x is Bilingue => !!x)
    .map((e) => `${e.nko ? `<span dir="rtl" lang="nqo" style="${nkoStyle}">${echapper(e.nko)}</span>` : ''}${e.nko && e.fr ? ' · ' : ''}${e.fr ? `<span dir="ltr" lang="fr" style="${frStyle};text-transform:uppercase;letter-spacing:1px;font-size:11px">${echapper(e.fr)}</span>` : ''}`).join(' &nbsp;|&nbsp; ');
  return `<tr><td style="padding:28px 32px 8px">
    <a href="${lienArticle(a.slug)}" style="text-decoration:none">${image(a.image, titre.fr || titre.nko)}</a>
    ${etiquette ? `<div style="color:#eab308;font-size:14px;margin:16px 0 6px;text-align:center">${etiquette}</div>` : ''}
    ${ligneNko(titre.nko, 'font-size:24px;line-height:1.7;color:#ffffff;font-weight:bold;text-align:center')}
    ${ligneFr(titre.fr, 'font-size:16px;line-height:1.4;color:#eab308;font-weight:bold;text-align:center;margin-top:4px')}
    ${a.excerpt ? `<div dir="auto" style="${frStyle};direction:auto;font-size:14px;line-height:1.7;color:#a3a3a3;text-align:center;margin-top:10px">${echapper(a.excerpt)}</div>` : ''}
    <div style="text-align:center;margin-top:14px"><a href="${lienArticle(a.slug)}" style="display:inline-block;border:1px solid #eab308;border-radius:999px;padding:10px 22px;color:#eab308;text-decoration:none;font-size:14px">
      <span dir="rtl" lang="nqo" style="${nkoStyle};font-size:16px">${echapper(T.TEXTES_NUMEROS.lireArticle.nko)}</span> · <span dir="ltr" lang="fr" style="${frStyle}">${echapper(T.TEXTES_NUMEROS.lireArticle.fr)}</span></a></div>
  </td></tr>`;
};

const html = `<!DOCTYPE html>
<html lang="nqo" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark"><title>${echapper(sujet)}</title>
<style>@font-face{font-family:'Kigelia';src:url('${SITE}/fonts/Kigelia.otf') format('opentype');font-weight:normal}@font-face{font-family:'Kigelia';src:url('${SITE}/fonts/Kigelia1.otf') format('opentype');font-weight:bold}</style>
</head><body style="margin:0;padding:0;background:#000000">
<div style="display:none;max-height:0;overflow:hidden">${echapper([T.numeroFr(n.numero), n.titleFr, articles.length + ' articles'].filter(Boolean).join(' · '))}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#000000"><tr><td align="center" style="padding:32px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:624px;background:#0a0a0a;border:1px solid #1f1f1f;border-radius:16px">
  <tr><td style="padding:36px 32px 8px;text-align:center">
    ${ligneNko(NOM.nko, 'font-size:30px;font-weight:bold;color:#ffffff;text-align:center')}
    ${ligneFr(NOM.fr, 'font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#eab308;text-align:center;margin-top:4px')}
  </td></tr>
  <tr><td style="padding:20px 32px 0;text-align:center">
    ${ligneNko([T.numeroNko(n.numero), n.saison ? T.saisonNko(n.saison) : ''].filter(Boolean).join(' · '), 'font-size:22px;color:#eab308;text-align:center')}
    ${ligneFr([T.numeroFr(n.numero), n.saison ? T.saisonFr(n.saison) : ''].filter(Boolean).join(' · '), 'font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#737373;text-align:center;margin-top:2px')}
    ${ligneNko(n.titleNko, 'font-size:26px;line-height:1.7;color:#ffffff;font-weight:bold;text-align:center;margin-top:14px')}
    ${ligneFr(n.titleFr, 'font-size:18px;color:#e5e5e5;font-weight:bold;text-align:center;margin-top:4px')}
  </td></tr>
  ${n.couverture ? `<tr><td style="padding:24px 32px 0"><a href="${lienNumero}">${image(n.couverture, n.couvertureAlt || T.numeroFr(n.numero))}</a></td></tr>` : ''}
  ${n.excerpt ? `<tr><td style="padding:18px 32px 0"><div dir="auto" style="${frStyle};direction:auto;font-size:15px;line-height:1.8;color:#d4d4d4;text-align:center">${echapper(n.excerpt)}</div></td></tr>` : ''}
  <tr><td style="padding:30px 32px 0;text-align:center">
    <div style="height:1px;background:#262626;margin-bottom:22px"></div>
    ${ligneNko(T.TEXTES_NUMEROS.sommaire.nko, 'font-size:20px;color:#eab308;text-align:center')}
    ${ligneFr(T.TEXTES_NUMEROS.sommaire.fr, 'font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#737373;text-align:center')}
  </td></tr>
  ${articles.map(blocArticle).join(SAUT)}
  <tr><td style="padding:30px 32px 36px;text-align:center">
    <a href="${lienNumero}" style="display:inline-block;background:#eab308;color:#000000;border-radius:999px;padding:16px 36px;text-decoration:none;font-weight:bold;font-size:16px">
      ${LIRE_NUMERO.nko ? `<span dir="rtl" lang="nqo" style="${nkoStyle};font-size:19px">${echapper(LIRE_NUMERO.nko)}</span><br>` : ''}<span dir="ltr" lang="fr" style="${frStyle}">${echapper(LIRE_NUMERO.fr)}</span></a>
  </td></tr>
</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:624px"><tr><td style="padding:22px 16px;text-align:center">
  ${ligneNko(POURQUOI.nko, 'font-size:14px;color:#737373;text-align:center')}
  ${ligneFr(POURQUOI.fr, 'font-size:12px;color:#737373;text-align:center;line-height:1.6')}
  <div style="margin-top:12px"><a href="${desabonnement}" style="color:#a3a3a3;font-size:13px;text-decoration:underline"><span dir="rtl" lang="nqo" style="${nkoStyle};font-size:15px">${echapper(DESABONNER.nko)}</span> / <span dir="ltr" lang="fr" style="${frStyle}">${echapper(DESABONNER.fr)}</span></a></div>
</td></tr></table>
</td></tr></table>
</body></html>`;

const texteBrut = [
  `${NOM.nko} — ${NOM.fr}`, '',
  [T.numeroNko(n.numero), n.titleNko].filter(Boolean).join(' — '), [T.numeroFr(n.numero), n.titleFr].filter(Boolean).join(' — '), '',
  `${T.TEXTES_NUMEROS.sommaire.nko} / ${T.TEXTES_NUMEROS.sommaire.fr}`, '',
  ...articles.flatMap((a) => { const t = separerTitre(a.title); return [t.nko, t.fr || '', lienArticle(a.slug), '']; }),
  `${LIRE_NUMERO.fr} : ${lienNumero}`, '', POURQUOI.fr, `${DESABONNER.nko} / ${DESABONNER.fr} : ${desabonnement}`,
].join(SAUT);

const lettrePour = (jeton: string) => ({
  from: EXPEDITEUR, reply_to: REPONSE, subject: sujet,
  html: html.split(JETON).join(jeton), text: texteBrut.split(JETON).join(jeton),
  headers: { 'List-Unsubscribe': `<${SITE}/api/unsubscribe?token=${jeton}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
});

// --- Modes --------------------------------------------------------------------------------------
console.log(`Numéro ${T.numeroFr(n.numero)} · ${articles.length} article(s) · objet : ${sujet}`);
const manquants = [LIRE_NUMERO, POURQUOI].filter((t) => !t.nko).map((t) => `« ${t.fr} »`);
if (manquants.length) console.log(`Libellés N'Ko à demander à la rédaction (vides pour l'instant) : ${manquants.join(', ')}`);

if (apercu) {
  const exemple = '00000000-0000-4000-8000-000000000000';
  writeFileSync(resolve(apercu), lettrePour(exemple).html);
  writeFileSync(resolve(apercu).replace(/[.]html?$/, '') + '.txt', lettrePour(exemple).text);
  console.log(`Aperçu écrit : ${resolve(apercu)} (aucun envoi)`);
  return 0;
}

// Clés : environnement, sinon .env.local (lu par Node, jamais affiché)
if (!process.env.RESEND_API_KEY && existsSync(join(PROJET, '.env.local'))) process.loadEnvFile(join(PROJET, '.env.local'));
const RESEND = process.env.RESEND_API_KEY;
if (!RESEND) return erreur('Clé RESEND_API_KEY absente.');
async function envoyerLot(lettres: object[], cle: string) {
  const r = await fetch('https://api.resend.com/emails/batch', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND}`, 'Content-Type': 'application/json', 'Idempotency-Key': cle },
    body: JSON.stringify(lettres),
  });
  if (!r.ok) throw new Error(`Resend : HTTP ${r.status} ${(await r.text()).slice(0, 300)}`);
}

if (essai) {
  if (!/^[^@ ]+@[^@ ]+[.][^@ ]+$/.test(essai)) return erreur('Adresse d\'essai invalide.');
  await envoyerLot([{ ...lettrePour('00000000-0000-4000-8000-000000000000'), to: [essai], subject: `[ESSAI] ${sujet}` }], `lettre-essai-${n.slug}-${Date.now()}`);
  console.log(`Lettre d'essai envoyée à ${essai.replace(/^(.).*@/, '$1***@')} (lien de désinscription factice).`);
  return 0;
}

// Tous les abonnés CONFIRMÉS (fiches privées subscriber.<uuid>, lues avec la clé Viewer)
const LECTURE = process.env.SANITY_API_READ_TOKEN;
if (!LECTURE) return erreur('Clé SANITY_API_READ_TOKEN absente.');
const requete = encodeURIComponent('*[_type == "subscriber" && status == "verified"]{ _id, email }');
const reponse = await fetch(`https://yfsyhc2p.api.sanity.io/v2024-01-01/data/query/production?query=${requete}&perspective=published`, { headers: { Authorization: `Bearer ${LECTURE}` } });
if (!reponse.ok) return erreur(`Lecture des abonnés impossible : HTTP ${reponse.status}`);
const abonnes = ((await reponse.json()) as { result: { _id: string; email: string }[] }).result
  .map((a) => ({ email: a.email, jeton: a._id.replace(/^subscriber[.]/, '') }))
  .filter((a) => a.email && UUID.test(a.jeton));
console.log(`${abonnes.length} abonné(s) confirmé(s).`);
if (confirmation !== String(n.numero)) {
  console.log(`Aucun envoi. Pour envoyer, relancer avec : --confirmer ${n.numero}`);
  return 0;
}
let envoyes = 0;
for (let i = 0; i < abonnes.length; i += 100) {
  const lot = abonnes.slice(i, i + 100).map((a) => ({ ...lettrePour(a.jeton), to: [a.email] }));
  try {
    // Même clé si on relance dans les 24 h : Resend n'envoie pas deux fois le même lot
    await envoyerLot(lot, `lettre-${n.slug}-lot-${i / 100}`);
  } catch (probleme) {
    return erreur(`Arrêt après ${envoyes} lettre(s) : ${(probleme as Error).message}. Relancer la même commande reprend sans doublon.`);
  }
  envoyes += lot.length;
  console.log(`… ${envoyes} / ${abonnes.length}`);
}
console.log(`Terminé : ${envoyes} lettre(s) envoyée(s).`);
return 0;
}

process.exitCode = await principal();
