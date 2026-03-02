// ============================================================================
// MATRICE DES DONNÉES : N'KO NI LONKO
// Fichier : app/api/contact/route.ts
// Rôle : API de Contact (Sanity + Alerte Souveraine)
// ============================================================================

import { NextResponse } from 'next/server';
import { z } from 'zod';

export const runtime = 'edge';

const contactSchema = z.object({
  name: z.string().min(2, "ߕߐ߮ ߡߊߢߌߣߌ߲ߣߍ߲ ߠߋ߬ (Le nom est trop court)").trim(),
  email: z.string().email("ߢߎߡߍߙߋ߲ߞߏ߲ߘߏ ߓߘߍ ߡߊߢߌߣߌ߲ߣߍ߲ ߠߋ߬ (E-mail invalide)").trim().toLowerCase(),
  message: z.string().min(10, "ߗߋߛߓߍ ߞߎ߬ߘߎ߲߬ߣߍ߲߬ ߞߏߖߎ߯ߦߊ߫ (Le message doit faire au moins 10 caractères)").trim(),
  honeypot: z.string().max(0).optional(),
});

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'IP_INCONNUE';
    const body = await request.json();
    
    const result = contactSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0]?.message }, { status: 400 });
    }

    const { name, email, message, honeypot } = result.data;

    if (honeypot && honeypot.length > 0) {
      console.warn(`🛡️ [Contact] Bot neutralisé en silence. IP: ${ip}`); // 👈 Utilisation de la variable 'ip'
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
    const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
    const SANITY_API_WRITE_TOKEN = process.env.SANITY_API_WRITE_TOKEN;
    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    const promises = [];

    // Frappe A : Gravure dans Sanity
    if (SANITY_PROJECT_ID && SANITY_API_WRITE_TOKEN) {
      const sanityMutation = {
        mutations: [{
          create: {
            _type: 'message',
            name: name,
            email: email,
            content: message,
            status: 'unread',
            submittedAt: new Date().toISOString(),
          }
        }]
      };

      const sanityPromise = fetch(`https://${SANITY_PROJECT_ID}.api.sanity.io/v2023-10-01/data/mutate/${SANITY_DATASET}`, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${SANITY_API_WRITE_TOKEN}`
        },
        body: JSON.stringify(sanityMutation)
      }).then(res => {
        if (!res.ok) throw new Error("Erreur Sanity");
      }).catch(err => console.error("❌ [Sanity] Échec :", err));
      
      promises.push(sanityPromise);
    }

    // Frappe B : Alerte Officielle (Design N'Ko RTL)
    if (RESEND_API_KEY) {
      const resendPromise = fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'N\'Ko ni Lonko <newsletter@nkonilonko.com>', 
          to: ['nkonilonko223@gmail.com'], // 🔴 L'ADRESSE OFFICIELLE
          subject: `🚨 ߗߋߛߓߍ ߞߎߘߊ (${name})`,
          html: `
            <!DOCTYPE html>
            <html lang="nqo" dir="rtl" translate="no" class="notranslate">
            <head>
              <meta charset="utf-8">
              <meta name="google" content="notranslate">
              <style>
                @font-face {
                  font-family: 'Kigelia';
                  src: url('https://www.nkonilonko.com/fonts/Kigelia.otf') format('opentype');
                }
                @font-face {
                  font-family: 'Kigelia';
                  src: url('https://www.nkonilonko.com/fonts/Kigelia1.otf') format('opentype');
                  font-weight: bold;
                }
                body { background-color: #000000; color: #ffffff; margin: 0; padding: 40px 20px; font-family: 'Kigelia', system-ui, sans-serif; text-align: right; }
                .container { max-width: 600px; margin: 0 auto; background-color: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 16px; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); direction: rtl; }
                .logo { text-align: center; font-size: 32px; font-weight: bold; color: #ffffff; margin-bottom: 40px; }
                .logo-dot { color: #fbbf24; }
                .header { border-bottom: 1px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
                .title { color: #fbbf24; font-size: 24px; margin: 0; }
                .info-row { margin-bottom: 12px; font-size: 18px; color: #e5e5e5; }
                .label { color: #fbbf24; font-weight: bold; }
                .message-content { background-color: #111111; border-right: 4px solid #fbbf24; padding: 25px; border-radius: 8px; margin-top: 30px; color: #d4d4d4; font-family: sans-serif; font-size: 16px; line-height: 1.8; white-space: pre-wrap; direction: auto; text-align: right; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="logo">ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ<span class="logo-dot">.</span></div>
                
                <div class="header">
                  <h2 class="title">🚨 ߗߋߛߓߍ ߞߎߘߊ ߓߘߊ߫ ߛߋ߫</h2>
                </div>

                <div class="info-row">
                  <span class="label">ߕߐ߮ :</span> ${name}
                </div>
                <div class="info-row">
                  <span class="label">ߢߎߡߍߙߋ߲ߞߏ߲ߘߏ :</span> <a href="mailto:${email}" style="color: #fbbf24; text-decoration: none;">${email}</a>
                </div>

                <div class="message-content" dir="auto">
                  ${message}
                </div>
              </div>
            </body>
            </html>
          `
        })
      }).then(res => {
        if (!res.ok) throw new Error("Erreur Resend");
      }).catch(err => console.error("❌ [Resend] Échec :", err));

      promises.push(resendPromise);
    }

    await Promise.all(promises);

    return NextResponse.json({ success: true, message: "ߗߋߛߓߍ ߓߘߊ߫ ߛߋ߫" }, { status: 200 });

  } catch (error) {
    console.error("❌ [API Contact] Crash serveur :", error); // 👈 Utilisation de la variable 'error'
    return NextResponse.json({ error: "ߝߎ߬ߕߎ߲߬ߕߌ ߘߏ߫ ߓߘߊ߫ ߞߍ߫" }, { status: 500 });
  }
}