import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { generateTikTokSlides, SCHEDULE_SLOTS } from '@/lib/tiktok'
import { publishPost } from '@/lib/tiktok-api'
import { TikTokPostType } from '@/lib/supabase'

const POST_TYPES: TikTokPostType[] = ['truco', 'vida_facil', 'mito', 'caso_practico']

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerSupabase()
  const origin = req.nextUrl.origin
  const now = new Date()

  // ── 1. Auto-generate today's posts if auto_mode is on ─────────────────────
  const { data: settings } = await supabase
    .from('tiktok_settings')
    .select('auto_mode')
    .eq('id', 1)
    .single()

  const generated: string[] = []
  const genErrors: string[] = []

  if (settings?.auto_mode) {
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date(todayStart)
    todayEnd.setDate(todayEnd.getDate() + 1)

    const { data: existing } = await supabase
      .from('tiktok_posts')
      .select('id')
      .gte('created_at', todayStart.toISOString())
      .lt('created_at', todayEnd.toISOString())

    if (!existing || existing.length < 4) {
      for (let i = 0; i < 4; i++) {
        const type = POST_TYPES[i]
        const [h, m] = SCHEDULE_SLOTS[i].split(':').map(Number)
        const scheduledAt = new Date(now)
        scheduledAt.setHours(h, m, 0, 0)

        try {
          const slides = await generateTikTokSlides(type)
          const { data: post } = await supabase
            .from('tiktok_posts')
            .insert({ type, slides, status: 'approved', scheduled_at: scheduledAt.toISOString() })
            .select('id')
            .single()
          if (post) generated.push(post.id)
        } catch (err) {
          genErrors.push(`${type}: ${err}`)
        }
      }
    }
  }

  // ── 2. Publish all approved posts whose scheduled_at has passed ────────────
  const { data: due } = await supabase
    .from('tiktok_posts')
    .select('id')
    .in('status', ['approved', 'scheduled'])
    .lte('scheduled_at', now.toISOString())

  const published: string[] = []
  const pubErrors: string[] = []

  for (const post of (due ?? [])) {
    try {
      await publishPost(post.id, origin)
      published.push(post.id)
    } catch (err) {
      pubErrors.push(`${post.id}: ${err}`)
      await supabase.from('tiktok_posts').update({ status: 'error' }).eq('id', post.id)
    }
  }

  return NextResponse.json({ ok: true, generated, genErrors, published, pubErrors })
}
