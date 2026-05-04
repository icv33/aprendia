import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { rateLimit, ipKey } from '@/lib/ratelimit'

const VALID_PACKS = ['starter', 'pro', 'elite', 'unsure']

export async function POST(req: NextRequest) {
  const { allowed, retryAfterMs } = rateLimit(ipKey(req, 'waitlist'), 5, 60_000)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Demasiadas peticiones. Espera un momento.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } },
    )
  }

  const { email, pack } = await req.json()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
  }
  if (!pack || !VALID_PACKS.includes(pack)) {
    return NextResponse.json({ error: 'Pack inválido' }, { status: 400 })
  }

  const supabase = createServerSupabase()
  const { error } = await supabase
    .from('waitlist')
    .insert({ email: String(email).trim().toLowerCase(), pack })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Este email ya está en la lista 🎉' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Error al guardar. Inténtalo de nuevo.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
