// ============================================================================
// N'KO NI LONKO — OG IMAGE HOMEPAGE 1/10000
// Fichier : app/opengraph-image.tsx
// Rôle : Image sociale dynamique pour la homepage (WhatsApp, LinkedIn, X)
// ============================================================================
import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const runtime = 'nodejs';
export const alt = 'ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ | N\'Ko ni Lonko';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  // 👑 N'Ko is King : Chargement de la police souveraine
  const [kigeliaRegular, kigliaBold] = await Promise.all([
    readFile(join(process.cwd(), 'public/fonts/Kigelia.otf')),
    readFile(join(process.cwd(), 'public/fonts/Kigelia1.otf')),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#02040a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 🌟 Halo doré central */}
        <div
          style={{
            position: 'absolute',
            width: '700px',
            height: '700px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(251,191,36,0.08) 0%, transparent 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
          }}
        />

        {/* 🟡 Ligne or supérieure */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '5px',
            background: 'linear-gradient(90deg, transparent, #fbbf24, transparent)',
            display: 'flex',
          }}
        />

        {/* 🟡 Ligne or inférieure */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '5px',
            background: 'linear-gradient(90deg, transparent, #fbbf24, transparent)',
            display: 'flex',
          }}
        />

        {/* Coins décoratifs */}
        <div style={{ position: 'absolute', top: '30px', left: '40px', width: '40px', height: '40px', borderTop: '2px solid #fbbf24', borderLeft: '2px solid #fbbf24', display: 'flex' }} />
        <div style={{ position: 'absolute', top: '30px', right: '40px', width: '40px', height: '40px', borderTop: '2px solid #fbbf24', borderRight: '2px solid #fbbf24', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: '30px', left: '40px', width: '40px', height: '40px', borderBottom: '2px solid #fbbf24', borderLeft: '2px solid #fbbf24', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: '30px', right: '40px', width: '40px', height: '40px', borderBottom: '2px solid #fbbf24', borderRight: '2px solid #fbbf24', display: 'flex' }} />

        {/* 👑 Contenu principal */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          {/* Badge plateforme */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(251,191,36,0.1)',
              border: '1px solid rgba(251,191,36,0.3)',
              borderRadius: '100px',
              padding: '8px 24px',
              marginBottom: '16px',
            }}
          >
            <span style={{ color: '#fbbf24', fontSize: '14px', letterSpacing: '3px', fontFamily: 'Kigelia' }}>
              ߓߟߐߟߐ ߝߏߟߏ߲ߝߊߟߊ߲ ߝߟߐ߫
            </span>
          </div>

          {/* 👑 Titre N'Ko — SOUVERAIN */}
          <div
            style={{
              fontSize: '96px',
              fontWeight: 'bold',
              color: '#ffffff',
              fontFamily: 'Kigelia',
              lineHeight: 1.1,
              textAlign: 'center',
            }}
          >
            ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ
          </div>

          {/* Séparateur doré */}
          <div
            style={{
              width: '160px',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #fbbf24, transparent)',
              display: 'flex',
              margin: '8px 0',
            }}
          />

          {/* Devise française */}
          <div
            style={{
              fontSize: '22px',
              color: '#9ca3af',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              fontFamily: 'Kigelia',
            }}
          >
            La Science et le Savoir en N&apos;Ko
          </div>

          {/* URL */}
          <div
            style={{
              marginTop: '16px',
              fontSize: '18px',
              color: '#fbbf24',
              letterSpacing: '2px',
              opacity: 0.7,
            }}
          >
            nkonilonko.com
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Kigelia', data: kigeliaRegular, style: 'normal', weight: 400 },
        { name: 'Kigelia', data: kigliaBold, style: 'normal', weight: 700 },
      ],
    }
  );
}