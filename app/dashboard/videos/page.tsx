import { createServerSupabase } from '@/lib/supabase'
import { VideoMain } from '@/components/dashboard/videos/VideoMain'

export const metadata = { title: 'Vídeos IA | AprendIA' }

export default async function VideosPage() {
  const supabase = createServerSupabase()
  const { data } = await supabase
    .from('did_videos')
    .select('*')
    .order('created_at', { ascending: false })

  return <VideoMain initialVideos={data ?? []} />
}
