// ============================================================================
// N'KO NI LONKO — Rapports de violation CSP (18 octobre 2026)
// ============================================================================
// Les navigateurs envoient ici ce que la règle CSP (proxy.ts, mode « rapport ») aurait
// bloqué. Chaque violation est écrite dans les journaux Vercel (« [CSP] »), pour vérifier
// la règle avant de la passer en mode appliqué. Rien n'est stocké.
// Protections : corps limité à 16 Ko, 10 violations par envoi, 20 envois par minute et par IP.
// ============================================================================

import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

export const runtime = 'nodejs';

const TAILLE_MAX = 16 * 1024;

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || 'https://dummy.upstash.io',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || 'dummy',
});
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 m'),
  prefix: '@upstash/ratelimit/csp',
});

type Rapport = Record<string, unknown>;
const texte = (r: Rapport, ...cles: string[]) => {
  for (const c of cles) if (typeof r[c] === 'string' || typeof r[c] === 'number') return String(r[c]).slice(0, 200);
  return '?';
};

export async function POST(request: Request) {
  const type = request.headers.get('content-type') || '';
  // application/csp-report (report-uri) ou application/reports+json (report-to)
  if (!/csp-report|json/.test(type)) return new NextResponse(null, { status: 415 });

  const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || request.headers.get('x-real-ip') || '';
  if (ip && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const { success } = await ratelimit.limit(ip);
      if (!success) return new NextResponse(null, { status: 429 });
    } catch {
      // Upstash injoignable : on accepte quand même (corps et nombre de rapports limités)
    }
  }

  try {
    const donnees: unknown = JSON.parse((await request.text()).slice(0, TAILLE_MAX));
    // Deux formats : « report-to » (liste de { body }) et « report-uri » ({ "csp-report": … })
    const rapports: Rapport[] = Array.isArray(donnees)
      ? donnees.map((r) => ((r as Rapport).body ?? r) as Rapport)
      : [((donnees as Rapport)['csp-report'] ?? donnees) as Rapport];
    for (const r of rapports.slice(0, 10)) {
      console.warn(
        `🛡️ [CSP] ${texte(r, 'effectiveDirective', 'effective-directive', 'violatedDirective', 'violated-directive')} ← ` +
          `${texte(r, 'blockedURL', 'blocked-uri')} sur ${texte(r, 'documentURL', 'document-uri')}`
      );
    }
  } catch {
    // Rapport illisible : ignoré
  }
  return new NextResponse(null, { status: 204 });
}
