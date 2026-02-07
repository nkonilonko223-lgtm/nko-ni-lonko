import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#02040a] text-white flex flex-col items-center justify-center p-6 text-center">
      {/* Icône de télescope ou boussole cassée */}
      <i className="ph-duotone ph-telescope text-8xl text-[#fbbf24] mb-6 opacity-80"></i>

      <h1 className="text-6xl font-extrabold text-[#fbbf24] mb-4">404</h1>
      
      <h2 className="text-2xl md:text-3xl font-bold mb-6 font-sans">
        Page introuvable / ߞߐߜߍ ߡߊ߫ ߛߐ߬ߘߐ߲߬
      </h2>

      {/* CORRECTION ICI : &apos; au lieu de ' */}
      <p className="text-gray-400 max-w-lg mb-10 text-lg">
        Il semble que vous vous soyez perdu dans l&apos;espace... Cette page n&apos;existe pas ou a été déplacée.
        <br/><br/>
       ߌ ߣߊ߬ ߝߐ߫ ߌ ߕߎߣߎ߲ߠߋ߲ ߠߋ߬... ߞߐߜߍ ߣߌ߲߬ ߕߴߦߋ߲߬ ߥߟߊ߫ ߊ߬ ߝߊ߭ ߦߟߍ߬ߡߊ߬ߟߊ߫ ߟߋ߬.
      </p>

      <Link 
        href="/" 
        className="px-8 py-3 rounded-full bg-[#fbbf24] text-black font-bold hover:bg-white transition-all duration-300 flex items-center gap-2"
      >
        <i className="ph-bold ph-house"></i>
        <span>Retour à la base / ߞߐߛߊ߬ߦߌ߬</span>
      </Link>
    </div>
  );
}