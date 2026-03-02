// ============================================================================
// MATRICE DES DONNÉES : N'KO NI LONKO
// Fichier : app/api/newsletter/route.ts
// Rôle : API Inscription (Avec Génération de Jeton Souverain)
// ============================================================================

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateWelcomeEmail } from './template'; 

export const runtime = 'edge';

const newsletterSchema = z.object({
  email: z
    .string()
    .min(1, { message: "L'adresse e-mail est requise." })
    .email({ message: "Le format de l'e-mail est invalide." })
    .trim() 
    .toLowerCase(), 
  honeypot: z.string().max(0).optional(), 
});

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'IP_INCONNUE';
    const baseUrl = new URL(request.url).origin; 
    
    const body = await request.json();
    const result = newsletterSchema.safeParse(body);

    if (!result.success) {
      const errorMessage = result.error.issues[0]?.message || "Données invalides.";
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const { email, honeypot } = result.data;

    if (honeypot && honeypot.length > 0) {
      console.warn(`🛡️ [Bouclier] Bot neutralisé en silence. IP: ${ip} | Faux e-mail: ${email}`);
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
    const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
    const SANITY_API_WRITE_TOKEN = process.env.SANITY_API_WRITE_TOKEN;

    // 🚀 L'INNOVATION 1/1000 : Nous forgeons la clé nous-mêmes
    const sovereignToken = crypto.randomUUID(); 

    // --- PHASE A : SAUVEGARDE & IMPOSITION DU TOKEN À SANITY ---
    if (SANITY_PROJECT_ID && SANITY_API_WRITE_TOKEN) {
      const sanityMutation = {
        mutations: [
          {
            create: {
              _id: sovereignToken, // 🔴 On force Sanity à utiliser NOTRE clé secrète
              _type: 'subscriber',
              email: email,
              status: 'pending', 
              languagePreference: 'nko',
              source: 'footer',
              subscribedAt: new Date().toISOString(),
            }
          }
        ]
      };

      const sanityRes = await fetch(`https://${SANITY_PROJECT_ID}.api.sanity.io/v2023-10-01/data/mutate/${SANITY_DATASET}`, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${SANITY_API_WRITE_TOKEN}`
        },
        body: JSON.stringify(sanityMutation)
      });

      if (sanityRes.ok) {
        console.log(`✅ [Sanity] Abonné scellé. Token FORGÉ : ${sovereignToken}`);
      } else {
        console.error("❌ [Sanity] Échec de l'enregistrement de l'abonné.");
      }
    }

    // --- PHASE B : L'ARME DE COMMUNICATION ---
    if (RESEND_API_KEY) {
      // Nous utilisons directement notre clé forgée pour créer le lien
      const verifyLink = `${baseUrl}/api/verify?token=${sovereignToken}`;

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'N\'Ko ni Lonko <newsletter@nkonilonko.com>', 
          to: [email],
          subject: 'ߌ ߣߌ߫ ߛߣߍ߫ ߟߐ߲ߞߏ ߘߎߢߊ߫ ߘߐ߫ (Bienvenue)',
          html: generateWelcomeEmail(verifyLink) 
        })
      });

      if (!res.ok) {
         const errorDetails = await res.text();
         throw new Error(`Refus Resend: ${errorDetails}`);
      }
      console.log(`✅ [API Newsletter] E-mail envoyé avec succès à : ${email}`);
    }

    return NextResponse.json(
      { success: true, message: "ߌ ߣߌ߫ ߛߣߍ߫ ! Inscription validée." },
      { status: 200 }
    );

  } catch (error) {
    console.error("❌ [API Newsletter] Erreur critique :", error);
    return NextResponse.json(
      { error: "Une perturbation réseau est survenue. Veuillez réessayer." },
      { status: 500 }
    );
  }
}