'use client'

import { motion } from 'framer-motion'
import { Flame, ArrowRight } from 'lucide-react'

export function Urgencia({ price, checkoutUrl }: { price: number; checkoutUrl: string }) {
  return (
    <section className="py-16 bg-gradient-to-r from-indigo-600 to-violet-600">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Flame size={20} className="text-amber-300" />
            <span className="text-amber-300 font-semibold text-sm uppercase tracking-wider">Oferta de lanzamiento</span>
            <Flame size={20} className="text-amber-300" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Precio especial · Solo por tiempo limitado
          </h2>
          <p className="text-indigo-200 mb-8">
            Este precio de lanzamiento puede subir en cualquier momento. Asegúrate el tuyo ahora.
          </p>

          <a
            href={checkoutUrl}
            className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold px-8 py-4 rounded-xl hover:bg-indigo-50 transition-all shadow-lg group text-base"
          >
            Quiero la guía por {price}€
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </a>

          <p className="text-indigo-300 text-xs mt-4">
            Pago único · Acceso inmediato · Garantía 30 días
          </p>
        </motion.div>
      </div>
    </section>
  )
}
