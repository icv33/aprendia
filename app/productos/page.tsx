export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase'
import { Navbar } from '@/components/landing/Navbar'
import { ArrowRight, Star, BookOpen } from 'lucide-react'

export const metadata = {
  title: 'Guías digitales | AprendIA',
  description: 'Explora todas nuestras guías prácticas sobre inteligencia artificial.',
}

export default async function ProductosPage() {
  const supabase = createServerSupabase()
  const { data: ebooks } = await supabase
    .from('ebooks')
    .select('id, title, slug, tagline, price, original_price, cover_image')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="pt-32 pb-16 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Guías de <span className="gradient-text">IA</span> para empezar hoy
          </h1>
          <p className="text-lg text-slate-600">
            Aprende a usar la inteligencia artificial para ahorrar tiempo y generar ingresos. Sin saber programar.
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="max-w-5xl mx-auto px-6">
          {!ebooks?.length ? (
            <div className="text-center py-20 text-slate-400">
              <BookOpen size={40} className="mx-auto mb-4 opacity-30" />
              <p>Próximamente nuevas guías. Vuelve pronto.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ebooks.map((ebook) => (
                <Link
                  key={ebook.id}
                  href={`/productos/${ebook.slug}`}
                  className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-indigo-100 transition-all overflow-hidden"
                >
                  {/* Cover */}
                  <div className="gradient-bg aspect-[4/3] flex items-end p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/5" />
                    <div className="relative">
                      <h3 className="text-white font-bold text-lg leading-tight">{ebook.title}</h3>
                    </div>
                  </div>

                  <div className="p-5">
                    <p className="text-sm text-slate-500 mb-4 line-clamp-2">{ebook.tagline}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        {ebook.original_price && (
                          <span className="text-xs text-slate-400 line-through">{ebook.original_price}€</span>
                        )}
                        <span className="text-xl font-bold text-slate-900">{ebook.price}€</span>
                      </div>
                      <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                        Ver guía <ArrowRight size={12} />
                      </span>
                    </div>

                    <div className="flex items-center gap-1 mt-3">
                      {[...Array(5)].map((_, i) => <Star key={i} size={11} className="text-amber-400 fill-amber-400" />)}
                      <span className="text-xs text-slate-400 ml-1">4.9</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
