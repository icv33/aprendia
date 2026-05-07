import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

// ElevenLabs - Adam (multilingual v2, works well in Spanish)
const VOICE_ID = 'pNInz6obpgDQGcFmaJgB'
const EL_MODEL  = 'eleven_multilingual_v2'

const SYSTEM = `Eres experto en crear vídeos explicativos virales para TikTok en español.
Dado un tema, genera un guión de voz Y las escenas visuales animadas que lo acompañan.

Responde SOLO con JSON válido, sin markdown, sin explicaciones:
{
  "script": "guión completo para la voz. Texto corrido, sin listas, sin emojis, sin asteriscos. Tuteo directo. 140-160 palabras. Termina siempre con: Sigue la cuenta y comenta CLUB para más recursos como este.",
  "scenes": [
    { "text": "texto corto para pantalla, máximo 8 palabras", "emojis": ["🎯", "💡"], "duration": 5 },
    { "text": "...", "emojis": ["emoji"], "duration": 4 }
  ]
}

REGLAS DE ESCENAS:
- Entre 7 y 9 escenas en total.
- Cada escena: 4-7 segundos. Suma total ≈ 45-55 segundos.
- Emojis MUY relevantes al contenido de esa escena: 1, 2 o 3 emojis (nunca más de 3).
- El texto de pantalla es la idea clave resumida, NO una copia del script.
- Flujo narrativo: problema → insight → solución → resultado → CTA.
- Última escena siempre: texto "Sigue y comenta CLUB" emojis ["📲","💬"] duration 5.
- Elige emojis conocidos y visualmente claros (🍞🏪💰📱⚡🎯💡✅❌🔑🚀).`

const TOPIC_PROMPTS: Record<string, string> = {
  historia:  `Cuenta una historia real de alguien (estudiante, freelancer o empleado) que mejoró su situación usando IA. Empieza con el problema cotidiano y termina con el resultado concreto y creíble. Nada de ganancias exageradas.`,
  error:     `Habla del mayor error que comete la gente con ChatGPT: usarlo como buscador en vez de darle contexto. Explica la diferencia con un ejemplo práctico. El espectador debe pensar "yo hago eso, voy a cambiarlo".`,
  ahorro:    `Explica cómo la IA puede devolverte 2 horas al día. Tres ejemplos cotidianos: correos, documentos largos, planificación semanal. Directo y práctico, sin exagerar.`,
  aprender:  `Convence de que aprender a usar IA ahora es la mejor inversión de tiempo. Sin programar ni cursos caros. Habilidades prácticas en días que marcan diferencia en cualquier trabajo.`,
  negocio:   `Cómo una persona sin conocimientos técnicos puede ofrecer un servicio con IA a negocios locales: crear contenido, automatizar tareas, hacer presentaciones. Ejemplo concreto de cómo empezar.`,
  futuro:    `El futuro del trabajo con IA desde ángulo positivo. Tesis: la IA no te quita el trabajo, te da ventaja sobre los que no la usan. Ejemplos donde ayuda y potencia en vez de reemplazar.`,
}

const TOPIC_LABELS: Record<string, string> = {
  historia:  'Historia de éxito con IA',
  error:     'El mayor error con ChatGPT',
  ahorro:    'Cómo ahorrar 2h al día con IA',
  aprender:  'Por qué aprender IA ahora',
  negocio:   'Montar un negocio con IA',
  futuro:    'El futuro del trabajo con IA',
}

export async function POST(req: Request) {
  try {
    const { topicKey, customTopic } = await req.json() as { topicKey?: string; customTopic?: string }

    const topicLabel  = customTopic || TOPIC_LABELS[topicKey ?? ''] || topicKey || 'Vídeo IA'
    const topicPrompt = customTopic
      ? `Crea el guión y escenas sobre: "${customTopic}". Sigue exactamente las mismas reglas de formato y estilo.`
      : (TOPIC_PROMPTS[topicKey ?? ''] ?? TOPIC_PROMPTS.historia)

    // ── 1. Generate script + scenes ─────────────────────────────────────────
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 900,
      system: SYSTEM,
      messages: [{ role: 'user', content: topicPrompt }],
    })
    const raw  = message.content[0].type === 'text' ? message.content[0].text : ''
    const json = raw.match(/\{[\s\S]*\}/)
    if (!json) throw new Error('No JSON in Claude response')

    const { script, scenes } = JSON.parse(json[0]) as {
      script: string
      scenes: { text: string; emojis: string[]; duration: number }[]
    }
    if (!script || !scenes?.length) throw new Error('Invalid Claude response structure')

    // ── 2. Generate audio via ElevenLabs ────────────────────────────────────
    const elKey = process.env.ELEVENLABS_API_KEY
    if (!elKey) throw new Error('ELEVENLABS_API_KEY not configured')

    const audioRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'xi-api-key': elKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text: script,
        model_id: EL_MODEL,
        voice_settings: { stability: 0.55, similarity_boost: 0.8, style: 0.2 },
      }),
    })

    if (!audioRes.ok) {
      const err = await audioRes.text()
      throw new Error(`ElevenLabs: ${audioRes.status} ${err}`)
    }

    const audioBuffer = await audioRes.arrayBuffer()
    const audioBase64 = Buffer.from(audioBuffer).toString('base64')

    return NextResponse.json({ scenes, script, audioBase64, topic: topicLabel })
  } catch (err) {
    console.error('generate-animated error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
