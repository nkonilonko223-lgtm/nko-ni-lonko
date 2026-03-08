import { Metadata } from "next";
import ContactClient from "./ContactClient";

// 1. LE BOUCLIER SEO (Optimisation 1/1000 pour Google et WhatsApp)
export const metadata: Metadata = {
  title: "ߊ߲ ߟߊߛߐ߬ߘߐ߲߬ | Contact | N'Ko ni Lonko",
  description: "Contactez l'équipe N'Ko ni Lonko. Posez vos questions sur la science, l'astronomie ou la biologie en N'Ko.",
  openGraph: {
    title: "ߊ߲ ߟߊߛߐ߬ߘߐ߲߬ | Contactez N'Ko ni Lonko",
    description: "Rejoignez la révolution scientifique en langue N'Ko.",
    // 🚀 CORRECTION : Utilisation de l'icône réelle du projet
    images: ["/icon-512x512.png"],
  },
};

// 2. L'INJECTION DU VISUEL
export default function ContactPage() {
  return <ContactClient />;
}