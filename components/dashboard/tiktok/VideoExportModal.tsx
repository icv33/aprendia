'use client'

import { useState, useRef, useCallback } from 'react'
import { TikTokSlide, TikTokPostType } from '@/lib/supabase'

interface Props {
  postId: string
  slides: TikTokSlide[]
  type: TikTokPostType
  onClose: () => void
}

const SLIDE_DUR: Record<string, number> = { cover: 5, content: 4, cta: 3 }
const FPS = 30
const W   = 1080
const H   = 1920
const TRANS_S = 0.45 // transition duration seconds

// Ken Burns variants: different zoom/pan per slide for variety
const KB = [
  { s0: 1.00, s1: 1.07, px: 0,   py: 0   }, // zoom in center
  { s0: 1.07, s1: 1.00, px: -25, py: 0   }, // zoom out, drift right
  { s0: 1.00, s1: 1.07, px: 0,   py: -18 }, // zoom in, drift up
  { s0: 1.07, s1: 1.00, px: 22,  py: 0   }, // zoom out, drift left
  { s0: 1.00, s1: 1.06, px: -18, py: 14  }, // zoom in diagonal
]

function lerp(a: number, b: number, t: number) { return a + (b - a) * t }
function easeOut3(t: number) { return 1 - Math.pow(1 - t, 3) }
function easeInOut3(t: number) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2 }

function buildSlideUrl(slide: TikTokSlide, type: TikTokPostType, bgUrl?: string): string {
  const p = new URLSearchParams({ type })
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

function getSlideText(slide: TikTokSlide): string {
  const c = (s: string) => s.replace(/<<|>>/g, '').trim()
  if (slide.type === 'cover')   return `${c(slide.titulo)}. ${slide.subtitulo ? c(slide.subtitulo) : ''}`.trim()
  if (slide.type === 'content') return `${c(slide.titulo)}. ${c(slide.contenido)}`
  return c(slide.cta)
}

async function loadImg(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload  = () => resolve(img)
    img.onerror = () => reject(new Error(`No se pudo cargar: ${url}`))
    img.src = url
  })
}

async function loadVideoEl(url: string): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const v = document.createElement('video')
    v.crossOrigin  = 'anonymous'
    v.muted        = true
    v.loop         = true
    v.playsInline  = true
    v.preload      = 'auto'
    v.oncanplay    = async () => { await v.play(); resolve(v) }
    v.onerror      = () => reject(new Error('Video no disponible'))
    v.src = url
  })
}

// ── Sound effects via Web Audio API ─────────────────────────────────────────

function sfxFlash(ctx: AudioContext, dest: AudioNode, when: number) {
  // Brief high-freq noise burst — camera flash feel
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.12), ctx.sampleRate)
  const d   = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) {
    const t = i / d.length
    d[i] = (Math.random() * 2 - 1) * 0.08 * Math.pow(1 - t, 2.5)
  }
  const src = ctx.createBufferSource()
  src.buffer = buf
  const hi = ctx.createBiquadFilter()
  hi.type = 'highpass'; hi.frequency.value = 5000
  src.connect(hi); hi.connect(dest)
  src.start(when)
}

function sfxWhoosh(ctx: AudioContext, dest: AudioNode, when: number) {
  // Descending whoosh — slide transition
  const osc  = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(500, when)
  osc.frequency.exponentialRampToValueAtTime(80, when + 0.35)
  gain.gain.setValueAtTime(0.07, when)
  gain.gain.exponentialRampToValueAtTime(0.001, when + 0.38)
  osc.connect(gain); gain.connect(dest)
  osc.start(when); osc.stop(when + 0.4)
}

function sfxPop(ctx: AudioContext, dest: AudioNode, when: number) {
  // Soft pop — cover slide entry
  const osc  = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(280, when)
  osc.frequency.exponentialRampToValueAtTime(600, when + 0.07)
  gain.gain.setValueAtTime(0.18, when)
  gain.gain.exponentialRampToValueAtTime(0.001, when + 0.18)
  osc.connect(gain); gain.connect(dest)
  osc.start(when); osc.stop(when + 0.2)
}

