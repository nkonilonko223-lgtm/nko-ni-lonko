// ============================================================================
// 🏰 MATRICE DES DONNÉES : N'KO NI LONKO (Niveau 1/10000)
// Fichier : middleware.ts (Racine du projet)
// Rôle : Douane Frontalière Edge (Filtre Anti-Bots et Verrouillage HTTP)
// ============================================================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 🛡️ LISTE NOIRE : Les robots parasites et les outils de piratage
// (On laisse passer Google, Bing, et les réseaux sociaux pour le SEO)
const BANNED_AGENTS = [
  'python-requests', // Scripts d'attaque automatisés
  'curl',            // Aspirateurs de code
  'wget',            // Aspirateurs de site
  'nikto',           // Scanner de vulnérabilités
  'sqlmap',          // Attaque de base de données
  'yandexbot',       // Robot russe agressif (souvent inutile en Afrique/Europe)
  'baiduspider',     // Robot chinois agressif
];

// ✅ CORRECT pour Next.js 16 — remettre "proxy"
export function proxy(request: NextRequest) {
  // 1. LECTURE DU PASSEPORT (Extraction des données)
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';
  const method = request.method;

  // 🛡️ BOUCLIER 1 : FILTRE ANTI-BOTS SAUVAGES
  // Si le passeport contient le nom d'un outil de piratage, on tire.
  if (BANNED_AGENTS.some(bot => userAgent.includes(bot))) {
    console.warn(`🚨 [Middleware] Bot malveillant pulvérisé : ${userAgent}`);
    // Réponse frontale avec le Dogme N'Ko : "Accès Refusé"
    return new NextResponse("ߟߊ߬ߘߌ߬ߢߍ߬ߟߌ ߕߍ߫ / Accès Refusé", { status: 403 });
  }

  // 🛡️ BOUCLIER 2 : VERROUILLAGE DES MÉTHODES HTTP
  // Les pirates utilisent souvent les méthodes TRACE ou TRACK pour chercher des failles.
  const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'];
  if (!allowedMethods.includes(method)) {
    console.warn(`🚨 [Middleware] Méthode HTTP interdite bloquée : ${method}`);
    return new NextResponse("ߢߌߣߌ߲ߞߊߟߌ ߣߌ߲߬ ߕߍ߫ ߓߍ߲߬ / Méthode Non Autorisée", { status: 405 });
  }

  // ========================================================================
  // 🛡️ BOUCLIER 3 : CSP (Content Security Policy) — réécrite le 18 octobre 2026
  // ========================================================================
  // L'ancienne règle exigeait un « nonce » (code différent à chaque visite) sur chaque script.
  // Or les pages sont PRÉPARÉES À L'AVANCE (rapides, en cache) : elles ne peuvent pas porter
  // ce code. Mesure faite : 0 script sur 24 à 31 l'avait → appliquée, la règle aurait bloqué
  // TOUT le JavaScript. Nouvelle règle : les scripts du site lui-même, et seulement les sites
  // tiers réellement utilisés (Cloudflare Turnstile, Sanity, YouTube). Les icônes sont auto-hébergées.
  // Mode RAPPORT : les violations arrivent dans /api/csp-rapport (journaux Vercel). Quand les
  // journaux seront propres (après le 30 octobre), passer en mode appliqué :
  // en-tête « Content-Security-Policy » et ajout de « upgrade-insecure-requests ».
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://cdn.sanity.io https://img.youtube.com https://i.ytimg.com;
    font-src 'self' data:;
    connect-src 'self' https://*.sanity.io wss://*.sanity.io https://challenges.cloudflare.com;
    frame-src 'self' https://challenges.cloudflare.com https://www.youtube.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'self';
    report-uri /api/csp-rapport;
    report-to csp;
  `.replace(/\s{2,}/g, ' ').trim();

  const response = NextResponse.next();

  // 🛡️ BOUCLIER 4 : VERROUILLAGE FINAL DE LA RÉPONSE (Headers)
  response.headers.set('Content-Security-Policy-Report-Only', cspHeader);
  response.headers.set('Reporting-Endpoints', 'csp="/api/csp-rapport"');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  // Réserve des droits de fouille de textes (directive européenne 2019/790, art. 4 ; norme TDMRep du W3C) :
  // nos textes ne servent pas à entraîner des IA sans accord écrit. Aussi dans /.well-known/tdmrep.json
  // et dans les Conditions d'utilisation (partie 10).
  response.headers.set('tdm-reservation', '1');

  return response;
}

// 🎯 LE RADAR DE CIBLAGE (Config)
// On dit au Middleware quelles routes il doit protéger.
export const config = {
  matcher: [
    /*
     * On protège TOUT le site, sauf :
     * 1. Les fichiers statiques cachés (_next/static, _next/image)
     * 2. L'icône du site (favicon.ico)
     * 3. Les fichiers SEO (sitemap.xml, robots.txt)
     * 4. Les assets PWA (manifest, icônes)
     * 5. Le Sanity Studio (/studio)
     * 6. Les routes API (protégées par Turnstile/CRON_SECRET)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|manifest\\.webmanifest|icon-.*\\.png|studio|api/).*)',
  ],
};