import Link from "next/link";

export default function About() {
  return (
    <div className="min-h-screen bg-[#02040a] text-white flex flex-col items-center justify-center p-6 text-center">
      
      {/* Icône décorative */}
      <i className="ph-duotone ph-scroll text-6xl text-[#fbbf24] mb-6 animate-pulse"></i>

      {/* Titre Impérial */}
      <h1 className="text-4xl md:text-5xl font-extrabold text-[#fbbf24] mb-6 font-sans">
        ߞߊ߲߬ߞߎߡߊ / À Propos
      </h1>

      {/* Contenu */}
      <div className="max-w-2xl text-lg text-gray-300 leading-relaxed space-y-6">
        <p dir="rtl" className="text-xl">
          ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ ߦߋ߫ ߓߟߐߟߐ߫ ߝߏߟߏ߲ߝߊߟߊ߲ ߟߋ߬ ߘߌ߫ ߡߌ߲ ߟߊߘߊ߲ߠߍ߲ ߝߘߏ߬ߓߊ߬ ߟߐ߲ߞߏ ߟߎ߬ ߕߌߙߌ߲ߠߌ߲ ߞߊߡߊ߬ ߡߊ߲߬ߘߋ߲߬ ߞߊ߲ ߘߐ߫.
        </p>
        <p>
          N&apos;Ko ni Lonko est une plateforme dédiée à la vulgarisation scientifique et à la diffusion du savoir avancé en langue N&apos;Ko. Notre mission est de rendre l&apos;astronomie, la physique et la biologie accessibles à tous.
        </p>
      </div>

      {/* Bouton Retour */}
      <Link 
        href="/" 
        className="mt-12 px-8 py-3 rounded-full border border-[#fbbf24] text-[#fbbf24] hover:bg-[#fbbf24] hover:text-black transition-all duration-300 font-bold flex items-center gap-2"
      >
        <i className="ph-bold ph-arrow-left"></i>
        <span>Retour à l&apos;accueil / ߞߐߛߊ߬ߦߌ߬</span>
      </Link>
    </div>
  );
}