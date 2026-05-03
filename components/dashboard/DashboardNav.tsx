'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { LayoutDashboard, BookOpen, ShoppingBag, LogOut, ExternalLink } from 'lucide-react'

const links = [
  { href: '/dashboard', label: 'Resumen', icon: LayoutDashboard },
  { href: '/dashboard/ebooks', label: 'Ebooks', icon: BookOpen },
  { href: '/dashboard/ventas', label: 'Ventas', icon: ShoppingBag },
]

export function DashboardNav() {
  const path = usePathname()

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 mr-4">
            <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center">
              <span className="text-white font-bold text-xs">A</span>
            </div>
            <span className="font-semibold text-slate-900 text-sm">
              Aprend<span className="gradient-text">IA</span>
              <span className="text-slate-400 font-normal ml-1">· Panel</span>
            </span>
          </Link>

          <nav className="hidden sm:flex items-center gap-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  path === href
                    ? 'bg-indigo-50 text-indigo-700 font-medium'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon size={14} />
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/productos"
            target="_blank"
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ExternalLink size={12} />
            Ver tienda
          </a>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-600 px-2 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut size={12} />
            Salir
          </button>
        </div>
      </div>
    </header>
  )
}
