// ============================================================================
// MATRICE DES DONNÉES : N'KO NI LONKO
// Fichier : app/api/verify/route.ts
// Rôle : Intercepteur Cryptographique (Change le statut Sanity de 🟡 à 🟢)
// ============================================================================

import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    // 1. Radar : On lit l'URL et on extrait le jeton secret
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    const baseUrl = url.origin;

    console.log(`\n📡 [Radar] CLIC INTERCEPTÉ ! Jeton reçu : ${token}`);

    // Si un pirate essaie d'accéder à la page sans jeton
    if (!token) {
      console.warn("⚠️ [Radar] Aucun jeton trouvé, redirection vers l'accueil.");
      return NextResponse.redirect(baseUrl);
    }

    const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
    const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
    const SANITY_API_WRITE_TOKEN = process.env.SANITY_API_WRITE_TOKEN;

    // 2. Frappe Chirurgicale (Patch)
    if (SANITY_PROJECT_ID && SANITY_API_WRITE_TOKEN) {
      const sanityMutation = {
        mutations: [
          {
            patch: {
              id: token,
              set: {
                status: 'verified' // 🟢 Validation de classe mondiale
              }
            }
          }
        ]
      };

      const res = await fetch(`https://${SANITY_PROJECT_ID}.api.sanity.io/v2023-10-01/data/mutate/${SANITY_DATASET}`, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${SANITY_API_WRITE_TOKEN}`
        },
        body: JSON.stringify(sanityMutation)
      });
      
      // Le verdict implacable de Sanity
      if (!res.ok) {
         const err = await res.text();
         console.error(`❌ [Sanity] Erreur de modification (Patch échoué) : ${err}`);
      } else {
         console.log(`🟢 [Vérification] SUCCÈS TOTAL. L'abonné ${token} est passé au vert.`);
      }
    } else {
      console.error("❌ [API Vérification] Clés Sanity manquantes dans le fichier .env.local");
    }

    // 3. Le Triomphe : Redirection
    return NextResponse.redirect(`${baseUrl}?verified=true`);

  } catch (error) {
    console.error("❌ [API Vérification] Crash total du serveur :", error);
    return NextResponse.redirect(new URL(request.url).origin);
  }
}