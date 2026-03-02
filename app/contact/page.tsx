import { Metadata } from "next";
import ContactClient from "./ContactClient";

// 1. LE BOUCLIER SEO (Reste sur le serveur pour Google)
export const metadata: Metadata = {
  title: "Contact | N'Ko ni Lonko",
  description: "Contactez l'équipe N'Ko ni Lonko. Posez vos questions sur la science, l'astronomie ou la biologie en N'Ko.",
  openGraph: {
    title: "Contactez N'Ko ni Lonko",
    description: "Rejoignez la révolution scientifique en langue N'Ko.",
    images: ["/images/og-default.jpg"],
  },
};

// 2. L'INJECTION DU VISUEL (C'est cette partie qui manquait !)
export default function ContactPage() {
  return <ContactClient />;
}