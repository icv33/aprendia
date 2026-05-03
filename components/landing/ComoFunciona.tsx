'use client'

import { motion } from 'framer-motion'

const pasos = [
  { n: '01', title: 'Descarga la guía', desc: 'Completa el pago y recibe el PDF directamente en tu email en menos de 1 minuto.' },
  { n: '02', title: 'Sigue el sistema', desc: 'Cada módulo tiene ejercicios prácticos. Completa uno al día y en una semana tienes resultados.' },
  { n: '03', title: 'Aplica y gana', desc: 'Usa las herramientas y sistemas que aprendes para ahorrar tiempo y empezar a monetizar.' },
]

export function ComoFunciona() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">El proceso</span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3 mb-4">
            Cómo funciona
          </h2>
          <p className="text-lg text-slate-600">Tres pasos simples para empezar.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-8 left-1/6 right-1/6 h-px bg-indigo-100" style={{ left: '20%', right: '20%' }} />

          {pasos.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="text-center relative"
            >
              <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-6 glow-indigo-sm">
                <span className="text-white font-bold text-lg">{p.n}</span>
              </div>
              <h3 className="font-semibold text-slate-900 text-lg mb-3">{p.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
