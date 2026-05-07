import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createDIDTalk } from '@/lib/did-api'
import { createServerSupabase } from '@/lib/supabase'

const SCRIPT_SYSTEM = `Eres experto en crear guiones de vídeo virales para TikTok en español.
Representas a aprendia.store, una cuenta sobre IA práctica para productividad y trabajo.
El guión es para un avatar que habla directamente a cámara.

REGLAS CRÍTICAS:
- Solo texto corrido. Sin listas, sin emojis, sin títulos, sin asteriscos, sin guiones.
- Tuteo directo. Tono cercano, útil y motivador.
- El PRIMER párrafo es el hook: una pregunta o afirmación que impacte en los primeros 3 segundos.
- Máximo 170 palabras en total. Lenguaje natural, como una conversación.
- Cierra siempre con: "Sigue la cuenta y comenta CLUB para recibir más recursos como este."
- NUNCA menciones empresas: OpenAI, Anthropic, Google, Microsoft. Puedes decir ChatGPT o Claude.`

const TOPIC_PROMPTS: Record<string, string> = {
  historia: `Cuenta una historia en primera persona de alguien (estudiante, freelancer o empleado) que descubrió cómo usar IA para ahorrar tiempo. Hazla realista: empieza con el problema cotidiano y termina con el resultado concreto. Nada de "gané miles de euros", sino resultados creíbles como "terminé mi trabajo en la mitad de tiempo".`,

  error: `Habla del mayor error que comete la gente con ChatGPT: usarlo como un buscador de respuestas en vez de como un asistente al que dar contexto. Explica la diferencia con un ejemplo práctico y claro. Que el espectador sienta "eso lo hago yo y puedo mejorarlo".`,

  ahorro: `Explica cómo la IA puede devolverte literalmente 2 horas al día. Da tres ejemplos concretos y cotidianos: responder correos, resumir documentos largos, organizar la semana. Tono práctico y directo, sin exagerar.`,

  aprender: `Convence al espectador de que aprender a usar IA ahora es la mejor inversión de su tiempo. Sin hablar de programar ni de cursos caros. Habilidades concretas que se aprenden en días y que marcan la diferencia en cualquier trabajo o estudio.`,

  negocio: `Habla de cómo una persona sin conocimientos técnicos puede ofrecer un pequeño servicio con IA: crear contenido para negocios locales, automatizar tareas administrativas, hacer presentaciones. Realista, motivador, con un ejemplo de cómo empezar.`,

  futuro: `Habla del futuro del trabajo con IA desde un ángulo positivo. La tesis: la IA no te quita el trabajo, te da ventaja sobre los que no la usan. Pon ejemplos de trabajos donde la IA ayuda y potencia en vez de reemplazar.`,
}

export async function POST(req: Request) {
  try {
    const { topicKey, customTopic } = await req.json() as { topicKey?: string; customTopic?: string }

    const topicLabel = customTopic || TOPIC_LABELS[topicKey ?? ''] || topicKey || 'Vídeo IA'
    const topicPrompt = customTopic
      ? `Crea un guión sobre: "${customTopic}". Sigue las mismas reglas de formato y estilo. Mismo tono directo y cercano.`
      : (TOPIC_PROMPTS[topicKey ?? ''] ?? TOPIC_PROMPTS.historia)

    // Generate script with Claude
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: SCRIPT_SYSTEM,
      messages: [{ role: 'user', content: topicPrompt }],
    })
    const script = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
    if (!script) throw new Error('Guión vacío')

    // Submit to D-ID
    const didId = await createDIDTalk(script)

    // Save to Supabase
    const supabase = createServerSupabase()
    const { data, error } = await supabase
      .from('did_videos')
      .insert({ did_id: didId, topic: topicLabel, script, status: 'processing' })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ video: data })
  } catch (err) {
    console.error('video/generate error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

const TOPIC_LABELS: Record<string, string> = {
  historia:  'Historia de éxito con IA',
  error:     'El mayor error con ChatGPT',
  ahorro:    'Cómo ahorrar 2h al día con IA',
  aprender:  'Por qué aprender IA ahora',
  negocio:   'Montar un negocio con IA',
  futuro:    'El futuro del trabajo con IA',
}
