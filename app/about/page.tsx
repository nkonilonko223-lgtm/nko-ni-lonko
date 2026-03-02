import { Metadata } from "next";
import AboutClient from "./AboutClient";

// 1. LE BOUCLIER SEO (Optimisation 1/1000 pour Google et Partage)
export const metadata: Metadata = {
  title: "ߞߊ߲߬ߞߎߡߊ | À Propos | N'Ko ni Lonko",
  description: "Notre mission : vulgariser la science (Astronomie, Physique, Biologie) en langue N'Ko pour le partage du savoir universel.",
  openGraph: {
    title: "ߞߊ߲߬ߞߎߡߊ | À Propos de N'Ko ni Lonko",
    description: "Science et Savoir pour tous, sans frontières linguistiques.",
    // 🚀 CORRECTION : Utilisation de l'icône réelle du projet
    images: ["/icon-512x512.png"],
  },
};

// 2. L'INJECTION DU VISUEL
export default function About() {
  return <AboutClient />;
}