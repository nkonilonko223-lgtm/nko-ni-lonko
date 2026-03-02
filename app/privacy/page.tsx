import { Metadata } from "next";
import PrivacyClient from "./PrivacyClient";

// 1. LE BOUCLIER SEO (Optimisation 1/1000 pour Google et Partage)
export const metadata: Metadata = {
  title: "ߜߎ߲߬ߘߏ߬ߦߊ ߞߎ߬ߙߎ߲߬ߘߎ | Confidentialité | N'Ko ni Lonko",
  description: "Politique de confidentialité et protection des données de la plateforme N'Ko ni Lonko. Vos informations scientifiques sont en sécurité.",
  openGraph: {
    title: "ߜߎ߲߬ߘߏ߬ߦߊ ߞߎ߬ߙߎ߲߬ߘߎ | Confidentialité N'Ko ni Lonko",
    description: "La protection de vos données est notre priorité absolue.",
    // 🚀 CORRECTION : Utilisation de l'icône réelle du projet
    images: ["/icon-512x512.png"],
  },
};

// 2. L'INJECTION DU VISUEL
export default function PrivacyPage() {
  return <PrivacyClient />;
}