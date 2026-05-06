const QUERIES = [
  'dark tech laptop minimal desk',
  'keyboard typing dark background',
  'laptop screen glowing dark night',
  'technology dark minimal workspace',
  'dark computer monitor setup',
]

export async function fetchPexelsVideo(): Promise<string | null> {
  const apiKey = process.env.PEXELS_API_KEY
  if (!apiKey) return null

  const query = QUERIES[Math.floor(Math.random() * QUERIES.length)]
  const page  = Math.floor(Math.random() * 3) + 1

  try {
    const res = await fetch(
      `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=20&page=${page}&orientation=portrait`,
      { headers: { Authorization: apiKey } }
    )
    if (!res.ok) return null
    const data = await res.json()
    if (!data.videos?.length) return null

    const video = data.videos[Math.floor(Math.random() * data.videos.length)]
    const file =
      video.video_files?.find((f: any) => f.quality === 'hd' && f.width <= 1080) ??
      video.video_files?.find((f: any) => f.quality === 'sd') ??
      video.video_files?.[0]

    return file?.link ?? null
  } catch {
    return null
  }
}
