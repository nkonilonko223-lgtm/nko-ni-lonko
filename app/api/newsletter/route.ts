/* eslint-disable no-console */
// ============================================================================
// MATRICE DES DONNÉES : N'KO NI LONKOs
// Fichier : app/api/newsletter/route.ts
// Rôle : Forteresse d'Abonnement (Anti-Doublons + Jeton Souverain + Sécurité Max)
// ============================================================================

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import disposableDomains from 'disposable-email-domains';

import { generateWelcomeEmail } from './template'; 

// ⚙️ INFRASTRUCTURE : Node.js pour supporter la cryptographie et la purification
export const runtime = 'nodejs';

// 🛡️ OUTIL D'ÉLITE 1 : Obfuscation RGPD pour les logs (ex: mous***@gmail.com)
const maskEmail = (email: string) => {
  const [name, domain] = email.split('@');
  if (!name || !domain) return '*@*';
  return `${name.substring(0, 3)}***@${domain}`;
};

// 🛡️ OUTIL D'ÉLITE 2 : Canonisation (Détruit les alias + et les points Gmail)
const canonicalizeEmail = (email: string) => {
  const parts = email.split('@');
  let local = parts[0]; // 'let' car nous allons le modifier
  const domain = parts[1]; // 'const' car le domaine ne change jamais
  
  local = local.split('+')[0]; // Détruit l'astuce du +12, +99, etc.
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    local = local.replace(/\./g, ''); // Détruit l'astuce des points
  }
  return `${local}@${domain}`;
};

// 🛡️ BOUCLIER ZOD (Radar Anti-Jetables + Exigence Cloudflare)
const newsletterSchema = z.object({
  email: z.string()
    .min(1, "L'adresse e-mail est requise.")
    .email("ߢߎߡߍߙߋ߲ߞߏ߲ߘߏ ߓߘߍ ߡߊߢߌߣߌ߲ߣߍ߲ ߠߋ߬ / E-mail invalide.")
    .trim()
    .toLowerCase()
    .refine((val) => {
      const domain = val.split('@')[1];
      return !disposableDomains.includes(domain);
    }, "ߢߎߡߍߙߋ߲ߞߏ߲ߘߏ ߣߌ߲߬ ߕߍ߫ ߓߍ߲߬ / Les e-mails jetables sont interdits"),
  honeypot: z.string().max(0, "Intrusion détectée").optional(), 
  turnstileToken: z.string().min(1, "Jeton de sécurité manquant") // 🛡️ Le sésame Cloudflare
});

// 🚦 CERVEAU REDIS (Bouclier Anti-DDoS Niveau 1/10000)
const redis = new Redis({
  // URL factice par défaut pour empêcher le serveur de crasher lors de la compilation
  url: process.env.UPSTASH_REDIS_REST_URL || 'https://dummy.upstash.io',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || 'dummy',
});

// Tolérance World Class : 3 essais par minute (Bloque les robots, mais pardonne vite les vrais humains)
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
  prefix: "@upstash/ratelimit/newsletter", // Isole cette limite de tes futures autres API
});

