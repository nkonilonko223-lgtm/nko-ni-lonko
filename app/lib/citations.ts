// ============================================================================
// N'KO NI LONKO — Citer un article (APA, MLA, BibTeX, RIS) — fonctions pures
// ============================================================================
// Titre original N'Ko d'abord, traduction française entre crochets (règle APA pour un titre
// dans une autre langue) : « N'Ko Is King ». Année = année de PUBLICATION (jamais l'année en
// cours). Aucun N'Ko écrit ici : le titre vient des données de l'article.
// ============================================================================

export type DonneesCitation = {
  titreNko: string; // titre original (N'Ko)
  titreFr: string | null; // traduction française (parenthèse finale du titre), si elle existe
  auteurs: string[]; // ex. « Moustapha CAMARA »
  datePublication: string; // ISO
  url: string;
  numero?: number | null; // numéro de la revue
  dateConsultation?: Date; // jour de la consultation (appareil du lecteur)
};

export const REVUE = "N'Ko ni Lonko";
const MOIS_MLA = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "June", "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."];
const MOIS_APA = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// La revue elle-même comme auteur (ex. fiche auteur « N'ko Ni Lonko ») : une organisation, jamais découpée
const simplifier = (t: string) => t.normalize("NFD").replace(/[^a-z]/gi, "").toLowerCase();
export const estLaRevue = (nom: string) => simplifier(nom) === simplifier(REVUE);

// « Moustapha CAMARA » → { prenoms: « Moustapha », nom: « Camara » } (le nom en capitales devient « Camara »)
export function decouperNom(nomComplet: string) {
  if (estLaRevue(nomComplet)) return { prenoms: "", nom: REVUE };
  const mots = nomComplet.trim().split(/[ ]+/).filter(Boolean);
  const capitalise = (m: string) => (m === m.toUpperCase() && m.length > 1 ? m.charAt(0) + m.slice(1).toLowerCase() : m);
  if (mots.length < 2) return { prenoms: "", nom: capitalise(mots[0] || "") };
  return { prenoms: mots.slice(0, -1).join(" "), nom: capitalise(mots[mots.length - 1]) };
}

const titreComplet = (d: DonneesCitation) => (d.titreFr ? `${d.titreNko} [${d.titreFr}]` : d.titreNko);
const date = (d: DonneesCitation) => new Date(d.datePublication);

// Citation N'Ko (en premier dans le panneau) : même forme que l'ancien bouton « Citer » du site,
// « Titre ». Revue, numéro, année. En ligne. URL — les mots N'Ko (nom de la revue, « en ligne »),
// le numéro et l'année en chiffres N'Ko sont fournis par l'appelant (textes de la rédaction).
export type MotsNko = { revue: string; enLigne: string; annee: string; numero?: string };
export const citationNko = (d: DonneesCitation, m: MotsNko) =>
  `"${d.titreNko}". ${m.revue}${m.numero ? `, ${m.numero}` : ""}, ${m.annee}. ${m.enLigne}. ${d.url}`;

// APA 7 : Nom, P. (2026, October 30). Titre [Traduction]. N'Ko ni Lonko, (3). URL
export function citationApa(d: DonneesCitation) {
  const noms = d.auteurs.map((a) => {
    const { prenoms, nom } = decouperNom(a);
    const initiales = prenoms.split(/[ -]+/).filter(Boolean).map((p) => p.charAt(0).toUpperCase() + ".").join(" ");
    return initiales ? `${nom}, ${initiales}` : nom;
  });
  const liste = noms.length === 0 ? REVUE : noms.length === 1 ? noms[0] : `${noms.slice(0, -1).join(", ")}, & ${noms[noms.length - 1]}`;
  const auteurs = liste.endsWith(".") ? liste : `${liste}.`; // « Camara, M. » ou « N'Ko ni Lonko. »
  const p = date(d);
  return `${auteurs} (${p.getUTCFullYear()}, ${MOIS_APA[p.getUTCMonth()]} ${p.getUTCDate()}). ${titreComplet(d)}. ${REVUE}${d.numero ? `, (${d.numero})` : ""}. ${d.url}`;
}

