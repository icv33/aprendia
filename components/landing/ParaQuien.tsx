'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, XCircle } from 'lucide-react'

const siEsPara = [
  'Quieres ahorrar tiempo en tu trabajo o negocio',
  'Eres curioso/a sobre la IA pero no sabes cómo usarla',
  'Buscas formas de generar ingresos desde casa',
  'Eres freelance, emprendedor/a o trabajas por cuenta propia',
  'Tienes entre 16 y 45 años y quieres estar al día',
]

const noEsPara = [
  'Buscas un sistema 100% automático sin esfuerzo',
  'Esperas hacerte millonario de la noche a la mañana',
  'Ya eres experto/a en IA y programación',
  'No estás dispuesto/a a dedicar 1-2 horas de tu semana',
]

export function ParaQuien() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">¿Es para ti?</h2>
          <p className="text-lg text-slate-600">Sé honesto/a contigo mismo/a antes de comprar.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-emerald-50 border border-emerald-100 rounded-2xl p-8"
          >
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle2 size={20} className="text-emerald-600" />
              <h3 className="font-bold text-emerald-800 text-lg">SÍ es para ti si...</h3>
            </div>
            <ul className="space-y-3">
              {siEsPara.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-emerald-900">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-slate-50 border border-slate-200 rounded-2xl p-8"
          >
            <div className="flex items-center gap-2 mb-6">
              <XCircle size={20} className="text-slate-400" />
              <h3 className="font-bold text-slate-700 text-lg">NO es para ti si...</h3>
            </div>
            <ul className="space-y-3">
              {noEsPara.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <XCircle size={16} className="text-slate-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-500">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
