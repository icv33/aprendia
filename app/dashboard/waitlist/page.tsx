export const dynamic = 'force-dynamic'

import { createServerSupabase } from '@/lib/supabase'
import { Users } from 'lucide-react'

export const metadata = { title: 'Lista de espera | AprendIA' }

const PACK_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  starter: { label: 'Starter',      color: '#007A40', bg: 'rgba(0,255,178,.12)' },
  pro:     { label: 'Pro',          color: '#3B82F6', bg: 'rgba(59,130,246,.1)' },
  elite:   { label: 'Élite',        color: '#8B5CF6', bg: 'rgba(139,92,246,.1)' },
  unsure:  { label: 'No lo sé aún', color: '#64748B', bg: 'rgba(100,116,139,.1)' },
}

export default async function WaitlistPage() {
  const supabase = createServerSupabase()
  const { data: leads } = await supabase
    .from('waitlist')
    .select('*')
    .order('created_at', { ascending: false })

  const all = leads ?? []

  const counts = {
    starter: all.filter((l) => l.pack === 'starter').length,
    pro:     all.filter((l) => l.pack === 'pro').length,
    elite:   all.filter((l) => l.pack === 'elite').length,
    unsure:  all.filter((l) => l.pack === 'unsure').length,
  }

  return (
    <>
      {/* Topbar */}
      <header style={{ height: 60, flexShrink: 0, background: '#fff', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px' }}>
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>Lista de espera</div>
          <div style={{ fontSize: '.8rem', color: '#64748B' }}>{all.length} {all.length === 1 ? 'persona apuntada' : 'personas apuntadas'}</div>
        </div>
        <a
          href="https://whatsapp.com/channel/0029VbCPfkzElah0V93Ils2J"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#25D366', color: '#fff', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, padding: '9px 16px', borderRadius: 10, textDecoration: 'none' }}
        >
          💬 Ver canal WhatsApp
        </a>
      </header>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {([
            { pack: 'starter', icon: '🚀' },
            { pack: 'pro',     icon: '⚡' },
            { pack: 'elite',   icon: '🏆' },
            { pack: 'unsure',  icon: '🤔' },
          ] as const).map(({ pack, icon }) => {
            const { label, color, bg } = PACK_LABEL[pack]
            return (
              <div key={pack} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', marginBottom: 14 }}>
                  {icon}
                </div>
                <div style={{ fontFamily: "var(--font-space-grotesk, 'Space Grotesk', sans-serif)", fontSize: '1.85rem', fontWeight: 700, color: '#0F172A', lineHeight: 1 }}>
                  {counts[pack]}
                </div>
                <div style={{ fontSize: '.78rem', color: '#64748B', marginTop: 4 }}>{label}</div>
              </div>
            )
          })}
        </div>

        {/* Table */}
        {all.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', padding: '80px 20px', textAlign: 'center' }}>
            <Users size={36} color="#CBD5E1" style={{ margin: '0 auto 14px' }} />
            <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#64748B', marginBottom: 6 }}>Sin registros todavía</p>
            <p style={{ fontSize: 13, color: '#94A3B8' }}>Cuando alguien se apunte aparecerá aquí</p>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #F1F5F9', background: '#F8FAFC' }}>
                  {['Email', 'Pack de interés', 'Fecha'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {all.map((lead, i) => {
                  const p = PACK_LABEL[lead.pack] ?? PACK_LABEL.unsure
                  return (
                    <tr key={lead.id} style={{ borderBottom: i < all.length - 1 ? '1px solid #F8FAFC' : 'none' }}>
                      <td style={{ padding: '14px 20px', fontWeight: 600, color: '#0F172A' }}>{lead.email}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, fontFamily: "'Syne', sans-serif", background: p.bg, color: p.color }}>
                          {p.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', color: '#94A3B8', fontSize: 12 }}>
                        {new Date(lead.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
