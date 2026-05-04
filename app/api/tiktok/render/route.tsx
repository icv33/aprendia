export const runtime = 'edge'

import { ImageResponse } from 'next/og'

const TYPE_COLORS: Record<string, string> = {
  truco:         '#00FFB2',
  vida_facil:    '#3B82F6',
  mito:          '#8B5CF6',
  caso_practico: '#F59E0B',
}

const TYPE_LABELS: Record<string, string> = {
  truco:         'TRUCO IA',
  vida_facil:    'VIDA FÁCIL',
  mito:          'MITO',
  caso_practico: 'CASO REAL',
}

const FALLBACK_BG = 'linear-gradient(160deg, #080D1A 0%, #0C1525 60%, #080D1A 100%)'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const slideType = searchParams.get('slideType') ?? 'content'
  const postType  = searchParams.get('type') ?? 'truco'
  const titulo    = searchParams.get('titulo') ?? ''
  const contenido = searchParams.get('contenido') ?? ''
  const subtitulo = searchParams.get('subtitulo') ?? ''
  const cta       = searchParams.get('cta') ?? ''
  const num       = parseInt(searchParams.get('num') ?? '1')
  const bgUrl     = searchParams.get('bg') ?? ''
  const forDownload = searchParams.get('dl') === '1'

  const accent = TYPE_COLORS[postType] ?? '#00FFB2'
  const hasBg  = bgUrl.startsWith('http')

  let element: React.ReactElement

  if (slideType === 'cover') {
    element = (
      <div style={{ position: 'relative', width: 1080, height: 1080, display: 'flex', overflow: 'hidden' }}>
        {/* Background */}
        {hasBg ? (
          <img src={bgUrl} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
        ) : (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: FALLBACK_BG, display: 'flex' }} />
        )}

        {/* Dark overlay */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.82) 100%)', display: 'flex' }} />

        {/* Tag top-left */}
        <div style={{ position: 'absolute', top: 56, left: 60, display: 'flex', alignItems: 'center', gap: 10, background: `${accent}28`, border: `1.5px solid ${accent}55`, borderRadius: 100, padding: '8px 20px' }}>
          <div style={{ width: 9, height: 9, borderRadius: '50%', background: accent, display: 'flex' }} />
          <span style={{ color: accent, fontSize: 20, fontWeight: 700, letterSpacing: 2 }}>{TYPE_LABELS[postType]}</span>
        </div>

        {/* Title + subtitle - bottom left */}
        <div style={{ position: 'absolute', bottom: 100, left: 60, right: 60, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ fontSize: titulo.length > 25 ? 78 : 92, fontWeight: 900, color: '#ffffff', lineHeight: 1.05, letterSpacing: -2 }}>
            {titulo}
          </div>
          {subtitulo ? (
            <div style={{ fontSize: 32, color: 'rgba(255,255,255,0.65)', fontWeight: 400, lineHeight: 1.4, display: 'flex' }}>
              {subtitulo}
            </div>
          ) : null}
        </div>

        {/* Bottom bar */}
        <div style={{ position: 'absolute', bottom: 44, left: 60, right: 60, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'rgba(255,255,255,0.5)', display: 'flex' }}>Desliza →</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: 'rgba(255,255,255,0.55)', display: 'flex' }}>@aprendia.ia</div>
        </div>
      </div>
    )

  } else if (slideType === 'content') {
    element = (
      <div style={{ position: 'relative', width: 1080, height: 1080, display: 'flex', overflow: 'hidden' }}>
        {/* Background */}
        {hasBg ? (
          <img src={bgUrl} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
        ) : (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: FALLBACK_BG, display: 'flex' }} />
        )}

        {/* Gradient overlay — heavier at bottom */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.4) 45%, rgba(0,0,0,0.88) 100%)', display: 'flex' }} />

        {/* Number — top left, large */}
        <div style={{ position: 'absolute', top: 52, left: 56, display: 'flex' }}>
          <span style={{ fontSize: 120, fontWeight: 900, color: '#ffffff', lineHeight: 1, opacity: 0.92 }}>{num}.</span>
        </div>

        {/* Content — bottom */}
        <div style={{ position: 'absolute', bottom: 90, left: 60, right: 60, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ fontSize: titulo.length > 22 ? 58 : 70, fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>
            {titulo}
          </div>
          <div style={{ fontSize: 34, color: 'rgba(255,255,255,0.78)', lineHeight: 1.55, fontWeight: 400, display: 'flex' }}>
            {contenido}
          </div>
        </div>

        {/* Handle bottom-right */}
        <div style={{ position: 'absolute', bottom: 44, right: 60, display: 'flex' }}>
          <span style={{ fontSize: 24, fontWeight: 600, color: 'rgba(255,255,255,0.45)' }}>@aprendia.ia</span>
        </div>
      </div>
    )

  } else {
    // CTA slide
    element = (
      <div style={{ position: 'relative', width: 1080, height: 1080, display: 'flex', overflow: 'hidden' }}>
        {/* Background */}
        {hasBg ? (
          <img src={bgUrl} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
        ) : (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: FALLBACK_BG, display: 'flex' }} />
        )}

        {/* Heavy dark overlay */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.78)', display: 'flex' }} />

        {/* Center glow */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: 600, height: 600, borderRadius: '50%', background: `radial-gradient(circle, ${accent}18 0%, transparent 65%)`, display: 'flex', transform: 'translate(-50%,-50%)' }} />

        {/* Centered content */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 48, padding: '0 80px', textAlign: 'center' }}>
          <div style={{ fontSize: cta.length > 40 ? 54 : 64, fontWeight: 800, color: '#ffffff', lineHeight: 1.2, textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
            {cta}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', background: accent, borderRadius: 100, padding: '18px 52px' }}>
            <span style={{ fontSize: 30, fontWeight: 800, color: '#080D1A' }}>↓ Link en bio</span>
          </div>

          <div style={{ fontSize: 26, fontWeight: 800, color: 'rgba(255,255,255,0.3)', display: 'flex' }}>
            Aprend<span style={{ color: accent }}>IA</span>
          </div>
        </div>
      </div>
    )
  }

  return new ImageResponse(element, {
    width: 1080,
    height: 1080,
    headers: forDownload
      ? { 'Content-Disposition': `attachment; filename="aprendia-${slideType}-${num}.png"` }
      : {},
  })
}
