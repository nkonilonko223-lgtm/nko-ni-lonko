"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import { abonnerInstallation, modeInstallation, modeInstallationServeur } from "../../lib/installation";

// ============================================================================
// N'KO NI LONKO — Installation de l'application, chargée À LA DEMANDE (gabarit)
// ============================================================================
// Ce petit composant retient dès le chargement l'événement d'installation (lib/installation.ts).
// Le code de la proposition et du guide iPhone n'est téléchargé que si le navigateur peut
// installer l'application (Chrome, Edge, Samsung Internet) ou sur iPhone / iPad : rien pour les
// autres lecteurs, ni dans l'application elle-même.
// ============================================================================

const PropositionInstallation = dynamic(() => import("./PropositionInstallation"), { ssr: false });

export default function Application() {
  const mode = useSyncExternalStore(abonnerInstallation, modeInstallation, modeInstallationServeur);
  return mode === "fenetre" || mode === "guide" ? <PropositionInstallation /> : null;
}
