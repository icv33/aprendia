'use client'

import { motion } from 'framer-motion'
import { Zap, DollarSign, Clock, Smile, Shield, Rocket } from 'lucide-react'

const beneficios = [
  { icon: Clock, title: 'Ahorra 2h/día', desc: 'Automatiza las tareas que más tiempo te roban con herramientas de IA simples.', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { icon: DollarSign, title: 'Genera ingresos reales', desc: 'Aprende los modelos de negocio digitales que funcionan hoy con IA.', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { icon: Zap, title: 'Resultados desde el día 1', desc: 'Cada módulo incluye ejercicios que puedes aplicar inmediatamente.', color: 'text-amber-600', bg: 'bg-amber-50' },
  { icon: Smile, title: 'Sin conocimientos técnicos', desc: 'Diseñado para personas que nunca han programado ni usado IA.', color: 'text-violet-600', bg: 'bg-violet-50' },
  { icon: Shield, title: 'Sin herramientas de pago', desc: 'Todo lo que enseñamos tiene versión gratuita accesible para todos.', color: 'text-rose-600', bg: 'bg-rose-50' },
  { icon: Rocket, title: 'Escala cuando quieras', desc: 'Una vez dominas lo básico, los sistemas que aprendes escalan solos.', color: 'text-cyan-600', bg: 'bg-cyan-50' },
]

export function Beneficios() {
  return (
    <section id="beneficios" className="py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Beneficios</span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3 mb-4">
            Qué consigues con esta guía
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            No es teoría. Es un sistema probado para que empieces a ver resultados esta semana.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {beneficios.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.5 }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all"
            >
              <div className={`w-11 h-11 ${b.bg} rounded-xl flex items-center justify-center mb-4`}>
                <b.icon size={22} className={b.color} />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{b.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
