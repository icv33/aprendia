import Anthropic from '@anthropic-ai/sdk'
import { TikTokSlide, TikTokPostType } from './supabase'

const PEXELS_QUERIES: Record<TikTokPostType, string[]> = {
  truco: [
    'laptop black dark minimal desk closeup',
    'dark keyboard tech minimal flat lay',
    'laptop screen glowing dark night',
    'black desk setup minimal tech',
    'dark computer workspace minimal aesthetic',
  ],
  vida_facil: [
    'laptop keyboard dark overhead minimal',
    'flatlay laptop dark background minimal',
    'dark desk tech clean setup',
    'laptop earphones dark minimal black',
    'minimal workspace dark aesthetic laptop',
  ],
  mito: [
    'laptop screen dark black minimal desk',
    'dark monitor screen workspace minimal',
    'abstract dark tech digital screen',
    'laptop dark night minimal glow',
    'black keyboard dark minimal tech',
  ],
  caso_practico: [
    'dark monitor workspace laptop minimal black',
    'dual monitor dark setup minimal',
    'laptop desk dark professional minimal',
    'dark tech workspace screen setup',
    'computer screen dark minimal workspace',
  ],
  personalizado: [
    'laptop dark background elegant bokeh',
  ],
}

async function fetchPexelsPhoto(queries: string[]): Promise<string | null> {
  const apiKey = process.env.PEXELS_API_KEY
  if (!apiKey) return null
  const query = queries[Math.floor(Math.random() * queries.length)]
  try {
    const page = Math.floor(Math.random() * 5) + 1
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=80&page=${page}`,
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

const FIXED_CTA = 'Comenta <<CLUB>> y sígueme para que pueda mandarte el acceso gratis por MD.'

const SYSTEM_PROMPT = `Eres experto en marketing de contenido viral para TikTok en español.
Generas contenido sobre IA aplicada que sea directo, útil y práctico.
Siempre respondes SOLO con JSON válido, sin markdown ni explicaciones adicionales.

OBJETIVO: Conseguir que la gente comente CLUB y siga la cuenta aprendia.store.

REGLAS DE COPY:
- Enfoca siempre en beneficios concretos: ahorrar tiempo, automatizar tareas, mejorar productividad, ganar dinero de forma realista.
- Evita promesas exageradas: "gana 1000€ hoy", "hazte rico", "dinero automático", "ingresos garantizados".
- Tono directo, útil y práctico. Español natural. Tuteo.
- Frases cortas y fáciles de leer.

REGLAS DE FORMATO DE TEXTO:
- En CADA campo de texto, marca EXACTAMENTE 1 palabra o frase corta (máximo 2 palabras) con <<dobles ángulos>>.
- Solo la palabra MÁS importante del texto. No más de una marca por campo.
- Ejemplo correcto: "El <<error fatal>> que cometes con ChatGPT"
- Ejemplo incorrecto: "El <<error fatal>> que <<todos cometen>> con ChatGPT" (demasiadas marcas)
- Los textos de contenido: máximo 15 palabras. Una sola idea por slide. Sin párrafos.

ESTRUCTURA NARRATIVA (seguir este orden en los 5 slides):
1. Problema o situación común que el lector reconoce.
2. Idea principal o cambio de enfoque.
3. Prompt, sistema o paso práctico concreto.
4. Ejemplo de aplicación real.
5. Resultado esperado realista.

MARCAS: Puedes nombrar ChatGPT o Claude como herramientas concretas, pero NUNCA menciones nombres de empresas (OpenAI, Anthropic, Google, Microsoft). Si necesitas referirte a la IA en general, di "la IA" o "ChatGPT".

HOOKS PROHIBIDOS (nunca uses estos):
- "Truco de ChatGPT", "Caso práctico de IA", "Mito sobre IA"
- El cover nunca empieza nombrando el tipo de contenido.
- El cover siempre empieza con el beneficio o con una frase que genere tensión.`

const HIGHLIGHT_RULE = `
Recuerda: EXACTAMENTE 1 marca <<palabra>> por campo. Solo la palabra más impactante.`

const PROMPTS: Record<TikTokPostType, string> = {
  truco: `Genera un carrusel de TikTok sobre un truco concreto de ChatGPT, Claude u otra IA.

El truco debe ayudar a: ahorrar tiempo, trabajar mejor, estudiar mejor, crear contenido, automatizar una tarea o ganar productividad.
El hook del cover debe empezar con el beneficio, nunca con "Truco de...".

Ejemplos de hooks buenos:
- "Ahorra <<2 horas>> con este prompt"
- "Deja de usar <<ChatGPT>> como Google"
- "Este prompt hace el <<trabajo>> por ti"
- "Haz en <<5 minutos>> lo que tardas una hora"

Devuelve exactamente este JSON (sin markdown, solo el objeto):
{
  "titulo_portada": "TÍTULO EN MAYÚSCULAS CON BENEFICIO CLARO, MÁXIMO 7 PALABRAS, con <<palabra clave>>",
  "subtitulo_portada": "una línea descriptiva, max 8 palabras",
  "slides": [
    {"titulo": "título max 5 palabras con <<marca>>", "contenido": "situación común que el lector reconoce, max 15 palabras"},
    {"titulo": "...", "contenido": "idea principal o cambio de enfoque, max 15 palabras"},
    {"titulo": "...", "contenido": "prompt o paso práctico concreto, max 15 palabras"},
    {"titulo": "...", "contenido": "ejemplo de aplicación real, max 15 palabras"},
    {"titulo": "...", "contenido": "resultado esperado realista, max 15 palabras"}
  ]
}

IMPORTANTE: exactamente 5 slides. Tono informal (tuteo). Sin emojis en los textos.${HIGHLIGHT_RULE}`,

  vida_facil: `Genera un carrusel de TikTok mostrando cómo usar IA para simplificar tareas del día a día.

Temas posibles: organizar la semana, responder emails, resumir textos, preparar trabajos, crear rutinas, tomar decisiones, ahorrar esfuerzo mental.
El hook del cover debe empezar con el beneficio o resultado, nunca con "Vida fácil con IA".

Ejemplos de hooks buenos:
- "Organiza tu <<semana>> en 2 minutos"
- "Tu IA puede ser tu <<secretario>>"
- "Responde emails sin <<pensar>> tanto"
- "Resume cualquier PDF en <<segundos>>"

Devuelve exactamente este JSON (sin markdown, solo el objeto):
{
  "titulo_portada": "TÍTULO EN MAYÚSCULAS CON BENEFICIO CLARO, MÁXIMO 7 PALABRAS, con <<palabra clave>>",
  "subtitulo_portada": "una línea descriptiva, max 8 palabras",
  "slides": [
    {"titulo": "título max 5 palabras con <<marca>>", "contenido": "situación común que el lector reconoce, max 15 palabras"},
    {"titulo": "...", "contenido": "idea principal o cambio de enfoque, max 15 palabras"},
    {"titulo": "...", "contenido": "paso práctico concreto con IA, max 15 palabras"},
    {"titulo": "...", "contenido": "ejemplo de aplicación real, max 15 palabras"},
    {"titulo": "...", "contenido": "resultado esperado realista, max 15 palabras"}
  ]
}

IMPORTANTE: exactamente 5 slides. Tono informal (tuteo). Sin emojis en los textos.${HIGHLIGHT_RULE}`,

  mito: `Genera un carrusel de TikTok desmitificando una creencia falsa sobre IA.

Debe generar curiosidad, debate o urgencia. Conectar con: dinero, trabajo, productividad, futuro laboral u oportunidades con IA.
El hook debe generar la reacción "eso lo pensaba yo" o "espera, ¿en serio?".

Ejemplos de hooks buenos:
- "La IA no te quita el <<trabajo>>"
- "No necesitas saber <<programar>>"
- "Los prompts mágicos no <<existen>>"
- "El 90% usa mal la <<IA>>"

Devuelve exactamente este JSON (sin markdown, solo el objeto):
{
  "titulo_portada": "TÍTULO EN MAYÚSCULAS QUE GENERE CURIOSIDAD O CONTRASTE, MÁXIMO 7 PALABRAS, con <<palabra clave>>",
  "subtitulo_portada": "una línea descriptiva, max 8 palabras",
  "slides": [
    {"titulo": "título max 5 palabras con <<marca>>", "contenido": "creencia falsa común que tiene mucha gente, max 15 palabras"},
    {"titulo": "...", "contenido": "por qué esa creencia está equivocada, max 15 palabras"},
    {"titulo": "...", "contenido": "cómo funciona realmente, max 15 palabras"},
    {"titulo": "...", "contenido": "ejemplo concreto que demuestra la realidad, max 15 palabras"},
    {"titulo": "...", "contenido": "qué cambia si adoptas la visión correcta, max 15 palabras"}
  ]
}

IMPORTANTE: exactamente 5 slides. Tono informal (tuteo). Sin emojis en los textos.${HIGHLIGHT_RULE}`,

  caso_practico: `Genera un carrusel de TikTok con un caso realista y creíble de uso de IA.

Debe mostrar cómo alguien puede ahorrar tiempo, crear un servicio simple, mejorar su trabajo, generar contenido, organizar un proyecto o encontrar una oportunidad de ingresos.
El hook debe incluir un resultado concreto o un número realista.

Ejemplos de hooks buenos:
- "Cómo ganaría mis primeros <<100€>> con IA"
- "Vende contenido a negocios con <<IA>>"
- "Monta un servicio simple con <<ChatGPT>>"
- "Automatiza clientes sin saber <<programar>>"

Devuelve exactamente este JSON (sin markdown, solo el objeto):
{
  "titulo_portada": "TÍTULO EN MAYÚSCULAS CON RESULTADO CONCRETO, MÁXIMO 7 PALABRAS, con <<palabra clave>>",
  "subtitulo_portada": "una línea descriptiva, max 8 palabras",
  "slides": [
    {"titulo": "título max 5 palabras con <<marca>>", "contenido": "situación de partida realista, max 15 palabras"},
    {"titulo": "...", "contenido": "qué herramienta o enfoque se usa, max 15 palabras"},
    {"titulo": "...", "contenido": "paso práctico o sistema concreto, max 15 palabras"},
    {"titulo": "...", "contenido": "ejemplo de aplicación real, max 15 palabras"},
    {"titulo": "...", "contenido": "resultado esperado realista y alcanzable, max 15 palabras"}
  ]
}

IMPORTANTE: exactamente 5 slides. Tono informal (tuteo). Sin emojis en los textos.${HIGHLIGHT_RULE}`,

  personalizado: '',
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
    { type: 'cta', cta: FIXED_CTA },
  ]

  return slides
}

export const TYPE_META: Record<TikTokPostType, { label: string; icon: string; color: string; desc: string }> = {
  truco:         { label: 'Truco IA',      icon: '⚡', color: '#00E5A0', desc: 'Un truco concreto de ChatGPT o Claude' },
  vida_facil:    { label: 'Vida fácil',    icon: '☀️', color: '#00E5A0', desc: 'Cómo uso IA para simplificar mi día' },
  mito:          { label: 'Mito',          icon: '💥', color: '#00E5A0', desc: 'Una creencia falsa sobre IA desmontada' },
  caso_practico: { label: 'Caso real',     icon: '🎯', color: '#00E5A0', desc: 'Un caso realista de uso de IA' },
  personalizado: { label: 'Personalizado', icon: '✏️', color: '#EC4899', desc: 'Post con tema y contenido personalizado' },
}

export const SCHEDULE_SLOTS = ['09:00', '12:00', '15:00', '19:00']

export async function generateCustomTikTokSlides(userPrompt: string): Promise<TikTokSlide[]> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

  const prompt = `El usuario quiere crear un carrusel de TikTok con las siguientes instrucciones:

"${userPrompt}"

REGLAS CRÍTICAS PARA ESTE POST PERSONALIZADO:
1. Si el usuario ha escrito frases o textos concretos, úsalos EXACTAMENTE tal como los ha escrito, palabra por palabra, en el slide que corresponda. No los parafrasees ni los reescribas.
2. Si el usuario ha dado un guión o estructura específica, síguelo al pie de la letra. El número de slides debe adaptarse a lo que pide, no forzar siempre 5.
3. Si el usuario solo da un tema general sin frases concretas, tú crea el contenido siguiendo su intención.
4. El número de slides de contenido puede ser entre 3 y 7 según lo que requiera el guión.

Para el título de portada: crea un hook fuerte basado en la intención del usuario.
Para cada slide: título corto (max 5 palabras) + contenido (max 15 palabras).
Añade marcas <<palabra>> solo donde aporte énfasis, exactamente 1 por campo.

Devuelve exactamente este JSON (sin markdown, solo el objeto):
{
  "titulo_portada": "TÍTULO EN MAYÚSCULAS CON GANCHO, con <<palabra clave>>",
  "subtitulo_portada": "una línea descriptiva, max 8 palabras",
  "slides": [
    {"titulo": "título con <<marca>>", "contenido": "texto del slide con <<énfasis>>"},
    {"titulo": "...", "contenido": "..."}
  ],
  "cta": "si el usuario especificó un CTA concreto úsalo exactamente; si no, usa: Comenta <<CLUB>> y sígueme para que pueda mandarte el acceso gratis por MD."
}

Tono informal (tuteo). Sin emojis en los textos.${HIGHLIGHT_RULE}`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1600,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON in response')

  const data = JSON.parse(jsonMatch[0])
  const bgUrl = await fetchPexelsPhoto(PEXELS_QUERIES['personalizado'])

  return [
    { type: 'cover', titulo: data.titulo_portada, subtitulo: data.subtitulo_portada, background_url: bgUrl ?? undefined },
    ...data.slides.slice(0, 8).map((s: { titulo: string; contenido: string }, i: number) => ({
      type: 'content' as const, num: i + 1, titulo: s.titulo, contenido: s.contenido,
    })),
    { type: 'cta', cta: data.cta ?? FIXED_CTA },
  ]
}
