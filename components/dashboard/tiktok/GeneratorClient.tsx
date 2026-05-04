'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TikTokSlide, TikTokPostType } from '@/lib/supabase'
import { TYPE_META, SCHEDULE_SLOTS } from '@/lib/tiktok'

function buildRenderUrl(slide: TikTokSlide, type: TikTokPostType): string {
  const p = new URLSearchParams({ type })
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

  const generate = async () => {
    if (!postType) return
    setStatus('generating')
    setSlides(null)
    setError('')
    setActiveSlide(0)
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

          {slides && status !== 'generating' && postType && (
            <>
              {/* Large preview */}
              <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 20 }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '.88rem', color: '#0F172A', marginBottom: 16 }}>
                  Vista previa — slide {activeSlide + 1} de {slides.length}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <img
                    key={buildRenderUrl(slides[activeSlide], postType)}
                    src={buildRenderUrl(slides[activeSlide], postType)}
                    alt="slide preview"
                    style={{ width: 360, height: 360, borderRadius: 12, border: '1px solid #E2E8F0', objectFit: 'cover' }}
                  />
                </div>
              </div>

              {/* Slide strip */}
              <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 16 }}>
                <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
                  {slides.map((slide, i) => (
                    <div
                      key={i}
                      onClick={() => setActiveSlide(i)}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: 'pointer', flexShrink: 0 }}
                    >
                      <img
                        src={buildRenderUrl(slide, postType)}
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
          )}

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
