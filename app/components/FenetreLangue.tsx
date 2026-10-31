/* eslint-disable @next/next/no-html-link-for-pages -- vrais liens HTML : ils marchent avant l'arrivée du code du site */
import Image from "next/image";

// ============================================================================
// N'KO NI LONKO — Fenêtre de langue de la première visite (constat A-02, 31 octobre 2026)
// ============================================================================
// Écrite par le serveur, sur les deux accueils seulement. Elle reste cachée (« hidden ») : Google et
// les lecteurs qui ont déjà choisi ne la voient jamais, sans aucun éclair. Le petit script qui la suit
// la montre avant l'affichage de la page, s'il n'y a aucun choix gardé, et ses deux boutons sont de vrais
// liens qui répondent tout de suite, même si le reste du code n'est pas encore arrivé (réseau lent).
// Le choix reste gardé dans « preferred-lang », comme le bouton de langue.
// ============================================================================

const SCRIPT = `(function(){
try{if(localStorage.getItem('preferred-lang'))return}catch(e){return}
var f=document.getElementById('fenetre-langue');if(!f)return;
f.hidden=false;document.body.style.overflow='hidden';document.body.style.touchAction='none';
f.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[data-choix]');if(!a)return;
var c=a.getAttribute('data-choix');try{localStorage.setItem('preferred-lang',c)}catch(x){}
if(navigator.vibrate)navigator.vibrate(c==='nko'?[50,30,50]:30);
if(new URL(a.href).pathname!==location.pathname)return;
e.preventDefault();f.hidden=true;document.body.style.overflow='';document.body.style.touchAction=''})})();`;

export default function FenetreLangue() {
  return (
    <>
    <div
      id="fenetre-langue"
      hidden
      suppressHydrationWarning
      role="dialog"
      aria-modal="true"
      aria-labelledby="fenetre-langue-titre"
      className="fixed inset-0 z-[99999] flex-col items-center justify-center bg-void/95 backdrop-blur-3xl animate-in fade-in duration-1000 [&:not([hidden])]:flex"
      dir="ltr"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-or/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center animate-in zoom-in-95 duration-700 delay-100 fill-mode-forwards px-6 w-full max-w-2xl">
        
        <div className="w-32 h-32 mb-10 relative group flex items-center justify-center p-4 backdrop-blur-xl bg-white/5 border border-white/10 rounded-[2rem] shadow-[inset_0_0_20px_rgba(251,191,36,0.05)]">
            <div className="absolute inset-0 bg-[#fbbf24] blur-2xl opacity-20 rounded-full animate-pulse duration-[3000ms]"></div>
            <Image
                src="/logo/logo-sceau.png"
                alt="Sceau N'Ko ni Lonko" lang="fr"
                width={128} 
                height={128} 
                className="relative z-10 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)] pointer-events-none"
                loading="lazy"
            />
        </div>

        <h2 id="fenetre-langue-titre" className="text-center flex flex-col gap-4 mb-16">
            <span lang="nqo" dir="rtl" className="font-kigelia text-4xl md:text-5xl text-or drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]">ߌ ߟߊ߫ ߞߊ߲ ߛߎߥߊ߲ߘߌ߫</span>
            <span lang="fr" className="text-gray-500 text-xs md:text-sm uppercase tracking-[0.4em] border-t border-white/10 pt-4">
              Choisissez votre langue
            </span>
        </h2>

        <div className="flex flex-col sm:flex-row gap-6 w-full justify-center">
          
          {/* BOUTON N'KO */}
          <a
            href="/"
            data-choix="nko"
            lang="nqo"
            className="no-underline group relative px-10 py-6 w-full sm:w-64 rounded-2xl bg-or/10 border border-or/30 hover:bg-[#fbbf24] transition-colors duration-300 shadow-[0_0_30px_rgba(251,191,36,0.1)] flex flex-col items-center overflow-hidden touch-manipulation cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none"></div>
            <span className="font-kigelia text-4xl text-or group-hover:text-black mb-1 transition-colors relative z-10 pointer-events-none">ߒߞߏ</span>
            <span className="text-[14px] text-or/70 group-hover:text-black/70 tracking-widest uppercase transition-colors relative z-10 pointer-events-none"> ߒߞߏ ߕߊ߬</span>
          </a>

          {/* BOUTON FRANÇAIS */}
          <a
            href="/fr"
            data-choix="fr"
            lang="fr"
            className="no-underline group relative px-10 py-6 w-full sm:w-64 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 transition-colors duration-300 flex flex-col items-center touch-manipulation cursor-pointer"
          >
            <span className="text-2xl text-white/80 group-hover:text-white font-light mb-2 tracking-wider transition-colors pointer-events-none">Français</span>
            <span className="text-[10px] text-gray-500 group-hover:text-gray-300 tracking-widest uppercase transition-colors pointer-events-none">Entrer en Français</span>
          </a>

        </div>

        <p lang="nqo" className="mt-16 text-[11px] text-white/20 uppercase tracking-widest font-kigelia opacity-70 cursor-default pointer-events-none">
           ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ ߞߊ߲ߞߋߦߊ ߓߐߘߊ ߂.߀
        </p>

      </div>
    </div>
      <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />
    </>
  );
}