// MLA 9 : Nom, Prénom. « Titre [Traduction]. » N'Ko ni Lonko, no. 3, 30 Oct. 2026, URL. Accessed 20 Oct. 2026.
// (Quand l'auteur est la revue elle-même, MLA commence directement par le titre.)
export function citationMla(d: DonneesCitation) {
  const noms = d.auteurs.filter((a) => !estLaRevue(a)).map(decouperNom);
  const premier = noms[0] ? (noms[0].prenoms ? `${noms[0].nom}, ${noms[0].prenoms}` : noms[0].nom) : "";
  const auteurs = noms.length === 0 ? "" : noms.length === 1 ? `${premier}. ` : noms.length === 2 ? `${premier}, and ${noms[1].prenoms} ${noms[1].nom}. ` : `${premier}, et al. `;
  const p = date(d);
  const jour = (x: Date) => `${x.getUTCDate()} ${MOIS_MLA[x.getUTCMonth()]} ${x.getUTCFullYear()}`;
  const consulte = d.dateConsultation ? ` Accessed ${jour(d.dateConsultation)}.` : "";
  return `${auteurs}“${titreComplet(d)}.” ${REVUE}${d.numero ? `, no. ${d.numero}` : ""}, ${jour(p)}, ${d.url}.${consulte}`;
}

// Clé BibTeX : nom du premier auteur + année + premier mot du slug (lettres latines seulement)
function cle(d: DonneesCitation) {
  const nom = (decouperNom(d.auteurs[0] || "nkonilonko").nom || "nkonilonko").normalize("NFD").replace(/[^A-Za-z]/g, "").toLowerCase();
  const mot = (d.url.split("/").pop() || "article").split("-").find((m) => m.length > 3) || "article";
  return `${nom}${date(d).getUTCFullYear()}${mot.replace(/[^a-z0-9]/g, "")}`;
}

// BibTeX (LaTeX) : les accolades protègent les majuscules et le N'Ko
export function citationBibtex(d: DonneesCitation) {
  const p = date(d);
  const champs: [string, string | undefined][] = [
    // Une organisation entre doubles accolades, pour que BibTeX ne la découpe pas
    ["author", d.auteurs.map((a) => { const { prenoms, nom } = decouperNom(a); return estLaRevue(a) ? `{${nom}}` : prenoms ? `${nom}, ${prenoms}` : nom; }).join(" and ") || undefined],
    ["title", `{${titreComplet(d)}}`],
    ["journal", REVUE],
    ["year", String(p.getUTCFullYear())],
    ["month", String(p.getUTCMonth() + 1)],
    ["number", d.numero ? String(d.numero) : undefined],
    ["url", d.url],
    ["urldate", d.dateConsultation ? d.dateConsultation.toISOString().slice(0, 10) : undefined],
    ["language", "N'Ko, French"],
  ];
  return `@article{${cle(d)},\n${champs.filter(([, v]) => v).map(([k, v]) => `  ${k} = {${v}}`).join(",\n")}\n}`;
}

// RIS (Zotero, Mendeley, EndNote) : un fichier à importer
export function citationRis(d: DonneesCitation) {
  const p = date(d);
  const deux = (n: number) => String(n).padStart(2, "0");
  const lignes = [
    "TY  - JOUR",
    ...d.auteurs.map((a) => { const { prenoms, nom } = decouperNom(a); return `AU  - ${prenoms ? `${nom}, ${prenoms}` : nom}`; }),
    `TI  - ${d.titreNko}`,
    ...(d.titreFr ? [`TT  - ${d.titreFr}`] : []),
    `T2  - ${REVUE}`,
    `PY  - ${p.getUTCFullYear()}`,
    `DA  - ${p.getUTCFullYear()}/${deux(p.getUTCMonth() + 1)}/${deux(p.getUTCDate())}`,
    ...(d.numero ? [`IS  - ${d.numero}`] : []),
    `UR  - ${d.url}`,
    ...(d.dateConsultation ? [`Y2  - ${d.dateConsultation.toISOString().slice(0, 10)}`] : []),
    "LA  - nqo; fr",
    "ER  - ",
  ];
  return lignes.join("\r\n") + "\r\n";
}
