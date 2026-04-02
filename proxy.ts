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
  // 🟢 3. GÉNÉRATION DU SCEAU CRYPTOGRAPHIQUE (NONCE) ET LAISSEZ-PASSER
  // ========================================================================
  // Création d'un mot de passe unique à chaque milliseconde pour valider NOS scripts
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

  // 🛡️ BOUCLIER 3 : L'ARMURE ABSOLUE CSP (Content Security Policy)
  // On dresse la liste blanche stricte (Sanity, Turnstile, YouTube sont autorisés)
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://challenges.cloudflare.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://cdn.sanity.io https://img.youtube.com https://i.ytimg.com;
    font-src 'self' data:;
    connect-src 'self' https://*.sanity.io https://challenges.cloudflare.com;
    frame-src 'self' https://challenges.cloudflare.com https://www.youtube.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'self';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

  // On clone les en-têtes de la requête pour y glisser notre Nonce (Next.js le lira)
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  // 🚨 URGENCE : On passe en mode 'Report-Only' pour ne plus bloquer le design
  requestHeaders.set('Content-Security-Policy-Report-Only', cspHeader);

  // On génère la réponse finale en y attachant la requête modifiée
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // 🛡️ BOUCLIER 4 : VERROUILLAGE FINAL DE LA RÉPONSE (Headers)
  // 🚨 URGENCE : Le navigateur signalera les menaces dans la console au lieu de casser l'UX
  response.headers.set('Content-Security-Policy-Report-Only', cspHeader);
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');

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