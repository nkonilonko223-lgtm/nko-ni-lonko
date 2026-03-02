import { Metadata } from "next";
import TermsClient from "./TermsClient";

// 1. LE BOUCLIER SEO (Optimisation 1/1000 pour Google et Partage)
export const metadata: Metadata = {
  title: "ߟߊߓߊ߯ߙߊߟߌ ߛߙߊߕߌ ߟߎ߬ | Conditions d'utilisation | N'Ko ni Lonko",
  description: "Lisez les conditions générales d'utilisation et la charte éditoriale de la plateforme scientifique N'Ko ni Lonko. Règles, propriété intellectuelle et engagements.",
  openGraph: {
    title: "ߟߊߓߊ߯ߙߊߟߌ ߛߙߊߕߌ ߟߎ߬ | Conditions N'Ko ni Lonko",
    description: "Le socle juridique et le pacte des auteurs de notre sanctuaire scientifique.",
    // 🚀 CORRECTION : Utilisation de l'icône réelle du projet
    images: ["/icon-512x512.png"],
  },
};

// 2. L'INJECTION DU VISUEL
export default function TermsPage() {
  return <TermsClient />;
}