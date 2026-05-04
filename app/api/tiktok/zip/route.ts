import { NextRequest, NextResponse } from 'next/server'
import { zipSync } from 'fflate'
import { TikTokSlide, TikTokPostType } from '@/lib/supabase'
import { rateLimit, ipKey } from '@/lib/ratelimit'

function buildRenderUrl(base: string, slide: TikTokSlide, type: TikTokPostType, bgUrl?: string): string {
  const p = new URLSearchParams({ type })
  if (bgUrl) p.set('bg', bgUrl)

  if (slide.type === 'cover') {
    p.set('slideType', 'cover')
    p.set('titulo', slide.titulo)
    if (slide.subtitulo) p.set('subtitulo', slide.subtitulo)
  } else if (slide.type === 'content') {
    p.set('slideType', 'content')
    p.set('titulo', slide.titulo)
    p.set('contenido', slide.contenido)
    p.set('num', String(slide.num))
  } else {
    p.set('slideType', 'cta')
    p.set('cta', slide.cta)
  }
  return `${base}/api/tiktok/render?${p.toString()}`
}

function slideFilename(slide: TikTokSlide, i: number): string {
  if (slide.type === 'cover') return `00-portada.png`
  if (slide.type === 'cta')   return `0${i}-cta.png`
  return `0${i}-slide-${slide.num}.png`
}

export async function POST(req: NextRequest) {
  const { allowed, retryAfterMs } = rateLimit(ipKey(req, 'zip'), 5, 60_000)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Demasiadas peticiones. Espera un momento.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } },
    )
  }

  const { slides, type, bgUrl } = await req.json() as {
    slides: TikTokSlide[]
    type: TikTokPostType
    bgUrl?: string
  }

  const base = new URL(req.url).origin

  const results = await Promise.all(
    slides.map(async (slide, i) => {
      const url = buildRenderUrl(base, slide, type, bgUrl)
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Render failed for slide ${i}`)
      const buf = await res.arrayBuffer()
      return { name: slideFilename(slide, i + 1), data: new Uint8Array(buf) }
    })
  )

  const files: Record<string, Uint8Array> = {}
  for (const { name, data } of results) files[name] = data

  const zipped = zipSync(files, { level: 0 })

  return new NextResponse(Buffer.from(zipped), {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="aprendia-slides.zip"',
    },
  })
}
