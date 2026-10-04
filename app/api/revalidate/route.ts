/* eslint-disable no-console */
// ============================================================================
// MATRICE DES DONNÉES : N'KO NI LONKO
// Fichier : app/api/revalidate/route.ts
// Rôle : « Sonnette » Sanity → l'accueil, le plan du site et l'article se mettent
//        à jour dès qu'un article est publié, modifié ou supprimé.
// ============================================================================

import { NextResponse, type NextRequest } from 'next/server';
import { revalidateTag } from 'next/cache';
import { parseBody } from 'next-sanity/webhook';

export const runtime = 'nodejs';

type CorpsWebhook = { _type?: string; slug?: string };

export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    console.error("❌ [Revalidate] SANITY_REVALIDATE_SECRET manquant.");
    return NextResponse.json({ error: 'Configuration manquante' }, { status: 500 });
  }

  try {
    // Vérifie la signature de Sanity et attend que ses copies soient à jour
    const { isValidSignature, body } = await parseBody<CorpsWebhook>(req, secret);

    if (!isValidSignature) {
      console.warn("🚨 [Revalidate] Signature invalide : appel refusé.");
      return NextResponse.json({ error: 'Signature invalide' }, { status: 401 });
    }

    // 📖 Terme du lexique : dictionnaire, pages des termes et plan du site
    // (les articles relisent leurs termes à chaque visite)
    if (body?._type === 'terme') {
      revalidateTag('terme', { expire: 0 });
      console.info("🔔 [Revalidate] Lexique mis à jour.");
      return NextResponse.json({ revalidated: true, now: Date.now() });
    }

    if (body?._type !== 'article') {
      return NextResponse.json({ revalidated: false, message: 'Type ignoré' });
    }

    // { expire: 0 } : le prochain visiteur reçoit directement la version à jour
    revalidateTag('article', { expire: 0 });
    if (body.slug) revalidateTag(`article-${body.slug}`, { expire: 0 });

    console.info("🔔 [Revalidate] Accueil, plan du site et article mis à jour.");
    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (error) {
    console.error("❌ [Revalidate] Erreur :", error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
