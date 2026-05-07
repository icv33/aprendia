'use client'

import { useState, useRef, useCallback } from 'react'

// Canvas dimensions — 9:16 TikTok format
const W = 540
const H = 960

type Scene = { text: string; emojis: string[]; duration: number }
type VideoData = { scenes: Scene[]; script: string; audioBase64: string; topic: string }

const TOPICS = [
  { key: 'historia',  label: 'Historia de éxito',         desc: 'Alguien que mejoró su trabajo con IA' },
  { key: 'error',     label: 'El mayor error con ChatGPT', desc: 'Por qué la mayoría lo usa mal' },
  { key: 'ahorro',    label: 'Ahorra 2h al día',           desc: 'Tres formas concretas de recuperar tiempo' },
  { key: 'aprender',  label: 'Por qué aprender IA ahora',  desc: 'La inversión de tiempo más rentable' },
  { key: 'negocio',   label: 'Negocio con IA',             desc: 'Servicio sin conocimientos técnicos' },
  { key: 'futuro',    label: 'El futuro del trabajo',      desc: 'IA como ventaja, no como amenaza' },
]

const ACCENT_COLORS = ['#00E5A0', '#6366F1', '#F59E0B', '#EC4899', '#3B82F6', '#A78BFA', '#10B981', '#F97316', '#00E5A0']

// ── Easing ────────────────────────────────────────────────────────────────────
function easeOutBack(t: number): number {
  const c1 = 1.5
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

// ── Text wrap ─────────────────────────────────────────────────────────────────
function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string, x: number, y: number, maxWidth: number, lineHeight: number
) {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = word }
    else line = test
  }
  if (line) lines.push(line)
  const totalH = lines.length * lineHeight
  lines.forEach((l, i) => ctx.fillText(l, x, y - totalH / 2 + i * lineHeight + lineHeight / 2))
}

// ── Rounded rect helper ───────────────────────────────────────────────────────
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

