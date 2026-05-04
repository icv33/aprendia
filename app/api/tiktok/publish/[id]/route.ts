import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { publishPost } from '@/lib/tiktok-api'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const origin = req.nextUrl.origin

  try {
    const result = await publishPost(id, origin)
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error('Publish error:', err)

    const supabase = createServerSupabase()
    await supabase.from('tiktok_posts').update({ status: 'error' }).eq('id', id)

    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
