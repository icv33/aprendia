'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-black/5' : 'bg-transparent'
    }`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="font-semibold text-[#0F172A] text-lg">
            Aprend<span className="gradient-text font-bold">IA</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#beneficios" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Beneficios</a>
          <a href="#que-incluye" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Contenido</a>
          <a href="#precio" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Precio</a>
          <a href="#faq" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">FAQ</a>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <a
            href="#precio"
            className="gradient-bg text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:opacity-90 transition-all glow-indigo-sm"
          >
            Quiero la guía →
          </a>
        </div>

        <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-white border-b border-black/5 px-6 pb-4"
          >
            <nav className="flex flex-col gap-4 pt-2">
              <a href="#beneficios" className="text-sm text-slate-600" onClick={() => setOpen(false)}>Beneficios</a>
              <a href="#que-incluye" className="text-sm text-slate-600" onClick={() => setOpen(false)}>Contenido</a>
              <a href="#precio" className="text-sm text-slate-600" onClick={() => setOpen(false)}>Precio</a>
              <a href="#faq" className="text-sm text-slate-600" onClick={() => setOpen(false)}>FAQ</a>
              <a href="#precio" className="gradient-bg text-white text-sm font-semibold px-5 py-2.5 rounded-lg text-center" onClick={() => setOpen(false)}>
                Quiero la guía →
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
