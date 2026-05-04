'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { LayoutDashboard, BookOpen, ShoppingBag, LogOut, ExternalLink } from 'lucide-react'

const links = [
  { href: '/dashboard', label: 'Resumen', icon: LayoutDashboard },
  { href: '/dashboard/ebooks', label: 'Contenido', icon: BookOpen },
  { href: '/dashboard/ventas', label: 'Ventas', icon: ShoppingBag },
]

export function DashboardNav() {
  const path = usePathname()

  return (
    <header style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 40 }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: '#00FFB2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 13, color: '#0F172A' }}>A</span>
            </div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, color: '#0F172A' }}>
              Aprend<span style={{ color: '#00CC8F' }}>IA</span>
              <span style={{ color: '#94A3B8', fontWeight: 400, marginLeft: 4 }}>· Panel</span>
            </span>
          </Link>

          <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {links.map(({ href, label, icon: Icon }) => {
              const active = path === href
              return (
                <Link
                  key={href}
                  href={href}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px', borderRadius: 8, fontSize: 13, textDecoration: 'none',
                    fontWeight: active ? 600 : 400,
                    background: active ? 'rgba(0,255,178,.1)' : 'transparent',
                    color: active ? '#007A40' : '#64748B',
                    transition: 'all .15s',
                  }}
                >
                  <Icon size={14} />
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <a
            href="/"
            target="_blank"
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748B', padding: '6px 10px', borderRadius: 8, textDecoration: 'none', transition: 'all .15s' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <ExternalLink size={12} />
            Ver web
          </a>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748B', padding: '6px 10px', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', transition: 'all .15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#FEF2F2'; (e.currentTarget as HTMLButtonElement).style.color = '#EF4444' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#64748B' }}
          >
            <LogOut size={12} />
            Salir
          </button>
        </div>
      </div>
    </header>
  )
}
