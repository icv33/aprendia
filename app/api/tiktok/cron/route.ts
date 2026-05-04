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

  const { data: settings } = await supabase
    .from('tiktok_settings')
    .select('auto_mode')
    .eq('id', 1)
    .single()

  if (!settings?.auto_mode) {
    return NextResponse.json({ ok: true, message: 'Auto mode disabled' })
  }

  // Check if posts already exist for today
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date(todayStart)
  todayEnd.setDate(todayEnd.getDate() + 1)

  const { data: existing } = await supabase
    .from('tiktok_posts')
    .select('id')
    .gte('created_at', todayStart.toISOString())
    .lt('created_at', todayEnd.toISOString())

  if (existing && existing.length >= 4) {
    return NextResponse.json({ ok: true, message: 'Posts already generated for today' })
  }

  const generated: string[] = []
  const errors: string[] = []

  for (let i = 0; i < 4; i++) {
    const type = POST_TYPES[i]
    const [hours, minutes] = SCHEDULE_SLOTS[i].split(':').map(Number)
    const scheduledAt = new Date()
    scheduledAt.setHours(hours, minutes, 0, 0)

    try {
      const slides = await generateTikTokSlides(type)
      const { data: post } = await supabase
        .from('tiktok_posts')
        .insert({ type, slides, status: 'approved', scheduled_at: scheduledAt.toISOString() })
        .select('id')
        .single()

      if (post) generated.push(post.id)
    } catch (err) {
      errors.push(`${type}: ${err}`)
    }
  }

  return NextResponse.json({ ok: true, generated, errors })
}
