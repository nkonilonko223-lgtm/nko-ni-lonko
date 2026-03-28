// ============================================================================
// 🏰 MATRICE DES DONNÉES : N'KO NI LONKO (Niveau 1/10000)
// Fichier : app/api/contact/route.ts
// Rôle : Forteresse Zéro-Trust + Alerte Resend (Architecture "Fantôme")
// ============================================================================

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import disposableDomains from 'disposable-email-domains';

// ⚙️ INFRASTRUCTURE : Bascule sur Serverless Node.js pour supporter la purification DOM
export const runtime = 'nodejs';

// 🛡️ BOUCLIER ZOD (Validation Bilingue & Paranoïaque + Radar Anti-Jetables)
const contactSchema = z.object({
  name: z.string().min(2, "ߕߐ߮ ߡߊߢߌߣߌ߲ߣߍ߲ ߠߋ߬ / Le nom est trop court").max(100).trim(),
  email: z.string()
    .email("ߢߎߡߍߙߋ߲ߞߏ߲ߘߏ ߓߘߍ ߡߊߢߌߣߌ߲ߣߍ߲ ߠߋ߬ / E-mail invalide")
    .trim()
    .toLowerCase()
    .refine((val) => {
      const domain = val.split('@')[1];
      return !disposableDomains.includes(domain);
    }, "ߢߎߡߍߙߋ߲ߞߏ߲ߘߏ ߣߌ߲߬ ߕߍ߫ ߓߍ߲߬ / Les e-mails jetables sont interdits"),
  message: z.string().min(10, "ߗߋߛߓߍ ߞߎ߬ߘߎ߲߬ߣߍ߲߬ ߞߏߖߎ߯ߦߊ߫ / Le message est trop court").max(5000).trim(),
  botField: z.string().max(0, "Intrusion détectée").optional(), 
  timeToFill: z.number().min(4000, "Action trop rapide, robot suspecté"), 
  turnstileToken: z.string().min(1, "Jeton de sécurité manquant") 
});

// 🚦 CERVEAU REDIS (Protection Anti-DDoS Indestructible)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Tolérance : 3 messages toutes les 15 minutes
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, "15 m"),
  analytics: true,
});

export async function POST(request: Request) {
  try {
    // 1. EXTRACTION IP & RATE LIMITING (CERVEAU REDIS)
    const ip = request.headers.get('x-forwarded-for') || 'IP_INCONNUE';
    
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      const { success } = await ratelimit.limit(ip);
      if (!success) {
        return NextResponse.json({ error: "ߌ ߓߘߊ߫ ߗߋߛߓߍ߫ ߛߌߦߊߡߊ߲߫ ߗߋ߫. ߡߊ߬ߞߐ߬ߣߐ߲߬ߠߌ߲ ߞߍ߫. / Trop de tentatives. Veuillez patienter 15 minutes." }, { status: 429 });
      }
    } else {
      console.warn("⚠️ [Alerte] Clés Redis manquantes. Le bouclier Anti-DDoS est désactivé.");
    }

    // 2. PARSING DU CORPS DE LA REQUÊTE
    const body = await request.json();
    
    // 3. VALIDATION ZOD STRICTE
    const result = contactSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0]?.message }, { status: 400 });
    }

    const { name, email, message, botField, turnstileToken } = result.data;

    // 🪤 4. VÉRIFICATION DU POT DE MIEL (Honeypot)
    if (botField && botField.length > 0) {
      console.warn(`🛡️ [Contact] Bot piégé par le Honeypot. IP: ${ip}`);
      return NextResponse.json({ success: true }, { status: 200 }); // On simule un succès pour tromper le robot
    }

    // 🚀 5. VÉRIFICATION MILITAIRE CLOUDFLARE TURNSTILE
    if (!process.env.TURNSTILE_SECRET_KEY) {
      throw new Error("Erreur serveur : Clé secrète Turnstile introuvable.");
    }

    const turnstileVerifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${process.env.TURNSTILE_SECRET_KEY}&response=${turnstileToken}&remoteip=${ip}`
    });

    const turnstileVerifyResult = await turnstileVerifyResponse.json();

    if (!turnstileVerifyResult.success) {
       return NextResponse.json({ error: "ߟߊ߬ߛߙߋ߬ߦߊ߬ߟߌ ߓߘߊ߫ ߗߌߙߏ߲ / Échec de l'authentification sécurisée (Robot détecté)." }, { status: 403 });
    }

    // ========================================================================
    // 🟢 ZONE SÉCURISÉE : ENVOI DU FANTÔME (Resend Uniquement)
    // ========================================================================
    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
      throw new Error("Clé API Resend manquante.");
    }

    // 📧 Envoi Officiel Resend (Design N'Ko RTL)
    const resendResponse = await fetch('https://api.resend.com/emails', {
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
    });

    if (!resendResponse.ok) {
      throw new Error("Erreur Resend");
    }

    return NextResponse.json({ success: true, message: "ߗߋߛߓߍ ߓߘߊ߫ ߛߋ߫" }, { status: 200 });

  } catch (error) {
    console.error("❌ [API Contact] Crash serveur :", error);
    return NextResponse.json({ error: "ߝߎ߬ߕߎ߲߬ߕߌ ߘߏ߫ ߓߘߊ߫ ߞߍ߫ / Une erreur interne est survenue." }, { status: 500 });
  }
}