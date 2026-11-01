import { Head, Html, Main, NextScript } from "next/document";

// Seulement pour pages/500.tsx : le N'Ko vient d'abord, le français y est marqué lang="fr"
export default function Document() {
  return (
    <Html lang="nqo">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
