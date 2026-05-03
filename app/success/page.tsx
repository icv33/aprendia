import Link from 'next/link'
import { CheckCircle2, Mail } from 'lucide-react'

export const metadata = { title: 'Compra completada | AprendIA' }

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={32} className="text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">¡Compra completada! 🎉</h1>
        <p className="text-slate-600 mb-6">
          Tu guía está en camino. Revisa tu email (incluyendo la carpeta de spam) en los próximos minutos.
        </p>
        <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3 mb-8 text-left">
          <Mail size={18} className="text-indigo-500 shrink-0" />
          <p className="text-sm text-slate-600">
            Te hemos enviado un email con el enlace de descarga de tu PDF.
            El enlace es válido durante 48 horas.
          </p>
        </div>
        <Link href="/productos" className="text-sm text-indigo-600 hover:underline">
          ← Ver más guías
        </Link>
      </div>
    </div>
  )
}
