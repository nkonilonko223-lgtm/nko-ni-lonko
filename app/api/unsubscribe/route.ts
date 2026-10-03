/* eslint-disable no-console */
// ============================================================================
// MATRICE DES DONNÉES : N'KO NI LONKO
// Fichier : app/api/unsubscribe/route.ts
// Rôle : Désinscription (suppression définitive de la fiche abonné — RGPD)
// ============================================================================

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Appelée par le formulaire de la page /desabonnement (POST, pas un simple lien :
// les antivirus de messagerie qui « cliquent » sur les liens ne désabonnent personne).
export async function POST(request: Request) {
  const baseUrl = new URL(request.url).origin;
  const back = (query: string) => NextResponse.redirect(`${baseUrl}/desabonnement?${query}`, 303);

  try {
    const formData = await request.formData();
    const token = formData.get('token');

    if (typeof token !== 'string' || !UUID_REGEX.test(token)) {
      console.warn("⚠️ [Unsubscribe] Jeton absent ou invalide.");
      return back('error=invalid');
    }

    const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
    const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
    const SANITY_API_WRITE_TOKEN = process.env.SANITY_API_WRITE_TOKEN;

    if (!SANITY_PROJECT_ID || !SANITY_API_WRITE_TOKEN) {
      console.error("❌ [Unsubscribe] Clés Sanity manquantes.");
      return back('error=server');
    }

    // 🗑️ Suppression de la fiche privée et d'un éventuel brouillon.
    // Supprimer un identifiant inexistant ne provoque pas d'erreur : la réponse est
    // identique que l'adresse soit inscrite ou non (aucune fuite d'information).
    const docId = `subscriber.${token}`;
    const res = await fetch(
      `https://${SANITY_PROJECT_ID}.api.sanity.io/v2023-10-01/data/mutate/${SANITY_DATASET}`,
      {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${SANITY_API_WRITE_TOKEN}`,
        },
        body: JSON.stringify({
          mutations: [{ delete: { id: docId } }, { delete: { id: `drafts.${docId}` } }],
        }),
      }
    );

    if (!res.ok) {
      console.error(`❌ [Unsubscribe] Suppression Sanity échouée : HTTP ${res.status}`);
      return back('error=server');
    }

    console.info("⚪ [Unsubscribe] Désinscription traitée.");
    return back('done=1');
  } catch (error) {
    console.error("❌ [Unsubscribe] Crash serveur :", error);
    return back('error=server');
  }
}
