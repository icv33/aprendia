import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

const PACKS = {
  esencial: {
    name: 'AprendIA Esencial',
    description: 'eBook completo (240 págs) + 30 prompts esenciales + acceso vitalicio',
    amount: 1700,
  },
  completo: {
    name: 'AprendIA Completo',
    description: 'eBook + 80+ prompts + guía no-code + mapa de ingresos + actualizaciones vitalicias',
    amount: 2700,
  },
  pro: {
    name: 'AprendIA Pro',
    description: 'Todo lo del Completo + comunidad privada + email directo + templates + soporte prioritario',
    amount: 5700,
  },
} as const

export async function GET(req: NextRequest) {
  const pack = req.nextUrl.searchParams.get('pack') as keyof typeof PACKS | null

  if (!pack || !(pack in PACKS)) {
    return NextResponse.json({ error: 'Pack inválido. Usa: esencial, completo o pro' }, { status: 400 })
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
