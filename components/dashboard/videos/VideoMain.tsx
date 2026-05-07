'use client'

import { useState, useEffect } from 'react'
import { DidVideo } from '@/lib/supabase'
import { AnimatedVideoCreator } from './AnimatedVideoCreator'

const TOPICS = [
  { key: 'historia',  label: 'Historia de éxito',        desc: 'Un caso real de alguien que mejoró con IA' },
  { key: 'error',     label: 'El mayor error con ChatGPT', desc: 'Por qué la mayoría lo usa mal' },
  { key: 'ahorro',    label: 'Ahorra 2h al día',          desc: 'Tres formas concretas de recuperar tiempo' },
  { key: 'aprender',  label: 'Por qué aprender IA ahora', desc: 'La inversión de tiempo más rentable' },
  { key: 'negocio',   label: 'Negocio con IA',            desc: 'Montar un servicio sin conocimientos técnicos' },
  { key: 'futuro',    label: 'El futuro del trabajo',     desc: 'IA como ventaja, no como amenaza' },
]

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    processing: { label: 'Procesando', color: '#6366F1', bg: 'rgba(99,102,241,.1)' },
    done:       { label: 'Listo',      color: '#10B981', bg: 'rgba(16,185,129,.1)' },
    error:      { label: 'Error',      color: '#EF4444', bg: 'rgba(239,68,68,.1)'  },
    pending:    { label: 'Pendiente',  color: '#64748B', bg: 'rgba(100,116,139,.1)' },
  }
  const s = map[status] ?? map.pending
  return (
    <span style={{ fontSize: 11, fontWeight: 700, color: s.color, background: s.bg, padding: '4px 10px', borderRadius: 100, flexShrink: 0 }}>
      {s.label}
    </span>
  )
}

function Spinner() {
  return (
    <span style={{
      display: 'inline-block',
      width: 14, height: 14,
      border: '2px solid #6366F1',
      borderTopColor: 'transparent',
      borderRadius: '50%',
      animation: 'spin .8s linear infinite',
      flexShrink: 0,
    }} />
  )
}

function VideoCard({ video: initial, onDelete }: { video: DidVideo; onDelete: (id: string) => void }) {
  const [video, setVideo] = useState(initial)
  const [showScript, setShowScript] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Poll every 5 s while processing
  useEffect(() => {
    if (video.status !== 'processing' && video.status !== 'pending') return
    const iv = setInterval(async () => {
      const res = await fetch(`/api/video/status/${video.id}`)
      if (!res.ok) return
      const { video: updated } = await res.json()
      setVideo(updated)
      if (updated.status === 'done' || updated.status === 'error') clearInterval(iv)
    }, 5000)
    return () => clearInterval(iv)
  }, [video.id, video.status])

  const handleDelete = async () => {
    if (!confirm('¿Eliminar este vídeo?')) return
    setDeleting(true)
    await fetch(`/api/video/status/${video.id}`, { method: 'DELETE' }).catch(() => {})
    onDelete(video.id)
  }

  const date = new Date(video.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12, flexShrink: 0,
          background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
        }}>🎭</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '.95rem', marginBottom: 2 }}>{video.topic}</div>
          <div style={{ fontSize: '.73rem', color: '#94A3B8' }}>{date}</div>
        </div>

        <StatusPill status={video.status} />

        <button
          onClick={handleDelete}
          disabled={deleting}
          style={{ fontSize: 12, color: '#EF4444', background: 'rgba(239,68,68,.07)', border: 'none', borderRadius: 8, padding: '7px 12px', cursor: 'pointer', flexShrink: 0 }}
        >
          {deleting ? '...' : 'Eliminar'}
        </button>
      </div>

      {/* Processing state */}
      {(video.status === 'processing' || video.status === 'pending') && (
        <div style={{ padding: '0 20px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Spinner />
          <span style={{ fontSize: '.8rem', color: '#6366F1', fontWeight: 600 }}>D-ID está generando el vídeo... puede tardar 1-2 minutos.</span>
        </div>
      )}

      {/* Error state */}
      {video.status === 'error' && (
        <div style={{ padding: '0 20px 16px', fontSize: '.8rem', color: '#EF4444', fontWeight: 600 }}>
          Error al generar el vídeo. Prueba de nuevo.
        </div>
      )}

      {/* Done — video player + download */}
      {video.status === 'done' && video.result_url && (
        <div style={{ padding: '0 20px 16px' }}>
          <video
            controls
            src={video.result_url}
            style={{ width: '100%', borderRadius: 10, maxHeight: 320, background: '#000', display: 'block' }}
          />
          <a
            href={video.result_url}
            download
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              marginTop: 10, padding: '10px 0',
              background: '#0F172A', color: '#fff',
              borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none',
            }}
          >
            ⬇ Descargar MP4
          </a>
        </div>
      )}

      {/* Script toggle */}
      <div style={{ borderTop: '1px solid #F1F5F9', padding: '10px 20px' }}>
        <button
          onClick={() => setShowScript(s => !s)}
          style={{ fontSize: 12, color: '#64748B', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}
        >
          {showScript ? '▲ Ocultar guión' : '▼ Ver guión'}
        </button>
        {showScript && (
          <p style={{ margin: '10px 0 0', fontSize: 13, color: '#475569', lineHeight: 1.65 }}>
            {video.script}
          </p>
        )}
      </div>
    </div>
  )
}

