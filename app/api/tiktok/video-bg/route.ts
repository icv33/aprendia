import { fetchPexelsVideo } from '@/lib/pexels-video'

export async function GET() {
  const url = await fetchPexelsVideo()
  return Response.json({ url })
}
