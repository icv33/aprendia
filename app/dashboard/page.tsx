export const dynamic = 'force-dynamic'

import { createServerSupabase } from '@/lib/supabase'
import { TrendingUp, ShoppingBag, Clock, Send } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Resumen | AprendIA' }

function packFromAmount(amount: number) {
  if (amount >= 90) return 'Élite'
  if (amount >= 30) return 'Pro'
  return 'Starter'
}

export default async function DashboardPage() {
  const supabase = createServerSupabase()

  const [{ count: pending }, { data: orders }] = await Promise.all([
    supabase.from('ebooks').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('orders').select('amount, pdf_sent, created_at').eq('status', 'paid').order('created_at', { ascending: false }),
  ])

  const paid = orders ?? []
  const revenue = paid.reduce((sum, o) => sum + Number(o.amount), 0)
  const pendingPdf = paid.filter(o => !o.pdf_sent).length

  const packCounts = { Starter: 0, Pro: 0, 'Élite': 0 }
  paid.forEach(o => { packCounts[packFromAmount(Number(o.amount)) as keyof typeof packCounts]++ })

  const today = new Date().toDateString()
  const todaySales = paid.filter(o => new Date(o.created_at).toDateString() === today).length

  const stats = [
    { label: 'Ingresos totales', value: `${revenue.toFixed(2)}€`, icon: TrendingUp, color: '#007A40', bg: 'rgba(0,255,178,.1)' },
    { label: 'Ventas totales', value: String(paid.length), icon: ShoppingBag, color: '#3B82F6', bg: 'rgba(59,130,246,.1)' },
    { label: 'Ventas hoy', value: String(todaySales), icon: TrendingUp, color: '#8B5CF6', bg: 'rgba(139,92,246,.1)' },
    { label: 'PDF pendientes', value: String(pendingPdf), icon: Send, color: '#F59E0B', bg: 'rgba(245,158,11,.1)' },
  ]

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0 }}>Resumen</h1>
        <p style={{ color: '#64748B', fontSize: 14, marginTop: 4 }}>Estado general de AprendIA</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #E2E8F0' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <s.icon size={17} color={s.color} />
            </div>
            <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, color: '#0F172A', margin: 0 }}>{s.value}</p>
            <p style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Breakdown por pack */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 20 }}>Ventas por pack</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {([
            { pack: 'Élite', price: '97€', color: '#8B5CF6', bg: 'rgba(139,92,246,.1)' },
            { pack: 'Pro', price: '37€', color: '#3B82F6', bg: 'rgba(59,130,246,.1)' },
            { pack: 'Starter', price: '17€', color: '#007A40', bg: 'rgba(0,255,178,.12)' },
          ] as const).map(({ pack, price, color, bg }) => {
            const count = packCounts[pack as keyof typeof packCounts]
            const pct = paid.length > 0 ? (count / paid.length) * 100 : 0
            return (
              <div key={pack}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{pack} <span style={{ color: '#94A3B8', fontWeight: 400 }}>· {price}</span></span>
                  <span style={{ fontSize: 13, fontWeight: 700, color }}>{count} ventas</span>
                </div>
                <div style={{ height: 6, background: '#F1F5F9', borderRadius: 100, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 100, transition: 'width .5s' }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Alertas */}
      {(pending ?? 0) > 0 && (
        <div style={{ background: 'rgba(245,158,11,.06)', border: '1px solid rgba(245,158,11,.2)', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Clock size={15} color="#D97706" />
          <p style={{ fontSize: 13, color: '#92400E', margin: 0 }}>
            Tienes <strong>{pending}</strong> contenido(s) pendiente(s) de revisión.{' '}
            <Link href="/dashboard/ebooks" style={{ color: '#D97706', fontWeight: 600 }}>Revisarlos →</Link>
          </p>
        </div>
      )}
    </div>
  )
}
