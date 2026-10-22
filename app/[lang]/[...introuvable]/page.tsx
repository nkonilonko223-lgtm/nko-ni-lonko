import { notFound } from "next/navigation";

// Adresse inconnue, en N'Ko (/…) ou en français (/fr/…) : page « introuvable » du site
// (app/[lang]/not-found.tsx), dans le gabarit de la langue. Depuis la langue dans l'adresse
// (B6), il n'y a plus de gabarit à la racine de app/ pour l'afficher autrement.
export default function Introuvable() {
  notFound();
}
