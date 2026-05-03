'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, ArrowRight, Shield } from 'lucide-react'

const incluye = [
  'Guía completa en PDF (descarga inmediata)',
  'Acceso de por vida al contenido',
  'Todos los bonus incluidos',
  'Actualizaciones futuras gratis',
  'Garantía de devolución 30 días',
]

type PrecioProps = {
  title: string
  price: number
  originalPrice?: number
  checkoutUrl: string
}

export function Precio({ title, price, originalPrice, checkoutUrl }: PrecioProps) {
  const savings = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0

  return (
    <section id="precio" className="py-24 bg-white">
      <div className="max-w-lg mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Precio</span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3 mb-4">
            Invierte en tu futuro
          </h2>
          <p className="text-slate-600">Una sola vez. Sin suscripciones.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="bg-white border-2 border-indigo-200 rounded-3xl p-8 shadow-xl relative overflow-hidden"
        >
          {/* Gradient top border */}
          <div className="absolute top-0 left-0 right-0 h-1 gradient-bg" />

          {savings > 0 && (
            <div className="absolute top-4 right-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              -{savings}% hoy
            </div>
          )}

          <div className="text-center mb-8">
            <h3 className="font-semibold text-slate-700 mb-4">{title}</h3>
            <div className="flex items-baseline justify-center gap-2">
              {originalPrice && (
                <span className="text-2xl text-slate-400 line-through">{originalPrice}€</span>
              )}
              <span className="text-6xl font-bold text-slate-900">{price}</span>
              <span className="text-xl text-slate-500">€</span>
            </div>
            <p className="text-sm text-slate-500 mt-2">Pago único · Sin sorpresas</p>
          </div>

          <ul className="space-y-3 mb-8">
            {incluye.map((item, i) => (
              <li key={i} className="flex items-center gap-3">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span className="text-sm text-slate-700">{item}</span>
              </li>
            ))}
          </ul>

          <a
            href={checkoutUrl}
            className="gradient-bg text-white font-bold py-4 px-6 rounded-xl text-base w-full flex items-center justify-center gap-2 hover:opacity-90 transition-all glow-indigo group"
          >
            Conseguir la guía ahora
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </a>

          <div className="flex items-center justify-center gap-2 mt-4">
            <Shield size={14} className="text-slate-400" />
            <p className="text-xs text-slate-400 text-center">
              Pago seguro con Stripe · Garantía de 30 días
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
