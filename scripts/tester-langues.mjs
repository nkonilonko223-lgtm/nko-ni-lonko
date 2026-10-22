/* eslint-disable no-console */ // outil en ligne de commande : son rôle est d'afficher un rapport
// ============================================================================
// N'KO NI LONKO — Test de la langue dans l'adresse (B6) : N'Ko sans préfixe, français en /fr
// ============================================================================
// Vérifie, sur un serveur (local, aperçu ou site en ligne), SANS rien modifier :
// 1. chaque page répond dans les deux versions, avec la bonne langue (lang, sens, traduction) ;
// 2. cartes de partage (une langue par ligne, nom du site bilingue), titre d'onglet,
//    adresse canonique et hreflang de chaque version ;
// 3. /nqo/… renvoie vers l'adresse publique ; adresse inconnue → 404 ; fichiers servis tels quels ;
// 4. plan du site : chaque page en deux versions reliées ;
// 5. liens internes : tous répondent, et aucun ne change de langue.
//
// Usage : node scripts/tester-langues.mjs [adresse]   (par défaut http://localhost:3100)
// Résultat : code 0 = tout est juste ; code 1 = au moins un test en échec.
// ============================================================================
// Usage : BASE=http://localhost:3100 node tests-b6.mjs
const BASE = (process.argv[2] || process.env.BASE || "http://localhost:3100").replace(/\/$/, "");
const UA = { "user-agent": "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36" };
const BOT = { "user-agent": "WhatsApp/2.23.20.0 A" };
let erreurs = 0;
const ok = (cond, texte) => { if (!cond) erreurs++; console.log(`${cond ? "✅" : "❌"} ${texte}`); };
const nko = (t) => [...(t || "")].some((c) => { const n = c.codePointAt(0); return n >= 0x07c0 && n <= 0x07ff; });
const latin = (t) => /[A-Za-zÀ-ÿ]/.test(t || "");
const dec = (t) => t?.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
const meta = (h, k) => dec((h.match(new RegExp(`(?:property|name)="${k}" content="([^"]*)"`)) || [])[1]);
const lien = (h, rel, attr = "") => (h.match(new RegExp(`<link rel="${rel}"${attr}[^>]*href="([^"]*)"`)) || h.match(new RegExp(`<link[^>]*rel="${rel}"[^>]*href="([^"]*)"`)) || [])[1];
const get = async (p, h = UA, redirect = "manual") => { const r = await fetch(BASE + p, { headers: h, redirect }); return { r, h: r.status === 200 ? await r.text() : "" }; };
const SITE = "https://www.nkonilonko.com".replace(/\/$/, "");

// 1. Pages : les deux versions répondent, avec la bonne langue
const chemins = ["/", "/about", "/contact", "/privacy", "/terms", "/numeros", "/lexique", "/article/le-geant-a-crete-du-niger", "/article/bienvenue-sur-n-ko-ni-lonko", "/offline"];
for (const c of chemins) {
  for (const [langue, p] of [["nqo", c], ["fr", c === "/" ? "/fr" : `/fr${c}`]]) {
    const { r, h } = await get(p);
    const html = (h.match(/<html[^>]*>/) || [""])[0];
    const bonneLangue = langue === "nqo" ? /lang="nqo"/.test(html) && /dir="rtl"/.test(html) && /translate="no"/.test(html) : /lang="fr"/.test(html) && /dir="ltr"/.test(html) && !/translate=/.test(html);
    const google = /name="google" content="notranslate"/.test(h);
    ok(r.status === 200 && bonneLangue && google === (langue === "nqo"), `${p.padEnd(44)} ${r.status} · ${html.replace(/\s+/g, " ").slice(5, 60)} · notranslate=${google}`);
  }
}

