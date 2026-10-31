"use client";

import { useEffect } from "react";
import localFont from "next/font/local";
import PageErreur from "./components/PageErreur";

// Ici le gabarit du site n'existe plus : la même Kigelia (même fichier) est chargée à nouveau
const kigelia = localFont({
  src: [{ path: "./fonts/Kigelia.woff2", weight: "400", style: "normal" }],
  variable: "--font-kigelia",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

// Le gabarit lui-même ne peut pas s'afficher (ex. fichier de code perdu sur un réseau faible).
// La langue vient de l'adresse : le français est sous /fr.
export default function ErreurGlobale({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => { console.error("[Page d'erreur générale]", error); }, [error]);
  const nko = !(typeof window !== "undefined" && /^\/fr(\/|$)/.test(window.location.pathname));
  return (
    <html lang={nko ? "nqo" : "fr"} dir={nko ? "rtl" : "ltr"} className={kigelia.variable} suppressHydrationWarning>
      <body style={{ margin: 0, background: "#0e1322" }} suppressHydrationWarning>
        <PageErreur nko={nko} />
      </body>
    </html>
  );
}
