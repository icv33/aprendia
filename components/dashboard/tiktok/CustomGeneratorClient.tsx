'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TikTokSlide } from '@/lib/supabase'
import { SCHEDULE_SLOTS } from '@/lib/tiktok'

function buildRenderUrl(slide: TikTokSlide, dl = false, bgUrl?: string): string {
  const p = new URLSearchParams({ type: 'personalizado' })
  if (dl) p.set('dl', '1')
  if (bgUrl) p.set('bg', bgUrl)
  if (slide.type === 'cover') {
    p.set('slideType', 'cover')
    p.set('titulo', slide.titulo)
    if (slide.subtitulo) p.set('subtitulo', slide.subtitulo)
  } else if (slide.type === 'content') {
    p.set('slideType', 'content')
    p.set('titulo', slide.titulo)
    p.set('contenido', slide.contenido)
    p.set('num', String(slide.num))
  } else {
    p.set('slideType', 'cta')
    p.set('cta', slide.cta)
  }
  return `/api/tiktok/render?${p.toString()}`
}

const EXAMPLES = [
  'Publicidad de mi curso de IA para principiantes. Resalta que es gratis y que en 7 días aprenderás a usar ChatGPT',
  'Cómo uso la IA para crear contenido para redes sociales en 30 minutos al día',
  'Por qué deberías empezar a usar IA en tu negocio ahora mismo antes de que lo haga tu competencia',
]

