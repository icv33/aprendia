'use client'

import { motion } from 'framer-motion'
import { BookOpen } from 'lucide-react'

type Module = { title: string; description: string }

export function QueIncluye({ modules }: { modules: Module[] }) {
  return (
    <section id="que-incluye" className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Contenido</span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3 mb-4">
            Qué incluye la guía
          </h2>
          <p className="text-lg text-slate-600">
            Cada módulo está diseñado para que puedas aplicarlo de forma inmediata.
          </p>
        </motion.div>

        <div className="space-y-4">
          {modules.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="flex items-start gap-5 p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group"
            >
              <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <BookOpen size={16} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">Módulo {i + 1}</span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{m.title}</h3>
                <p className="text-sm text-slate-500">{m.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