export async function POST(request: Request) {
  try {
    // 🛡️ BOUCLIER CORS STRICT : Rejette les requêtes hors de tes domaines officiels
    const origin = request.headers.get('origin');
    const allowedOrigins = [
      'http://localhost:3000', 
      'https://www.nkonilonko.com', 
      'https://nkonilonko.com'
    ];
    
    if (origin && !allowedOrigins.includes(origin)) {
      console.error(`🚨 [Alerte Sécurité] Attaque CORS bloquée depuis l'origine : ${origin}`);
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // 1. EXTRACTION IP & RATE LIMITING (Lecture profonde derrière les proxys)
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    // Vercel renvoie souvent des IP séparées par des virgules. On isole la toute première (le vrai visiteur).
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : (realIp || 'IP_INCONNUE');
    const baseUrl = new URL(request.url).origin; 
    
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN && ip !== 'IP_INCONNUE') {
      const { success } = await ratelimit.limit(ip);
      if (!success) {
        console.warn(`🚨 [Bouclier Redis] Attaque DDoS bloquée depuis l'IP : ${ip}`);
        return NextResponse.json({ error: "ߌ ߓߘߊ߫ ߢߌߣߌ߲ߞߊߟߌ ߛߌߦߊߡߊ߲߫ ߞߍ߫ / Trop de tentatives. Veuillez patienter 1 minute." }, { status: 429 });
      }
    }

    // 2. PARSING & VALIDATION STRICTE
    const body = await request.json();
    const result = newsletterSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0]?.message }, { status: 400 });
    }

    const { email, honeypot, turnstileToken } = result.data;

    // 🪤 3. VÉRIFICATION DU POT DE MIEL
    if (honeypot && honeypot.length > 0) {
      console.warn(`🛡️ [Newsletter] Bot neutralisé par Honeypot. IP: ${ip}`);
      return NextResponse.json({ success: true, message: "ߌ ߓߘߊ߫ ߡߊߝߘߎ߬" }, { status: 200 });
    }

    // 🚀 4. VÉRIFICATION MILITAIRE CLOUDFLARE TURNSTILE
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
       return NextResponse.json({ error: "ߟߊ߬ߛߙߋ߬ߦߊ߬ߟߌ ߓߘߊ߫ ߗߌߙߏ߲ / Échec de l'authentification (Robot détecté)." }, { status: 403 });
    }

    // 🧪 5. PURIFICATION ET CANONISATION
    
    const pureEmail = canonicalizeEmail(email); // 🔴 L'arme Anti-Alias s'active

    // ========================================================================
    // 🟢 ZONE SÉCURISÉE : LOGIQUE D'IDEMPOTENCE ET GRAVURE SANITY
    // ========================================================================
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
    const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
    const SANITY_API_WRITE_TOKEN = process.env.SANITY_API_WRITE_TOKEN;

    if (!SANITY_PROJECT_ID || !SANITY_API_WRITE_TOKEN || !RESEND_API_KEY) {
        throw new Error("Clés d'API manquantes pour Sanity ou Resend.");
    }

    // 🔍 PHASE A : LE RADAR ANTI-DOUBLONS (Vérification en Temps Réel)
    const query = encodeURIComponent(`*[_type == "subscriber" && email == "${pureEmail}"][0]`);
    const sanityCheckRes = await fetch(`https://${SANITY_PROJECT_ID}.api.sanity.io/v2023-10-01/data/query/${SANITY_DATASET}?query=${query}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${SANITY_API_WRITE_TOKEN}` },
        cache: 'no-store' // 🚀 LE BRISE-CACHE : Interdit à Next.js de mentir, force l'interrogation directe à Sanity
    });

    const sanityCheckData = await sanityCheckRes.json();

    // 🛑 ARRÊT SILENCIEUX : Si l'e-mail existe déjà
    if (sanityCheckData.result) {
        console.info(`ℹ️ [Newsletter] Doublon évité pour : ${maskEmail(email)}`);
        // On renvoie un succès avec la traduction exacte du Dogme
        return NextResponse.json({ success: true, message: "ߌ ߕߎ߲߬ ߡߊߝߘߎ߬ߟߋ߲" }, { status: 200 });
    }

    // 🚀 L'INNOVATION 1/1000 : Nous forgeons la clé nous-mêmes
    const sovereignToken = crypto.randomUUID(); 

    // 🗄️ PHASE B : SAUVEGARDE & IMPOSITION DU TOKEN À SANITY
    const sanityMutation = {
      mutations: [
        {
          create: {
            _id: sovereignToken,
            _type: 'subscriber',
            email: pureEmail,
            status: 'pending', 
            languagePreference: 'nko',
            source: 'footer',
            subscribedAt: new Date().toISOString(),
            // 🛡️ Standard mondial : lien de vérification valable 24h uniquement
            tokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
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

    if (!sanityRes.ok) {
        throw new Error("Échec de la création dans Sanity");
    }
    
    console.log(`✅ [Sanity] Nouvel abonné scellé. Token FORGÉ : ${sovereignToken}`);

    // 📧 PHASE C : L'ARME DE COMMUNICATION (Email de vérification)
    const verifyLink = `${baseUrl}/api/verify?token=${sovereignToken}`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'N\'Ko ni Lonko <newsletter@nkonilonko.com>', 
        to: [pureEmail],
        subject: 'ߌ ߣߌ߫ ߛߣߍ߫ ߟߐ߲ߞߏ ߘߎߢߊ߫ ߘߐ߫ (Bienvenue)',
        html: generateWelcomeEmail(verifyLink) 
      })
    });

    if (!res.ok) {
       const errorDetails = await res.text();
       throw new Error(`Refus Resend: ${errorDetails}`);
    }

    console.info(`✅ [API Newsletter] E-mail envoyé avec succès à : ${maskEmail(email)}`);

    // 🎉 LE TRIOMPHE FINAL
    return NextResponse.json(
      { success: true, message: "ߌ ߓߘߊ߫ ߡߊߝߘߎ߬" },
      { status: 200 }
    );

  } catch (error) {
    console.error("❌ [API Newsletter] Erreur critique :", error);
    return NextResponse.json(
      { error: "ߝߎ߬ߕߎ߲߬ߕߌ ߘߏ߫ ߓߘߊ߫ ߞߍ߫ / Une erreur interne est survenue." },
      { status: 500 }
    );
  }
}