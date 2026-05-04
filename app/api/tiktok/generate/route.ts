import { NextRequest, NextResponse } from 'next/server'
import { generateTikTokSlides } from '@/lib/tiktok'
import { TikTokPostType } from '@/lib/supabase'

const VALID_TYPES: TikTokPostType[] = ['truco', 'vida_facil', 'mito', 'caso_practico']

export async function POST(req: NextRequest) {
  const { type } = await req.json() as { type: TikTokPostType }

  if (!type || !VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
  }

  try {
    const slides = await generateTikTokSlides(type)
    return NextResponse.json({ slides })
  } catch (err) {
    console.error('Error generating TikTok slides:', err)
    return NextResponse.json({ error: 'Error al generar contenido. Inténtalo de nuevo.' }, { status: 500 })
  }
}
