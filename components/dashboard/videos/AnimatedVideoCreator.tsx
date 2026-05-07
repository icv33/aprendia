'use client'

import { useState, useRef, useCallback } from 'react'

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type SceneType = 'hook' | 'problem' | 'insight' | 'step' | 'result' | 'cta'

type Scene = {
  text: string
  emojis: string[]
  duration: number
  sceneType: SceneType
}

type WordStamp = { word: string; start: number; end: number }

type AmbientParticle = {
  x: number; y: number; vx: number; vy: number
  size: number; alpha: number; hue: number
}

type BurstParticle = {
  x: number; y: number; vx: number; vy: number
  life: number; size: number; color: string; rotation: number; rSpeed: number
}

type AnimState = {
  ambient: AmbientParticle[]
  burst: BurstParticle[]
  lastScene: number
  sceneTimings: { start: number; end: number }[]
  totalDuration: number
}

type VideoData = {
  scenes: Scene[]
  script: string
  audioBase64: string
  wordTimestamps: WordStamp[]
  topic: string
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const W = 540
const H = 960
const TRANS_DUR = 0.38

const SCENE_COLORS: Record<SceneType, string> = {
  hook:    '#00E5A0',
  problem: '#F97316',
  insight: '#F59E0B',
  step:    '#818CF8',
  result:  '#34D399',
  cta:     '#00E5A0',
}

const TOPICS = [
  { key: 'historia',  label: 'Historia de éxito',          desc: 'Alguien que mejoró su trabajo con IA' },
  { key: 'error',     label: 'El mayor error con ChatGPT',  desc: 'Por qué la mayoría lo usa mal' },
  { key: 'ahorro',    label: 'Ahorra 2h al día',            desc: 'Tres formas concretas de recuperar tiempo' },
  { key: 'aprender',  label: 'Por qué aprender IA ahora',   desc: 'La inversión de tiempo más rentable' },
  { key: 'negocio',   label: 'Negocio con IA',              desc: 'Servicio sin conocimientos técnicos' },
  { key: 'futuro',    label: 'El futuro del trabajo',       desc: 'IA como ventaja, no como amenaza' },
]

// ═══════════════════════════════════════════════════════════════════════════
// EASING
// ═══════════════════════════════════════════════════════════════════════════

const easeOutCubic    = (t: number) => 1 - Math.pow(1 - t, 3)
const easeInOutCubic  = (t: number) => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2
const easeOutBack     = (t: number) => { const c=1.5; return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2) }
const easeOutElastic  = (t: number) => {
  if (t === 0 || t === 1) return t
  return Math.pow(2,-10*t)*Math.sin((t*10-0.75)*(2*Math.PI)/3)+1
}
const easeOutBounce = (t: number) => {
  const n=7.5625, d=2.75
  if (t < 1/d)       return n*t*t
  else if (t < 2/d)  return n*(t-=1.5/d)*t+0.75
  else if (t < 2.5/d)return n*(t-=2.25/d)*t+0.9375
  return n*(t-=2.625/d)*t+0.984375
}

// ═══════════════════════════════════════════════════════════════════════════
// CANVAS HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function rrect(ctx: CanvasRenderingContext2D, x:number,y:number,w:number,h:number,r:number) {
  ctx.beginPath()
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y)
  ctx.quadraticCurveTo(x+w,y,x+w,y+r); ctx.lineTo(x+w,y+h-r)
  ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h); ctx.lineTo(x+r,y+h)
  ctx.quadraticCurveTo(x,y+h,x,y+h-r); ctx.lineTo(x,y+r)
  ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath()
}

function wrapText(ctx: CanvasRenderingContext2D, text:string, x:number, y:number, maxW:number, lh:number) {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w }
    else line = test
  }
  if (line) lines.push(line)
  const totalH = lines.length * lh
  lines.forEach((l,i) => ctx.fillText(l, x, y - totalH/2 + i*lh + lh/2))
  return totalH
}

// ═══════════════════════════════════════════════════════════════════════════
// PARTICLES
// ═══════════════════════════════════════════════════════════════════════════

function initAmbient(): AmbientParticle[] {
  return Array.from({length:32}, () => ({
    x: Math.random()*W, y: Math.random()*H,
    vx: (Math.random()-0.5)*0.4, vy: -(Math.random()*0.6+0.1),
    size: Math.random()*2.2+0.4, alpha: Math.random()*0.22+0.04,
    hue: Math.random()*60+140, // greens/teals
  }))
}

function tickAmbient(ctx: CanvasRenderingContext2D, particles: AmbientParticle[], accent: string) {
  ctx.save()
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy
    if (p.y < -5) { p.y = H+5; p.x = Math.random()*W }
    if (p.x < -5) p.x = W+5
    if (p.x > W+5) p.x = -5
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI*2)
    ctx.fillStyle = accent
    ctx.globalAlpha = p.alpha
    ctx.fill()
  })
  ctx.restore()
}

function triggerBurst(particles: BurstParticle[], x:number, y:number, color:string) {
  for (let i = 0; i < 22; i++) {
    const angle = (Math.PI*2*i)/22 + Math.random()*0.3
    const spd   = Math.random()*7+2
    particles.push({
      x, y,
      vx: Math.cos(angle)*spd, vy: Math.sin(angle)*spd - 1,
      life: 1,
      size: Math.random()*6+2,
      color,
      rotation: Math.random()*Math.PI*2,
      rSpeed: (Math.random()-0.5)*0.3,
    })
  }
}

