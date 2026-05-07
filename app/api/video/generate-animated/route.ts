import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const VOICE_ID = 'pNInz6obpgDQGcFmaJgB'  // Adam – multilingual
const EL_MODEL  = 'eleven_multilingual_v2'

// ── Scene types ──────────────────────────────────────────────────────────────
// hook     → explosive opening, zoom+spin emoji
// problem  → tension, shaking emoji + orange accent
// insight  → "aha" moment, orbiting dots + gold accent
// step     → methodical, ghost number + indigo accent
// result   → payoff, gravity-drop emoji + green accent
// cta      → closing action, pulsing rings + brand accent

const SYSTEM = `Eres experto en crear vídeos explicativos virales para TikTok en español.
Dado un tema, genera un guión de voz Y las escenas visuales animadas.

Responde SOLO con JSON válido, sin markdown:
{
  "script": "guión completo hablado. Texto corrido, sin listas, sin emojis, sin asteriscos. Tuteo. 140-165 palabras. Termina con: Sigue la cuenta y comenta CLUB para más recursos como este.",
  "scenes": [
    {
      "text": "texto corto para pantalla, máximo 8 palabras",
      "emojis": ["🎯"],
      "duration": 5,
      "sceneType": "hook"
    }
  ]
}

REGLAS DE ESCENAS:
- Entre 7 y 9 escenas en total.
- Primera escena SIEMPRE sceneType "hook".
- Última escena SIEMPRE sceneType "cta", emojis ["📲","💬"], texto "Sigue y comenta CLUB".
- Asigna sceneType según el contenido:
  "problem"  → problemas, errores, dolor, obstáculos
  "insight"  → soluciones, trucos, revelaciones, ideas clave
  "step"     → pasos, métodos, sistemas, acciones concretas
  "result"   → resultados, beneficios, transformaciones
- Cada escena: 4-7 segundos. Suma total ≈ 48-58 segundos.
- Emojis muy visuales y relevantes: 1-3, nunca más.
- Texto de pantalla: la idea clave resumida, NO copia del script.
- Última escena CTA: solo emojis 📲 💬.`

const TOPIC_PROMPTS: Record<string, string> = {
  historia:  `Historia real (estudiante, freelancer o empleado) que mejoró usando IA. Problema cotidiano → solución concreta → resultado creíble. Sin ganancias exageradas.`,
  error:     `El mayor error con ChatGPT: usarlo como buscador en vez de darle contexto. Diferencia práctica con ejemplo. El espectador piensa "yo hago eso, puedo mejorarlo".`,
  ahorro:    `Cómo la IA devuelve 2 horas al día. Tres ejemplos: correos, documentos, planificación. Directo y práctico.`,
  aprender:  `Por qué aprender IA ahora es la mejor inversión de tiempo. Sin programar ni cursos caros. Habilidades en días que marcan diferencia.`,
  negocio:   `Servicio con IA para negocios locales: crear contenido, automatizar tareas, presentaciones. Realista y con ejemplo de cómo empezar.`,
  futuro:    `Futuro del trabajo con IA: ventaja para quienes la usan, no reemplazo. Ejemplos donde ayuda y potencia.`,
}

const TOPIC_LABELS: Record<string, string> = {
  historia: 'Historia de éxito con IA',
  error:    'El mayor error con ChatGPT',
  ahorro:   'Cómo ahorrar 2h al día con IA',
  aprender: 'Por qué aprender IA ahora',
  negocio:  'Montar un negocio con IA',
  futuro:   'El futuro del trabajo con IA',
}

// ── Word timestamp extractor ─────────────────────────────────────────────────
function extractWordTimestamps(alignment: {
  characters: string[]
  character_start_times_seconds: number[]
  character_end_times_seconds: number[]
}): { word: string; start: number; end: number }[] {
  const { characters, character_start_times_seconds, character_end_times_seconds } = alignment
  const words: { word: string; start: number; end: number }[] = []
  let wordStart: number | null = null
  let wordEnd = 0
  let wordChars = ''

  for (let i = 0; i < characters.length; i++) {
    const c = characters[i]
    if (/\S/.test(c)) {
      if (wordStart === null) wordStart = character_start_times_seconds[i]
      wordEnd   = character_end_times_seconds[i]
      wordChars += c
    } else if (wordChars) {
      const clean = wordChars.replace(/[.,!?;:]+$/, '')
      if (clean) words.push({ word: clean, start: wordStart!, end: wordEnd })
      wordChars = ''; wordStart = null
    }
  }
  if (wordChars) {
    const clean = wordChars.replace(/[.,!?;:]+$/, '')
    if (clean) words.push({ word: clean, start: wordStart!, end: wordEnd })
  }
  return words
}

// ── Route ────────────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const { topicKey, customTopic } = await req.json() as { topicKey?: string; customTopic?: string }

    const topicLabel  = customTopic || TOPIC_LABELS[topicKey ?? ''] || topicKey || 'Vídeo IA'
    const topicPrompt = customTopic
      ? `Crea el guión y escenas sobre: "${customTopic}". Mismas reglas de formato y estilo.`
      : (TOPIC_PROMPTS[topicKey ?? ''] ?? TOPIC_PROMPTS.historia)

    // ── 1. Script + scenes ─────────────────────────────────────────────────
    const client  = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      system: SYSTEM,
      messages: [{ role: 'user', content: topicPrompt }],
    })
    const raw  = message.content[0].type === 'text' ? message.content[0].text : ''
    const json = raw.match(/\{[\s\S]*\}/)
    if (!json) throw new Error('No JSON in Claude response')

    const { script, scenes } = JSON.parse(json[0]) as {
      script: string
      scenes: { text: string; emojis: string[]; duration: number; sceneType: string }[]
    }
    if (!script || !scenes?.length) throw new Error('Invalid Claude response')

    // ── 2. ElevenLabs with timestamps ──────────────────────────────────────
    const elKey = process.env.ELEVENLABS_API_KEY
    if (!elKey) throw new Error('ELEVENLABS_API_KEY not configured')

    const audioRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/with-timestamps`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': elKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          text: script,
          model_id: EL_MODEL,
          voice_settings: { stability: 0.52, similarity_boost: 0.80, style: 0.18 },
        }),
      }
    )

    if (!audioRes.ok) {
      const err = await audioRes.text()
      throw new Error(`ElevenLabs: ${audioRes.status} ${err}`)
    }

    const elData = await audioRes.json() as {
      audio_base64: string
      alignment: {
        characters: string[]
        character_start_times_seconds: number[]
        character_end_times_seconds: number[]
      }
    }

    const wordTimestamps = extractWordTimestamps(elData.alignment)

    return NextResponse.json({
      scenes,
      script,
      audioBase64:    elData.audio_base64,
      wordTimestamps,
      topic:          topicLabel,
    })
  } catch (err) {
    console.error('generate-animated:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
