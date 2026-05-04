import Anthropic from '@anthropic-ai/sdk'
import { TikTokSlide, TikTokPostType } from './supabase'

const PEXELS_QUERIES: Record<TikTokPostType, string> = {
  truco:         'laptop workspace minimal desk tech setup',
  vida_facil:    'morning coffee laptop lifestyle productive home',
  mito:          'person thinking laptop focus work concentration',
  caso_practico: 'office desk work productivity professional setup',
}

async function fetchPexelsPhoto(query: string): Promise<string | null> {
  const apiKey = process.env.PEXELS_API_KEY
  if (!apiKey) return null
  try {
    const page = Math.floor(Math.random() * 3) + 1
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=15&page=${page}`,
      { headers: { Authorization: apiKey } }
    )
    if (!res.ok) return null
    const data = await res.json()
    if (!data.photos?.length) return null
    const photo = data.photos[Math.floor(Math.random() * data.photos.length)]
    return photo.src.portrait ?? photo.src.large ?? null
  } catch {
    return null
  }
}

const SYSTEM_PROMPT = `Eres experto en marketing de contenido viral para TikTok en español.
Generas contenido educativo sobre IA que sea práctico, directo y que enganche.
Siempre respondes SOLO con JSON válido, sin markdown ni explicaciones adicionales.`

const PROMPTS: Record<TikTokPostType, string> = {
  truco: `Genera un carrusel de TikTok sobre UN truco específico y útil de ChatGPT o Claude.

El truco debe ser concreto, aplicable hoy mismo, sorprendente o poco conocido.

Devuelve exactamente este JSON (sin markdown, solo el objeto):
{
  "titulo_portada": "TÍTULO EN MAYÚSCULAS CON GANCHO, MÁXIMO 7 PALABRAS",
  "subtitulo_portada": "una línea descriptiva, max 10 palabras",
  "slides": [
    {"titulo": "título descriptivo max 5 palabras", "contenido": "explicación práctica y directa, max 35 palabras"},
    {"titulo": "...", "contenido": "..."},
    {"titulo": "...", "contenido": "..."},
    {"titulo": "...", "contenido": "..."},
    {"titulo": "...", "contenido": "..."}
  ],
  "cta": "frase de cierre con call to action, max 12 palabras"
}

IMPORTANTE: exactamente 5 slides. Tono informal (tuteo). Sin emojis en los textos.`,

  vida_facil: `Genera un carrusel de TikTok del estilo "X cosas que hago con IA para [resultado concreto]".

El tema debe ser práctico y aplicable a la vida cotidiana o al trabajo diario.

Devuelve exactamente este JSON (sin markdown, solo el objeto):
{
  "titulo_portada": "TÍTULO EN MAYÚSCULAS CON GANCHO, MÁXIMO 7 PALABRAS",
  "subtitulo_portada": "una línea descriptiva, max 10 palabras",
  "slides": [
    {"titulo": "título descriptivo max 5 palabras", "contenido": "explicación práctica, max 35 palabras"},
    {"titulo": "...", "contenido": "..."},
    {"titulo": "...", "contenido": "..."},
    {"titulo": "...", "contenido": "..."},
    {"titulo": "...", "contenido": "..."}
  ],
  "cta": "frase de cierre con call to action, max 12 palabras"
}

IMPORTANTE: exactamente 5 slides. Tono informal (tuteo). Sin emojis en los textos.`,

  mito: `Genera un carrusel de TikTok desmitificando UN error muy común que comete la gente al usar IA.

El error debe ser algo que hace mucha gente, fácil de corregir y con impacto claro al corregirlo.

Devuelve exactamente este JSON (sin markdown, solo el objeto):
{
  "titulo_portada": "TÍTULO EN MAYÚSCULAS QUE GENERE CURIOSIDAD, MÁXIMO 7 PALABRAS",
  "subtitulo_portada": "una línea descriptiva, max 10 palabras",
  "slides": [
    {"titulo": "título descriptivo max 5 palabras", "contenido": "explicación del error o la corrección, max 35 palabras"},
    {"titulo": "...", "contenido": "..."},
    {"titulo": "...", "contenido": "..."},
    {"titulo": "...", "contenido": "..."},
    {"titulo": "...", "contenido": "..."}
  ],
  "cta": "frase de cierre con call to action, max 12 palabras"
}

IMPORTANTE: exactamente 5 slides. Tono informal (tuteo). Sin emojis en los textos.`,

  caso_practico: `Genera un carrusel de TikTok sobre cómo automatizar UNA tarea concreta del trabajo usando IA.

La tarea debe ser algo que mucha gente hace manualmente, claramente mejorable con IA y que ahorre tiempo visible.

Devuelve exactamente este JSON (sin markdown, solo el objeto):
{
  "titulo_portada": "TÍTULO EN MAYÚSCULAS CON GANCHO REAL, MÁXIMO 7 PALABRAS",
  "subtitulo_portada": "una línea descriptiva, max 10 palabras",
  "slides": [
    {"titulo": "título descriptivo max 5 palabras", "contenido": "paso o insight del caso práctico, max 35 palabras"},
    {"titulo": "...", "contenido": "..."},
    {"titulo": "...", "contenido": "..."},
    {"titulo": "...", "contenido": "..."},
    {"titulo": "...", "contenido": "..."}
  ],
  "cta": "frase de cierre con call to action, max 12 palabras"
}

IMPORTANTE: exactamente 5 slides. Tono informal (tuteo). Sin emojis en los textos.`,
}

export async function generateTikTokSlides(type: TikTokPostType): Promise<TikTokSlide[]> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1200,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: PROMPTS[type] }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''

  // Extract JSON — handle potential markdown code blocks
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON in response')

  const data = JSON.parse(jsonMatch[0])

  const bgUrl = await fetchPexelsPhoto(PEXELS_QUERIES[type])

  const slides: TikTokSlide[] = [
    { type: 'cover', titulo: data.titulo_portada, subtitulo: data.subtitulo_portada, background_url: bgUrl ?? undefined },
    ...data.slides.slice(0, 5).map((s: { titulo: string; contenido: string }, i: number) => ({
      type: 'content' as const,
      num: i + 1,
      titulo: s.titulo,
      contenido: s.contenido,
    })),
    { type: 'cta', cta: data.cta },
  ]

  return slides
}

export const TYPE_META: Record<TikTokPostType, { label: string; icon: string; color: string; desc: string }> = {
  truco:         { label: 'Truco IA',    icon: '⚡', color: '#00FFB2', desc: 'Un truco concreto de ChatGPT o Claude' },
  vida_facil:    { label: 'Vida fácil',  icon: '☀️', color: '#3B82F6', desc: 'Cosas que hago con IA para facilitar mi día' },
  mito:          { label: 'Mito',        icon: '💥', color: '#8B5CF6', desc: 'El error que comete la mayoría al usar IA' },
  caso_practico: { label: 'Caso real',   icon: '🎯', color: '#F59E0B', desc: 'Cómo automaticé una tarea concreta con IA' },
}

export const SCHEDULE_SLOTS = ['09:00', '12:00', '15:00', '19:00']
