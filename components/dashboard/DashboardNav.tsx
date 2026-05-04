'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const NAV_SECTIONS = [
  {
    label: 'Principal',
    items: [
      { href: '/dashboard', label: 'Resumen', icon: '◧', exact: true },
      { href: '/dashboard/ebooks', label: 'Contenido', icon: '📦', exact: false },
      { href: '/dashboard/ventas', label: 'Ventas', icon: '🛒', exact: false },
    ],
  },
  {
    label: 'Tienda',
    items: [
      { href: '/', label: 'Ver web', icon: '🌐', exact: true, external: true },
    ],
  },
]

type Props = { userName?: string; userEmail?: string }

export function DashboardNav({ userName, userEmail }: Props) {
  const path = usePathname()
  const initials = (userName || 'A').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <aside style={{
      width: 228, background: '#0F172A',
      display: 'flex', flexDirection: 'column', flexShrink: 0,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', bottom: -120, right: -120,
        width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,255,178,.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Brand */}
      <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 9,
          background: 'linear-gradient(135deg, #00FFB2, #3B82F6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '.85rem', color: '#0F172A', flexShrink: 0,
        }}>A</div>
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.05rem', color: '#fff', lineHeight: 1.2 }}>
            Aprend<span style={{ color: '#00FFB2' }}>IA</span>
          </div>
          <div style={{ fontSize: '.62rem', color: 'rgba(255,255,255,.3)', fontWeight: 500, letterSpacing: '.04em' }}>Panel de control</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <div style={{
              fontSize: '.62rem', fontWeight: 700, letterSpacing: '.1em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,.25)',
              padding: '10px 8px 6px', fontFamily: "'Syne', sans-serif",
            }}>
              {section.label}
            </div>
            {section.items.map((item) => {
              const active = item.exact ? path === item.href : path.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  target={(item as any).external ? '_blank' : undefined}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 10px', borderRadius: 8,
                    fontSize: '.86rem', fontWeight: 500,
                    color: active ? '#00FFB2' : 'rgba(255,255,255,.45)',
                    background: active ? 'rgba(0,255,178,.1)' : 'transparent',
                    textDecoration: 'none', transition: 'all .18s',
                  }}
                >
                  <span style={{ width: 16, textAlign: 'center', fontSize: '.85rem' }}>{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '14px 12px', borderTop: '1px solid rgba(255,255,255,.06)', display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '.75rem', color: '#fff', flexShrink: 0,
        }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '.8rem', fontWeight: 600, color: 'rgba(255,255,255,.8)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {userName || 'Admin'}
          </div>
          <div style={{ fontSize: '.68rem', color: 'rgba(255,255,255,.3)' }}>Admin</div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          title="Salir"
          style={{ color: 'rgba(255,255,255,.25)', fontSize: '1rem', cursor: 'pointer', background: 'none', border: 'none', padding: 4, transition: 'color .18s', flexShrink: 0, lineHeight: 1 }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,.7)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,.25)' }}
        >
          ⏏
        </button>
      </div>
    </aside>
  )
}
