'use client'

import { motion } from 'framer-motion'
import { Clock, TrendingDown, Brain } from 'lucide-react'

const problems = [
  {
    icon: Clock,
    title: 'Pierdes horas en tareas repetitivas',
    desc: 'Respondes los mismos emails, buscas la misma información, repites los mismos procesos... cada día.',
    color: 'text-red-500',
    bg: 'bg-red-50',
  },
  {
    icon: Brain,
    title: 'La IA te intimida o no sabes por dónde empezar',
    desc: 'Has oído que la IA puede cambiarlo todo, pero entre tutoriales en inglés y términos técnicos, lo dejas para mañana.',
    color: 'text-orange-500',
    bg: 'bg-orange-50',
  },
  {
    icon: TrendingDown,
    title: 'Ves cómo otros generan ingresos y tú no',
    desc: 'Gente sin conocimientos técnicos monetizando con IA mientras tú sigues igual que hace un año.',
    color: 'text-violet-500',
    bg: 'bg-violet-50',
  },
]

export function Problema({ problem }: { problem: string }) {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-red-500 uppercase tracking-wider">¿Te suena familiar?</span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3 mb-4">El problema es real</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">{problem}</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {problems.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`w-10 h-10 ${p.bg} rounded-xl flex items-center justify-center mb-4`}>
                <p.icon size={20} className={p.color} />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{p.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
