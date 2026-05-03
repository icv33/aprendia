'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Ebook } from '@/lib/supabase'
import { Plus, CheckCircle, XCircle, Globe, Trash2, Loader2, BookOpen, FileText } from 'lucide-react'

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  pending:  { label: 'Pendiente',  cls: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Aprobado',   cls: 'bg-blue-100 text-blue-700' },
  published:{ label: 'Publicado',  cls: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Rechazado',  cls: 'bg-red-100 text-red-700' },
}

export function EbooksClient({ ebooks }: { ebooks: Ebook[] }) {
  const router = useRouter()
  const [showGen, setShowGen] = useState(false)
  const [topic, setTopic] = useState('')
  const [audience, setAudience] = useState('')
  const [price, setPrice] = useState('9.99')
  const [generating, setGenerating] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)

  const generate = async () => {
    if (!topic.trim() || !audience.trim()) return
    setGenerating(true)
    await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, audience, price }),
    })
    setGenerating(false)
    setShowGen(false)
    setTopic('')
    setAudience('')
    router.refresh()
  }

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id)
    await fetch(`/api/ebooks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setUpdating(null)
    router.refresh()
  }

  const deleteEbook = async (id: string) => {
    if (!confirm('¿Seguro que quieres eliminar este ebook?')) return
    setUpdating(id)
    await fetch(`/api/ebooks/${id}`, { method: 'DELETE' })
    setUpdating(null)
    router.refresh()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ebooks</h1>
          <p className="text-slate-500 text-sm mt-1">Gestiona y genera tus guías digitales</p>
        </div>
        <button
          onClick={() => setShowGen(true)}
          className="gradient-bg text-white font-semibold px-4 py-2 rounded-xl text-sm flex items-center gap-2 hover:opacity-90 transition-all"
        >
          <Plus size={16} />
          Generar con IA
        </button>
      </div>

      {/* Generator modal */}
      {showGen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="font-bold text-slate-900 text-lg mb-4">Generar ebook con IA</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Tema del ebook</label>
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="ej: Automatizar tareas con ChatGPT"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Audiencia objetivo</label>
                <input
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="ej: Freelancers que quieren ahorrar tiempo"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Precio (€)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="1"
                  step="0.01"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowGen(false)}
                className="flex-1 border border-slate-200 text-slate-700 font-medium py-2.5 rounded-xl text-sm hover:bg-slate-50 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={generate}
                disabled={generating || !topic.trim() || !audience.trim()}
                className="flex-1 gradient-bg text-white font-semibold py-2.5 rounded-xl text-sm hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {generating ? <><Loader2 size={14} className="animate-spin" /> Generando...</> : 'Generar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ebooks list */}
      {ebooks.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <BookOpen size={40} className="mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500 font-medium">No hay ebooks todavía</p>
          <p className="text-slate-400 text-sm mt-1">Genera tu primer ebook con IA</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ebooks.map((eb) => {
            const st = STATUS_LABELS[eb.status] ?? STATUS_LABELS.pending
            const isUpdating = updating === eb.id

            return (
              <div key={eb.id} className="bg-white rounded-2xl border border-slate-100 p-5 flex items-start gap-4">
                <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center shrink-0">
                  <FileText size={16} className="text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-slate-900 truncate">{eb.title}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${st.cls}`}>
                      {st.label}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5 truncate">{eb.tagline}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {eb.price}€ · {new Date(eb.created_at).toLocaleDateString('es-ES')}
                    {eb.status === 'published' && (
                      <a href={`/productos/${eb.slug}`} target="_blank" className="text-indigo-500 ml-2 hover:underline">
                        Ver landing →
                      </a>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isUpdating ? (
                    <Loader2 size={16} className="animate-spin text-slate-400" />
                  ) : (
                    <>
                      {eb.status === 'pending' && (
                        <>
                          <button onClick={() => updateStatus(eb.id, 'published')} title="Aprobar y publicar"
                            className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors">
                            <CheckCircle size={16} />
                          </button>
                          <button onClick={() => updateStatus(eb.id, 'rejected')} title="Rechazar"
                            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                      {eb.status === 'approved' && (
                        <button onClick={() => updateStatus(eb.id, 'published')} title="Publicar"
                          className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors">
                          <Globe size={16} />
                        </button>
                      )}
                      {eb.status === 'rejected' && (
                        <button onClick={() => updateStatus(eb.id, 'pending')} title="Volver a pendiente"
                          className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors">
                          <CheckCircle size={16} />
                        </button>
                      )}
                      <button onClick={() => deleteEbook(eb.id)} title="Eliminar"
                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
