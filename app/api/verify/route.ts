/* eslint-disable no-console */
// ============================================================================
// MATRICE DES DONNÉES : N'KO NI LONKO
// Fichier : app/api/verify/route.ts
// Rôle : Intercepteur Cryptographique Blindé (Token + Expiration + Existence)
// ============================================================================

import { NextResponse } from 'next/server';

// 🚀 Node.js pour le rate limiting header reading
export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    const baseUrl = url.origin;

    // 🛡️ 1. TOKEN PRÉSENT ?
    if (!token) {
      console.warn("⚠️ [Verify] Tentative sans jeton.");
      return NextResponse.redirect(`${baseUrl}?verified=false&reason=missing`);
    }

    // 🛡️ 2. FORMAT UUID VALIDE ? (Bloque les injections non-UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(token)) {
      console.warn(`⚠️ [Verify] Format de jeton invalide : ${token}`);
      return NextResponse.redirect(`${baseUrl}?verified=false&reason=invalid`);
    }

    const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
    const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
    const SANITY_API_WRITE_TOKEN = process.env.SANITY_API_WRITE_TOKEN;

    if (!SANITY_PROJECT_ID || !SANITY_API_WRITE_TOKEN) {
      console.error("❌ [Verify] Clés Sanity manquantes.");
      return NextResponse.redirect(`${baseUrl}?verified=false&reason=server`);
    }

    // 🛡️ 3. VÉRIFICATION QUE LE DOCUMENT EXISTE + EST PENDING + N'EST PAS EXPIRÉ
    const query = encodeURIComponent(`*[_type == "subscriber" && _id == "${token}"][0]`);
    const checkRes = await fetch(
      `https://${SANITY_PROJECT_ID}.api.sanity.io/v2023-10-01/data/query/${SANITY_DATASET}?query=${query}`,
      {
        headers: { Authorization: `Bearer ${SANITY_API_WRITE_TOKEN}` },
        cache: 'no-store',
      }
    );

    const checkData = await checkRes.json();
    const subscriber = checkData.result;

    // 🛡️ Document introuvable
    if (!subscriber) {
      console.warn(`⚠️ [Verify] Jeton introuvable dans Sanity : ${token}`);
      return NextResponse.redirect(`${baseUrl}?verified=false&reason=notfound`);
    }

    // 🛡️ Déjà vérifié — succès silencieux (idempotence)
    if (subscriber.status === 'verified') {
      console.info(`ℹ️ [Verify] Déjà vérifié : ${token}`);
      return NextResponse.redirect(`${baseUrl}?verified=true`);
    }

    // 🛡️ Statut inattendu (ni pending ni verified)
    if (subscriber.status !== 'pending') {
      console.warn(`⚠️ [Verify] Statut inattendu : ${subscriber.status}`);
      return NextResponse.redirect(`${baseUrl}?verified=false&reason=invalid`);
    }

    // 🛡️ TOKEN EXPIRÉ ? (24h maximum — standard mondial)
    if (subscriber.tokenExpiresAt) {
      const expiresAt = new Date(subscriber.tokenExpiresAt).getTime();
      const now = Date.now();
      if (now > expiresAt) {
        console.warn(`⚠️ [Verify] Jeton expiré pour : ${token}`);
        return NextResponse.redirect(`${baseUrl}?verified=false&reason=expired`);
      }
    }

    // 🟢 4. FRAPPE CHIRURGICALE — Patch vers "verified"
    const sanityMutation = {
      mutations: [
        {
          patch: {
            id: token,
            set: { status: 'verified' },
            // 🛡️ Sécurité supplémentaire : on n'accepte de patcher QUE si pending
            ifRevisionID: subscriber._rev,
          }
        }
      ]
    };

    const patchRes = await fetch(
      `https://${SANITY_PROJECT_ID}.api.sanity.io/v2023-10-01/data/mutate/${SANITY_DATASET}`,
      {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${SANITY_API_WRITE_TOKEN}`,
        },
        body: JSON.stringify(sanityMutation),
      }
    );

    if (!patchRes.ok) {
      const err = await patchRes.text();
      console.error(`❌ [Verify] Patch Sanity échoué : ${err}`);
      return NextResponse.redirect(`${baseUrl}?verified=false&reason=server`);
    }

    console.log(`🟢 [Verify] Abonné vérifié avec succès : ${token}`);
    return NextResponse.redirect(`${baseUrl}?verified=true`);

  } catch (error) {
    console.error("❌ [Verify] Crash serveur :", error);
    return NextResponse.redirect(new URL(request.url).origin);
  }
}