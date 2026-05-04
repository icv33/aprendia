export const dynamic = 'force-dynamic'

import { createServerSupabase } from '@/lib/supabase'
import { ShoppingBag, CheckCircle, Clock } from 'lucide-react'

export const metadata = { title: 'Ventas | AprendIA' }

function packFromAmount(amount: number) {
  if (amount >= 50) return { label: 'Pro', color: '#8B5CF6', bg: 'rgba(139,92,246,.1)' }
  if (amount >= 25) return { label: 'Completo', color: '#3B82F6', bg: 'rgba(59,130,246,.1)' }
  return { label: 'Esencial', color: '#007A40', bg: 'rgba(0,255,178,.12)' }
}

export default async function VentasPage() {
  const supabase = createServerSupabase()
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  const paid = orders?.filter(o => o.status === 'paid') ?? []
  const revenue = paid.reduce((sum, o) => sum + Number(o.amount), 0)

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0 }}>Ventas</h1>
        <p style={{ color: '#64748B', fontSize: 14, marginTop: 4 }}>
          {paid.length} ventas · <strong style={{ color: '#0F172A' }}>{revenue.toFixed(2)}€</strong> en total
        </p>
      </div>

      {!paid.length ? (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', padding: '80px 20px', textAlign: 'center' }}>
          <ShoppingBag size={36} color="#CBD5E1" style={{ margin: '0 auto 14px' }} />
          <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#64748B', marginBottom: 6 }}>Sin ventas todavía</p>
          <p style={{ fontSize: 13, color: '#94A3B8' }}>Cuando alguien compre aparecerá aquí</p>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #F1F5F9', background: '#F8FAFC' }}>
                {['Cliente', 'Pack', 'Importe', 'PDF', 'Fecha'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paid.map((order, i) => {
                const pack = packFromAmount(Number(order.amount))
                return (
                  <tr key={order.id} style={{ borderBottom: i < paid.length - 1 ? '1px solid #F8FAFC' : 'none' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <p style={{ fontWeight: 600, color: '#0F172A', margin: 0 }}>{order.customer_name ?? '—'}</p>
                      <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{order.customer_email}</p>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, fontFamily: "'Syne', sans-serif", background: pack.bg, color: pack.color }}>
                        {pack.label}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#0F172A' }}>
                      {Number(order.amount).toFixed(2)}€
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      {order.pdf_sent ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#007A40', fontSize: 12, fontWeight: 600 }}>
                          <CheckCircle size={13} /> Enviado
                        </span>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#94A3B8', fontSize: 12 }}>
                          <Clock size={13} /> Pendiente
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '14px 20px', color: '#94A3B8', fontSize: 12 }}>
                      {new Date(order.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
