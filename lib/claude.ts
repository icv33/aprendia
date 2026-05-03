import Anthropic from '@anthropic-ai/sdk'
import type { EbookContent } from './supabase'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function generateEbook(topic: string, audience: string, price: number): Promise<{
  title: string
  slug: string
  tagline: string
  description: string
  content: EbookContent
}> {
  const prompt = `Eres un experto en marketing digital y en inteligencia artificial. Crea el contenido completo para un ebook/guía digital sobre: "${topic}" dirigido a: "${audience}".

Responde ÚNICAMENTE con un JSON válido con esta estructura exacta:
{
  "title": "Título atractivo del ebook (máx 60 chars)",
  "slug": "titulo-en-kebab-case-sin-acentos",
  "tagline": "Frase gancho de 1 línea (máx 80 chars)",
  "description": "Descripción de 2-3 frases del ebook",
  "content": {
    "subtitle": "Subtítulo del hero de la landing page",
    "promise": "Promesa principal del ebook (resultado concreto + tiempo)",
    "problem": "Descripción del problema que resuelve (2-3 frases)",
    "solution": "Cómo el ebook soluciona el problema (2-3 frases)",
    "modules": [
      {"title": "Nombre del módulo 1", "description": "Qué aprenden en este módulo"},
      {"title": "Nombre del módulo 2", "description": "Qué aprenden en este módulo"},
      {"title": "Nombre del módulo 3", "description": "Qué aprenden en este módulo"},
      {"title": "Nombre del módulo 4", "description": "Qué aprenden en este módulo"},
      {"title": "Nombre del módulo 5", "description": "Qué aprenden en este módulo"}
    ],
    "bonuses": [
      {"title": "Nombre del bonus 1", "description": "Qué incluye", "value": "Valor en €"},
      {"title": "Nombre del bonus 2", "description": "Qué incluye", "value": "Valor en €"},
      {"title": "Nombre del bonus 3", "description": "Qué incluye", "value": "Valor en €"}
    ],
    "faqs": [
      {"question": "Pregunta frecuente 1", "answer": "Respuesta clara y directa"},
      {"question": "Pregunta frecuente 2", "answer": "Respuesta clara y directa"},
      {"question": "Pregunta frecuente 3", "answer": "Respuesta clara y directa"},
      {"question": "Pregunta frecuente 4", "answer": "Respuesta clara y directa"},
      {"question": "Pregunta frecuente 5", "answer": "Respuesta clara y directa"}
    ],
    "testimonials": [
      {"name": "Nombre realista", "role": "Rol o profesión", "text": "Testimonio creíble de 1-2 frases", "rating": 5},
      {"name": "Nombre realista", "role": "Rol o profesión", "text": "Testimonio creíble de 1-2 frases", "rating": 5},
      {"name": "Nombre realista", "role": "Rol o profesión", "text": "Testimonio creíble de 1-2 frases", "rating": 5}
    ],
    "tiktok_scripts": [
      "Script completo para video TikTok 1 (30-45 segundos, formato: hook + desarrollo + CTA)",
      "Script completo para video TikTok 2",
      "Script completo para video TikTok 3",
      "Script completo para video TikTok 4",
      "Script completo para video TikTok 5"
    ]
  }
}

IMPORTANTE:
- Tono: claro, directo, para jóvenes hispanohablantes
- Sin promesas exageradas tipo "hazte rico"
- Los testimonios deben parecer REALES y creíbles
- Los scripts de TikTok deben empezar con un hook fuerte
- Precio del producto: ${price}€`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No se pudo parsear el JSON de Claude')

  return JSON.parse(jsonMatch[0])
}
