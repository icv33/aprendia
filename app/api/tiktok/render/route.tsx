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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const slideType = searchParams.get('slideType') ?? 'content'
  const postType  = searchParams.get('type') ?? 'truco'
  const titulo    = searchParams.get('titulo') ?? ''
  const contenido = searchParams.get('contenido') ?? ''
  const subtitulo = searchParams.get('subtitulo') ?? ''
  const cta       = searchParams.get('cta') ?? ''
  const num       = parseInt(searchParams.get('num') ?? '1')
  const forDownload = searchParams.get('dl') === '1'

  const accent = TYPE_COLORS[postType] ?? '#00FFB2'
  const bg = 'linear-gradient(160deg, #080D1A 0%, #0C1525 60%, #080D1A 100%)'

  let element: React.ReactElement

  if (slideType === 'cover') {
    element = (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: bg, padding: '72px', position: 'relative' }}>
        {/* Glow */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 440, height: 440, borderRadius: '50%', background: `radial-gradient(circle, ${accent}22 0%, transparent 65%)`, display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: 60, left: -60, width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, ${accent}10 0%, transparent 65%)`, display: 'flex' }} />

        {/* Tag pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: `${accent}22`, border: `1.5px solid ${accent}44`, borderRadius: 100, padding: '10px 22px', width: 'fit-content' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: accent, display: 'flex' }} />
          <span style={{ color: accent, fontSize: 22, fontWeight: 700, letterSpacing: 2 }}>{TYPE_LABELS[postType] ?? postType.toUpperCase()}</span>
        </div>

        {/* Title */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, flex: 1, justifyContent: 'center', marginTop: 32 }}>
          <div style={{ fontSize: titulo.length > 28 ? 76 : 92, fontWeight: 900, color: '#fff', lineHeight: 1.04, letterSpacing: -2 }}>{titulo}</div>
          {subtitulo ? (
            <div style={{ fontSize: 30, color: 'rgba(255,255,255,0.45)', fontWeight: 400, lineHeight: 1.5 }}>{subtitulo}</div>
          ) : null}
        </div>

        {/* Bottom */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#fff' }}>Aprend<span style={{ color: accent }}>IA</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 22, color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>Desliza →</div>
        </div>
      </div>
    )
  } else if (slideType === 'content') {
    element = (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: bg, padding: '72px', position: 'relative' }}>
        {/* Subtle accent glow */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: 350, height: 350, borderRadius: '50%', background: `radial-gradient(circle, ${accent}0D 0%, transparent 70%)`, display: 'flex' }} />

        {/* Number badge */}
        <div style={{ display: 'flex', width: 76, height: 76, borderRadius: '50%', background: accent, alignItems: 'center', justifyContent: 'center', fontSize: 34, fontWeight: 900, color: '#080D1A', flexShrink: 0 }}>{num}</div>

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 28, justifyContent: 'center', marginTop: 40 }}>
          <div style={{ fontSize: titulo.length > 22 ? 60 : 72, fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>{titulo}</div>
          <div style={{ fontSize: 34, color: 'rgba(255,255,255,0.62)', lineHeight: 1.55, fontWeight: 400 }}>{contenido}</div>
        </div>

        {/* Bottom bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 32, borderTop: `2px solid ${accent}28` }}>
          <div style={{ width: 56, height: 5, background: accent, borderRadius: 3, display: 'flex' }} />
          <div style={{ fontSize: 22, fontWeight: 600, color: 'rgba(255,255,255,0.28)' }}>@aprendia.ia</div>
        </div>
      </div>
    )
  } else {
    // CTA slide
    element = (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: bg, padding: '72px', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {/* Center glow */}
        <div style={{ position: 'absolute', width: 560, height: 560, borderRadius: '50%', background: `radial-gradient(circle, ${accent}18 0%, transparent 65%)`, display: 'flex' }} />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 44, textAlign: 'center', position: 'relative' }}>
          <div style={{ fontSize: cta.length > 38 ? 54 : 64, fontWeight: 800, color: '#fff', lineHeight: 1.2, textAlign: 'center' }}>{cta}</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: accent, borderRadius: 100, padding: '18px 48px' }}>
            <span style={{ fontSize: 30, fontWeight: 800, color: '#080D1A' }}>↓ Link en bio</span>
          </div>

          <div style={{ fontSize: 26, fontWeight: 800, color: 'rgba(255,255,255,0.25)' }}>
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
      ? { 'Content-Disposition': `attachment; filename="aprendia-slide-${slideType}-${num}.png"` }
      : {},
  })
}
