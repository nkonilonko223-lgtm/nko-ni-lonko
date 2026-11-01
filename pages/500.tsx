import Head from "next/head";
import PageErreur from "../app/components/PageErreur";
import { NOM_REVUE } from "../app/lib/messages-lecteur";

// ============================================================================
// N'KO NI LONKO — Page de secours du serveur (1er novembre 2026)
// ============================================================================
// Une page jamais préparée qui échoue sur le serveur, par exemple pendant une panne de Sanity, ne passe pas
// par app/[lang]/error.tsx : sans cette page, le lecteur voit un message en anglais. Elle est fabriquée à la
// construction, sans lire Sanity. Une seule page pour toutes les adresses : le N'Ko puis le français. Seule
// page du dossier pages/ : tout le site reste dans app/. Aucun code envoyé au navigateur : elle s'affiche seule,
// et le routeur de pages/ ne tente rien sur une adresse qui n'est pas la sienne.
// ============================================================================

// « runtime » est la valeur par défaut : sans elle, les types de Next.js refusent unstable_runtimeJS (construction en échec)
export const config = { unstable_runtimeJS: false, runtime: "nodejs" };

export default function Page500() {
  return (
    <>
      <Head>
        <title>{NOM_REVUE.fr}</title>
        <meta name="robots" content="noindex" />
        <style>{"body { margin: 0; background: #0e1322; }"}</style>
      </Head>
      <PageErreur nko deuxLangues />
    </>
  );
}
