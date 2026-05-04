import { createServerSupabase, TikTokSlide, TikTokPostType } from './supabase'

export type TikTokTokenRow = {
  open_id: string
  access_token: string
  refresh_token: string
  expires_at: string
}

// ── Token storage ──────────────────────────────────────────────────────────────

export async function getStoredToken(): Promise<TikTokTokenRow | null> {
  const supabase = createServerSupabase()
  const { data } = await supabase.from('tiktok_tokens').select('*').eq('id', 1).single()
  return data
}

export async function saveToken(token: TikTokTokenRow): Promise<void> {
  const supabase = createServerSupabase()
  await supabase
    .from('tiktok_tokens')
    .upsert({ id: 1, ...token, updated_at: new Date().toISOString() })
}

async function doRefresh(refreshToken: string): Promise<TikTokTokenRow> {
  const res = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_key:    process.env.TIKTOK_CLIENT_KEY!,
      client_secret: process.env.TIKTOK_CLIENT_SECRET!,
      grant_type:    'refresh_token',
      refresh_token: refreshToken,
    }),
  })
  const data = await res.json()
  if (data.error) throw new Error(`Token refresh failed: ${data.error_description}`)
  return {
    open_id:       data.open_id,
    access_token:  data.access_token,
    refresh_token: data.refresh_token,
    expires_at:    new Date(Date.now() + data.expires_in * 1000).toISOString(),
  }
}

export async function getValidAccessToken(): Promise<string> {
  const token = await getStoredToken()
  if (!token) throw new Error('TikTok no conectado. Ve a ajustes para conectar la cuenta.')

  const expiresAt = new Date(token.expires_at)
  if (expiresAt < new Date(Date.now() + 3_600_000)) {
    const refreshed = await doRefresh(token.refresh_token)
    await saveToken(refreshed)
    return refreshed.access_token
  }
  return token.access_token
}

// ── Image upload to Supabase Storage ──────────────────────────────────────────

function buildRenderUrl(base: string, slide: TikTokSlide, type: TikTokPostType, bgUrl?: string): string {
  const p = new URLSearchParams({ type })
  if (bgUrl) p.set('bg', bgUrl)
  if (slide.type === 'cover') {
    p.set('slideType', 'cover')
    p.set('titulo', slide.titulo)
    if (slide.subtitulo) p.set('subtitulo', slide.subtitulo)
  } else if (slide.type === 'content') {
    p.set('slideType', 'content')
    p.set('titulo', slide.titulo)
    p.set('contenido', slide.contenido)
    p.set('num', String(slide.num))
  } else {
    p.set('slideType', 'cta')
    p.set('cta', slide.cta)
  }
  return `${base}/api/tiktok/render?${p.toString()}`
}

async function uploadSlidesToStorage(
  postId: string,
  slides: TikTokSlide[],
  type: TikTokPostType,
  bgUrl: string | undefined,
  base: string,
): Promise<string[]> {
  const supabase = createServerSupabase()
  const urls: string[] = []

  for (let i = 0; i < slides.length; i++) {
    const renderUrl = buildRenderUrl(base, slides[i], type, bgUrl)
    const res = await fetch(renderUrl)
    if (!res.ok) throw new Error(`Render falló para slide ${i}`)
    const bytes = await res.arrayBuffer()

    const path = `${postId}/${i}.png`
    const { error } = await supabase.storage
      .from('tiktok-slides')
      .upload(path, bytes, { contentType: 'image/png', upsert: true })
    if (error) throw new Error(`Storage upload falló: ${error.message}`)

    const { data: { publicUrl } } = supabase.storage.from('tiktok-slides').getPublicUrl(path)
    urls.push(publicUrl)
  }
  return urls
}

// ── TikTok Content Posting API ─────────────────────────────────────────────────

function buildCaption(slides: TikTokSlide[]): string {
  const cover = slides.find(s => s.type === 'cover') as Extract<TikTokSlide, { type: 'cover' }> | undefined
  const title = (cover?.titulo ?? '').replace(/<<|>>/g, '')
  return `${title}\n\n#IA #InteligenciaArtificial #ChatGPT #Productividad #AprendeIA`
}

async function callPublishAPI(accessToken: string, photoUrls: string[], caption: string): Promise<string> {
  const res = await fetch('https://open.tiktokapis.com/v2/post/publish/content/init/', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify({
      post_info: {
        title: caption,
        privacy_level: 'PUBLIC_TO_EVERYONE',
        disable_comment: false,
        auto_add_music: true,
      },
      source_info: {
        source: 'PULL_FROM_URL',
        photo_images: photoUrls,
        photo_cover_index: 0,
      },
      media_type: 'PHOTO',
    }),
  })
  const data = await res.json()
  if (data.error?.code !== 'ok') throw new Error(data.error?.message ?? 'TikTok API error')
  return data.data.publish_id as string
}

// ── Main publish function (called by route + cron) ─────────────────────────────

export async function publishPost(postId: string, origin: string): Promise<{ publishId: string }> {
  const supabase = createServerSupabase()

  const { data: post, error } = await supabase
    .from('tiktok_posts')
    .select('*')
    .eq('id', postId)
    .single()

  if (error || !post) throw new Error('Post no encontrado')

  const accessToken = await getValidAccessToken()
  const bgUrl = post.slides[0]?.type === 'cover' ? post.slides[0].background_url : undefined

  const photoUrls = await uploadSlidesToStorage(postId, post.slides, post.type, bgUrl, origin)
  const caption = buildCaption(post.slides)
  const publishId = await callPublishAPI(accessToken, photoUrls, caption)

  await supabase
    .from('tiktok_posts')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
      tiktok_url: `https://www.tiktok.com/@aprendia.ia/video/${publishId}`,
    })
    .eq('id', postId)

  return { publishId }
}