function tickBurst(ctx: CanvasRenderingContext2D, particles: BurstParticle[]) {
  ctx.save()
  for (let i = particles.length-1; i >= 0; i--) {
    const p = particles[i]
    p.x += p.vx; p.y += p.vy
    p.vy += 0.14; p.vx *= 0.97
    p.life -= 0.022
    p.rotation += p.rSpeed
    if (p.life <= 0) { particles.splice(i,1); continue }
    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.rotate(p.rotation)
    ctx.globalAlpha = p.life * 0.85
    ctx.fillStyle = p.color
    const s = p.size * Math.max(p.life, 0.1)
    // diamond shape
    ctx.beginPath()
    ctx.moveTo(0,-s); ctx.lineTo(s*0.5,0); ctx.lineTo(0,s); ctx.lineTo(-s*0.5,0)
    ctx.closePath(); ctx.fill()
    ctx.restore()
  }
  ctx.restore()
}

// ═══════════════════════════════════════════════════════════════════════════
// BACKGROUND helpers
// ═══════════════════════════════════════════════════════════════════════════

function drawBackground(ctx: CanvasRenderingContext2D, accent: string) {
  ctx.fillStyle = '#080D1A'
  ctx.fillRect(0,0,W,H)
  const g = ctx.createRadialGradient(W/2, H*0.4, 0, W/2, H*0.4, W*0.8)
  g.addColorStop(0, accent+'22')
  g.addColorStop(1, 'transparent')
  ctx.fillStyle = g
  ctx.fillRect(0,0,W,H)
}

function drawGhost(ctx: CanvasRenderingContext2D, text: string, alpha: number, color: string) {
  ctx.save()
  ctx.font = `900 380px -apple-system, Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = color
  ctx.globalAlpha = alpha
  ctx.fillText(text, W/2, H*0.38)
  ctx.restore()
}

function drawProgressBar(ctx: CanvasRenderingContext2D, elapsed: number, total: number, accent: string) {
  const w = Math.min(elapsed/total, 1) * W
  ctx.fillStyle = 'rgba(255,255,255,0.07)'
  ctx.fillRect(0, H-5, W, 5)
  ctx.fillStyle = accent
  ctx.fillRect(0, H-5, w, 5)
}

function drawBrand(ctx: CanvasRenderingContext2D, accent: string) {
  ctx.fillStyle = accent
  ctx.fillRect((W-W*0.26)/2, H-72, W*0.26, 2.5)
  ctx.fillStyle = 'rgba(255,255,255,0.28)'
  ctx.font = `500 18px -apple-system, Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('aprendia.store', W/2, H-44)
}

// ═══════════════════════════════════════════════════════════════════════════
// KARAOKE
// ═══════════════════════════════════════════════════════════════════════════

function drawKaraoke(ctx: CanvasRenderingContext2D, words: WordStamp[], elapsed: number, accent: string) {
  if (!words.length) return

  // Last word whose start has passed
  let cur = -1
  for (let i = words.length-1; i >= 0; i--) {
    if (words[i].start <= elapsed) { cur = i; break }
  }
  if (cur < 0) return

  const BEFORE = 3, AFTER = 2
  const si = Math.max(0, cur - BEFORE)
  const ei = Math.min(words.length-1, cur + AFTER)
  const win = words.slice(si, ei+1)

  const FS = 29
  const GAP = 9
  ctx.font = `700 ${FS}px -apple-system, Arial, sans-serif`

  const widths = win.map(w => ctx.measureText(w.word).width + GAP)
  const totalW = widths.reduce((s,w)=>s+w,0) - GAP

  if (totalW === 0) return

  let x = (W - Math.min(totalW, W*0.88)) / 2
  const y = H * 0.808

  // Pill background for whole line
  ctx.save()
  ctx.fillStyle = 'rgba(0,0,0,0.45)'
  rrect(ctx, x-10, y-FS+2, Math.min(totalW,W*0.88)+20, FS+12, 8)
  ctx.fill()
  ctx.restore()

  win.forEach((w, i) => {
    const wi = si + i
    const isCur  = wi === cur
    const isPast = wi < cur

    if (isCur) {
      // Highlight pill
      ctx.save()
      ctx.fillStyle = accent+'44'
      rrect(ctx, x-5, y-FS+2, widths[i]-GAP+10, FS+12, 6)
      ctx.fill()
      ctx.restore()
      ctx.fillStyle = accent
      ctx.font = `800 ${FS}px -apple-system, Arial, sans-serif`
    } else {
      ctx.fillStyle = isPast ? 'rgba(255,255,255,0.52)' : 'rgba(255,255,255,0.22)'
      ctx.font = `700 ${FS}px -apple-system, Arial, sans-serif`
    }
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
    ctx.fillText(w.word, x, y)
    x += widths[i]
  })
}

// ═══════════════════════════════════════════════════════════════════════════
// HEADLINE TEXT CARD
// ═══════════════════════════════════════════════════════════════════════════

