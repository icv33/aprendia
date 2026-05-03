import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServerSupabase } from '@/lib/supabase'
import { sendPurchaseEmail } from '@/lib/resend'
import Stripe from 'stripe'

const PACK_NAMES: Record<string, string> = {
  esencial: 'AprendIA Esencial',
  completo: 'AprendIA Completo',
  pro: 'AprendIA Pro',
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const session = event.data.object as Stripe.Checkout.Session
  const pack = session.metadata?.pack
  const ebookId = session.metadata?.ebook_id

  const customerEmail = session.customer_details?.email ?? session.customer_email ?? ''
  const customerName = session.customer_details?.name ?? 'lector'

  const supabase = createServerSupabase()

  // Intentar obtener el ebook (por ID si existe, o el último publicado)
  let ebook: { id: string; title: string; pdf_path: string | null } | null = null

  if (ebookId) {
    const { data } = await supabase
      .from('ebooks')
      .select('id, title, pdf_path')
      .eq('id', ebookId)
      .single()
    ebook = data
  } else {
    // Nuevo flujo: buscar el último ebook publicado
    const { data } = await supabase
      .from('ebooks')
      .select('id, title, pdf_path')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    ebook = data
  }

  const ebookTitle = ebook?.title ?? PACK_NAMES[pack ?? ''] ?? 'AprendIA'
  const orderEbookId = ebook?.id ?? null

  // Registrar el pedido
  await supabase.from('orders').insert({
    ebook_id: orderEbookId,
    customer_email: customerEmail,
    customer_name: customerName,
    amount: (session.amount_total ?? 0) / 100,
    stripe_session_id: session.id,
    status: 'paid',
  })

  // Enviar PDF si está disponible
  if (ebook?.pdf_path && customerEmail) {
    const { data: signedUrl } = await supabase.storage
      .from('ebooks')
      .createSignedUrl(ebook.pdf_path, 60 * 60 * 48)

    if (signedUrl?.signedUrl) {
      await sendPurchaseEmail({
        to: customerEmail,
        customerName,
        ebookTitle,
        downloadUrl: signedUrl.signedUrl,
      })

      await supabase
        .from('orders')
        .update({ pdf_sent: true })
        .eq('stripe_session_id', session.id)
    }
  }

  return NextResponse.json({ received: true })
}
