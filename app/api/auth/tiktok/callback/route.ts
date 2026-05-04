import { NextRequest, NextResponse } from 'next/server'
import { saveToken } from '@/lib/tiktok-api'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code  = searchParams.get('code')
  const state = searchParams.get('state')
  const err   = searchParams.get('error')

  const base = req.nextUrl.origin

  if (err) {
    return NextResponse.redirect(`${base}/dashboard/tiktok?error=tiktok_denied`)
  }

  const storedState = req.cookies.get('tiktok_oauth_state')?.value
  if (!state || state !== storedState) {
    return NextResponse.redirect(`${base}/dashboard/tiktok?error=invalid_state`)
  }

  const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_key:    process.env.TIKTOK_CLIENT_KEY!,
      client_secret: process.env.TIKTOK_CLIENT_SECRET!,
      code:          code!,
      grant_type:    'authorization_code',
      redirect_uri:  process.env.TIKTOK_REDIRECT_URI!,
    }),
  })

  const data = await tokenRes.json()
  if (data.error) {
    return NextResponse.redirect(`${base}/dashboard/tiktok?error=${data.error}`)
  }

  await saveToken({
    open_id:       data.open_id,
    access_token:  data.access_token,
    refresh_token: data.refresh_token,
    expires_at:    new Date(Date.now() + data.expires_in * 1000).toISOString(),
  })

  const response = NextResponse.redirect(`${base}/dashboard/tiktok?connected=1`)
  response.cookies.delete('tiktok_oauth_state')
  return response
}
