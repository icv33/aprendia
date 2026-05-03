import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateEbook } from '@/lib/claude'
import { createServerSupabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { topic, audience, price } = await req.json()
  if (!topic || !audience || !price) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const generated = await generateEbook(topic, audience, Number(price))

  const supabase = createServerSupabase()
  const { data, error } = await supabase
    .from('ebooks')
    .insert({
      title: generated.title,
      slug: generated.slug,
      tagline: generated.tagline,
      description: generated.description,
      content: generated.content,
      price: Number(price),
      original_price: Math.round(Number(price) * 2),
      status: 'pending',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ebook: data })
}
