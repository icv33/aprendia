import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export async function GET() {
  const supabase = createServerSupabase()
  const { data } = await supabase.from('tiktok_settings').select('*').eq('id', 1).single()
  return NextResponse.json({ settings: data ?? { id: 1, auto_mode: false } })
}

export async function POST(req: NextRequest) {
  const { auto_mode } = await req.json()
  const supabase = createServerSupabase()
  const { data, error } = await supabase
    .from('tiktok_settings')
    .upsert({ id: 1, auto_mode, updated_at: new Date().toISOString() })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ settings: data })
}
