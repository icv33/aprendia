'use client'

import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'

const points = [
  'Sin necesidad de saber programar',
  'Explicado en español, paso a paso',
  'Aplicable desde el primer día',
  'Herramientas gratuitas y de pago',
]

export function Solucion({ title, solution }: { title: string; solution: string }) {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">La solución</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3 mb-6 leading-tight">
              Todo lo que necesitas,<br />en una guía práctica
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed mb-8">{solution}</p>

            <div className="space-y-3">
              {points.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                  <span className="text-slate-700">{p}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="gradient-bg rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full" />

              <div className="relative">
                <div className="text-4xl mb-4">📘</div>
                <h3 className="text-2xl font-bold mb-3">{title}</h3>
                <p className="text-white/80 leading-relaxed">
                  Una guía completa, práctica y en español que transforma la forma en que usas la IA.
                </p>

                <div className="mt-6 pt-6 border-t border-white/20 grid grid-cols-3 gap-4 text-center">
                  {[
                    { n: '5+', label: 'Módulos' },
                    { n: '3', label: 'Bonus' },
                    { n: '100%', label: 'Práctico' },
                  ].map((s) => (
                    <div key={s.label}>
                      <div className="text-2xl font-bold">{s.n}</div>
                      <div className="text-white/60 text-xs mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
