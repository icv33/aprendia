import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { generateTikTokSlides, SCHEDULE_SLOTS } from '@/lib/tiktok'
import { TikTokPostType } from '@/lib/supabase'

const POST_TYPES: TikTokPostType[] = ['truco', 'vida_facil', 'mito', 'caso_practico']

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerSupabase()
  const now = new Date()

  // Skip if today's posts already exist
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date(todayStart)
  todayEnd.setDate(todayEnd.getDate() + 1)

  const { data: existing } = await supabase
    .from('tiktok_posts')
    .select('id')
    .gte('created_at', todayStart.toISOString())
    .lt('created_at', todayEnd.toISOString())

  if (existing && existing.length >= 4) {
    return NextResponse.json({ ok: true, skipped: true, reason: 'already generated today' })
  }

  // Generate 1 post of each type, scheduled at the 4 daily slots
  const generated: string[] = []
  const errors: string[] = []

  for (let i = 0; i < 4; i++) {
    const type = POST_TYPES[i]
    const [h, m] = SCHEDULE_SLOTS[i].split(':').map(Number)
    const scheduledAt = new Date(now)
    scheduledAt.setHours(h, m, 0, 0)

    try {
      const slides = await generateTikTokSlides(type)
      const { data: post } = await supabase
        .from('tiktok_posts')
        .insert({ type, slides, status: 'scheduled', scheduled_at: scheduledAt.toISOString() })
        .select('id')
        .single()
      if (post) generated.push(`${type}:${post.id}`)
    } catch (err) {
      errors.push(`${type}: ${err}`)
    }
  }

  return NextResponse.json({ ok: true, generated, errors })
}
