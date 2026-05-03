'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Star, Users, BookOpen } from 'lucide-react'

function anim(i: number) {
  return {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' as const },
  }
}

type HeroProps = {
  title: string
  tagline: string
  promise: string
  price: number
  originalPrice?: number
  checkoutUrl: string
}

export function Hero({ title, tagline, promise, price, originalPrice, checkoutUrl }: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-white pt-16">
      {/* Background gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-indigo-100/60 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-violet-100/40 blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left content */}
        <div>
          {/* Social proof pill */}
          <motion.div
            {...anim(0)}
            className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 mb-8"
          >
            <div className="flex -space-x-1">
              {['bg-indigo-400', 'bg-violet-400', 'bg-emerald-400'].map((c, i) => (
                <div key={i} className={`w-5 h-5 rounded-full ${c} border-2 border-white`} />
              ))}
            </div>
            <span className="text-xs font-medium text-indigo-700">+2.400 personas ya lo usan</span>
            <div className="flex">
              {[...Array(5)].map((_, i) => <Star key={i} size={10} className="text-amber-400 fill-amber-400" />)}
            </div>
          </motion.div>

          <motion.h1
            {...anim(1)}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight tracking-tight mb-6"
          >
            {title.split('IA').map((part, i, arr) => (
              <span key={i}>
                {part}
                {i < arr.length - 1 && <span className="gradient-text">IA</span>}
              </span>
            ))}
          </motion.h1>

          <motion.p {...anim(2)} className="text-lg text-slate-600 leading-relaxed mb-4">
            {tagline}
          </motion.p>

          <motion.div
            {...anim(3)}
            className="flex items-center gap-2 mb-8 p-3 bg-emerald-50 border border-emerald-100 rounded-xl"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <p className="text-sm font-medium text-emerald-800">{promise}</p>
          </motion.div>

          <motion.div {...anim(4)} className="flex flex-col sm:flex-row gap-3 mb-8">
            <a
              href={checkoutUrl}
              className="gradient-bg text-white font-semibold px-8 py-4 rounded-xl text-base hover:opacity-90 transition-all glow-indigo flex items-center justify-center gap-2 group"
            >
              Quiero la guía por {price}€
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#que-incluye"
              className="border border-slate-200 text-slate-700 font-medium px-8 py-4 rounded-xl text-base hover:bg-slate-50 transition-all text-center"
            >
              Ver contenido
            </a>
          </motion.div>

          <motion.div {...anim(5)} className="flex items-center gap-6 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <BookOpen size={14} className="text-indigo-500" />
              Descarga inmediata
            </span>
            <span className="flex items-center gap-1.5">
              <Users size={14} className="text-indigo-500" />
              Sin suscripciones
            </span>
            <span className="flex items-center gap-1.5">
              <Star size={14} className="text-amber-500 fill-amber-500" />
              Garantía 30 días
            </span>
          </motion.div>
        </div>

        {/* Right — Ebook mockup */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
          className="hidden lg:flex justify-center"
        >
          <div className="relative">
            <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-2xl gradient-bg opacity-20 blur-sm" />

            <div className="relative w-72 bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
              <div className="gradient-bg p-8 aspect-[3/4] flex flex-col justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-white/20 rounded-md flex items-center justify-center">
                    <span className="text-white text-xs font-bold">A</span>
                  </div>
                  <span className="text-white/80 text-xs font-medium">AprendIA</span>
                </div>

                <div>
                  <div className="w-16 h-1 bg-white/30 rounded-full mb-4" />
                  <h3 className="text-white text-xl font-bold leading-tight mb-2">{title}</h3>
                  <p className="text-white/70 text-xs">{tagline}</p>
                </div>

                <div className="flex gap-2">
                  {['Automatización', 'IA', 'Ingresos'].map((tag) => (
                    <span key={tag} className="text-[10px] font-medium bg-white/15 text-white px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 flex items-center justify-between">
                <div>
                  {originalPrice && (
                    <span className="text-xs text-slate-400 line-through mr-2">{originalPrice}€</span>
                  )}
                  <span className="text-2xl font-bold text-slate-900">{price}€</span>
                </div>
                <div className="flex">
                  {[...Array(5)].map((_, i) => <Star key={i} size={12} className="text-amber-400 fill-amber-400" />)}
                </div>
              </div>
            </div>

            <div className="absolute -top-3 -right-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              PDF Instantáneo
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
