'use client'

import { motion } from 'framer-motion'
import { Gift } from 'lucide-react'

type BonusItem = { title: string; description: string; value: string }

export function Bonus({ bonuses }: { bonuses: BonusItem[] }) {
  return (
    <section className="py-24 bg-gradient-to-br from-indigo-50 to-violet-50">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-violet-600 uppercase tracking-wider">Extras incluidos</span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3 mb-4">
            Bonus que se incluyen gratis
          </h2>
          <p className="text-lg text-slate-600">
            Si comprases estos recursos por separado, pagarías más de 3 veces el precio.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {bonuses.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-bl-xl">
                Valor {b.value}
              </div>

              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 mt-4">
                <Gift size={18} className="text-indigo-600" />
              </div>

              <h3 className="font-semibold text-slate-900 mb-2">{b.title}</h3>
              <p className="text-sm text-slate-500">{b.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-10 text-center"
        >
          <p className="text-slate-500 text-sm">
            Todo esto incluido en el precio único de la guía. Sin costes adicionales.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
