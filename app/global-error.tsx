"use client";

import { useEffect } from "react";
import PageErreur from "./components/PageErreur";

// Le gabarit lui-même ne peut pas s'afficher (ex. fichier de code perdu sur un réseau faible).
// La langue vient de l'adresse : le français est sous /fr.
export default function ErreurGlobale({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => { console.error("[Page d'erreur générale]", error); }, [error]);
  const nko = !(typeof window !== "undefined" && /^\/fr(\/|$)/.test(window.location.pathname));
  return (
    <html lang={nko ? "nqo" : "fr"} dir={nko ? "rtl" : "ltr"} suppressHydrationWarning>
      <body style={{ margin: 0, background: "#0e1322" }} suppressHydrationWarning>
        <PageErreur nko={nko} />
      </body>
    </html>
  );
}