function drawHeadline(
  ctx: CanvasRenderingContext2D,
  text: string, progress: number, accent: string,
  style: 'stagger' | 'scale' | 'typewriter' | 'slide'
) {
  const tP = Math.max(0, (progress - 0.32) / 0.3)
  if (tP <= 0) return

  const words = text.split(' ')
  const y = H * 0.655
  const cardW = W * 0.84
  const cardX = (W - cardW) / 2

  // Card
  ctx.save()
  ctx.globalAlpha = Math.min(tP, 1) * 0.9
  ctx.fillStyle = 'rgba(0,0,0,0.55)'
  rrect(ctx, cardX, y-74, cardW, 140, 18)
  ctx.fill()
  // Left accent bar
  ctx.fillStyle = accent
  rrect(ctx, cardX, y-74, 5, 140, 4)
  ctx.fill()
  ctx.restore()

  ctx.save()
  const FS = text.length > 40 ? 31 : text.length > 25 ? 35 : 40

  if (style === 'stagger') {
    // Words stagger in one by one
    words.forEach((w, i) => {
      const wP = Math.min(Math.max((tP - i*0.09)/0.22, 0), 1)
      if (wP <= 0) return
      ctx.globalAlpha = easeOutCubic(wP)
    })
    ctx.globalAlpha = Math.min(tP, 1)
    ctx.fillStyle = '#FFFFFF'
    ctx.font = `800 ${FS}px -apple-system, Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    wrapText(ctx, text, W/2, y-4, cardW*0.88, FS*1.3)

  } else if (style === 'scale') {
    const sc = 0.4 + 0.6 * easeOutBack(Math.min(tP, 1))
    ctx.translate(W/2, y-4)
    ctx.scale(sc, sc)
    ctx.translate(-W/2, -(y-4))
    ctx.globalAlpha = Math.min(tP*2, 1)
    ctx.fillStyle = '#FFFFFF'
    ctx.font = `900 ${FS}px -apple-system, Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    wrapText(ctx, text, W/2, y-4, cardW*0.88, FS*1.3)

  } else if (style === 'typewriter') {
    const chars = Math.floor(easeInOutCubic(Math.min(tP,1)) * text.length)
    const shown = text.slice(0, chars) + (chars < text.length ? '▌' : '')
    ctx.globalAlpha = 1
    ctx.fillStyle = '#FFFFFF'
    ctx.font = `700 ${FS}px 'Courier New', monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    wrapText(ctx, shown, W/2, y-4, cardW*0.88, FS*1.35)

  } else { // slide
    const offY = (1 - easeOutCubic(Math.min(tP,1))) * 40
    ctx.translate(0, offY)
    ctx.globalAlpha = Math.min(tP*1.8, 1)
    ctx.fillStyle = '#FFFFFF'
    ctx.font = `800 ${FS}px -apple-system, Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    wrapText(ctx, text, W/2, y-4, cardW*0.88, FS*1.3)
  }
  ctx.restore()
}

// ═══════════════════════════════════════════════════════════════════════════
// SCENE RENDERERS
// ═══════════════════════════════════════════════════════════════════════════

function renderHook(
  ctx: CanvasRenderingContext2D,
  scene: Scene, sceneIdx: number,
  lp: number, elapsed: number,
  accent: string
) {
  drawBackground(ctx, accent)

  // Shockwave ring at center on entrance
  if (lp < 0.4) {
    const rP = lp / 0.4
    const radius = rP * W * 0.7
    ctx.save()
    ctx.strokeStyle = accent
    ctx.lineWidth = 3 * (1 - rP)
    ctx.globalAlpha = (1 - rP) * 0.6
    ctx.beginPath(); ctx.arc(W/2, H*0.4, radius, 0, Math.PI*2); ctx.stroke()
    ctx.restore()
  }

  // Emojis: spin + scale in
  const ep = Math.min(lp / 0.42, 1)
  const scale = easeOutBack(ep)
  const spinRad = (1 - easeOutCubic(ep)) * Math.PI * 4 // 2 full spins

  const n = scene.emojis.length
  const emojiSz = n === 1 ? 155 : 120
  const emojiY  = H * 0.41

  scene.emojis.forEach((em, i) => {
    const slotW = (W*0.78)/n
    const ex = W*0.11 + slotW*i + slotW/2
    ctx.save()
    ctx.translate(ex, emojiY)
    ctx.rotate(spinRad)
    ctx.scale(scale, scale)
    ctx.font = `${emojiSz}px serif`
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(em, 0, 0)
    ctx.restore()
  })

  // Breathe pulse after landing
  if (ep >= 1) {
    const pulse = 1 + Math.sin(elapsed*3) * 0.025
    scene.emojis.forEach((em, i) => {
      const slotW = (W*0.78)/n
      const ex = W*0.11 + slotW*i + slotW/2
      ctx.save()
      ctx.translate(ex, emojiY)
      ctx.scale(pulse, pulse)
      ctx.font = `${emojiSz}px serif`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(em, 0, 0)
      ctx.restore()
    })
  }

  drawHeadline(ctx, scene.text, lp, accent, 'stagger')
}