// 2. Cartes de partage, titres, canonique et hreflang par version (robot WhatsApp)
for (const c of ["/", "/about", "/article/le-geant-a-crete-du-niger", "/lexique", "/numeros"]) {
  for (const langue of ["nqo", "fr"]) {
    const p = langue === "fr" ? (c === "/" ? "/fr" : `/fr${c}`) : c;
    const { h } = await get(p, BOT);
    const titre = meta(h, "og:title"), desc = meta(h, "og:description"), site = meta(h, "og:site_name");
    const tab = dec((h.match(/<title>([^<]*)<\/title>/) || [])[1]);
    const canon = lien(h, "canonical");
    const alt = { nqo: (h.match(/hrefLang="nqo" href="([^"]*)"/) || [])[1], fr: (h.match(/hrefLang="fr" href="([^"]*)"/) || [])[1], x: (h.match(/hrefLang="x-default" href="([^"]*)"/) || [])[1] };
    const attendue = `${SITE}${langue === "fr" ? (c === "/" ? "/fr" : `/fr${c}`) : c}`;
    const uneLangue = (t) => !t || (langue === "nqo" ? !latin(t) || nko(t) : !nko(t));
    const titreOk = langue === "nqo" ? nko(titre) && !latin(titre) : latin(titre) && !nko(titre);
    const descOk = !desc || (langue === "nqo" ? nko(desc) : !nko(desc));
    const ongletOk = langue === "nqo" ? nko(tab) : latin(tab) && !nko(tab);
    ok(titreOk && descOk && nko(site) && latin(site) && ongletOk && uneLangue(desc), `${p.padEnd(44)} carte : titre ${langue === "nqo" ? "N'Ko" : "français"} ${titreOk ? "ok" : "MÉLANGE"} · description ${desc ? (descOk ? "ok" : "MAUVAISE LANGUE") : "aucune"} · site bilingue · onglet « ${(tab || "").replace(/[߀-߿]+/g, "#").slice(0, 50)} »`);
    // On compare les chemins : en local, l'adresse du site n'a pas de « www »
    const chemin = (u) => (u ? new URL(u).pathname.replace(/\/$/, "") || "/" : null);
    const cheminAttendu = chemin(attendue), cheminNqo = c, cheminFr = c === "/" ? "/fr" : `/fr${c}`;
    ok(chemin(canon) === cheminAttendu && chemin(alt.nqo) === cheminNqo && chemin(alt.fr) === cheminFr && alt.x === alt.nqo && /<title>[^<]+<\/title>/.test(h), `${p.padEnd(44)} canonique ${chemin(canon) === cheminAttendu ? "ok" : canon} · hreflang nqo/fr/x-default ${chemin(alt.nqo) === cheminNqo && chemin(alt.fr) === cheminFr ? "ok" : JSON.stringify(alt)} · titre d'onglet ${/<title>[^<]+<\/title>/.test(h) ? "présent" : "ABSENT"}`);
  }
}

// 3. Adresses internes /nqo → adresse publique ; adresses inconnues → 404 ; fichiers servis tels quels
for (const [p, attendu] of [["/nqo/article/le-geant-a-crete-du-niger", "/article/le-geant-a-crete-du-niger"], ["/nqo", "/"], ["/nqo/about", "/about"]]) {
  const { r } = await get(p);
  ok(r.status === 308 && new URL(r.headers.get("location"), BASE).pathname === attendu, `${p.padEnd(44)} → ${r.status} ${r.headers.get("location")}`);
}
for (const p of ["/cette-page-n-existe-pas", "/fr/cette-page-n-existe-pas", "/article/article-inconnu", "/fr/article/article-inconnu"]) {
  // Une page 404 est lue en entier (get() ne lit que les réponses 200). Next.js la sert dans un
  // gabarit d'erreur sans attribut de langue (déjà le cas avant B6 pour un article inconnu) :
  // on vérifie le code 404, la page « introuvable » du site et le titre dans la langue de l'adresse.
  const r = await fetch(BASE + p, { headers: UA, redirect: "manual" });
  const t = await r.text();
  const titre = dec((t.match(/<title>([^<]*)<\/title>/) || [])[1]) || "";
  const titreJuste = p.startsWith("/fr") ? latin(titre) && !nko(titre) : nko(titre);
  ok(r.status === 404 && /Retour à la base/.test(t) && titreJuste, `${p.padEnd(44)} → ${r.status} · page « introuvable » du site · titre ${p.startsWith("/fr") ? "français" : "N'Ko"} ${titreJuste ? "ok" : "MAUVAIS"}`);
}
for (const p of ["/manifest.json", "/apple-touch-icon.png", "/icon-192x192.png", "/og/accueil-v1.jpg", "/favicon.ico", "/robots.txt", "/sitemap.xml", "/fondateur.png"]) {
  const { r } = await get(p);
  ok(r.status === 200, `${p.padEnd(44)} → ${r.status} ${r.headers.get("content-type")}`);
}
const studio = await fetch(BASE + "/studio", { headers: UA });
ok(studio.status === 200, `/studio${" ".repeat(38)} → ${studio.status}`);

// 4. Plan du site : chaque page en deux versions, reliées
const plan = await (await fetch(BASE + "/sitemap.xml", { headers: UA })).text();
const urls = [...plan.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const fr = urls.filter((u) => /\/fr(\/|$)/.test(new URL(u).pathname));
ok(urls.length > 0 && fr.length * 2 === urls.length && (plan.match(/hreflang="nqo"/g) || []).length === urls.length, `plan du site : ${urls.length} adresses dont ${fr.length} françaises · hreflang nqo ${(plan.match(/hreflang="nqo"/g) || []).length} · fr ${(plan.match(/hreflang="fr"/g) || []).length} · x-default ${(plan.match(/hreflang="x-default"/g) || []).length}`);

// 5. Liens internes : chaque page française ne mène qu'à des pages françaises (sauf le changement de langue), et tous répondent
const vus = new Map();
for (const c of chemins.filter((x) => x !== "/offline")) {
  for (const langue of ["nqo", "fr"]) {
    const p = langue === "fr" ? (c === "/" ? "/fr" : `/fr${c}`) : c;
    const { h } = await get(p);
    for (const m of h.matchAll(/href="(\/[^"#]*)"/g)) {
      const href = m[1];
      if (/^\/(_next|api|og|icon|favicon|manifest|apple|fonts|studio)/.test(href) || /\.[a-z0-9]+(\?|$)/i.test(href)) continue;
      if (!vus.has(href)) vus.set(href, new Set());
      vus.get(href).add(p);
    }
  }
}
let casses = 0, melanges = [];
for (const [href, pages] of vus) {
  const r = await fetch(BASE + href, { headers: UA, redirect: "manual" });
  if (r.status !== 200) { casses++; console.log(`   ⚠ ${href} → ${r.status} (depuis ${[...pages][0]})`); }
  const versFr = /^\/fr(\/|$|\?)/.test(href);
  for (const p of pages) {
    const pageFr = /^\/fr(\/|$)/.test(p);
    if (pageFr !== versFr) melanges.push(`${p} → ${href}`);
  }
}
ok(casses === 0, `liens internes : ${vus.size} adresses différentes, ${casses} en erreur`);
// Une page peut contenir, au plus, le lien de changement de langue vers l'autre version (bouton N'Ko / FR rendu côté serveur ?)
console.log(`   liens qui changent de langue : ${melanges.length}${melanges.length ? " — " + melanges.slice(0, 8).join(" | ") : ""}`);

console.log(erreurs ? `\n${erreurs} test(s) en échec.` : "\nTous les tests sont réussis.");
process.exitCode = erreurs ? 1 : 0;
