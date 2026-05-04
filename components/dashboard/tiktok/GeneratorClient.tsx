'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TikTokSlide, TikTokPostType } from '@/lib/supabase'
import { TYPE_META, SCHEDULE_SLOTS } from '@/lib/tiktok'

function buildRenderUrl(slide: TikTokSlide, type: TikTokPostType, dl = false, bgUrl?: string): string {
  const p = new URLSearchParams({ type })
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

export function GeneratorClient() {
  const router = useRouter()
  const [postType, setPostType] = useState<TikTokPostType | null>(null)
  const [slides, setSlides] = useState<TikTokSlide[] | null>(null)
  const [status, setStatus] = useState<'idle' | 'generating' | 'ready' | 'saving' | 'saved'>('idle')
  const [scheduleTime, setScheduleTime] = useState<string>(SCHEDULE_SLOTS[0])
  const [error, setError] = useState('')
  const [activeSlide, setActiveSlide] = useState(0)
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null)
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const generate = async () => {
    if (!postType) return
    setStatus('generating')
    setSlides(null)
    setError('')
    setActiveSlide(0)
    setFeedback(null)
    setFeedbackSent(false)
    try {
      const res = await fetch('/api/tiktok/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: postType }),
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

  const downloadAll = async () => {
    if (!slides || !postType || downloading) return
    setDownloading(true)
    try {
      const bgUrl = slides[0]?.type === 'cover' ? (slides[0] as Extract<TikTokSlide, { type: 'cover' }>).background_url : undefined
      const res = await fetch('/api/tiktok/zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slides, type: postType, bgUrl }),
      })
      if (!res.ok) return
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'aprendia-slides.zip'
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  const sendFeedback = async (rating: 'like' | 'dislike') => {
    if (!slides || !postType || feedbackSent) return
    setFeedback(rating)
    setFeedbackSent(true)
    await fetch('/api/tiktok/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: postType, slides, rating }),
    })
  }

  const approve = async () => {
    if (!slides || !postType) return
    setStatus('saving')
    setError('')

    const today = new Date()
    const [hours, minutes] = scheduleTime.split(':').map(Number)
    today.setHours(hours, minutes, 0, 0)

    try {
      const res = await fetch('/api/tiktok/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: postType, slides, scheduled_at: today.toISOString() }),
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

  const meta = postType ? TYPE_META[postType] : null

  return (
    <>
      {/* Topbar */}
      <header style={{ height: 60, flexShrink: 0, background: '#fff', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="/dashboard/tiktok" style={{ fontSize: 13, color: '#94A3B8', textDecoration: 'none', fontWeight: 500 }}>← TikTok</a>
          <span style={{ color: '#E2E8F0' }}>|</span>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>Nuevo post</div>
        </div>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '28px', display: 'flex', gap: 28 }}>

        {/* Left — config */}
        <div style={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Step 1: type */}
          <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 20 }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '.88rem', color: '#0F172A', marginBottom: 14 }}>
              1 · Elige el tipo de post
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(Object.entries(TYPE_META) as [TikTokPostType, typeof TYPE_META[TikTokPostType]][]).map(([key, m]) => (
                <button
                  key={key}
                  onClick={() => { setPostType(key); setSlides(null); setStatus('idle') }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '11px 14px', borderRadius: 10,
                    border: postType === key ? `1.5px solid ${m.color}` : '1.5px solid #E2E8F0',
                    background: postType === key ? `${m.color}10` : '#fff',
                    cursor: 'pointer', textAlign: 'left', transition: 'all .15s',
                  }}
                >
                  <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{m.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: postType === key ? m.color : '#0F172A' }}>{m.label}</div>
                    <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>{m.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: generate */}
          <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 20 }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '.88rem', color: '#0F172A', marginBottom: 14 }}>
              2 · Generar contenido
            </div>
            <button
              onClick={generate}
              disabled={!postType || status === 'generating' || status === 'saving' || status === 'saved'}
              style={{
                width: '100%', padding: '12px', borderRadius: 10, border: 'none',
                background: !postType ? '#F1F5F9' : meta?.color ?? '#0F172A',
                color: !postType ? '#94A3B8' : '#0F172A',
                fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14,
                cursor: !postType ? 'not-allowed' : 'pointer',
                transition: 'all .15s',
              }}
            >
              {status === 'generating' ? '⏳ Generando...' : slides ? '🔄 Regenerar' : '✨ Generar slides'}
            </button>
            {error && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 8 }}>{error}</p>}
          </div>

          {/* Step 3: schedule + approve */}
          {status === 'ready' || status === 'saving' || status === 'saved' ? (
            <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 20 }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '.88rem', color: '#0F172A', marginBottom: 14 }}>
                3 · Programar publicación
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
                  style={{
                    width: '100%', padding: '12px', borderRadius: 10, border: 'none',
                    background: '#0F172A', color: '#fff',
                    fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14,
                    cursor: 'pointer',
                  }}
                >
                  {status === 'saving' ? 'Guardando...' : '✓ Aprobar y programar →'}
                </button>
              )}
            </div>
          ) : null}
        </div>

        {/* Right — preview */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {status === 'generating' && (
            <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: '60px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>✨</div>
              <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>Claude está generando tu post...</p>
              <p style={{ fontSize: 13, color: '#94A3B8' }}>Esto tarda unos segundos</p>
            </div>
          )}

          {slides && status !== 'generating' && postType && (() => {
            const bgUrl = slides[0]?.type === 'cover' ? slides[0].background_url : undefined
            const activeUrl = buildRenderUrl(slides[activeSlide], postType, false, bgUrl)
            const activeDownloadUrl = buildRenderUrl(slides[activeSlide], postType, true, bgUrl)
            const slideLabel = slides[activeSlide].type === 'cover' ? 'portada' : slides[activeSlide].type === 'cta' ? 'cta' : `slide-${(slides[activeSlide] as Extract<TikTokSlide, { type: 'content' }>).num}`

            return (
              <>
                {/* Large preview */}
                <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '.88rem', color: '#0F172A' }}>
                      Vista previa — slide {activeSlide + 1} de {slides.length}
                    </div>
                    {/* Feedback + download */}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {/* Thumbs */}
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          onClick={() => sendFeedback('like')}
                          title="Me gusta este post"
                          style={{
                            width: 34, height: 34, borderRadius: 8, border: 'none', cursor: feedbackSent ? 'default' : 'pointer',
                            background: feedback === 'like' ? 'rgba(0,255,178,.15)' : '#F8FAFC',
                            fontSize: 16, transition: 'all .15s',
                            opacity: feedbackSent && feedback !== 'like' ? 0.35 : 1,
                          }}
                        >👍</button>
                        <button
                          onClick={() => sendFeedback('dislike')}
                          title="No me gusta este post"
                          style={{
                            width: 34, height: 34, borderRadius: 8, border: 'none', cursor: feedbackSent ? 'default' : 'pointer',
                            background: feedback === 'dislike' ? 'rgba(239,68,68,.12)' : '#F8FAFC',
                            fontSize: 16, transition: 'all .15s',
                            opacity: feedbackSent && feedback !== 'dislike' ? 0.35 : 1,
                          }}
                        >👎</button>
                      </div>
                      {/* Download active slide */}
                      <a
                        href={activeDownloadUrl}
                        download={`aprendia-${slideLabel}.png`}
                        target="_blank"
                        rel="noreferrer"
                        title="Descargar slide actual"
                        style={{
                          display: 'flex', alignItems: 'center', gap: 5,
                          padding: '7px 12px', borderRadius: 8, textDecoration: 'none',
                          background: '#F1F5F9', color: '#64748B',
                          fontSize: 12, fontWeight: 600,
                        }}
                      >
                        ↓ PNG
                      </a>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <img
                      key={activeUrl}
                      src={activeUrl}
                      alt="slide preview"
                      style={{ width: 360, height: 360, borderRadius: 12, border: '1px solid #E2E8F0', objectFit: 'cover' }}
                    />
                  </div>
                  {feedbackSent && (
                    <p style={{ fontSize: 11, color: '#94A3B8', textAlign: 'center', marginTop: 10 }}>
                      {feedback === 'like' ? '👍 Guardado — lo usaré como referencia' : '👎 Anotado — mejoraré el estilo'}
                    </p>
                  )}
                </div>

                {/* Slide strip */}
                <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>Todas las slides</div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <button
                        onClick={downloadAll}
                        disabled={downloading}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 5,
                          padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                          background: '#0F172A', color: '#fff',
                          fontSize: 12, fontWeight: 700, opacity: downloading ? 0.6 : 1,
                        }}
                      >
                        {downloading ? '⏳ Generando...' : '↓ Descargar todo'}
                      </button>
                      {slides.map((slide, i) => {
                        const label = slide.type === 'cover' ? 'portada' : slide.type === 'cta' ? 'cta' : `slide-${(slide as Extract<TikTokSlide, { type: 'content' }>).num}`
                        return (
                          <a
                            key={i}
                            href={buildRenderUrl(slide, postType, true, bgUrl)}
                            download={`aprendia-${label}.png`}
                            target="_blank"
                            rel="noreferrer"
                            title={`Descargar ${label}`}
                            onClick={e => e.stopPropagation()}
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              width: 26, height: 26, borderRadius: 6,
                              background: '#F1F5F9', color: '#64748B', textDecoration: 'none',
                              fontSize: 11, fontWeight: 700,
                            }}
                          >↓</a>
                        )
                      })}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
                    {slides.map((slide, i) => (
                      <div
                        key={i}
                        onClick={() => setActiveSlide(i)}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: 'pointer', flexShrink: 0 }}
                      >
                        <img
                          src={buildRenderUrl(slide, postType, false, bgUrl)}
                          alt={`slide ${i + 1}`}
                          style={{
                            width: 88, height: 88, borderRadius: 8, objectFit: 'cover',
                            border: activeSlide === i ? `2.5px solid ${TYPE_META[postType].color}` : '1.5px solid #E2E8F0',
                            transition: 'border .15s',
                          }}
                        />
                        <span style={{ fontSize: 10, color: activeSlide === i ? TYPE_META[postType].color : '#94A3B8', fontWeight: 600 }}>
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
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>📱</div>
              <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#64748B', marginBottom: 6 }}>Aquí verás la previsualización</p>
              <p style={{ fontSize: 13, color: '#94A3B8' }}>Selecciona un tipo y genera el post</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
