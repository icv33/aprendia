import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, TikTokPostType, TikTokSlide } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { type, slides, rating } = await req.json() as {
    type: TikTokPostType
    slides: TikTokSlide[]
    rating: 'like' | 'dislike'
  }

  if (!type || !slides || !['like', 'dislike'].includes(rating)) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  const supabase = createServerSupabase()
  const { error } = await supabase
    .from('tiktok_feedback')
    .insert({ type, slides, rating })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
