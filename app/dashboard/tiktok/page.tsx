export const dynamic = 'force-dynamic'

import { createServerSupabase } from '@/lib/supabase'
import { TikTokMain } from '@/components/dashboard/tiktok/TikTokMain'

export const metadata = { title: 'TikTok | AprendIA' }

export default async function TikTokPage() {
  const supabase = createServerSupabase()

  const [{ data: posts }, { data: settings }] = await Promise.all([
    supabase.from('tiktok_posts').select('*').order('created_at', { ascending: false }),
    supabase.from('tiktok_settings').select('*').eq('id', 1).single(),
  ])

  return (
    <TikTokMain
      initialPosts={posts ?? []}
      initialSettings={settings ?? { id: 1, auto_mode: false, updated_at: '' }}
    />
  )
}
