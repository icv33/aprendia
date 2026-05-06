const VOICE_ID = '21m00Tcm4TlvDq8ikWAM' // Rachel — disponible en todos los planes, buena en español

export async function generateSpeech(text: string): Promise<Buffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) throw new Error('no_key')

  const clean = text.replace(/<<|>>/g, '').trim()
  if (!clean) throw new Error('empty')

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: clean,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.4,
        similarity_boost: 0.75,
        style: 0.35,
        use_speaker_boost: true,
      },
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail?.message ?? res.statusText)
  }

  return Buffer.from(await res.arrayBuffer())
}