function GenerateModal({ onClose, onCreated }: { onClose: () => void; onCreated: (v: DidVideo) => void }) {
  const [selectedKey, setSelectedKey] = useState<string>('historia')
  const [customTopic, setCustomTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isCustom = selectedKey === 'custom'

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isCustom ? { customTopic } : { topicKey: selectedKey }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al generar')
      onCreated(data.video as DidVideo)
      onClose()
    } catch (e) {
      setError(String(e))
    }
    setLoading(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 520, overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,.2)' }}>
        {/* Header */}
        <div style={{ padding: '22px 24px 18px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A', fontFamily: "'Syne', sans-serif" }}>Nuevo vídeo IA</div>
            <div style={{ fontSize: '.78rem', color: '#94A3B8', marginTop: 2 }}>Claude genera el guión · D-ID crea el avatar</div>
          </div>
          <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontSize: 14, color: '#64748B' }}>✕</button>
        </div>

        {/* Topic grid */}
        <div style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: '.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12 }}>Elige el tema</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {TOPICS.map(t => (
              <button
                key={t.key}
                onClick={() => setSelectedKey(t.key)}
                style={{
                  textAlign: 'left', padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                  border: selectedKey === t.key ? '2px solid #6366F1' : '1.5px solid #E2E8F0',
                  background: selectedKey === t.key ? 'rgba(99,102,241,.05)' : '#fff',
                  transition: 'all .15s',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '.82rem', color: selectedKey === t.key ? '#6366F1' : '#0F172A' }}>{t.label}</div>
                <div style={{ fontSize: '.72rem', color: '#94A3B8', marginTop: 3 }}>{t.desc}</div>
              </button>
            ))}
            {/* Custom option */}
            <button
              onClick={() => setSelectedKey('custom')}
              style={{
                textAlign: 'left', padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                border: isCustom ? '2px solid #6366F1' : '1.5px solid #E2E8F0',
                background: isCustom ? 'rgba(99,102,241,.05)' : '#fff',
                gridColumn: '1 / -1', transition: 'all .15s',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '.82rem', color: isCustom ? '#6366F1' : '#0F172A' }}>✏️ Tema personalizado</div>
              <div style={{ fontSize: '.72rem', color: '#94A3B8', marginTop: 3 }}>Describe el tema que quieras</div>
            </button>
          </div>

          {isCustom && (
            <textarea
              value={customTopic}
              onChange={e => setCustomTopic(e.target.value)}
              placeholder="Ej: Cómo uso IA para organizar mi negocio de fotografía..."
              rows={3}
              style={{
                width: '100%', marginTop: 10, padding: '10px 12px', borderRadius: 10,
                border: '1.5px solid #E2E8F0', fontSize: 13, color: '#0F172A',
                fontFamily: 'inherit', resize: 'none', outline: 'none', boxSizing: 'border-box',
              }}
            />
          )}

          {error && (
            <div style={{ marginTop: 12, fontSize: 12, color: '#EF4444', fontWeight: 600 }}>{error}</div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '0 24px 22px', display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: '1.5px solid #E2E8F0', background: '#fff', fontSize: 14, fontWeight: 600, color: '#64748B', cursor: 'pointer' }}
          >
            Cancelar
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading || (isCustom && !customTopic.trim())}
            style={{
              flex: 2, padding: '11px 0', borderRadius: 10, border: 'none',
              background: loading ? '#94A3B8' : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              color: '#fff', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {loading ? <><Spinner /> Generando guión...</> : '🎭 Generar vídeo IA'}
          </button>
        </div>
      </div>
    </div>
  )
}

type Props = { initialVideos: DidVideo[] }

export function VideoMain({ initialVideos }: Props) {
  const [videos, setVideos]           = useState<DidVideo[]>(initialVideos)
  const [showDIDModal, setShowDIDModal]   = useState(false)
  const [showAnimModal, setShowAnimModal] = useState(false)

  const handleCreated = (v: DidVideo) => setVideos(prev => [v, ...prev])
  const handleDelete  = (id: string)  => setVideos(prev => prev.filter(v => v.id !== id))

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      {/* Topbar */}
      <header style={{ flexShrink: 0, background: '#fff', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', height: 60 }}>
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>Vídeos IA</div>
          <div style={{ fontSize: '.8rem', color: '#64748B' }}>Vídeo animado con emojis · voz IA</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setShowAnimModal(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              color: '#fff', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13,
              padding: '9px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
            }}
          >
            🎬 Vídeo animado
          </button>
          <button
            onClick={() => setShowDIDModal(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#F1F5F9', border: '1px solid #E2E8F0',
              color: '#64748B', fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 13,
              padding: '9px 16px', borderRadius: 10, cursor: 'pointer',
            }}
          >
            🎭 Avatar D-ID
          </button>
        </div>
      </header>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
        {videos.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', padding: '80px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🎭</div>
            <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#64748B', marginBottom: 6 }}>Sin vídeos todavía</p>
            <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 20 }}>Genera tu primer vídeo con avatar IA</p>
            <button
              onClick={() => setShowAnimModal(true)}
              style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
            >
              🎬 Generar primer vídeo animado
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 700 }}>
            {videos.map(v => <VideoCard key={v.id} video={v} onDelete={handleDelete} />)}
          </div>
        )}
      </div>

      {showDIDModal  && <GenerateModal onClose={() => setShowDIDModal(false)} onCreated={handleCreated} />}
      {showAnimModal && <AnimatedVideoCreator onClose={() => setShowAnimModal(false)} />}
    </>
  )
}
