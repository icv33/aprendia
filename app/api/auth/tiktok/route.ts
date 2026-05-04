import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function GET() {
  const clientKey   = process.env.TIKTOK_CLIENT_KEY?.trim()
  const redirectUri = process.env.TIKTOK_REDIRECT_URI?.trim()

  // Debug: return env var status if missing
  if (!clientKey || !redirectUri) {
    return NextResponse.json({
      error: 'Missing env vars',
      TIKTOK_CLIENT_KEY:   clientKey   ? `set (${clientKey.length} chars)` : 'MISSING',
      TIKTOK_REDIRECT_URI: redirectUri ? `set (${redirectUri.length} chars)` : 'MISSING',
    }, { status: 500 })
  }

  const state = crypto.randomBytes(16).toString('hex')

  // Build URL manually to avoid encoding issues with commas in scope
  const url = `https://www.tiktok.com/v2/auth/authorize/` +
    `?client_key=${encodeURIComponent(clientKey)}` +
    `&scope=user.info.basic,video.upload,video.publish` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=${state}`

  const res = NextResponse.redirect(url)
  res.cookies.set('tiktok_oauth_state', state, {
    httpOnly: true,
    maxAge: 600,
    sameSite: 'lax',
    secure: true,
  })
  return res
}
