export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase'
import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { Problema } from '@/components/landing/Problema'
import { Solucion } from '@/components/landing/Solucion'
import { Beneficios } from '@/components/landing/Beneficios'
import { ParaQuien } from '@/components/landing/ParaQuien'
import { ComoFunciona } from '@/components/landing/ComoFunciona'
import { QueIncluye } from '@/components/landing/QueIncluye'
import { Bonus } from '@/components/landing/Bonus'
import { PruebaSocial } from '@/components/landing/PruebaSocial'
import { FAQ } from '@/components/landing/FAQ'
import { Precio } from '@/components/landing/Precio'
import { Urgencia } from '@/components/landing/Urgencia'
import { Garantia } from '@/components/landing/Garantia'
import { CTAFinal } from '@/components/landing/CTAFinal'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const supabase = createServerSupabase()
  const { data } = await supabase
    .from('ebooks')
    .select('title, tagline')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!data) return { title: 'AprendIA' }
  return { title: `${data.title} | AprendIA`, description: data.tagline }
}

export default async function ProductoPage({ params }: Props) {
  const { slug } = await params
  const supabase = createServerSupabase()

  const { data: ebook } = await supabase
    .from('ebooks')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!ebook) notFound()

  const checkoutUrl = `/api/checkout?ebook=${ebook.id}`
  const content = ebook.content

  return (
    <main>
      <Navbar />
      <Hero
        title={ebook.title}
        tagline={ebook.tagline}
        promise={content?.promise ?? ''}
        price={ebook.price}
        originalPrice={ebook.original_price ?? undefined}
        checkoutUrl={checkoutUrl}
      />
      <Problema problem={content?.problem ?? ''} />
      <Solucion title={ebook.title} solution={content?.solution ?? ''} />
      <Beneficios />
      <ParaQuien />
      <ComoFunciona />
      {content?.modules?.length > 0 && <QueIncluye modules={content.modules} />}
      {content?.bonuses?.length > 0 && <Bonus bonuses={content.bonuses} />}
      {content?.testimonials?.length > 0 && <PruebaSocial testimonials={content.testimonials} />}
      {content?.faqs?.length > 0 && <FAQ faqs={content.faqs} />}
      <Precio
        title={ebook.title}
        price={ebook.price}
        originalPrice={ebook.original_price ?? undefined}
        checkoutUrl={checkoutUrl}
      />
      <Urgencia price={ebook.price} checkoutUrl={checkoutUrl} />
      <Garantia />
      <CTAFinal title={ebook.title} price={ebook.price} checkoutUrl={checkoutUrl} />
    </main>
  )
}
