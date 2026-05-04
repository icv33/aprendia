export const runtime = 'edge'

import { ImageResponse } from 'next/og'

const TYPE_COLORS: Record<string, string> = {
  truco:         '#00FFB2',
  vida_facil:    '#3B82F6',
  mito:          '#8B5CF6',
  caso_practico: '#F59E0B',
}

const FALLBACK_BG = 'linear-gradient(160deg, #080D1A 0%, #0C1525 60%, #080D1A 100%)'

async function fetchGoogleFont(weight: number, italic: boolean): Promise<ArrayBuffer | null> {
  try {
    const ital = italic ? 1 : 0
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Poppins:ital,wght@${ital},${weight}&display=swap`,
      { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36' } }
    ).then(r => r.text())
    // grab last woff2 url (latin subset)
    const matches = [...css.matchAll(/url\((.+?)\) format\('woff2'\)/g)]
    const url = matches[matches.length - 1]?.[1]
    if (!url) return null
    return await fetch(url).then(r => r.arrayBuffer())
  } catch {
    return null
  }
}

function HighlightText({
  text, accent, fontSize, fontWeight, baseColor = '#ffffff', letterSpacing = 0, center = false,
}: {
  text: string
  accent: string
  fontSize: number
  fontWeight: number
  baseColor?: string
  letterSpacing?: number
  center?: boolean
}) {
  const parts = text.split(/(<<[^>]+>>)/g).filter(Boolean)
  const tokens: { word: string; hi: boolean }[] = []

  for (const part of parts) {
    const hi = part.startsWith('<<') && part.endsWith('>>')
    const content = hi ? part.slice(2, -2) : part
    for (const word of content.split(/\s+/).filter(Boolean)) {
      tokens.push({ word, hi })
    }
  }

  const gap = Math.round(fontSize * 0.2)

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap, letterSpacing, justifyContent: center ? 'center' : 'flex-start' }}>
      {tokens.map((t, i) => (
        <span key={i} style={{
          fontFamily: 'Poppins',
          fontSize,
          fontWeight,
          color: t.hi ? accent : baseColor,
          fontStyle: t.hi ? 'italic' : 'normal',
          lineHeight: 1.05,
        }}>
          {t.word}
        </span>
      ))}
    </div>
  )
}

function rawLength(text: string) {
  return text.replace(/<<|>>/g, '').length
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const slideType   = searchParams.get('slideType') ?? 'content'
  const postType    = searchParams.get('type') ?? 'truco'
  const titulo      = searchParams.get('titulo') ?? ''
  const contenido   = searchParams.get('contenido') ?? ''
  const subtitulo   = searchParams.get('subtitulo') ?? ''
  const cta         = searchParams.get('cta') ?? ''
  const num         = parseInt(searchParams.get('num') ?? '1')
  const bgUrl       = searchParams.get('bg') ?? ''
  const forDownload = searchParams.get('dl') === '1'

  const accent = TYPE_COLORS[postType] ?? '#00FFB2'
  const hasBg  = bgUrl.startsWith('http')

  const [font700, font700i, font800] = await Promise.all([
    fetchGoogleFont(700, false),
    fetchGoogleFont(700, true),
    fetchGoogleFont(800, false),
  ])

  const fonts: { name: string; data: ArrayBuffer; weight: number; style: 'normal' | 'italic' }[] = []
  if (font700)  fonts.push({ name: 'Poppins', data: font700,  weight: 700, style: 'normal' })
  if (font700i) fonts.push({ name: 'Poppins', data: font700i, weight: 700, style: 'italic' })
  if (font800)  fonts.push({ name: 'Poppins', data: font800,  weight: 800, style: 'normal' })

  let element: React.ReactElement

  if (slideType === 'cover') {
    element = (
      <div style={{ position: 'relative', width: 1080, height: 1080, display: 'flex', overflow: 'hidden' }}>
        {hasBg ? (
          <img src={bgUrl} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
        ) : (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: FALLBACK_BG, display: 'flex' }} />
        )}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0.88) 100%)', display: 'flex' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 5, background: accent, display: 'flex' }} />

        <div style={{ position: 'absolute', bottom: 160, left: 64, right: 64, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <HighlightText
            text={titulo}
            accent={accent}
            fontSize={rawLength(titulo) > 25 ? 80 : 96}
            fontWeight={800}
            letterSpacing={-2}
          />
          {subtitulo ? (
            <div style={{ fontFamily: 'Poppins', fontSize: 34, color: 'rgba(255,255,255,0.58)', fontWeight: 400, lineHeight: 1.4, display: 'flex' }}>
              {subtitulo}
            </div>
          ) : null}
        </div>

        <div style={{ position: 'absolute', bottom: 52, left: 64, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: accent, display: 'flex' }} />
          <span style={{ fontFamily: 'Poppins', fontSize: 22, fontWeight: 700, color: 'rgba(255,255,255,0.38)', letterSpacing: 1 }}>aprendia.store</span>
        </div>
      </div>
    )

  } else if (slideType === 'content') {
    element = (
      <div style={{ position: 'relative', width: 1080, height: 1080, display: 'flex', overflow: 'hidden' }}>
        {hasBg ? (
          <img src={bgUrl} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
        ) : (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: FALLBACK_BG, display: 'flex' }} />
        )}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.4) 45%, rgba(0,0,0,0.88) 100%)', display: 'flex' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 5, background: accent, display: 'flex' }} />

        <div style={{ position: 'absolute', top: 48, left: 56, display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontFamily: 'Poppins', fontSize: 110, fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>{num}</span>
          <span style={{ fontFamily: 'Poppins', fontSize: 60, fontWeight: 800, color: accent, lineHeight: 1 }}>.</span>
        </div>

        <div style={{ position: 'absolute', bottom: 130, left: 64, right: 64, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <HighlightText
            text={titulo}
            accent={accent}
            fontSize={rawLength(titulo) > 22 ? 62 : 74}
            fontWeight={800}
          />
          <HighlightText
            text={contenido}
            accent={accent}
            fontSize={38}
            fontWeight={700}
            baseColor="rgba(255,255,255,0.72)"
          />
        </div>
      </div>
    )

  } else {
    element = (
      <div style={{ position: 'relative', width: 1080, height: 1080, display: 'flex', overflow: 'hidden' }}>
        {hasBg ? (
          <img src={bgUrl} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
        ) : (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: FALLBACK_BG, display: 'flex' }} />
        )}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.80)', display: 'flex' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 5, background: accent, display: 'flex' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: 600, height: 600, borderRadius: '50%', background: `radial-gradient(circle, ${accent}15 0%, transparent 65%)`, display: 'flex', transform: 'translate(-50%,-50%)' }} />

        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 52, padding: '0 80px' }}>
          <HighlightText
            text={cta}
            accent={accent}
            fontSize={rawLength(cta) > 40 ? 54 : 64}
            fontWeight={800}
            center={true}
          />

          <div style={{ display: 'flex', alignItems: 'center', background: accent, borderRadius: 100, padding: '20px 56px' }}>
            <span style={{ fontFamily: 'Poppins', fontSize: 30, fontWeight: 800, color: '#080D1A' }}>↓ Link en bio</span>
          </div>

          <div style={{ fontFamily: 'Poppins', fontSize: 26, fontWeight: 800, color: 'rgba(255,255,255,0.28)', display: 'flex' }}>
            Aprend<span style={{ color: accent }}>IA</span>
          </div>
        </div>
      </div>
    )
  }

  return new ImageResponse(element, {
    width: 1080,
    height: 1080,
    fonts: fonts.length > 0 ? fonts : undefined,
    headers: forDownload
      ? { 'Content-Disposition': `attachment; filename="aprendia-${slideType}-${num}.png"` }
      : {},
  })
}
