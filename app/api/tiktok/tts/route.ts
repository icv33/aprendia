import { generateSpeech } from '@/lib/elevenlabs'

export async function POST(req: Request) {
  const { text } = await req.json()

  try {
    const audio = await generateSpeech(text)
    return new Response(new Uint8Array(audio), {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(audio.byteLength),
        'Cache-Control': 'no-store',
      },
    })
  } catch (e) {
    const msg = (e as Error).message
    const status = msg === 'no_key' ? 503 : 500
    return Response.json({ error: msg }, { status })
  }
}
