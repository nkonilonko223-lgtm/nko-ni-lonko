// ============================================================================
// N'KO NI LONKO — Garde du bouton de langue (1er novembre 2026)
// ============================================================================
// Un petit script écrit dans la page, sans React : il réagit dès le toucher, même avant l'arrivée du code,
// et il passe avant React et avant NetworkBoundary (c'est le premier à écouter sur document).
// - Premier toucher : bouton appuyé et petit indicateur (globals.css), puis bouton occupé.
//   Avant l'arrivée du code, React n'entend pas l'appui : il finirait aussitôt de démarrer, et l'écran
//   attendrait la fin de ce travail pour montrer la réaction.
// - Touchers suivants : ignorés tant que le changement dure, puis tant que le lecteur continue de toucher
//   (chaque toucher ignoré relance un court repos) : une rafale ne fait qu'un seul changement.
// - Fin : BoutonLangue appelle window.__langueArrivee quand l'adresse change (l'autre langue est arrivée, ou
//   une autre page a remplacé le changement). Même adresse : le changement est encore en route. Filet : 15 s.
// - Vrai rechargement (application installée, lien touché avant l'arrivée du code) : la clé prévient la page
//   suivante, qui ignore les touchers jusqu'à ce que son code soit prêt, 15 s au plus après son arrivée. La
//   page peut arriver tard sur un réseau lent : la clé reste valable 60 s, même si le bouton a été libéré.
// ============================================================================

declare global {
  interface Window {
    __langueArrivee?: () => void;
  }
}

export const scriptGardeLangue = `(function(){
var MAX=15000,RESEAU_LENT=60000,REPOS=700,CLE='nko_langue_demandee',fin=0,depuis=null,minuteur;
function cible(e){return e.target.closest&&e.target.closest('a.btn-lang')}
function oublier(){try{sessionStorage.removeItem(CLE)}catch(x){}}
function relacher(){var a=document.querySelector('a.btn-lang[data-actif]:not([aria-busy])');if(a)a.removeAttribute('data-actif')}
function liberer(garderCle){clearTimeout(minuteur);depuis=null;if(!garderCle)oublier();var a=document.querySelector('a.btn-lang[aria-busy]');if(a){a.removeAttribute('aria-busy');a.removeAttribute('aria-disabled');a.removeAttribute('data-actif')}}
try{var t=Number(sessionStorage.getItem(CLE));oublier();if(t&&Date.now()-t<RESEAU_LENT)fin=Date.now()+MAX}catch(x){}
function cacher(e){if(cible(e)&&!document.documentElement.hasAttribute('data-site-vivant'))e.stopImmediatePropagation()}
document.addEventListener('pointerdown',function(e){var a=cible(e);if(!a)return;cacher(e);if(!e.button&&Date.now()>=fin)a.setAttribute('data-actif','')},true);
document.addEventListener('touchstart',cacher,{capture:true,passive:true});
document.addEventListener('mousedown',cacher,true);
document.addEventListener('pointerup',function(){setTimeout(relacher,200)},true);
document.addEventListener('pointercancel',relacher,true);
document.addEventListener('contextmenu',relacher,true);
document.addEventListener('click',function(e){var a=cible(e);if(!a||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;var n=Date.now();
if(n<fin){e.preventDefault();e.stopImmediatePropagation();fin=Math.max(fin,n+REPOS);return}
try{sessionStorage.setItem(CLE,String(n))}catch(x){}
depuis=location.pathname;
if(navigator.onLine===false){fin=n+REPOS;return}
fin=n+MAX;a.setAttribute('data-actif','');a.setAttribute('aria-busy','true');a.setAttribute('aria-disabled','true');
clearTimeout(minuteur);minuteur=setTimeout(function(){fin=0;liberer(true)},MAX)},true);
window.__langueArrivee=function(){if(depuis===location.pathname)return;var n=Date.now();if(fin>n)fin=n+REPOS;liberer()};
window.addEventListener('pageshow',function(e){if(e.persisted){fin=0;liberer()}});
})();`;
