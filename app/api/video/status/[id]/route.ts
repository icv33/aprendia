import { NextResponse } from 'next/server'
import { getDIDTalk } from '@/lib/did-api'
import { createServerSupabase } from '@/lib/supabase'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createServerSupabase()

    const { data: video, error } = await supabase
      .from('did_videos')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !video) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Already settled — return cached
    if (video.status === 'done' || video.status === 'error') {
      return NextResponse.json({ video })
    }

    // Poll D-ID for live status
    const didStatus = await getDIDTalk(video.did_id)

    let newStatus: string = video.status
    let resultUrl: string | null = video.result_url

    if (didStatus.status === 'done') {
      newStatus = 'done'
      resultUrl = didStatus.result_url ?? null
    } else if (didStatus.status === 'error' || didStatus.error) {
      newStatus = 'error'
    }

    if (newStatus !== video.status) {
      await supabase
        .from('did_videos')
        .update({ status: newStatus, result_url: resultUrl })
        .eq('id', video.id)
    }

    return NextResponse.json({ video: { ...video, status: newStatus, result_url: resultUrl } })
  } catch (err) {
    console.error('video/status error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
