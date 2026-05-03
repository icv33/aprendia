'use client'

import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'

export function Garantia() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-emerald-50 border border-emerald-100 rounded-3xl p-8 md:p-12 text-center"
        >
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield size={28} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
            Garantía de devolución · 30 días
          </h2>
          <p className="text-slate-600 leading-relaxed max-w-xl mx-auto">
            Si después de leer la guía sientes que no ha valido la pena, escríbenos en los primeros 30 días y te devolvemos el 100% del dinero. Sin preguntas, sin complicaciones.
          </p>
          <p className="text-sm text-emerald-700 font-medium mt-6">
            Riesgo cero para ti. Todo el riesgo es nuestro.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