function renderProblem(
  ctx: CanvasRenderingContext2D,
  scene: Scene, sceneIdx: number,
  lp: number, elapsed: number,
  accent: string
) {
  drawBackground(ctx, accent)
  drawGhost(ctx, '!', 0.055, '#F9731633')

  const n = scene.emojis.length
  const emojiSz = n === 1 ? 140 : 110
  const emojiY  = H * 0.41

  // Slide in from RIGHT
  const ep = Math.min(lp / 0.4, 1)
  const slideX = (1 - easeOutBack(ep)) * W * 0.7

  scene.emojis.forEach((em, i) => {
    const slotW = (W*0.78)/n
    const ex = W*0.11 + slotW*i + slotW/2
    // Shake after landing
    const shake = ep >= 1 && lp < 0.55
      ? Math.sin(elapsed * 28) * 5 * (1 - (lp - 0.4)/0.15)
      : 0
    ctx.save()
    ctx.translate(ex + slideX + shake, emojiY)
    ctx.scale(1, 1)
    ctx.font = `${emojiSz}px serif`
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(em, 0, 0)
    ctx.restore()
  })

  // Arrow between emojis
  if (n > 1 && ep > 0.85) {
    const aP = (ep - 0.85) / 0.15
    ctx.save()
    ctx.globalAlpha = aP * 0.8
    ctx.strokeStyle = accent; ctx.lineWidth = 3; ctx.lineCap = 'round'
    ctx.setLineDash([8,5])
    for (let i = 0; i < n-1; i++) {
      const slotW = (W*0.78)/n
      const x1 = W*0.11 + slotW*i + slotW/2 + emojiSz*0.42
      const x2 = W*0.11 + slotW*(i+1) + slotW/2 - emojiSz*0.42
      ctx.beginPath(); ctx.moveTo(x1, emojiY); ctx.lineTo(x2-14, emojiY); ctx.stroke()
      ctx.setLineDash([])
      ctx.beginPath(); ctx.moveTo(x2-14, emojiY-9); ctx.lineTo(x2, emojiY); ctx.lineTo(x2-14, emojiY+9); ctx.stroke()
      ctx.setLineDash([8,5])
    }
    ctx.setLineDash([]); ctx.restore()
  }

  drawHeadline(ctx, scene.text, lp, accent, 'slide')
}

function renderInsight(
  ctx: CanvasRenderingContext2D,
  scene: Scene, sceneIdx: number,
  lp: number, elapsed: number,
  accent: string,
  burst: BurstParticle[]
) {
  drawBackground(ctx, accent)
  // Gold star ghost
  drawGhost(ctx, '✦', 0.05, '#F59E0B44')

  const n = scene.emojis.length
  const emojiSz = n === 1 ? 148 : 115
  const emojiY  = H * 0.40

  // Scale in with elastic bounce
  const ep = Math.min(lp / 0.38, 1)
  const scale = easeOutElastic(ep)

  scene.emojis.forEach((em, i) => {
    const slotW = (W*0.78)/n
    const ex = W*0.11 + slotW*i + slotW/2
    ctx.save()
    ctx.translate(ex, emojiY)
    ctx.scale(scale, scale)
    ctx.font = `${emojiSz}px serif`
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(em, 0, 0)
    ctx.restore()
  })

  // Orbiting dots (after landing)
  if (ep >= 1) {
    const NUM_DOTS = 5
    for (let d = 0; d < NUM_DOTS; d++) {
      const angle = elapsed * 1.8 + (Math.PI*2*d/NUM_DOTS)
      const orbitR = n === 1 ? 105 : 80
      const cx = W/2
      const dx = cx + Math.cos(angle) * orbitR
      const dy = emojiY + Math.sin(angle) * orbitR * 0.55
      ctx.beginPath(); ctx.arc(dx, dy, 5, 0, Math.PI*2)
      ctx.fillStyle = accent
      ctx.globalAlpha = 0.55
      ctx.fill()
      ctx.globalAlpha = 1
    }
  }

  drawHeadline(ctx, scene.text, lp, accent, 'stagger')
}

function renderStep(
  ctx: CanvasRenderingContext2D,
  scene: Scene, sceneIdx: number,
  lp: number, elapsed: number,
  accent: string
) {
  drawBackground(ctx, accent)

  // Ghost step number
  const stepNum = sceneIdx.toString().padStart(2,'0')
  ctx.save()
  ctx.font = `900 360px -apple-system, Arial, sans-serif`
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillStyle = 'rgba(255,255,255,0.035)'
  ctx.fillText(stepNum, W/2, H*0.36)
  ctx.restore()

  // Step pill top-right
  const ppP = Math.min(lp/0.35, 1)
  if (ppP > 0) {
    ctx.save()
    ctx.globalAlpha = easeOutCubic(ppP)
    ctx.fillStyle = accent+'22'
    rrect(ctx, W-100, 50, 80, 36, 18)
    ctx.fill()
    ctx.fillStyle = accent
    ctx.font = `700 20px -apple-system, Arial, sans-serif`
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(stepNum, W-60, 68)
    ctx.restore()
  }

  const n = scene.emojis.length
  const emojiSz = n === 1 ? 142 : 112
  const emojiY  = H * 0.42

  // Slide UP from below with bounce
  const ep = Math.min(lp / 0.45, 1)
  const offY = (1 - easeOutBounce(ep)) * H * 0.28

  scene.emojis.forEach((em, i) => {
    const slotW = (W*0.78)/n
    const ex = W*0.11 + slotW*i + slotW/2
    // Gentle bob after landing
    const bob = ep >= 1 ? Math.sin(elapsed*2.2)*6 : 0
    ctx.save()
    ctx.translate(ex, emojiY + offY + bob)
    ctx.font = `${emojiSz}px serif`
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(em, 0, 0)
    ctx.restore()
  })

  drawHeadline(ctx, scene.text, lp, accent, 'slide')
}

