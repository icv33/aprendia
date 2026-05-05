'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { DashboardNav } from './DashboardNav'

type Props = {
  children: React.ReactNode
  userName?: string
  userEmail?: string
}

export function DashboardShell({ children, userName, userEmail }: Props) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close sidebar on navigation (mobile)
  useEffect(() => { setOpen(false) }, [pathname])

  // Prevent body scroll when sidebar open on mobile
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Backdrop — mobile only */}
      <div
        className="dash-overlay"
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none' }}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar wrapper */}
      <div className={`dash-sidebar${open ? ' is-open' : ''}`} style={{ height: '100%' }}>
        <DashboardNav userName={userName} userEmail={userEmail} />
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#F8FAFC', minWidth: 0 }}>
        {children}
      </div>

      {/* FAB — mobile only, toggles sidebar */}
      <button
        className="dash-fab"
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
      >
        {open ? '✕' : '☰'}
      </button>
    </div>
  )
}
