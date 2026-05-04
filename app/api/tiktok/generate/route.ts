import { NextRequest, NextResponse } from 'next/server'
import { generateTikTokSlides } from '@/lib/tiktok'
import { createServerSupabase, TikTokPostType, TikTokSlide } from '@/lib/supabase'
import { rateLimit, ipKey } from '@/lib/ratelimit'

const VALID_TYPES: TikTokPostType[] = ['truco', 'vida_facil', 'mito', 'caso_practico']

export async function POST(req: NextRequest) {
  const { allowed, retryAfterMs } = rateLimit(ipKey(req, 'generate'), 10, 60_000)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Demasiadas peticiones. Espera un momento.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } },
    )
  }

  const { type } = await req.json() as { type: TikTokPostType }

  if (!type || !VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
  }

  try {
    const supabase = createServerSupabase()
    const { data: liked } = await supabase
      .from('tiktok_feedback')
      .select('slides')
      .eq('type', type)
      .eq('rating', 'like')
      .order('created_at', { ascending: false })
      .limit(3)

    const likedExamples: TikTokSlide[][] = (liked ?? []).map((r: { slides: TikTokSlide[] }) => r.slides)

    const slides = await generateTikTokSlides(type, likedExamples)
    return NextResponse.json({ slides })
  } catch (err) {
    console.error('Error generating TikTok slides:', err)
    return NextResponse.json({ error: 'Error al generar contenido. Inténtalo de nuevo.' }, { status: 500 })
  }
}
