// ============================================================================
// N'KO NI LONKO — Gabarit du Studio Sanity (/studio)
// ============================================================================
// Depuis la langue dans l'adresse (B6, 22 octobre 2026), le gabarit du site est dans
// app/[lang]/layout.tsx (versions N'Ko et française). Le Studio a donc son propre gabarit,
// minimal : il ne charge ni les polices, ni les styles, ni les outils du site.
// ============================================================================
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Studio — N'Ko ni Lonko",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function StudioLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // Même langue et même sens qu'avant (gabarit du site en N'Ko) : le Studio ne change pas
    // d'aspect ; les champs français ont leur propre sens (ChampLtr, SmartBidiInput)
    <html lang="nqo" dir="rtl">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
