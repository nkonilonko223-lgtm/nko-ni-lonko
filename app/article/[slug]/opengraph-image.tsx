// ============================================================================
// N'KO NI LONKO — OG IMAGE ARTICLE 1/10000
// Fichier : app/article/[slug]/opengraph-image.tsx
// Rôle : Image sociale unique par article — Image Sanity + Titre N'Ko incrusté
// ============================================================================
import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { client } from '../../../sanity/client';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// ==============================================================================
// TYPAGE STRICT
// ==============================================================================
interface OgArticleData {
  title: string;
  category: string;
  mainImageUrl: string | null;
}

// ==============================================================================
// REQUÊTE GROQ CHIRURGICALE
// ==============================================================================
const OG_QUERY = `*[_type == "article" && slug.current == $slug][0] {
  title,
  category,
  "mainImageUrl": mainImage.asset->url
}`;

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // 👑 Chargement parallèle : polices + données article
  const [kigeliaRegular, kigliaBold, articleRaw] = await Promise.all([
    readFile(join(process.cwd(), 'public/fonts/Kigelia.otf')),
    readFile(join(process.cwd(), 'public/fonts/Kigelia1.otf')),
    client.fetch<OgArticleData | null>(OG_QUERY, { slug }),
  ]);

  // 🛡️ Fallback : si l'article n'existe pas → image générique
  const article: OgArticleData = articleRaw ?? {
    title: 'ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ',
    category: 'ߟߐ߲ߞߏ',
    mainImageUrl: null,
  };

  // 🚀 URL image Sanity optimisée pour OG (1200x630, crop, jpg)
  const bgImageUrl = article.mainImageUrl
    ? `${article.mainImageUrl}?w=1200&h=630&fit=crop&fm=jpg&q=85`
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#02040a',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'Kigelia',
        }}
      >
        {bgImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bgImageUrl}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.25,
            }}
          />
        )}

        {/* Overlay gradient — lisibilité du texte */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to bottom, rgba(2,4,10,0.3) 0%, rgba(2,4,10,0.7) 50%, rgba(2,4,10,0.97) 100%)',
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
            background:
              'linear-gradient(90deg, transparent, #fbbf24, transparent)',
            display: 'flex',
          }}
        />

        {/* Coins décoratifs */}
        <div style={{ position: 'absolute', top: '28px', left: '40px', width: '36px', height: '36px', borderTop: '2px solid #fbbf24', borderLeft: '2px solid #fbbf24', display: 'flex' }} />
        <div style={{ position: 'absolute', top: '28px', right: '40px', width: '36px', height: '36px', borderTop: '2px solid #fbbf24', borderRight: '2px solid #fbbf24', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: '28px', left: '40px', width: '36px', height: '36px', borderBottom: '2px solid #fbbf24', borderLeft: '2px solid #fbbf24', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: '28px', right: '40px', width: '36px', height: '36px', borderBottom: '2px solid #fbbf24', borderRight: '2px solid #fbbf24', display: 'flex' }} />

        {/* 👑 Contenu principal — aligné en bas */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '0 72px 56px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {/* Badge catégorie */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              width: 'fit-content',
            }}
          >
            <div
              style={{
                backgroundColor: 'rgba(251,191,36,0.15)',
                border: '1px solid rgba(251,191,36,0.4)',
                borderRadius: '100px',
                padding: '6px 20px',
                display: 'flex',
              }}
            >
              <span
                style={{
                  color: '#fbbf24',
                  fontSize: '18px',
                  letterSpacing: '1px',
                  fontFamily: 'Kigelia',
                }}
              >
                {article.category}
              </span>
            </div>
          </div>

          {/* 👑 Titre N'Ko — SOUVERAIN */}
          <div
            style={{
              fontSize: article.title.length > 60 ? '44px' : '56px',
              fontWeight: 'bold',
              color: '#ffffff',
              fontFamily: 'Kigelia',
              lineHeight: 1.25,
              maxWidth: '1000px',
              direction: 'rtl',
              textAlign: 'right',
            }}
          >
            {article.title}
          </div>

          {/* Séparateur + Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '4px',
            }}
          >
            {/* Signature plateforme */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '2px',
                  backgroundColor: '#fbbf24',
                  display: 'flex',
                }}
              />
              <span
                style={{
                  color: '#9ca3af',
                  fontSize: '16px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                }}
              >
                nkonilonko.com
              </span>
            </div>

            {/* 👑 Logo N'Ko */}
            <span
              style={{
                color: '#ffffff',
                fontSize: '28px',
                fontWeight: 'bold',
                fontFamily: 'Kigelia',
                opacity: 0.6,
              }}
            >
              ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ
              <span style={{ color: '#fbbf24' }}>.</span>
            </span>
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