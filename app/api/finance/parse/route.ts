import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const SYSTEM = `Eres un asistente de finanzas. Extraes datos de gastos e ingresos del lenguaje natural.
Devuelves SOLO JSON válido, sin markdown ni explicaciones.

- "expense": pagos, compras, suscripciones, servicios pagados, gastos
- "income": ventas, cobros, ingresos, beneficios

Categorías de gasto: Infraestructura, Marketing, Herramientas, Suscripciones, Diseño, Otros
Categorías de ingreso: Ventas, Club, Servicios, Otros

Si el texto menciona una fecha, úsala en formato YYYY-MM-DD. Si no, usa la fecha proporcionada.

Devuelve exactamente este JSON:
{"type":"income"|"expense","amount":number,"description":"string","category":"string","date":"YYYY-MM-DD"}`

export async function POST(req: Request) {
  const { text, today } = await req.json()
  if (!text?.trim()) return Response.json({ error: 'Texto vacío' }, { status: 400 })

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    system: SYSTEM,
    messages: [{ role: 'user', content: `Fecha de hoy: ${today}. Texto: "${text}"` }],
  })

  const raw = msg.content[0].type === 'text' ? msg.content[0].text : ''
  const match = raw.match(/\{[\s\S]*\}/)
  if (!match) return Response.json({ error: 'No se pudo interpretar' }, { status: 400 })

  return Response.json(JSON.parse(match[0]))
}
