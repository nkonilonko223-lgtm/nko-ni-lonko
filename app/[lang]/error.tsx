"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import PageErreur from "../components/PageErreur";

// Une page du site ne peut pas s'afficher : le gabarit reste, la page d'erreur prend sa place
export default function Erreur({ error }: { error: Error & { digest?: string } }) {
  const { lang } = useParams<{ lang: string }>();
  useEffect(() => { console.error("[Page d'erreur]", error); }, [error]);
  return <PageErreur nko={lang !== "fr"} />;
}
