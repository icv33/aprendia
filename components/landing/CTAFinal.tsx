'use client'

import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

export function CTAFinal({ title, price, checkoutUrl }: { title: string; price: number; checkoutUrl: string }) {
  return (
    <section className="py-24 bg-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Empieza hoy.<br />
            <span className="gradient-text">La IA no espera.</span>
          </h2>
          <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
            Cada día que pasa sin usar la IA correctamente es tiempo y dinero que pierdes.
            La guía que necesitas está a un clic.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-10 text-sm text-slate-400">
            {['Descarga inmediata', 'Solo {price}€', 'Garantía 30 días', 'Sin suscripción'].map((item, i) => (
              <span key={i} className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400" />
                {item.replace('{price}', String(price))}
              </span>
            ))}
          </div>

          <a
            href={checkoutUrl}
            className="inline-flex items-center gap-2 gradient-bg text-white font-bold px-10 py-5 rounded-xl text-lg hover:opacity-90 transition-all glow-indigo group"
          >
            Quiero empezar ahora — {price}€
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </a>

          <p className="text-slate-600 text-xs mt-6">
            © {new Date().getFullYear()} AprendIA · Todos los derechos reservados
          </p>
        </motion.div>
      </div>
    </section>
  )
}