function renderResult(
  ctx: CanvasRenderingContext2D,
  scene: Scene, sceneIdx: number,
  lp: number, elapsed: number,
  accent: string
) {
  drawBackground(ctx, accent)
  // Green burst glow
  const g2 = ctx.createRadialGradient(W/2, H*0.42, 0, W/2, H*0.42, W*0.55)
  g2.addColorStop(0, accent+'35')
  g2.addColorStop(1, 'transparent')
  ctx.fillStyle = g2; ctx.fillRect(0,0,W,H)

  const n = scene.emojis.length
  const emojiSz = n === 1 ? 148 : 112
  const emojiY  = H * 0.42

  // Drop from top with bounce
  const ep  = Math.min(lp / 0.5, 1)
  const offY = (1 - easeOutBounce(ep)) * (-H * 0.35)

  scene.emojis.forEach((em, i) => {
    const slotW = (W*0.78)/n
    const ex = W*0.11 + slotW*i + slotW/2
    ctx.save()
    ctx.translate(ex, emojiY + offY)
    // Impact squish: scaleY < 1 on landing
    const squish = ep > 0.7 && ep < 0.85
      ? 1 - (Math.sin((ep-0.7)/0.15*Math.PI))*0.18
      : 1
    ctx.scale(1, squish)
    ctx.font = `${emojiSz}px serif`
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(em, 0, 0)
    ctx.restore()
  })

  // Impact ripple on landing
  if (ep > 0.7) {
    const rP = Math.min((ep - 0.7) / 0.3, 1)
    ctx.save()
    ctx.strokeStyle = accent
    ctx.lineWidth = 3 * (1 - rP)
    ctx.globalAlpha = (1 - rP) * 0.5
    ctx.beginPath(); ctx.arc(W/2, emojiY+emojiSz*0.45, rP*120, 0, Math.PI*2); ctx.stroke()
    ctx.restore()
  }

  drawHeadline(ctx, scene.text, lp, accent, 'scale')
}

function renderCTA(
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  lp: number, elapsed: number,
  accent: string
) {
  drawBackground(ctx, accent)

  // Pulsing concentric rings from center
  for (let r = 0; r < 3; r++) {
    const phase = ((elapsed / 2.0) + r/3) % 1
    const radius = 50 + phase * 260
    const alpha = (1 - phase) * 0.35
    ctx.beginPath(); ctx.arc(W/2, H*0.40, radius, 0, Math.PI*2)
    ctx.strokeStyle = accent; ctx.lineWidth = 2.5; ctx.globalAlpha = alpha; ctx.stroke()
  }
  ctx.globalAlpha = 1

  // "SIGUE Y COMENTA" label above emojis
  const labelP = Math.min(Math.max((lp-0.2)/0.3, 0), 1)
  if (labelP > 0) {
    ctx.save()
    ctx.globalAlpha = easeOutCubic(labelP)
    ctx.fillStyle = accent
    ctx.font = `800 24px -apple-system, Arial, sans-serif`
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.letterSpacing = '3px'
    ctx.fillText('SIGUE Y COMENTA', W/2, H*0.29)
    ctx.letterSpacing = '0px'
    ctx.restore()
  }

  const n = scene.emojis.length
  const emojiSz = n === 1 ? 145 : 115
  const emojiY  = H * 0.41

  const ep = Math.min(lp / 0.40, 1)
  const sc = easeOutBack(ep)

  scene.emojis.forEach((em, i) => {
    const slotW = (W*0.78)/n
    const ex = W*0.11 + slotW*i + slotW/2
    const bob = ep >= 1 ? Math.sin(elapsed*2.5 + i*1.2) * 8 : 0
    ctx.save()
    ctx.translate(ex, emojiY + bob)
    ctx.scale(sc, sc)
    ctx.font = `${emojiSz}px serif`
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(em, 0, 0)
    ctx.restore()
  })

  // CLUB badge
  if (lp > 0.5) {
    const bp = Math.min((lp-0.5)/0.25, 1)
    ctx.save()
    ctx.globalAlpha = easeOutCubic(bp)
    ctx.fillStyle = accent
    rrect(ctx, W/2-52, H*0.6-22, 104, 44, 22)
    ctx.fill()
    ctx.fillStyle = '#080D1A'
    ctx.font = `900 24px -apple-system, Arial, sans-serif`
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('CLUB', W/2, H*0.6)
    ctx.restore()
  }

  // Typewriter text
  drawHeadline(ctx, scene.text, lp, accent, 'typewriter')
}

// ═══════════════════════════════════════════════════════════════════════════
// FULL SCENE DISPATCHER
// ═══════════════════════════════════════════════════════════════════════════

function drawScene(
  ctx: CanvasRenderingContext2D,
  scene: Scene, sceneIdx: number,
  lp: number, elapsed: number,
  burst: BurstParticle[],
  ambient: AmbientParticle[]
) {
  const accent = SCENE_COLORS[scene.sceneType as SceneType] ?? '#00E5A0'

  switch (scene.sceneType as SceneType) {
    case 'hook':    renderHook(ctx, scene, sceneIdx, lp, elapsed, accent);             break
    case 'problem': renderProblem(ctx, scene, sceneIdx, lp, elapsed, accent);         break
    case 'insight': renderInsight(ctx, scene, sceneIdx, lp, elapsed, accent, burst);  break
    case 'step':    renderStep(ctx, scene, sceneIdx, lp, elapsed, accent);            break
    case 'result':  renderResult(ctx, scene, sceneIdx, lp, elapsed, accent);          break
    case 'cta':     renderCTA(ctx, scene, lp, elapsed, accent);                       break
    default:        renderInsight(ctx, scene, sceneIdx, lp, elapsed, accent, burst);  break
  }

  tickAmbient(ctx, ambient, accent)
  tickBurst(ctx, burst)
  drawBrand(ctx, accent)
}

