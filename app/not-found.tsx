import Link from "next/link";

export default function NotFound() {
  return (
    // AJOUT : Structure 'Cosmique' identique à la page À Propos
    <div className="min-h-screen relative flex flex-col items-center justify-center p-6 text-center overflow-hidden bg-[#02040a] text-white selection:bg-[#fbbf24] selection:text-black">

      {/* 1. FOND COSMIQUE (Immersion Totale) */}
      <div className="fixed inset-0 z-0">
         <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-[#02040a] to-[#02040a]"></div>
         {/* Grain texture */}
         <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
      </div>

      {/* 2. GLOW CENTRAL */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#fbbf24] rounded-full blur-[100px] opacity-10 pointer-events-none"></div>

      {/* 3. CONTENU (Au-dessus du fond) */}
      <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in duration-700">

        {/* Icône animée */}
        <div className="relative mb-6">
           <div className="absolute inset-0 bg-[#fbbf24] blur-xl opacity-20 animate-pulse"></div>
           <i className="ph-duotone ph-telescope text-9xl text-[#fbbf24] relative z-10"></i>
        </div>

        <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 mb-2 font-sans tracking-tighter">
          404
        </h1>

        <div className="w-16 h-1 bg-[#fbbf24] mb-8 rounded-full"></div>

        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white">
          Page introuvable <span className="text-[#fbbf24] px-2">/</span> <span className="font-kigelia">ߞߐߜߍ ߡߊ߫ ߛߐ߬ߘߐ߲߬</span>
        </h2>

        <p className="text-gray-400 max-w-lg mb-10 text-lg leading-relaxed">
          Il semble que vous vous soyez perdu dans l&apos;espace... Cette page n&apos;existe pas ou a été déplacée.
          <br/><br/>
          <span className="font-kigelia text-xl text-gray-300">ߌ ߣߊ߬ ߝߐ߫ ߌ ߕߎߣߎ߲ߠߋ߲ ߠߋ߬... ߞߐߜߍ ߣߌ߲߬ ߕߴߦߋ߲߬ ߥߟߊ߫ ߊ߬ ߝߊ߭ ߦߟߍ߬ߡߊ߬ߟߊ߫ ߟߋ߬.</span>
        </p>

        <Link 
          href="/" 
          className="group px-8 py-4 rounded-full bg-[#fbbf24] text-black font-bold text-lg hover:bg-white hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(251,191,36,0.3)] flex items-center gap-3"
        >
          <i className="ph-bold ph-rocket-launch text-xl group-hover:-rotate-45 transition-transform"></i>
          <span>Retour à la base</span>
          <span className="w-[1px] h-4 bg-black/20 mx-1"></span>
          <span className="font-kigelia">ߞߐߛߊ߬ߦߌ߬</span>
        </Link>
      </div>
    </div>
  );
}