export function CustomGeneratorClient() {
  const router = useRouter()
  const [prompt, setPrompt]       = useState('')
  const [slides, setSlides]       = useState<TikTokSlide[] | null>(null)
  const [status, setStatus]       = useState<'idle' | 'generating' | 'ready' | 'saving' | 'saved'>('idle')
  const [scheduleTime, setScheduleTime] = useState<string | null>(null)
  const [error, setError]         = useState('')
  const [activeSlide, setActiveSlide] = useState(0)

  const generate = async () => {
    if (!prompt.trim()) return
    setStatus('generating')
    setSlides(null)
    setError('')
    setActiveSlide(0)
    try {
      const res = await fetch('/api/tiktok/generate-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error al generar'); setStatus('idle'); return }
      setSlides(data.slides)
      setStatus('ready')
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.')
      setStatus('idle')
    }
  }

  const approve = async () => {
    if (!slides) return
    setStatus('saving')
    setError('')

    let scheduled_at: string | null = null
    if (scheduleTime) {
      const today = new Date()
      const [hours, minutes] = scheduleTime.split(':').map(Number)
      today.setHours(hours, minutes, 0, 0)
      scheduled_at = today.toISOString()
    }

    try {
      const res = await fetch('/api/tiktok/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'personalizado', slides, scheduled_at }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error al guardar'); setStatus('ready'); return }
      setStatus('saved')
      setTimeout(() => router.push('/dashboard/tiktok'), 1200)
    } catch {
      setError('Error de conexión.')
      setStatus('ready')
    }
  }

  const bgUrl = slides?.[0]?.type === 'cover' ? slides[0].background_url : undefined

  return (
    <>
      <header style={{ height: 60, flexShrink: 0, background: '#fff', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="/dashboard/tiktok" style={{ fontSize: 13, color: '#94A3B8', textDecoration: 'none', fontWeight: 500 }}>← TikTok</a>
          <span style={{ color: '#E2E8F0' }}>|</span>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>Post personalizado</div>
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#EC4899', background: 'rgba(236,72,153,.1)', padding: '4px 12px', borderRadius: 100 }}>✏️ Personalizado</span>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '28px', display: 'flex', gap: 28 }}>

        {/* Left */}
        <div style={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Step 1: prompt */}
          <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 20 }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '.88rem', color: '#0F172A', marginBottom: 6 }}>
              1 · Describe el post
            </div>
            <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 12 }}>
              Cuéntale a Claude de qué va el post, el tono, el objetivo, si es publicidad, etc.
            </p>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Ej: Quiero hacer publicidad de mi curso de IA gratuito. El objetivo es que la gente se apunte..."
              rows={6}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 10,
                border: '1.5px solid #E2E8F0', fontSize: 13, color: '#0F172A',
                resize: 'vertical', outline: 'none', fontFamily: 'inherit',
                boxSizing: 'border-box', lineHeight: 1.5,
              }}
              onFocus={e => e.currentTarget.style.borderColor = '#EC4899'}
              onBlur={e => e.currentTarget.style.borderColor = '#E2E8F0'}
            />
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 6, fontWeight: 600 }}>Ejemplos:</div>
              {EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(ex)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '6px 10px', borderRadius: 7, border: '1px solid #F1F5F9',
                    background: '#F8FAFC', fontSize: 11, color: '#64748B',
                    cursor: 'pointer', marginBottom: 4, lineHeight: 1.4,
                  }}
                >
                  {ex.slice(0, 60)}…
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: generate */}
          <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 20 }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '.88rem', color: '#0F172A', marginBottom: 14 }}>
              2 · Generar
            </div>
            <button
              onClick={generate}
              disabled={!prompt.trim() || status === 'generating' || status === 'saving' || status === 'saved'}
              style={{
                width: '100%', padding: '12px', borderRadius: 10, border: 'none',
                background: !prompt.trim() ? '#F1F5F9' : '#EC4899',
                color: !prompt.trim() ? '#94A3B8' : '#fff',
                fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14,
                cursor: !prompt.trim() ? 'not-allowed' : 'pointer', transition: 'all .15s',
              }}
            >
              {status === 'generating' ? '⏳ Generando...' : slides ? '🔄 Regenerar' : '✨ Generar slides'}
            </button>
            {error && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 8 }}>{error}</p>}
          </div>

          {/* Step 3: schedule */}
          {(status === 'ready' || status === 'saving' || status === 'saved') && (
            <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 20 }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '.88rem', color: '#0F172A', marginBottom: 14 }}>
                3 · Guardar post
              </div>

              <button
                onClick={() => setScheduleTime(null)}
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: 8, border: 'none',
                  background: scheduleTime === null ? '#0F172A' : '#F8FAFC',
                  color: scheduleTime === null ? '#fff' : '#64748B',
                  fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13,
                  cursor: 'pointer', transition: 'all .15s', marginBottom: 10,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                <span style={{ fontSize: 15 }}>📥</span>
                Solo en cola <span style={{ fontWeight: 400, opacity: .7 }}>(subo yo manualmente)</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
                <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>O programar para hoy a las</span>
                <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                {SCHEDULE_SLOTS.map(slot => (
                  <button
                    key={slot}
                    onClick={() => setScheduleTime(slot)}
                    style={{
                      padding: '10px', borderRadius: 8, border: 'none',
                      background: scheduleTime === slot ? '#0F172A' : '#F8FAFC',
                      color: scheduleTime === slot ? '#fff' : '#64748B',
                      fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15,
                      cursor: 'pointer', transition: 'all .15s',
                    }}
                  >
                    {slot}
                  </button>
                ))}
              </div>

              {status === 'saved' ? (
                <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(0,255,178,.1)', borderRadius: 10, color: '#007A40', fontWeight: 700, fontSize: 13 }}>
                  ✓ Post guardado en la cola
                </div>
              ) : (
                <button
                  onClick={approve}
                  disabled={status === 'saving'}
                  style={{ width: '100%', padding: '12px', borderRadius: 10, border: 'none', background: '#0F172A', color: '#fff', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
                >
                  {status === 'saving' ? 'Guardando...' : scheduleTime ? `✓ Programar para las ${scheduleTime} →` : '✓ Añadir a la cola →'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right — preview */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {status === 'generating' && (
            <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: '60px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>✨</div>
              <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>Claude está creando tu post...</p>
              <p style={{ fontSize: 13, color: '#94A3B8' }}>Esto tarda unos segundos</p>
            </div>
          )}

          {slides && status !== 'generating' && (() => {
            const activeUrl = buildRenderUrl(slides[activeSlide], false, bgUrl)
            const activeDownloadUrl = buildRenderUrl(slides[activeSlide], true, bgUrl)
            const slideLabel = slides[activeSlide].type === 'cover' ? 'portada' : slides[activeSlide].type === 'cta' ? 'cta' : `slide-${(slides[activeSlide] as Extract<TikTokSlide, { type: 'content' }>).num}`

            return (
              <>
                <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '.88rem', color: '#0F172A' }}>
                      Vista previa — slide {activeSlide + 1} de {slides.length}
                    </div>
                    <a
                      href={activeDownloadUrl}
                      download={`aprendia-${slideLabel}.png`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 8, textDecoration: 'none', background: '#F1F5F9', color: '#64748B', fontSize: 12, fontWeight: 600 }}
                    >
                      ↓ PNG
                    </a>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <img
                      key={activeUrl}
                      src={activeUrl}
                      alt="slide preview"
                      style={{ width: 360, height: 360, borderRadius: 12, border: '1px solid #E2E8F0', objectFit: 'cover' }}
                    />
                  </div>
                </div>

                <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 12 }}>Todas las slides</div>
                  <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
                    {slides.map((slide, i) => (
                      <div
                        key={i}
                        onClick={() => setActiveSlide(i)}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: 'pointer', flexShrink: 0 }}
                      >
                        <img
                          src={buildRenderUrl(slide, false, bgUrl)}
                          alt={`slide ${i + 1}`}
                          style={{ width: 88, height: 88, borderRadius: 8, objectFit: 'cover', border: activeSlide === i ? '2.5px solid #EC4899' : '1.5px solid #E2E8F0', transition: 'border .15s' }}
                        />
                        <span style={{ fontSize: 10, color: activeSlide === i ? '#EC4899' : '#94A3B8', fontWeight: 600 }}>
                          {slide.type === 'cover' ? 'COVER' : slide.type === 'cta' ? 'CTA' : `#${slide.num}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )
          })()}

          {!slides && status === 'idle' && (
            <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: '80px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>✏️</div>
              <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#64748B', marginBottom: 6 }}>Describe tu post</p>
              <p style={{ fontSize: 13, color: '#94A3B8' }}>Claude creará las slides siguiendo tus instrucciones</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
