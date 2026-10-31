import { PAGE_ERREUR_TEXTE, PAGE_ERREUR_TITRE, REESSAYER } from "./messages-lecteur";

// ============================================================================
// N'KO NI LONKO — Fichier de code perdu au premier chargement (constat G-01, 31 octobre 2026)
// ============================================================================
// Sur un réseau faible, un fichier de code peut ne jamais arriver : la page reste visible, mais aucun
// bouton ne répond, et rien ne le dit. Ce petit script, écrit dans la page, ne dépend pas de React (c'est
// peut-être lui qui manque) : si un fichier /_next/static échoue avant que le site soit prêt, un bandeau
// le dit et « Réessayer » recharge la page. Le site prêt pose data-site-vivant sur <html>
// (LanguageProvider) : après, une page d'erreur prend le relais (app/[lang]/error.tsx).
// ============================================================================

const CARTE = "position:fixed;left:16px;right:16px;bottom:16px;z-index:2147483647;max-width:440px;margin:0 auto;padding:18px 20px;box-sizing:border-box;border-radius:20px;border:1px solid rgba(242,181,68,.45);background:#111829;color:#ebe5d8;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.6)";
const TITRE = "margin:0;font-size:17px;font-weight:700;line-height:1.5;color:#fff7e8";
const TEXTE = "margin:6px 0 14px;font-size:15px;line-height:1.55;color:#c9c3b4";
const BOUTON = "min-height:48px;width:100%;padding:0 22px;border:none;border-radius:999px;font-size:16px;font-weight:700;color:#0e1322;background:#f2b544;cursor:pointer";

export function scriptFichierPerdu(nko: boolean): string {
  const choisir = (texte: { nko: string; fr: string }) => (nko ? texte.nko : texte.fr);
  const donnees = JSON.stringify({
    dir: nko ? "rtl" : "ltr",
    lang: nko ? "nqo" : "fr",
    police: nko ? "var(--font-kigelia,system-ui),system-ui,sans-serif" : "var(--font-fr,system-ui),system-ui,sans-serif",
    titre: choisir(PAGE_ERREUR_TITRE),
    texte: choisir(PAGE_ERREUR_TEXTE),
    bouton: choisir(REESSAYER),
    carte: CARTE,
    styleTitre: TITRE,
    styleTexte: TEXTE,
    styleBouton: BOUTON,
  });
  return `(function(){var d=${donnees.replace(/</g, "\\u003c")};
function poser(){if(document.getElementById('fichier-perdu')||document.documentElement.hasAttribute('data-site-vivant'))return;
var c=document.createElement('div');c.id='fichier-perdu';c.setAttribute('role','alert');c.dir=d.dir;c.lang=d.lang;c.style.cssText=d.carte+';font-family:'+d.police;
var t=document.createElement('p');t.style.cssText=d.styleTitre;t.textContent=d.titre;
var p=document.createElement('p');p.style.cssText=d.styleTexte;p.textContent=d.texte;
var b=document.createElement('button');b.type='button';b.style.cssText=d.styleBouton+';font-family:'+d.police;b.textContent=d.bouton;b.onclick=function(){location.reload()};
c.appendChild(t);c.appendChild(p);c.appendChild(b);document.body.appendChild(c)}
window.addEventListener('error',function(e){var s=e.target;if(!s||s.tagName!=='SCRIPT'||!s.src||s.src.indexOf('/_next/static/')<0)return;
if(document.body)poser();else document.addEventListener('DOMContentLoaded',poser)},true)})();`;
}