// ═══════════════════════════════════════════════════════════════════════════
// TRANSITIONS
// ═══════════════════════════════════════════════════════════════════════════

function renderTransition(
  ctx: CanvasRenderingContext2D,
  fromScene: Scene, fromIdx: number,
  toScene: Scene,   toIdx: number,
  tp: number, type: number,
  elapsed: number, burst: BurstParticle[], ambient: AmbientParticle[]
) {
  const ease = easeInOutCubic(tp)

  if (type % 3 === 0) {
    // ── Slide up: next scene slides up from bottom ─────────────────────────
    drawScene(ctx, fromScene, fromIdx, 1, elapsed, burst, ambient)
    ctx.save()
    ctx.translate(0, H * (1 - ease))
    drawScene(ctx, toScene, toIdx, 0, elapsed, burst, ambient)
    ctx.restore()

  } else if (type % 3 === 1) {
    // ── Circle expand from center ──────────────────────────────────────────
    drawScene(ctx, fromScene, fromIdx, 1, elapsed, burst, ambient)
    ctx.save()
    ctx.beginPath()
    ctx.arc(W/2, H/2, ease * H * 1.5, 0, Math.PI*2)
    ctx.clip()
    drawScene(ctx, toScene, toIdx, 0, elapsed, burst, ambient)
    ctx.restore()

  } else {
    // ── Flash white ────────────────────────────────────────────────────────
    if (tp < 0.45) {
      drawScene(ctx, fromScene, fromIdx, 1, elapsed, burst, ambient)
      ctx.fillStyle = `rgba(255,255,255,${tp/0.45 * 0.9})`
      ctx.fillRect(0,0,W,H)
    } else {
      drawScene(ctx, toScene, toIdx, 0, elapsed, burst, ambient)
      ctx.fillStyle = `rgba(255,255,255,${(1-tp)/0.55 * 0.9})`
      ctx.fillRect(0,0,W,H)
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN RENDER FRAME
// ═══════════════════════════════════════════════════════════════════════════

function renderFrame(
  ctx: CanvasRenderingContext2D,
  scenes: Scene[], words: WordStamp[],
  elapsed: number, state: AnimState
) {
  const { sceneTimings, totalDuration, ambient, burst } = state

  // Find current scene
  let sceneIdx = scenes.length - 1
  let lp = 1
  let inTrans = false
  let transP  = 0
  let transType = 0

  for (let i = 0; i < sceneTimings.length; i++) {
    const { start, end } = sceneTimings[i]
    if (elapsed >= start && elapsed < end) {
      sceneIdx = i
      const timeIn = elapsed - start
      const dur    = end - start
      lp = timeIn / dur

      if (i < scenes.length-1 && timeIn > dur - TRANS_DUR) {
        inTrans   = true
        transP    = (timeIn - (dur - TRANS_DUR)) / TRANS_DUR
        transType = i
      }
      break
    }
  }

  // Trigger burst when scene changes
  if (sceneIdx !== state.lastScene) {
    const n  = scenes[sceneIdx].emojis.length
    const cx = W / 2
    const cy = H * 0.41
    triggerBurst(burst, cx, cy, SCENE_COLORS[scenes[sceneIdx].sceneType as SceneType] ?? '#00E5A0')
    state.lastScene = sceneIdx
  }

  const accent = SCENE_COLORS[scenes[sceneIdx].sceneType as SceneType] ?? '#00E5A0'

  if (inTrans && sceneIdx < scenes.length-1) {
    renderTransition(ctx, scenes[sceneIdx], sceneIdx, scenes[sceneIdx+1], sceneIdx+1, Math.min(transP,1), transType, elapsed, burst, ambient)
  } else {
    drawScene(ctx, scenes[sceneIdx], sceneIdx, lp, elapsed, burst, ambient)
  }

  drawKaraoke(ctx, words, elapsed, accent)
  drawProgressBar(ctx, elapsed, totalDuration, accent)
}

// ═══════════════════════════════════════════════════════════════════════════
// SPINNER
// ═══════════════════════════════════════════════════════════════════════════

function Spinner({ color='#6366F1' }: { color?: string }) {
  return (
    <span style={{
      display:'inline-block', width:16, height:16,
      border:`2.5px solid ${color}`, borderTopColor:'transparent',
      borderRadius:'50%', animation:'spin .75s linear infinite', flexShrink:0,
    }}/>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// REACT COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

type Step = 'select' | 'loading' | 'ready' | 'recording' | 'done'

export function AnimatedVideoCreator({ onClose }: { onClose: () => void }) {
  const [step,        setStep]        = useState<Step>('select')
  const [selectedKey, setSelectedKey] = useState('historia')
  const [customTopic, setCustomTopic] = useState('')
  const [error,       setError]       = useState('')
  const [videoData,   setVideoData]   = useState<VideoData | null>(null)
  const [downloadUrl, setDownloadUrl] = useState('')
  const [progress,    setProgress]    = useState(0)

  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const rafRef      = useRef<number>(0)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef   = useRef<Blob[]>([])
  const animRef     = useRef<AnimState | null>(null)
  const isCustom    = selectedKey === 'custom'

  // ── Generate ──────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    setStep('loading'); setError('')
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
    } catch (e) { setError(String(e)); setStep('select') }
  }

  // ── Record ────────────────────────────────────────────────────────────────
  const handleRecord = useCallback(async () => {
    if (!videoData || !canvasRef.current) return
    setStep('recording')
    chunksRef.current = []

    const bytes    = Uint8Array.from(atob(videoData.audioBase64), c => c.charCodeAt(0)).buffer
    const audioCtx = new AudioContext()
    const audioBuf = await audioCtx.decodeAudioData(bytes)
    const totalDur = audioBuf.duration

    // Scene timings
    const totalEst  = videoData.scenes.reduce((s, sc) => s + sc.duration, 0)
    const timings   = videoData.scenes.map((sc, i) => {
      let start = 0
      for (let j = 0; j < i; j++) start += (videoData.scenes[j].duration / totalEst) * totalDur
      return { start, end: start + (sc.duration / totalEst) * totalDur }
    })

    animRef.current = {
      ambient: initAmbient(),
      burst: [],
      lastScene: -1,
      sceneTimings: timings,
      totalDuration: totalDur,
    }

    // Audio routing
    const dest   = audioCtx.createMediaStreamDestination()
    const source = audioCtx.createBufferSource()
    source.buffer = audioBuf
    source.connect(dest)
    source.connect(audioCtx.destination)

    const canvas  = canvasRef.current
    const combined = new MediaStream([
      ...canvas.captureStream(30).getVideoTracks(),
      ...dest.stream.getAudioTracks(),
    ])
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
      ? 'video/webm;codecs=vp8,opus' : 'video/webm'

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

    const ctx      = canvas.getContext('2d')!
    const startT   = performance.now()

    const animate  = () => {
      const elapsed = (performance.now() - startT) / 1000
      if (elapsed >= totalDur) {
        renderFrame(ctx, videoData.scenes, videoData.wordTimestamps, totalDur, animRef.current!)
        recorder.stop()
        return
      }
      renderFrame(ctx, videoData.scenes, videoData.wordTimestamps, elapsed, animRef.current!)
      setProgress(elapsed / totalDur)
      rafRef.current = requestAnimationFrame(animate)
    }
    animate()
  }, [videoData])

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.68)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>

      <div style={{ background:'#fff', borderRadius:20, width:'100%', maxWidth:900, maxHeight:'96vh', overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 32px 100px rgba(0,0,0,.35)' }}>

        {/* Header */}
        <div style={{ padding:'16px 22px', borderBottom:'1px solid #F1F5F9', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div>
            <div style={{ fontWeight:800, fontSize:'1rem', color:'#0F172A', fontFamily:"'Syne',sans-serif" }}>🎬 Vídeo explicativo IA</div>
            <div style={{ fontSize:'.73rem', color:'#94A3B8', marginTop:1 }}>6 tipos de escena · transiciones · karaoke sincronizado con voz</div>
          </div>
          <button onClick={onClose} style={{ background:'#F1F5F9', border:'none', borderRadius:8, padding:'7px 12px', cursor:'pointer', fontSize:13, color:'#64748B' }}>✕</button>
        </div>

        <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

          {/* Left panel */}
          <div style={{ width:300, borderRight:'1px solid #F1F5F9', padding:18, overflowY:'auto', flexShrink:0, display:'flex', flexDirection:'column', gap:14 }}>

            {(step === 'select' || step === 'ready') && (
              <>
                <div style={{ fontSize:'.7rem', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'.06em' }}>Tema</div>
                <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                  {TOPICS.map(t => (
                    <button key={t.key} onClick={() => step==='select' && setSelectedKey(t.key)} style={{
                      textAlign:'left', padding:'9px 11px', borderRadius:9, cursor:step==='ready'?'default':'pointer',
                      border: selectedKey===t.key ? '2px solid #6366F1' : '1.5px solid #E2E8F0',
                      background: selectedKey===t.key ? 'rgba(99,102,241,.06)' : '#FAFAFA',
                      opacity: step==='ready' && selectedKey!==t.key ? 0.35 : 1, transition:'all .12s',
                    }}>
                      <div style={{ fontWeight:700, fontSize:'.78rem', color:selectedKey===t.key?'#6366F1':'#0F172A' }}>{t.label}</div>
                      <div style={{ fontSize:'.68rem', color:'#94A3B8', marginTop:2 }}>{t.desc}</div>
                    </button>
                  ))}
                  <button onClick={() => step==='select' && setSelectedKey('custom')} style={{
                    textAlign:'left', padding:'9px 11px', borderRadius:9, cursor:step==='ready'?'default':'pointer',
                    border: isCustom ? '2px solid #6366F1' : '1.5px solid #E2E8F0',
                    background: isCustom ? 'rgba(99,102,241,.06)' : '#FAFAFA',
                    opacity: step==='ready' && !isCustom ? 0.35 : 1,
                  }}>
                    <div style={{ fontWeight:700, fontSize:'.78rem', color:isCustom?'#6366F1':'#0F172A' }}>✏️ Personalizado</div>
                    <div style={{ fontSize:'.68rem', color:'#94A3B8', marginTop:2 }}>Describe el tema</div>
                  </button>

                  {isCustom && step!=='ready' && (
                    <textarea value={customTopic} onChange={e=>setCustomTopic(e.target.value)} placeholder="Ej: Cómo uso IA para mejorar mis notas..." rows={3}
                      style={{ padding:'9px 11px', borderRadius:9, border:'1.5px solid #E2E8F0', fontSize:12, fontFamily:'inherit', resize:'none', outline:'none', color:'#0F172A' }}/>
                  )}
                </div>

                {error && <div style={{ fontSize:12, color:'#EF4444', fontWeight:600 }}>{error}</div>}

                {step==='select' && (
                  <button onClick={handleGenerate} disabled={isCustom&&!customTopic.trim()} style={{
                    padding:'11px', borderRadius:10, border:'none', cursor:'pointer',
                    background:'linear-gradient(135deg, #6366F1, #8B5CF6)',
                    color:'#fff', fontSize:13, fontWeight:700,
                    opacity:(isCustom&&!customTopic.trim())?0.5:1,
                  }}>
                    Generar guión y voz →
                  </button>
                )}
              </>
            )}

            {step==='loading' && (
              <div style={{ display:'flex', flexDirection:'column', gap:14, alignItems:'center', padding:'28px 0' }}>
                <Spinner/>
                <div style={{ fontSize:12.5, color:'#64748B', textAlign:'center', lineHeight:1.6 }}>
                  <strong>Claude</strong> genera el guión y las escenas...<br/>
                  <span style={{ color:'#94A3B8' }}>ElevenLabs sintetiza la voz con timestamps</span>
                </div>
              </div>
            )}

            {step==='ready' && videoData && (
              <>
                <div style={{ background:'#F0FDF4', borderRadius:9, padding:'10px 13px', fontSize:11.5, color:'#16A34A', fontWeight:600, lineHeight:1.5 }}>
                  ✅ {videoData.scenes.length} escenas · voz sincronizada lista<br/>
                  <span style={{ color:'#64748B', fontWeight:400 }}>Pulsa grabar. La animación se renderiza en tiempo real.</span>
                </div>
                <button onClick={handleRecord} style={{ padding:'12px', borderRadius:10, border:'none', background:'#0F172A', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                  ⏺ Grabar vídeo
                </button>
                <div>
                  <div style={{ fontSize:'.68rem', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:6 }}>Guión</div>
                  <p style={{ fontSize:11, color:'#475569', lineHeight:1.7, margin:0 }}>{videoData.script}</p>
                </div>
              </>
            )}

            {step==='recording' && (
              <div style={{ display:'flex', flexDirection:'column', gap:12, alignItems:'center', padding:'22px 0' }}>
                <Spinner color="#EF4444"/>
                <div style={{ fontSize:13, color:'#64748B', textAlign:'center', fontWeight:600 }}>Grabando animación...</div>
                <div style={{ width:'100%', height:7, background:'#F1F5F9', borderRadius:4, overflow:'hidden' }}>
                  <div style={{ height:'100%', background:'linear-gradient(90deg,#6366F1,#00E5A0)', borderRadius:4, width:`${progress*100}%`, transition:'width .25s' }}/>
                </div>
                <div style={{ fontSize:11, color:'#94A3B8' }}>{Math.round(progress*100)}%</div>
              </div>
            )}

            {step==='done' && downloadUrl && (
              <div style={{ display:'flex', flexDirection:'column', gap:11 }}>
                <div style={{ background:'#F0FDF4', borderRadius:9, padding:'10px 13px', fontSize:12, color:'#16A34A', fontWeight:600 }}>✅ ¡Vídeo listo!</div>
                <a href={downloadUrl} download={`aprendia-${Date.now()}.webm`}
                  style={{ display:'block', textAlign:'center', padding:'12px', borderRadius:10, background:'#0F172A', color:'#fff', fontSize:13, fontWeight:700, textDecoration:'none' }}>
                  ⬇ Descargar WebM
                </a>
                <button onClick={()=>{ setStep('select'); setVideoData(null); setDownloadUrl(''); setProgress(0) }}
                  style={{ padding:'11px', borderRadius:10, border:'1.5px solid #E2E8F0', background:'#fff', fontSize:13, fontWeight:600, color:'#64748B', cursor:'pointer' }}>
                  Crear otro vídeo
                </button>
              </div>
            )}
          </div>

          {/* Canvas */}
          <div style={{ flex:1, background:'#060810', display:'flex', alignItems:'center', justifyContent:'center', padding:18, position:'relative' }}>
            <canvas ref={canvasRef} width={W} height={H}
              style={{ display:'block', borderRadius:14, maxHeight:'74vh', width:'auto', boxShadow:'0 20px 72px rgba(0,0,0,.7)' }}/>

            {(step==='select'||step==='loading') && (
              <div style={{ position:'absolute', inset:18, borderRadius:14, background:'linear-gradient(160deg,#080D1A,#0C1525)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:14 }}>
                <div style={{ fontSize:'3rem' }}>🎬</div>
                <div style={{ fontSize:13, color:'rgba(255,255,255,.3)', textAlign:'center', lineHeight:1.5 }}>
                  {step==='loading' ? <><Spinner color="#00E5A0"/> <span style={{marginLeft:8}}>Generando...</span></> : 'La animación aparece aquí durante la grabación'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
