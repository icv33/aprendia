'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Ebook } from '@/lib/supabase'
import { Plus, CheckCircle, XCircle, Trash2, Loader2, BookOpen, FileText, Sparkles } from 'lucide-react'

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: 'Pendiente',  color: '#D97706', bg: 'rgba(245,158,11,.1)' },
  approved:  { label: 'Aprobado',   color: '#3B82F6', bg: 'rgba(59,130,246,.1)' },
  published: { label: 'Publicado',  color: '#007A40', bg: 'rgba(0,255,178,.12)' },
  rejected:  { label: 'Rechazado',  color: '#EF4444', bg: 'rgba(239,68,68,.1)' },
}

export function EbooksClient({ ebooks }: { ebooks: Ebook[] }) {
  const router = useRouter()
  const [showGen, setShowGen] = useState(false)
  const [topic, setTopic] = useState('')
  const [audience, setAudience] = useState('')
  const [generating, setGenerating] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)

  const generate = async () => {
    if (!topic.trim() || !audience.trim()) return
    setGenerating(true)
    await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, audience, price: 27 }),
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
    if (!confirm('¿Eliminar este contenido?')) return
    setUpdating(id)
    await fetch(`/api/ebooks/${id}`, { method: 'DELETE' })
    setUpdating(null)
    router.refresh()
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0 }}>Contenido</h1>
          <p style={{ color: '#64748B', fontSize: 14, marginTop: 4 }}>Genera y gestiona el PDF del eBook con IA</p>
        </div>
        <button
          onClick={() => setShowGen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#00FFB2', color: '#0F172A', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, padding: '10px 18px', borderRadius: 12, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all .2s' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#00CC8F')}
          onMouseLeave={e => (e.currentTarget.style.background = '#00FFB2')}
        >
          <Sparkles size={15} />
          Generar con IA
        </button>
      </div>

      {/* Info box */}
      <div style={{ background: 'rgba(0,255,178,.06)', border: '1px solid rgba(0,255,178,.2)', borderRadius: 12, padding: '14px 18px', marginBottom: 24, fontSize: 13, color: '#047857', lineHeight: 1.6 }}>
        <strong>¿Cómo funciona?</strong> La IA genera el contenido del eBook (estructura, módulos, prompts, FAQs). Tú lo revisas, lo apruebas y subes el PDF a Supabase. Los 3 packs (Esencial, Completo, Pro) usan el mismo PDF base.
      </div>

      {/* Modal generar */}
      {showGen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.5)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 28, width: '100%', maxWidth: 440, boxShadow: '0 24px 60px rgba(15,23,42,.15)' }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>Generar contenido con IA</h2>
            <p style={{ fontSize: 13, color: '#64748B', marginBottom: 24 }}>Claude generará la estructura completa del eBook</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Tema del eBook</label>
                <input
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="ej: Automatizar tareas con ChatGPT en 2025"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => (e.target.style.borderColor = '#00FFB2')}
                  onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Audiencia objetivo</label>
                <input
                  value={audience}
                  onChange={e => setAudience(e.target.value)}
                  placeholder="ej: Freelancers y emprendedores sin conocimientos técnicos"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => (e.target.style.borderColor = '#00FFB2')}
                  onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button
                onClick={() => setShowGen(false)}
                style={{ flex: 1, border: '1px solid #E2E8F0', background: '#fff', color: '#374151', fontWeight: 600, padding: '11px', borderRadius: 12, fontSize: 13, cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                onClick={generate}
                disabled={generating || !topic.trim() || !audience.trim()}
                style={{ flex: 1, background: generating ? '#94A3B8' : '#00FFB2', color: '#0F172A', fontFamily: "'Syne', sans-serif", fontWeight: 700, padding: '11px', borderRadius: 12, fontSize: 13, border: 'none', cursor: generating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {generating ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Generando...</> : '✨ Generar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista */}
      {ebooks.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', padding: '80px 20px', textAlign: 'center' }}>
          <BookOpen size={36} color="#CBD5E1" style={{ margin: '0 auto 14px' }} />
          <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#64748B', marginBottom: 6 }}>Sin contenido todavía</p>
          <p style={{ fontSize: 13, color: '#94A3B8' }}>Genera tu primer eBook con IA</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ebooks.map((eb) => {
            const st = STATUS[eb.status] ?? STATUS.pending
            const isUpdating = updating === eb.id

            return (
              <div key={eb.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(0,255,178,.12)', border: '1px solid rgba(0,255,178,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FileText size={16} color="#007A40" />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, color: '#0F172A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{eb.title}</h3>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 100, background: st.bg, color: st.color, whiteSpace: 'nowrap' }}>
                      {st.label}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {eb.tagline} · {new Date(eb.created_at).toLocaleDateString('es-ES')}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  {isUpdating ? (
                    <Loader2 size={16} color="#94A3B8" style={{ animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <>
                      {eb.status === 'pending' && (
                        <>
                          <button onClick={() => updateStatus(eb.id, 'published')} title="Aprobar y publicar"
                            style={{ padding: 6, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#94A3B8', transition: 'all .15s' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,255,178,.1)'; (e.currentTarget as HTMLButtonElement).style.color = '#007A40' }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#94A3B8' }}
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button onClick={() => updateStatus(eb.id, 'rejected')} title="Rechazar"
                            style={{ padding: 6, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#94A3B8', transition: 'all .15s' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,.08)'; (e.currentTarget as HTMLButtonElement).style.color = '#EF4444' }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#94A3B8' }}
                          >
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                      {(eb.status === 'approved' || eb.status === 'rejected') && (
                        <button onClick={() => updateStatus(eb.id, 'published')} title="Publicar"
                          style={{ padding: 6, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#94A3B8', transition: 'all .15s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,255,178,.1)'; (e.currentTarget as HTMLButtonElement).style.color = '#007A40' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#94A3B8' }}
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      <button onClick={() => deleteEbook(eb.id)} title="Eliminar"
                        style={{ padding: 6, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#94A3B8', transition: 'all .15s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,.08)'; (e.currentTarget as HTMLButtonElement).style.color = '#EF4444' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#94A3B8' }}
                      >
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

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
