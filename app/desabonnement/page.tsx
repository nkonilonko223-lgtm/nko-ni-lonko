import type { Metadata } from "next";
import Link from "next/link";

// ============================================================================
// N'KO NI LONKO — Page de désinscription
// Fichier : app/desabonnement/page.tsx
// Rôle : Confirmer la désinscription par un bouton (formulaire POST, sans JavaScript)
// ============================================================================

export const metadata: Metadata = {
  title: "Désabonnement | N'Ko ni Lonko",
  robots: { index: false, follow: false },
};

// ⚠️ TEXTES N'KO À FOURNIR PAR LA RÉDACTION (règle : on n'invente jamais de N'Ko).
// Tant qu'un texte est vide, seule la version française s'affiche.
const TEXTES_NKO = {
  titre: "",
  explication: "",
  bouton: "",
  fait: "",
  invalide: "",
  erreur: "",
  accueil: "",
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function Bilingue({ nko, fr }: { nko: string; fr: string }) {
  return (
    <>
      {nko && (
        <span lang="nqo" dir="rtl" className="block font-kigelia mb-2">
          {nko}
        </span>
      )}
      <span lang="fr" dir="ltr" className="block">
        {fr}
      </span>
    </>
  );
}

export default async function DesabonnementPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; done?: string; error?: string }>;
}) {
  const { token, done, error } = await searchParams;
  const tokenValide = typeof token === "string" && UUID_REGEX.test(token);

  let message: { nko: string; fr: string };
  if (done === "1") {
    message = {
      nko: TEXTES_NKO.fait,
      fr: "C'est fait : votre adresse a été supprimée de notre liste. Vous ne recevrez plus nos e-mails.",
    };
  } else if (error === "server") {
    message = {
      nko: TEXTES_NKO.erreur,
      fr: "Une erreur est survenue. Réessayez plus tard, ou écrivez-nous depuis la page Contact.",
    };
  } else if (tokenValide) {
    message = {
      nko: TEXTES_NKO.explication,
      fr: "Cliquez sur le bouton pour supprimer votre adresse de la liste de N'Ko ni Lonko.",
    };
  } else {
    message = {
      nko: TEXTES_NKO.invalide,
      fr: "Ce lien est invalide ou incomplet. Utilisez le lien reçu dans notre e-mail.",
    };
  }

  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-16 text-center bg-[#02040a] text-white">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">
        <Bilingue nko={TEXTES_NKO.titre} fr="Se désabonner" />
      </h1>

      <div className="w-16 h-1 bg-[#fbbf24] mb-8 rounded-full" />

      <p className="text-gray-300 max-w-md mb-10 text-lg leading-relaxed">
        <Bilingue nko={message.nko} fr={message.fr} />
      </p>

      {tokenValide && done !== "1" && (
        <form method="post" action="/api/unsubscribe">
          <input type="hidden" name="token" value={token} />
          <button
            type="submit"
            className="px-8 py-4 rounded-full bg-[#fbbf24] text-black font-bold hover:bg-white transition-colors"
          >
            <Bilingue nko={TEXTES_NKO.bouton} fr="Me désabonner" />
          </button>
        </form>
      )}

      <Link href="/" className="mt-10 text-[#fbbf24] underline underline-offset-4">
        <Bilingue nko={TEXTES_NKO.accueil} fr="Retour à l'accueil" />
      </Link>
    </main>
  );
}
