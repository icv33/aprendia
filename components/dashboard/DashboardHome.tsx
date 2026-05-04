'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

type Order = {
  amount: number
  created_at: string
  customer_name?: string | null
  customer_email?: string | null
  status: string
  pdf_sent?: boolean
}

type Props = {
  orders: Order[]
  pendingContent: number
}

type Period = '7d' | '30d' | 'all'

function fmt(n: number) {
  return n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '€'
}

function packFromAmount(amount: number): 'starter' | 'pro' | 'elite' {
  if (amount >= 90) return 'elite'
  if (amount >= 30) return 'pro'
  return 'starter'
}

function computeData(paidOrders: Order[], period: Period, pendingContent: number) {
  const now = new Date()
  const todayStr = now.toDateString()
  const hoy = paidOrders.filter((o) => new Date(o.created_at).toDateString() === todayStr).length
  const pendingPdf = paidOrders.filter((o) => !o.pdf_sent).length

  if (period === '7d') {
    const days: string[] = []
    const ingr_series: number[] = []
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      d.setHours(0, 0, 0, 0)
      const next = new Date(d)
      next.setDate(next.getDate() + 1)
      days.push(dayNames[d.getDay()])
      const rev = paidOrders
        .filter((o) => { const od = new Date(o.created_at); return od >= d && od < next })
        .reduce((s, o) => s + o.amount, 0)
      ingr_series.push(rev)
    }

    const cutoff = new Date(now)
    cutoff.setDate(cutoff.getDate() - 6)
    cutoff.setHours(0, 0, 0, 0)
    const filtered = paidOrders.filter((o) => new Date(o.created_at) >= cutoff)

    return {
      kpis: { ingr: filtered.reduce((s, o) => s + o.amount, 0), ventas: filtered.length, hoy, pend: pendingPdf },
      packs: computePacks(filtered),
      days, ingr_series,
    }
  }

  if (period === '30d') {
    const cutoff = new Date(now)
    cutoff.setDate(cutoff.getDate() - 29)
    cutoff.setHours(0, 0, 0, 0)
    const days: string[] = []
    const ingr_series: number[] = []

    for (let w = 0; w < 4; w++) {
      const start = new Date(cutoff)
      start.setDate(start.getDate() + w * 7)
      const end = new Date(start)
      end.setDate(end.getDate() + 7)
      const monthShort = start.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
      days.push(monthShort)
      const rev = paidOrders
        .filter((o) => { const d = new Date(o.created_at); return d >= start && d < end })
        .reduce((s, o) => s + o.amount, 0)
      ingr_series.push(rev)
    }

    const filtered = paidOrders.filter((o) => new Date(o.created_at) >= cutoff)
    return {
      kpis: { ingr: filtered.reduce((s, o) => s + o.amount, 0), ventas: filtered.length, hoy, pend: pendingPdf },
      packs: computePacks(filtered),
      days, ingr_series,
    }
  }

  // all — last 6 months
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const days: string[] = []
  const ingr_series: number[] = []

  for (let m = 5; m >= 0; m--) {
    const d = new Date(now.getFullYear(), now.getMonth() - m, 1)
    const nextM = new Date(d.getFullYear(), d.getMonth() + 1, 1)
    days.push(monthNames[d.getMonth()])
    const rev = paidOrders
      .filter((o) => { const od = new Date(o.created_at); return od >= d && od < nextM })
      .reduce((s, o) => s + o.amount, 0)
    ingr_series.push(rev)
  }

  return {
    kpis: { ingr: paidOrders.reduce((s, o) => s + o.amount, 0), ventas: paidOrders.length, hoy, pend: pendingPdf },
    packs: computePacks(paidOrders),
    days, ingr_series,
  }
}

function computePacks(orders: Order[]) {
  const packs = { starter: 0, pro: 0, elite: 0 }
  orders.forEach((o) => { packs[packFromAmount(o.amount)]++ })
  return packs
}