// ── Scene renderer ────────────────────────────────────────────────────────────
function drawScene(
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  sceneIdx: number,
  progress: number  // 0..1 within this scene
) {
  const accent = ACCENT_COLORS[sceneIdx % ACCENT_COLORS.length]
  const n = scene.emojis.length

  // Background
  ctx.fillStyle = '#080D1A'
  ctx.fillRect(0, 0, W, H)

  // Radial accent glow
  const grd = ctx.createRadialGradient(W / 2, H * 0.44, 0, W / 2, H * 0.44, W * 0.75)
  grd.addColorStop(0, `${accent}28`)
  grd.addColorStop(1, 'transparent')
  ctx.fillStyle = grd
  ctx.fillRect(0, 0, W, H)

  // ── Emojis animate in (0..0.45 of progress) ─────────────────────────────
  const emojiAnim = Math.min(progress / 0.45, 1)
  const emojiScale = easeOutBack(emojiAnim)

  const emojiSize = n === 1 ? 150 : n === 2 ? 115 : 92
  const emojiY = H * 0.41

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  scene.emojis.forEach((emoji, i) => {
    const slotW = (W * 0.78) / n
    const ex = W * 0.11 + slotW * i + slotW / 2
    ctx.save()
    ctx.translate(ex, emojiY)
    ctx.scale(emojiScale, emojiScale)
    ctx.font = `${emojiSize}px serif`
    ctx.fillText(emoji, 0, 0)
    ctx.restore()
  })

  // ── Arrows between emojis (appear after emojis land) ────────────────────
  if (n > 1 && emojiAnim > 0.85) {
    const arrowAlpha = easeInOutCubic((emojiAnim - 0.85) / 0.15)
    ctx.globalAlpha = arrowAlpha
    ctx.strokeStyle = `${accent}BB`
    ctx.lineWidth = 3
    ctx.lineCap = 'round'

    for (let i = 0; i < n - 1; i++) {
      const slotW = (W * 0.78) / n
      const x1 = W * 0.11 + slotW * i + slotW / 2 + emojiSize * 0.42
      const x2 = W * 0.11 + slotW * (i + 1) + slotW / 2 - emojiSize * 0.42
      const ay = emojiY

      // Dashed line
      ctx.setLineDash([8, 5])
      ctx.beginPath(); ctx.moveTo(x1, ay); ctx.lineTo(x2 - 14, ay); ctx.stroke()

      // Arrowhead
      ctx.setLineDash([])
      ctx.beginPath()
      ctx.moveTo(x2 - 14, ay - 9)
      ctx.lineTo(x2, ay)
      ctx.lineTo(x2 - 14, ay + 9)
      ctx.stroke()
    }
    ctx.setLineDash([])
    ctx.globalAlpha = 1
  }

  // ── Text card (fades in from 0.30 of progress) ───────────────────────────
  const textAnim = Math.min(Math.max((progress - 0.30) / 0.28, 0), 1)
  if (textAnim > 0) {
    ctx.globalAlpha = easeInOutCubic(textAnim)

    // Card background
    const cardW = W * 0.84
    const cardX = (W - cardW) / 2
    const cardY = H * 0.615
    const cardH = 160
    ctx.fillStyle = 'rgba(255,255,255,0.06)'
    roundRect(ctx, cardX, cardY, cardW, cardH, 20)
    ctx.fill()

    // Left accent bar
    ctx.fillStyle = accent
    roundRect(ctx, cardX, cardY, 5, cardH, 4)
    ctx.fill()

    // Text
    ctx.fillStyle = '#FFFFFF'
    ctx.font = `bold ${n > 2 ? 33 : 37}px -apple-system, 'Helvetica Neue', Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    drawWrappedText(ctx, scene.text, W / 2, cardY + cardH / 2, cardW * 0.84, 50)

    ctx.globalAlpha = 1
  }

  // ── Brand footer ─────────────────────────────────────────────────────────
  ctx.fillStyle = accent
  ctx.fillRect((W - W * 0.28) / 2, H - 74, W * 0.28, 2.5)

  ctx.fillStyle = 'rgba(255,255,255,0.28)'
  ctx.font = `500 19px -apple-system, Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('aprendia.store', W / 2, H - 46)

  // ── Fade in at scene start (first 5%) ────────────────────────────────────
  if (progress < 0.05) {
    ctx.fillStyle = `rgba(0,0,0,${1 - progress / 0.05})`
    ctx.fillRect(0, 0, W, H)
  }

  // ── Fade out at scene end (last 10%) ─────────────────────────────────────
  if (progress > 0.90) {
    ctx.fillStyle = `rgba(0,0,0,${(progress - 0.90) / 0.10})`
    ctx.fillRect(0, 0, W, H)
  }
}

// ── Main render ───────────────────────────────────────────────────────────────
function renderFrame(
  ctx: CanvasRenderingContext2D,
  scenes: Scene[],
  elapsed: number,
  totalDuration: number
) {
  const totalEst = scenes.reduce((s, sc) => s + sc.duration, 0)
  const scale    = totalDuration / totalEst

  let t = 0
  let sceneIdx = scenes.length - 1
  let sceneProg = 1

  for (let i = 0; i < scenes.length; i++) {
    const dur = scenes[i].duration * scale
    if (elapsed < t + dur) {
      sceneIdx  = i
      sceneProg = (elapsed - t) / dur
      break
    }
    t += dur
  }

  drawScene(ctx, scenes[sceneIdx], sceneIdx, Math.min(sceneProg, 1))

  // Progress bar
  const barW = (elapsed / totalDuration) * W
  const accent = ACCENT_COLORS[sceneIdx % ACCENT_COLORS.length]
  ctx.fillStyle = 'rgba(255,255,255,0.08)'
  ctx.fillRect(0, H - 5, W, 5)
  ctx.fillStyle = accent
  ctx.fillRect(0, H - 5, barW, 5)
}

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner({ color = '#6366F1' }: { color?: string }) {
  return (
    <span style={{
      display: 'inline-block', width: 16, height: 16,
      border: `2.5px solid ${color}`, borderTopColor: 'transparent',
      borderRadius: '50%', animation: 'spin .75s linear infinite', flexShrink: 0,
    }} />
  )
}

// ── Main component ────────────────────────────────────────────────────────────
type Step = 'select' | 'loading' | 'ready' | 'recording' | 'done'

export function AnimatedVideoCreator({ onClose }: { onClose: () => void }) {
  const [step,         setStep]         = useState<Step>('select')
  const [selectedKey,  setSelectedKey]  = useState('historia')
  const [customTopic,  setCustomTopic]  = useState('')
  const [error,        setError]        = useState('')
  const [videoData,    setVideoData]    = useState<VideoData | null>(null)
  const [downloadUrl,  setDownloadUrl]  = useState('')
  const [progress,     setProgress]     = useState(0) // 0..1 recording progress

  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const rafRef       = useRef<number>(0)
  const recorderRef  = useRef<MediaRecorder | null>(null)
  const chunksRef    = useRef<Blob[]>([])

  const isCustom = selectedKey === 'custom'

  // ── Step 1: Generate ───────────────────────────────────────────────────────
  const handleGenerate = async () => {
    setStep('loading')
    setError('')
    try {
      const res = await fetch('/api/video/generate-animated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isCustom ? { customTopic } : { topicKey: selectedKey }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al generar')
      setVideoData(data as VideoData)
      setStep('ready')
    } catch (e) {
      setError(String(e))
      setStep('select')
    }
  }

  // ── Step 2: Record ─────────────────────────────────────────────────────────
  const handleRecord = useCallback(async () => {
    if (!videoData || !canvasRef.current) return
    setStep('recording')
    chunksRef.current = []

    // Decode audio
    const bytes = Uint8Array.from(atob(videoData.audioBase64), c => c.charCodeAt(0)).buffer
    const audioCtx  = new AudioContext()
    const audioBuf  = await audioCtx.decodeAudioData(bytes)
    const totalDur  = audioBuf.duration

    // Audio routing
    const dest   = audioCtx.createMediaStreamDestination()
    const source = audioCtx.createBufferSource()
    source.buffer = audioBuf
    source.connect(dest)
    source.connect(audioCtx.destination)

    // Canvas stream
    const canvas       = canvasRef.current
    const canvasStream = canvas.captureStream(30)
    const combined     = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...dest.stream.getAudioTracks(),
    ])

    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
      ? 'video/webm;codecs=vp8,opus'
      : 'video/webm'

    const recorder = new MediaRecorder(combined, { mimeType })
    recorderRef.current = recorder

    recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' })
      setDownloadUrl(URL.createObjectURL(blob))
      setStep('done')
    }

    recorder.start(200)
    source.start()

    // Animation loop
    const ctx       = canvas.getContext('2d')!
    const startTime = performance.now()

    const animate = () => {
      const elapsed = (performance.now() - startTime) / 1000
      if (elapsed >= totalDur) {
        renderFrame(ctx, videoData.scenes, totalDur, totalDur)
        recorder.stop()
        return
      }
      renderFrame(ctx, videoData.scenes, elapsed, totalDur)
      setProgress(elapsed / totalDur)
      rafRef.current = requestAnimationFrame(animate)
    }
    animate()
  }, [videoData])

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 880, maxHeight: '95vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 32px 96px rgba(0,0,0,.28)' }}>

        {/* Header */}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A', fontFamily: "'Syne', sans-serif" }}>🎬 Vídeo explicativo IA</div>
            <div style={{ fontSize: '.74rem', color: '#94A3B8', marginTop: 1 }}>Guión · Voz IA · Animación con emojis y flechas</div>
          </div>
          <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', borderRadius: 8, padding: '7px 12px', cursor: 'pointer', fontSize: 13, color: '#64748B' }}>✕</button>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* Left panel — controls */}
          <div style={{ width: 320, borderRight: '1px solid #F1F5F9', padding: '20px', overflowY: 'auto', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Topic selection */}
            {(step === 'select' || step === 'ready') && (
              <>
                <div style={{ fontSize: '.72rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.06em' }}>Tema del vídeo</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {TOPICS.map(t => (
                    <button
                      key={t.key}
                      onClick={() => setSelectedKey(t.key)}
                      disabled={step === 'ready'}
                      style={{
                        textAlign: 'left', padding: '10px 12px', borderRadius: 10, cursor: step === 'ready' ? 'default' : 'pointer',
                        border: selectedKey === t.key ? '2px solid #6366F1' : '1.5px solid #E2E8F0',
                        background: selectedKey === t.key ? 'rgba(99,102,241,.06)' : '#FAFAFA',
                        opacity: step === 'ready' && selectedKey !== t.key ? 0.4 : 1,
                        transition: 'all .12s',
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '.8rem', color: selectedKey === t.key ? '#6366F1' : '#0F172A' }}>{t.label}</div>
                      <div style={{ fontSize: '.7rem', color: '#94A3B8', marginTop: 2 }}>{t.desc}</div>
                    </button>
                  ))}

                  <button
                    onClick={() => setSelectedKey('custom')}
                    disabled={step === 'ready'}
                    style={{
                      textAlign: 'left', padding: '10px 12px', borderRadius: 10, cursor: step === 'ready' ? 'default' : 'pointer',
                      border: isCustom ? '2px solid #6366F1' : '1.5px solid #E2E8F0',
                      background: isCustom ? 'rgba(99,102,241,.06)' : '#FAFAFA',
                      opacity: step === 'ready' && !isCustom ? 0.4 : 1,
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '.8rem', color: isCustom ? '#6366F1' : '#0F172A' }}>✏️ Personalizado</div>
                    <div style={{ fontSize: '.7rem', color: '#94A3B8', marginTop: 2 }}>Describe el tema que quieras</div>
                  </button>

                  {isCustom && step !== 'ready' && (
                    <textarea
                      value={customTopic}
                      onChange={e => setCustomTopic(e.target.value)}
                      placeholder="Ej: Cómo uso IA para gestionar mis redes sociales..."
                      rows={3}
                      style={{ padding: '10px 12px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 12, fontFamily: 'inherit', resize: 'none', outline: 'none', color: '#0F172A' }}
                    />
                  )}
                </div>

                {error && <div style={{ fontSize: 12, color: '#EF4444', fontWeight: 600 }}>{error}</div>}

                {step === 'select' && (
                  <button
                    onClick={handleGenerate}
                    disabled={isCustom && !customTopic.trim()}
                    style={{
                      padding: '12px', borderRadius: 10, border: 'none',
                      background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                      color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                      opacity: (isCustom && !customTopic.trim()) ? 0.5 : 1,
                    }}
                  >
                    Generar guión y voz →
                  </button>
                )}
              </>
            )}

            {/* Loading */}
            {step === 'loading' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', paddingTop: 24 }}>
                <Spinner />
                <div style={{ fontSize: 13, color: '#64748B', textAlign: 'center' }}>
                  Claude genera el guión y las escenas visuales...
                  <br /><br />
                  <span style={{ color: '#94A3B8', fontSize: 12 }}>ElevenLabs sintetiza la voz</span>
                </div>
              </div>
            )}

            {/* Ready to record */}
            {step === 'ready' && videoData && (
              <>
                <div style={{ background: '#F0FDF4', borderRadius: 10, padding: '12px 14px', fontSize: 12, color: '#16A34A', fontWeight: 600, lineHeight: 1.5 }}>
                  ✅ Guión y voz listos.<br />
                  <span style={{ color: '#64748B', fontWeight: 400 }}>Pulsa grabar para renderizar la animación en tiempo real. Mantén la pestaña abierta.</span>
                </div>

                <button
                  onClick={handleRecord}
                  style={{ padding: '13px', borderRadius: 10, border: 'none', background: '#0F172A', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >
                  ⏺ Grabar vídeo
                </button>

                <div>
                  <div style={{ fontSize: '.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>Guión generado</div>
                  <p style={{ fontSize: 11.5, color: '#475569', lineHeight: 1.65, margin: 0 }}>{videoData.script}</p>
                </div>
              </>
            )}

            {/* Recording */}
            {step === 'recording' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', paddingTop: 20 }}>
                <Spinner color="#EF4444" />
                <div style={{ fontSize: 13, color: '#64748B', textAlign: 'center', fontWeight: 600 }}>
                  Grabando animación...
                </div>
                <div style={{ width: '100%', height: 6, background: '#F1F5F9', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'linear-gradient(90deg, #6366F1, #00E5A0)', borderRadius: 3, width: `${progress * 100}%`, transition: 'width .2s' }} />
                </div>
                <div style={{ fontSize: 11, color: '#94A3B8' }}>{Math.round(progress * 100)}% completado</div>
              </div>
            )}

            {/* Done */}
            {step === 'done' && downloadUrl && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ background: '#F0FDF4', borderRadius: 10, padding: '12px 14px', fontSize: 12, color: '#16A34A', fontWeight: 600 }}>
                  ✅ ¡Vídeo listo!
                </div>
                <a
                  href={downloadUrl}
                  download={`aprendia-${Date.now()}.webm`}
                  style={{ display: 'block', textAlign: 'center', padding: '13px', borderRadius: 10, background: '#0F172A', color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}
                >
                  ⬇ Descargar WebM
                </a>
                <button
                  onClick={() => { setStep('select'); setVideoData(null); setDownloadUrl(''); setProgress(0) }}
                  style={{ padding: '11px', borderRadius: 10, border: '1.5px solid #E2E8F0', background: '#fff', fontSize: 13, fontWeight: 600, color: '#64748B', cursor: 'pointer' }}
                >
                  Crear otro vídeo
                </button>
              </div>
            )}
          </div>

          {/* Right panel — canvas preview */}
          <div style={{ flex: 1, background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div style={{ position: 'relative' }}>
              <canvas
                ref={canvasRef}
                width={W}
                height={H}
                style={{ display: 'block', borderRadius: 16, maxHeight: '70vh', width: 'auto', boxShadow: '0 16px 64px rgba(0,0,0,.6)' }}
              />
              {/* Placeholder when idle */}
              {(step === 'select' || step === 'loading') && (
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: 16,
                  background: 'linear-gradient(160deg, #080D1A 0%, #0C1525 100%)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
                }}>
                  <div style={{ fontSize: '3rem' }}>🎬</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,.35)', textAlign: 'center', lineHeight: 1.5 }}>
                    {step === 'loading' ? 'Generando...' : 'La animación aparecerá aquí'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
