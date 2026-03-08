/* eslint-disable no-console */
// ============================================================================
// 🏰 MATRICE DES DONNÉES : N'KO NI LONKO (Niveau 1/10000)
// Fichier : app/api/cron/cleanup/route.ts
// Rôle : La Faucheuse Automatique (Nettoyage des brouillons et abonnés expirés)
// ============================================================================

import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: Request) {
  // 🛡️ COUCHE 1 : LE CADENAS VERCEL (Zero Trust)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.error("🚨 [Sécurité] Tentative d'accès non autorisée à la Faucheuse.");
    return NextResponse.json({ error: "ߟߊ߬ߘߌ߬ߢߍ߬ߟߌ ߕߍ߫ / Non autorisé" }, { status: 401 });
  }

  console.info("⚙️ [Faucheuse] Réveil automatique. ߓߍ߬ߙߍ߲߬ߓߍ߬ߙߍ߲߬ߠߌ߲ ߓߘߊ߫ ߘߊߡߌ߬ߣߊ߬...");

  const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
  const SANITY_API_WRITE_TOKEN = process.env.SANITY_API_WRITE_TOKEN;

  try {
   // 🧠 COUCHE 2 : L'INTELLIGENCE GROQ (Ciblage chirurgical)
    // On calcule la date d'il y a 72 heures (3 jours) pour laisser le temps aux lecteurs de valider
    const expirationLimit = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();

    // On cible : 1. Les brouillons (instantanément) OU 2. Les pending vieux de plus de 72h
    const query = encodeURIComponent(
      `*[_type == "subscriber" && (_id in path("drafts.**") || (status == "pending" && _createdAt < "${expirationLimit}"))][0...100]{ _id }`
    );

    const fetchRes = await fetch(`https://${SANITY_PROJECT_ID}.api.sanity.io/v2023-10-01/data/query/${SANITY_DATASET}?query=${query}`, {
       method: 'GET',
       headers: { Authorization: `Bearer ${SANITY_API_WRITE_TOKEN}` },
       cache: 'no-store'
    });
    
    const data = await fetchRes.json();
    const targets = data.result;

    if (!targets || targets.length === 0) {
        console.info("🟢 [Faucheuse] Aucun déchet trouvé. La matrice est propre.");
        return NextResponse.json({ message: "Matrice propre", count: 0 });
    }

    // ⚡ COUCHE 3 : LA FRAPPE GROUPÉE (Batch Mutation)
    const mutations = targets.map((doc: { _id: string }) => ({
      delete: { id: doc._id }
    }));

    const mutateRes = await fetch(`https://${SANITY_PROJECT_ID}.api.sanity.io/v2023-10-01/data/mutate/${SANITY_DATASET}`, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${SANITY_API_WRITE_TOKEN}`
        },
        body: JSON.stringify({ mutations })
    });

    if (!mutateRes.ok) throw new Error("Échec de la mutation Sanity");

    console.info(`🔥 [Faucheuse] ߛߎߘߊ߲ߠߌ߲ ! ${targets.length} cibles désintégrées.`);
    return NextResponse.json({ message: "Purge réussie", count: targets.length });

  } catch (error) {
    console.error("❌ [Faucheuse] Erreur système :", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}