function Chart({ days, ingr_series }: { days: string[]; ingr_series: number[] }) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string } | null>(null)
  const W = 500, H = 160
  const n = ingr_series.length
  const maxI = Math.max(...ingr_series, 10)

  const pts = ingr_series.map((v, i) => ({
    x: n > 1 ? (i / (n - 1)) * W : W / 2,
    y: H - (v / maxI) * H * 0.82 - 8,
  }))

  function polyLine(points: { x: number; y: number }[]) {
    if (points.length === 0) return ''
    if (points.length === 1) return `M${points[0].x},${points[0].y}`
    let d = `M${points[0].x},${points[0].y}`
    for (let i = 1; i < points.length; i++) {
      const cp1x = (points[i - 1].x + points[i].x) / 2
      d += ` C${cp1x},${points[i - 1].y} ${cp1x},${points[i].y} ${points[i].x},${points[i].y}`
    }
    return d
  }

  const linePath = polyLine(pts)
  const areaPath = pts.length > 0
    ? linePath + ` L${pts[pts.length - 1].x},${H} L${pts[0].x},${H} Z`
    : ''

  const yTop = Math.ceil(maxI / 5) * 5
  const yLabels = [yTop, Math.round(yTop * 0.75), Math.round(yTop * 0.5), Math.round(yTop * 0.25), 0]

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '.68rem', color: '#94A3B8', pointerEvents: 'none' }}>
        {yLabels.map((v, i) => <span key={i}>{v}€</span>)}
      </div>
      <div style={{ marginLeft: 36, position: 'relative' }}>
        <svg style={{ width: '100%', display: 'block', overflow: 'visible' }} height={H} viewBox={`0 0 ${W} ${H}`}>
          <defs>
            <linearGradient id="gr-ingr-d" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00FFB2" stopOpacity=".18" />
              <stop offset="100%" stopColor="#00FFB2" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 40, 80, 120, 160].map((y) => (
            <line key={y} x1="0" y1={y} x2={W} y2={y} stroke="#E2E8F0" strokeWidth="1" strokeDasharray={y === 160 ? undefined : '4,4'} />
          ))}
          <path d={areaPath} fill="url(#gr-ingr-d)" />
          <path d={linePath} fill="none" stroke="#00FFB2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {pts.map((pt, i) => (
            <circle
              key={i} cx={pt.x} cy={pt.y} r="4"
              fill="#00FFB2" stroke="#fff" strokeWidth="2"
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setTooltip({ x: pt.x, y: pt.y, label: `${days[i]} · ${fmt(ingr_series[i])}` })}
              onMouseLeave={() => setTooltip(null)}
            />
          ))}
        </svg>
        {tooltip && (
          <div style={{
            position: 'absolute',
            left: `${(tooltip.x / W) * 100}%`,
            top: `${(tooltip.y / H) * 100}%`,
            transform: 'translate(-50%, -130%)',
            background: '#0F172A', color: '#fff',
            padding: '6px 10px', borderRadius: 8,
            fontSize: '.72rem', fontWeight: 600,
            fontFamily: "'Syne', sans-serif",
            pointerEvents: 'none', whiteSpace: 'nowrap', zIndex: 10,
          }}>
            {tooltip.label}
            <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', border: '5px solid transparent', borderTopColor: '#0F172A' }} />
          </div>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginLeft: 36, marginTop: 6, fontSize: '.68rem', color: '#94A3B8' }}>
        {days.map((d, i) => <span key={i}>{d}</span>)}
      </div>
    </div>
  )
}

function KpiCard({ icon, iconBg, label, value, trend }: {
  icon: string; iconBg: string; label: string; value: string; trend?: string
}) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 12, transition: 'box-shadow .2s, transform .2s', cursor: 'default' }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(15,23,42,.08)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)' }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; (e.currentTarget as HTMLDivElement).style.transform = 'none' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
          {icon}
        </div>
        {trend && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '.72rem', fontWeight: 700, fontFamily: "'Syne', sans-serif", padding: '3px 8px', borderRadius: 100, background: '#F1F5F9', color: '#64748B' }}>
            {trend}
          </div>
        )}
      </div>
      <div>
        <div style={{ fontFamily: "var(--font-space-grotesk, 'Space Grotesk', sans-serif)", fontSize: '1.85rem', fontWeight: 700, lineHeight: 1, letterSpacing: '-.02em', color: '#0F172A' }}>{value}</div>
        <div style={{ fontSize: '.78rem', color: '#64748B', marginTop: 4 }}>{label}</div>
      </div>
    </div>
  )
}

