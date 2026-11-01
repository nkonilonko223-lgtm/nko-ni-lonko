import Head from "next/head";
import PageErreur from "../app/components/PageErreur";
import { NOM_REVUE } from "../app/lib/messages-lecteur";

// ============================================================================
// N'KO NI LONKO — Page de secours du serveur (1er novembre 2026)
// ============================================================================
// Une page jamais préparée qui échoue sur le serveur, par exemple pendant une panne de Sanity, ne passe pas
// par app/[lang]/error.tsx : sans cette page, le lecteur voit un message en anglais. Elle est fabriquée à la
// construction, sans lire Sanity. Une seule page pour toutes les adresses : le N'Ko puis le français. Seul
// fichier du dossier pages/ : tout le site reste dans app/.
// ============================================================================

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
