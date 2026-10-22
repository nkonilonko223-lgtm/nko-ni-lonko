// ============================================================================
// N'KO NI LONKO — Lien interne d'un composant SERVEUR, dans la langue de la page
// ============================================================================
// Langue dans l'adresse (B6, 22 octobre 2026) : sur une page française (/fr/…), les liens
// internes mènent aux pages françaises ; sur une page N'Ko, aux pages N'Ko (sans préfixe).
// La langue est lue dans l'adresse par next/root-params (dossier app/[lang]) : rien à passer
// de composant en composant. Les composants CLIENT utilisent lien() de useLanguage().
// Ne jamais l'importer dans un fichier « use client » (next/root-params l'interdit).
// ============================================================================
import Link from "next/link";
import type { ComponentProps } from "react";
import { lang } from "next/root-params";
import { cheminLangue, langueDe } from "../lib/langue";

type Props = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

export default async function LienLangue({ href, ...props }: Props) {
  return <Link href={cheminLangue(langueDe(await lang()), href)} {...props} />;
}