export function DashboardHome({ orders, pendingContent }: Props) {
  const [period, setPeriod] = useState<Period>('7d')
  const [copied, setCopied] = useState(false)

  const paid = useMemo(() => orders.filter((o) => o.status === 'paid'), [orders])

  const data = useMemo(() => computeData(paid, period, pendingContent), [paid, period, pendingContent])

  const recentActivity = useMemo(() =>
    [...paid]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 6),
    [paid])

  const packLabels = { starter: 'Starter', pro: 'Pro', elite: 'Élite' }
  const packColors = {
    starter: { color: '#007A40', bg: 'rgba(0,255,178,.12)' },
    pro:     { color: '#3B82F6', bg: 'rgba(59,130,246,.1)' },
    elite:   { color: '#8B5CF6', bg: 'rgba(139,92,246,.1)' },
  }
  const packPrices = { starter: '17€', pro: '37€', elite: '97€' }
  const packTotal = data.packs.starter * 17 + data.packs.pro * 37 + data.packs.elite * 97
  const packMax = Math.max(data.packs.starter, data.packs.pro, data.packs.elite, 1)
  const packBarColors = {
    starter: 'linear-gradient(90deg, #00FFB2, #00CC8F)',
    pro:     'linear-gradient(90deg, #3B82F6, #6366F1)',
    elite:   'linear-gradient(90deg, #8B5CF6, #EC4899)',
  }

  const copyLink = () => {
    navigator.clipboard.writeText('https://aprendia.store').then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const today = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <>
      {/* Topbar */}
      <header style={{ height: 60, flexShrink: 0, background: '#fff', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px' }}>
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>Resumen</div>
          <div style={{ fontSize: '.8rem', color: '#64748B' }}>Estado general de AprendIA · {today}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', gap: 2 }}>
            {(['7d', '30d', 'all'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  padding: '6px 14px', borderRadius: 8, border: 'none',
                  fontFamily: "'DM Sans', sans-serif", fontSize: '.82rem',
                  fontWeight: period === p ? 600 : 500,
                  background: period === p ? '#F1F5F9' : 'transparent',
                  color: period === p ? '#0F172A' : '#64748B',
                  cursor: 'pointer', transition: 'all .18s',
                  boxShadow: period === p ? '0 1px 3px rgba(15,23,42,.06)' : 'none',
                }}
              >
                {p === '7d' ? '7 días' : p === '30d' ? '30 días' : 'Todo'}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,255,178,.08)', border: '1px solid rgba(0,255,178,.2)', borderRadius: 100, padding: '5px 12px', fontSize: '.75rem', fontWeight: 600, color: '#00CC8F', fontFamily: "'Syne', sans-serif" }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00CC8F', animation: 'pulse-dot 2s ease-in-out infinite' }} />
            Tienda activa
          </div>
        </div>
      </header>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          <KpiCard icon="💰" iconBg="rgba(0,255,178,.12)" label="Ingresos totales" value={fmt(data.kpis.ingr)} />
          <KpiCard icon="🛒" iconBg="rgba(59,130,246,.1)"  label="Ventas totales"  value={String(data.kpis.ventas)} />
          <KpiCard icon="⚡" iconBg="rgba(139,92,246,.1)"  label="Ventas hoy"      value={String(data.kpis.hoy)} />
          <KpiCard icon="📋" iconBg="rgba(245,158,11,.1)"  label="PDFs pendientes" value={String(data.kpis.pend)} />
        </div>

        {/* Row 2: Chart + Pack breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 14 }}>

          {/* Chart */}
          <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '.95rem', color: '#0F172A' }}>Ingresos por período</div>
                <div style={{ fontSize: '.78rem', color: '#64748B', marginTop: 2 }}>
                  {period === '7d' ? 'Últimos 7 días' : period === '30d' ? 'Últimos 30 días' : 'Histórico mensual'}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.75rem', color: '#64748B' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00FFB2' }} /> Ingresos
              </div>
            </div>
            <Chart days={data.days} ingr_series={data.ingr_series} />
          </div>

          {/* Pack sales */}
          <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '.95rem', color: '#0F172A' }}>Ventas por pack</div>
              <div style={{ fontSize: '.78rem', color: '#64748B', marginTop: 2 }}>Distribución de unidades vendidas</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
              {(['elite', 'pro', 'starter'] as const).map((pack) => {
                const count = data.packs[pack]
                const pct = (count / packMax) * 100
                return (
                  <div key={pack}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div>
                        <div style={{ fontSize: '.84rem', fontWeight: 600, color: '#0F172A' }}>{packLabels[pack]}</div>
                        <div style={{ fontSize: '.72rem', color: '#64748B' }}>{packPrices[pack]} / unidad</div>
                      </div>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '.84rem', color: packColors[pack].color }}>
                        {count} {count === 1 ? 'venta' : 'ventas'}
                      </div>
                    </div>
                    <div style={{ height: 6, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: packBarColors[pack], borderRadius: 4, transition: 'width 1.2s cubic-bezier(.22,.68,0,1.2)' }} />
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{ paddingTop: 12, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '.78rem', color: '#64748B' }}>Total facturado</div>
              <div style={{ fontFamily: "var(--font-space-grotesk, 'Space Grotesk', sans-serif)", fontWeight: 700, fontSize: '1.1rem', color: '#0F172A' }}>{fmt(packTotal)}</div>
            </div>

            {/* Conversion mini */}
            <div style={{ background: 'linear-gradient(145deg, #0F172A, #1E293B)', borderRadius: 14, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,178,.12) 0%, transparent 70%)' }} />
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '.85rem', color: 'rgba(255,255,255,.6)' }}>Pack más vendido</div>
              <div style={{ fontFamily: "var(--font-space-grotesk, 'Space Grotesk', sans-serif)", fontWeight: 700, fontSize: '1.4rem', color: '#fff', letterSpacing: '-.01em' }}>
                {data.kpis.ventas === 0 ? '—' : (
                  (() => {
                    const max = Math.max(data.packs.starter, data.packs.pro, data.packs.elite)
                    if (max === 0) return '—'
                    if (data.packs.elite === max) return 'Élite 🏆'
                    if (data.packs.pro === max) return 'Pro ⚡'
                    return 'Starter 🚀'
                  })()
                )}
              </div>
              <div style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.35)' }}>
                {data.kpis.ventas === 0 ? 'Sin ventas todavía' : `${data.kpis.ventas} ${data.kpis.ventas === 1 ? 'venta' : 'ventas'} en el período`}
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Activity + Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 14 }}>

          {/* Activity */}
          <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '.95rem', color: '#0F172A' }}>Actividad reciente</div>
                <div style={{ fontSize: '.78rem', color: '#64748B', marginTop: 2 }}>Últimas ventas en tu tienda</div>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 100, fontSize: '.68rem', fontWeight: 700, fontFamily: "'Syne', sans-serif", background: 'rgba(0,255,178,.1)', color: '#00CC8F' }}>
                En vivo
              </div>
            </div>

            {recentActivity.length === 0 ? (
              <div style={{ padding: '32px 0', textAlign: 'center', color: '#94A3B8', fontSize: '.85rem' }}>
                <div style={{ fontSize: '1.6rem', marginBottom: 8 }}>📭</div>
                Sin actividad todavía
              </div>
            ) : (
              <div>
                {recentActivity.map((order, i) => {
                  const pack = packFromAmount(order.amount)
                  const { color, bg } = packColors[pack]
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '11px 0', borderBottom: i < recentActivity.length - 1 ? '1px solid #F8FAFC' : 'none' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 9, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.85rem', flexShrink: 0, marginTop: 1 }}>
                        🛒
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '.83rem', fontWeight: 500, color: '#0F172A', lineHeight: 1.4 }}>
                          Nueva venta · <span style={{ fontWeight: 700, color }}>{packLabels[pack]}</span>
                          {order.customer_name && ` — ${order.customer_name}`}
                        </div>
                        <div style={{ fontSize: '.72rem', color: '#94A3B8', marginTop: 2 }}>
                          {order.customer_email} · {new Date(order.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '.84rem', color: '#00CC8F', flexShrink: 0, marginTop: 2 }}>
                        +{fmt(order.amount)}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '.95rem', color: '#0F172A' }}>Acciones rápidas</div>
              <div style={{ fontSize: '.78rem', color: '#64748B', marginTop: 2 }}>Atajos para gestionar tu tienda</div>
            </div>

            {[
              { href: '/dashboard/ebooks', icon: '📦', iconBg: 'rgba(0,255,178,.1)', label: 'Nuevo contenido', sub: 'Añade o genera un eBook' },
              { href: '/dashboard/ventas', icon: '📊', iconBg: 'rgba(59,130,246,.1)', label: 'Ver ventas', sub: 'Historial de pedidos' },
            ].map((item) => (
              <Link key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '13px 14px', borderRadius: 12,
                border: '1px solid #E2E8F0', cursor: 'pointer',
                transition: 'all .18s', textDecoration: 'none', color: '#0F172A', background: '#fff',
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#00FFB2'; (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(0,255,178,.04)'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateX(3px)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#E2E8F0'; (e.currentTarget as HTMLAnchorElement).style.background = '#fff'; (e.currentTarget as HTMLAnchorElement).style.transform = 'none' }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 9, background: item.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '.84rem', fontWeight: 600, color: '#0F172A' }}>{item.label}</div>
                  <div style={{ fontSize: '.72rem', color: '#64748B', marginTop: 1 }}>{item.sub}</div>
                </div>
                <div style={{ color: '#94A3B8', fontSize: '.8rem' }}>→</div>
              </Link>
            ))}

            <button
              onClick={copyLink}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '13px 14px', borderRadius: 12,
                border: '1px solid #E2E8F0', cursor: 'pointer',
                transition: 'all .18s', textDecoration: 'none', color: '#0F172A', background: '#fff',
                textAlign: 'left', width: '100%',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#00FFB2'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,255,178,.04)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateX(3px)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E2E8F0'; (e.currentTarget as HTMLButtonElement).style.background = '#fff'; (e.currentTarget as HTMLButtonElement).style.transform = 'none' }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(245,158,11,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>🔗</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '.84rem', fontWeight: 600, color: '#0F172A' }}>{copied ? '¡Copiado!' : 'Copiar enlace'}</div>
                <div style={{ fontSize: '.72rem', color: '#64748B', marginTop: 1 }}>aprendia.store</div>
              </div>
              <div style={{ color: '#94A3B8', fontSize: '.8rem' }}>→</div>
            </button>

            <a href="/" target="_blank" rel="noopener noreferrer" style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '13px 14px', borderRadius: 12,
              border: '1px solid #E2E8F0', cursor: 'pointer',
              transition: 'all .18s', textDecoration: 'none', color: '#0F172A', background: '#fff',
            }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#00FFB2'; (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(0,255,178,.04)'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateX(3px)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#E2E8F0'; (e.currentTarget as HTMLAnchorElement).style.background = '#fff'; (e.currentTarget as HTMLAnchorElement).style.transform = 'none' }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(244,63,94,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>🌐</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '.84rem', fontWeight: 600, color: '#0F172A' }}>Ver web pública</div>
                <div style={{ fontSize: '.72rem', color: '#64748B', marginTop: 1 }}>aprendia.store</div>
              </div>
              <div style={{ color: '#94A3B8', fontSize: '.8rem' }}>↗</div>
            </a>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.7)} }
      `}</style>
    </>
  )
}
