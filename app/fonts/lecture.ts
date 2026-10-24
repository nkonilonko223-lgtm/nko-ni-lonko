import { Literata } from "next/font/google";

// ============================================================================
// N'KO NI LONKO — Police de lecture des articles (novembre 2026)
// ============================================================================
// Literata : police à empattements dessinée pour la lecture longue sur écran (licence libre
// OFL). Seulement pour le TEXTE français des articles (app/globals.css, « LECTURE ») ; titres,
// encadrés et interface gardent Montserrat, le N'Ko garde Kigelia. Next.js la télécharge à la
// construction et la sert depuis le site : aucun appel à Google chez le lecteur.
// Importée seulement par la page article (ArticleClient.tsx) et le PDF d'un numéro : les autres
// pages ne la chargent pas. Une police « variable » par style (≈ 40 Ko, normal et italique),
// tous les poids dedans. Pas de préchargement : l'image de couverture passe d'abord ; le texte
// s'affiche tout de suite dans la police de secours aux mêmes mesures, puis en Literata.
// ============================================================================
export const literata = Literata({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-lecture",
  display: "swap",
  preload: false,
  fallback: ["Georgia", "serif"],
});
