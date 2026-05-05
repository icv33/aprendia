import { NextRequest, NextResponse } from 'next/server'
import { generateCustomTikTokSlides } from '@/lib/tiktok'
import { rateLimit, ipKey } from '@/lib/ratelimit'

export async function POST(req: NextRequest) {
  const { allowed, retryAfterMs } = rateLimit(ipKey(req, 'generate-custom'), 10, 60_000)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Demasiadas peticiones. Espera un momento.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } },
    )
  }

  const { prompt } = await req.json()
  if (!prompt?.trim()) {
    return NextResponse.json({ error: 'Escribe el tema del post' }, { status: 400 })
  }

  try {
    const slides = await generateCustomTikTokSlides(prompt.trim())
    return NextResponse.json({ slides })
  } catch (err) {
    console.error('Error generating custom TikTok slides:', err)
    return NextResponse.json({ error: 'Error al generar contenido. Inténtalo de nuevo.' }, { status: 500 })
  }
}