function sfxChime(ctx: AudioContext, dest: AudioNode, when: number) {
  // Bright chime — CTA slide
  [880, 1100, 1320].forEach((freq, i) => {
    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    const t = when + i * 0.08
    gain.gain.setValueAtTime(0.08, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6)
    osc.connect(gain); gain.connect(dest)
    osc.start(t); osc.stop(t + 0.65)
  })
}

// ── Main component ───────────────────────────────────────────────────────────

export function VideoExportModal({ postId, slides, type, onClose }: Props) {
  const [phase,    setPhase]    = useState<'idle' | 'loading' | 'recording' | 'done' | 'error'>('idle')
  const [pct,      setPct]      = useState(0)
  const [label,    setLabel]    = useState('')
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [err,      setErr]      = useState('')
  const [useVoice, setUseVoice] = useState(true)
  const [useFx,    setUseFx]    = useState(true)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const totalSec  = slides.reduce((s, sl) => s + SLIDE_DUR[sl.type], 0)

  const generate = useCallback(async () => {
    setPhase('loading'); setPct(0); setErr('')

    const canvas = canvasRef.current!
    canvas.width = W; canvas.height = H
    const ctx = canvas.getContext('2d', { alpha: false })!

    try {
      // ── 1. Load slide images ──────────────────────────────────────────────
      setLabel('Cargando slides...')
      const bgUrl = slides[0]?.type === 'cover' ? (slides[0] as any).background_url : undefined
      const imgs  = await Promise.all(slides.map(s => loadImg(buildSlideUrl(s, type, bgUrl))))
      setPct(12)

      // ── 2. Background video (Pexels) ──────────────────────────────────────
      setLabel('Buscando vídeo de fondo...')
      let bgVid: HTMLVideoElement | null = null
      try {
        const vr = await fetch('/api/tiktok/video-bg')
        const { url } = await vr.json()
        if (url) bgVid = await loadVideoEl(url).catch(() => null)
      } catch { /* skip */ }
      setPct(28)

      // ── 3. TTS audio ──────────────────────────────────────────────────────
      setLabel('Generando voz...')
      const audioCtx  = new AudioContext()
      const audioDest = audioCtx.createMediaStreamDestination()
      const ttsBufs: (AudioBuffer | null)[] = []

      if (useVoice) {
        const results = await Promise.allSettled(
          slides.map(async slide => {
            const text = getSlideText(slide)
            const res  = await fetch('/api/tiktok/tts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text }),
            })
            if (!res.ok) return null
            return audioCtx.decodeAudioData(await res.arrayBuffer())
          })
        )
        ttsBufs.push(...results.map(r => (r.status === 'fulfilled' ? r.value : null)))
      } else {
        ttsBufs.push(...slides.map(() => null))
      }
      setPct(58)

      // ── 4. Schedule audio on timeline ─────────────────────────────────────
      let t = audioCtx.currentTime
      for (let i = 0; i < slides.length; i++) {
        const dur = SLIDE_DUR[slides[i].type]
        if (useFx) {
          if (slides[i].type === 'cover') sfxPop(audioCtx, audioDest, t + 0.2)
          else if (slides[i].type === 'cta') sfxChime(audioCtx, audioDest, t + 0.15)
          else {
            sfxWhoosh(audioCtx, audioDest, t)
            sfxFlash(audioCtx, audioDest, t + TRANS_S * 0.5)
          }
        }
        const buf = ttsBufs[i]
        if (buf) {
          const src  = audioCtx.createBufferSource()
          const gain = audioCtx.createGain()
          src.buffer = buf; gain.gain.value = 1.0
          src.connect(gain); gain.connect(audioDest)
          src.start(t + 0.55)
        }
        t += dur
      }

      // ── 5. MediaRecorder setup ────────────────────────────────────────────
      const canvasStream = canvas.captureStream(FPS)
      const stream = new MediaStream([
        ...canvasStream.getTracks(),
        ...audioDest.stream.getTracks(),
      ])
      const mimeType = (
        ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']
          .find(m => MediaRecorder.isTypeSupported(m)) ?? 'video/webm'
      )
      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 12_000_000 })
      const chunks: BlobPart[] = []
      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data) }
      const donePr = new Promise<void>(res => {
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: mimeType })
          setVideoUrl(URL.createObjectURL(blob))
          res()
        }
      })
      recorder.start(200)
      setPhase('recording')

      // ── 6. Canvas animation loop ──────────────────────────────────────────
      const totalFrames  = totalSec * FPS
      const transFrames  = Math.round(TRANS_S * FPS)
      let   rendered     = 0

      const drawBg = (vid: HTMLVideoElement | null) => {
        if (vid) {
          const vW = vid.videoWidth, vH = vid.videoHeight
          const sc = Math.max(W / vW, H / vH)
          const dW = vW * sc, dH = vH * sc
          const dx = (W - dW) / 2, dy = (H - dH) / 2
          ctx.save()
          ctx.filter = 'blur(28px) brightness(0.28)'
          ctx.drawImage(vid, dx - 50, dy - 50, dW + 100, dH + 100)
          ctx.filter = 'none'
          ctx.restore()
          // extra dark overlay so slide pops
          ctx.fillStyle = 'rgba(0,0,0,0.35)'
          ctx.fillRect(0, 0, W, H)
        } else {
          const g = ctx.createLinearGradient(0, 0, 0, H)
          g.addColorStop(0, '#080D1A')
          g.addColorStop(1, '#0C1525')
          ctx.fillStyle = g
          ctx.fillRect(0, 0, W, H)
        }
        // Vignette
        const vig = ctx.createRadialGradient(W/2, H/2, H*0.18, W/2, H/2, H*0.72)
        vig.addColorStop(0, 'rgba(0,0,0,0)')
        vig.addColorStop(1, 'rgba(0,0,0,0.55)')
        ctx.fillStyle = vig
        ctx.fillRect(0, 0, W, H)
      }

      for (let si = 0; si < slides.length; si++) {
        const dur       = SLIDE_DUR[slides[si].type]
        const slideF    = Math.round(dur * FPS)
        const kb        = KB[si % KB.length]
        const slideSize = W // 1080×1080 slide centered in 1080×1920

        for (let f = 0; f < slideF; f++) {
          const tp = f / slideF // 0→1 through slide

          // Opacity: fade in first transFrames, fade out last transFrames
          let alpha = 1
          if (f < transFrames)            alpha = easeOut3(f / transFrames)
          else if (f > slideF - transFrames) alpha = easeOut3((slideF - f) / transFrames)

          // Ken Burns
          const scale = lerp(kb.s0, kb.s1, easeInOut3(tp))
          const panX  = lerp(0, kb.px, tp)
          const panY  = lerp(0, kb.py, tp)

          // Background
          drawBg(bgVid)

          // Slide image centered vertically (420px top/bottom padding on 1920 canvas)
          const sy = (H - slideSize) / 2
          ctx.save()
          ctx.globalAlpha = alpha
          ctx.shadowBlur  = 50
          ctx.shadowColor = 'rgba(0,0,0,0.9)'
          ctx.translate(W/2 + panX, sy + slideSize/2 + panY)
          ctx.scale(scale, scale)
          ctx.drawImage(imgs[si], -slideSize/2, -slideSize/2, slideSize, slideSize)
          ctx.restore()

          // Flash on first 2 frames of non-cover slides
          if (useFx && f < 2 && si > 0) {
            ctx.fillStyle = `rgba(255,255,255,${0.55 - f * 0.28})`
            ctx.fillRect(0, 0, W, H)
          }

          // Branding watermark above slide
          ctx.save()
          ctx.globalAlpha = 0.35
          ctx.font = '600 26px system-ui, sans-serif'
          ctx.fillStyle = '#ffffff'
          ctx.textAlign = 'center'
          ctx.fillText('aprendia.store', W/2, sy - 32)
          ctx.restore()

          rendered++
          setPct(58 + Math.round((rendered / totalFrames) * 39))
          await new Promise<void>(r => requestAnimationFrame(() => r()))
        }
      }

      recorder.stop()
      audioCtx.close()
      await donePr
      setPct(100); setLabel(''); setPhase('done')

    } catch (e) {
      console.error(e)
      setErr((e as Error).message)
      setPhase('error')
    }
  }, [slides, type, useVoice, useFx, totalSec])

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.72)', backdropFilter: 'blur(10px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 460, padding: 28, boxShadow: '0 32px 80px rgba(0,0,0,.45)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>Exportar como vídeo</div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>~{totalSec}s · 1080×1920 · WebM</div>
          </div>
          <button onClick={onClose} disabled={phase === 'loading' || phase === 'recording'} style={{ background: '#F1F5F9', border: 'none', color: '#64748B', borderRadius: 8, width: 36, height: 36, fontSize: 16, cursor: 'pointer', opacity: phase === 'loading' || phase === 'recording' ? 0.4 : 1 }}>✕</button>
        </div>

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* IDLE */}
        {phase === 'idle' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {([
                { key: 'voice', label: '🎙️ Voz en español', desc: 'Narración IA por ElevenLabs', val: useVoice, set: setUseVoice },
                { key: 'fx',    label: '🔊 Efectos de sonido', desc: 'Whoosh, flash, chime en transiciones', val: useFx,    set: setUseFx   },
              ] as const).map(opt => (
                <div
                  key={opt.key}
                  onClick={() => opt.set(!opt.val)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, border: `1.5px solid ${opt.val ? '#00E5A0' : '#E2E8F0'}`, background: opt.val ? 'rgba(0,229,160,.06)' : '#F8FAFC', cursor: 'pointer', transition: 'all .15s' }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{opt.label}</div>
                    <div style={{ fontSize: 11, color: '#94A3B8' }}>{opt.desc}</div>
                  </div>
                  <div style={{ width: 36, height: 20, borderRadius: 100, background: opt.val ? '#00E5A0' : '#CBD5E1', position: 'relative', flexShrink: 0, transition: 'background .15s' }}>
                    <div style={{ position: 'absolute', top: 2, left: opt.val ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left .15s', boxShadow: '0 1px 4px rgba(0,0,0,.2)' }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 12, color: '#94A3B8', background: '#F8FAFC', borderRadius: 10, padding: '10px 14px', marginBottom: 20, lineHeight: 1.5 }}>
              El vídeo se genera en tu navegador. Deja la pantalla activa mientras graba (~{totalSec + 12}s). Requiere Chrome o Edge.
            </div>

            <button
              onClick={generate}
              style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: '#fff', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, cursor: 'pointer', letterSpacing: '0.3px' }}
            >
              🎬 Generar vídeo
            </button>
          </>
        )}

        {/* LOADING / RECORDING */}
        {(phase === 'loading' || phase === 'recording') && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: '2.8rem', marginBottom: 14 }}>{phase === 'loading' ? '⏳' : '🎬'}</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#0F172A', fontSize: '1.05rem', marginBottom: 6 }}>
              {phase === 'loading' ? label : 'Grabando...'}
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 22 }}>
              {phase === 'recording' ? 'No cierres esta ventana 🙏' : 'Preparando todos los assets...'}
            </div>
            <div style={{ background: '#F1F5F9', borderRadius: 100, height: 10, overflow: 'hidden', marginBottom: 10 }}>
              <div style={{ height: '100%', borderRadius: 100, background: 'linear-gradient(90deg, #00E5A0, #0F172A)', width: `${pct}%`, transition: 'width .4s ease' }} />
            </div>
            <div style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>{pct}%</div>
          </div>
        )}

        {/* DONE */}
        {phase === 'done' && videoUrl && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.8rem', marginBottom: 14 }}>✅</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, color: '#0F172A', fontSize: '1.05rem', marginBottom: 6 }}>¡Vídeo listo!</div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 22 }}>Descárgalo y súbelo directamente a TikTok Ads</div>
            <a
              href={videoUrl}
              download={`aprendia-${postId}.webm`}
              style={{ display: 'block', padding: '14px', borderRadius: 12, background: '#0F172A', color: '#fff', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, textDecoration: 'none', marginBottom: 10 }}
            >
              ⬇ Descargar vídeo (.webm)
            </a>
            <button
              onClick={() => { setPhase('idle'); setVideoUrl(null); setPct(0) }}
              style={{ width: '100%', padding: '11px', borderRadius: 10, border: '1.5px solid #E2E8F0', background: 'transparent', color: '#64748B', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              Generar otra versión
            </button>
          </div>
        )}

        {/* ERROR */}
        {phase === 'error' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>❌</div>
            <div style={{ fontSize: 13, color: '#EF4444', marginBottom: 16, lineHeight: 1.5 }}>{err}</div>
            <button
              onClick={() => setPhase('idle')}
              style={{ width: '100%', padding: '12px', borderRadius: 10, border: 'none', background: '#F1F5F9', color: '#0F172A', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
            >
              Reintentar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
