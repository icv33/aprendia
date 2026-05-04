import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { rateLimit, ipKey } from '@/lib/ratelimit'

const PACKS = {
  starter: {
    name: 'AprendIA Starter',
    description: 'eBook base + 30 prompts esenciales + acceso vitalicio + garantía',
    amount: 1700,
  },
  pro: {
    name: 'AprendIA Pro',
    description: 'Todo lo del Starter + 2 eBooks especializados + 80+ prompts + comunidad WhatsApp',
    amount: 3700,
  },
  elite: {
    name: 'AprendIA Élite',
    description: 'Todo lo del Pro + comunidad privada + mentoría directa + templates de negocio',
    amount: 9700,
  },
} as const

export async function GET(req: NextRequest) {
  const { allowed, retryAfterMs } = rateLimit(ipKey(req, 'checkout'), 10, 60_000)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Demasiadas peticiones. Espera un momento.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } },
    )
  }

  const pack = req.nextUrl.searchParams.get('pack') as keyof typeof PACKS | null

  if (!pack || !(pack in PACKS)) {
    return NextResponse.json({ error: 'Pack inválido. Usa: starter, pro o elite' }, { status: 400 })
  }

  const { name, description, amount } = PACKS[pack]
  const origin = req.nextUrl.origin

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: { name, description },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    metadata: { pack },
    success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/#pricing`,
    billing_address_collection: 'required',
    customer_creation: 'always',
  })

  return NextResponse.redirect(session.url!)
}
