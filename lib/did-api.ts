const DID_BASE = 'https://api.d-id.com'

// Public presenter from D-ID — female professional look
const PRESENTER_URL = 'https://d-id-public-bucket.s3.amazonaws.com/alice.jpg'
const VOICE_ID = 'es-ES-AlvaroNeural'

function authHeader() {
  // DID_API_KEY must be "email:api_key" (unencoded) in Vercel env vars
  return `Basic ${Buffer.from(process.env.DID_API_KEY!).toString('base64')}`
}

export async function createDIDTalk(script: string): Promise<string> {
  const res = await fetch(`${DID_BASE}/talks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: authHeader(),
    },
    body: JSON.stringify({
      source_url: PRESENTER_URL,
      script: {
        type: 'text',
        input: script,
        provider: { type: 'microsoft', voice_id: VOICE_ID },
      },
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`D-ID create: ${res.status} ${text}`)
  }

  const data = await res.json()
  return data.id as string
}

export async function getDIDTalk(didId: string): Promise<{
  status: string
  result_url?: string
  error?: string
}> {
  const res = await fetch(`${DID_BASE}/talks/${didId}`, {
    headers: {
      Accept: 'application/json',
      Authorization: authHeader(),
    },
  })

  if (!res.ok) throw new Error(`D-ID status: ${res.status}`)
  const data = await res.json()
  return {
    status: data.status as string,
    result_url: data.result_url as string | undefined,
    error: data.error?.kind as string | undefined,
  }
}
