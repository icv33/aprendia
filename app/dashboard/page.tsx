export const dynamic = 'force-dynamic'

import { createServerSupabase } from '@/lib/supabase'
import { BookOpen, ShoppingBag, TrendingUp, Clock } from 'lucide-react'

export const metadata = { title: 'Resumen | AprendIA' }

export default async function DashboardPage() {
  const supabase = createServerSupabase()

  const [{ count: totalEbooks }, { count: published }, { data: orders }, { count: pending }] =
    await Promise.all([
      supabase.from('ebooks').select('*', { count: 'exact', head: true }),
      supabase.from('ebooks').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('orders').select('amount').eq('status', 'paid'),
      supabase.from('ebooks').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    ])

  const revenue = orders?.reduce((sum, o) => sum + Number(o.amount), 0) ?? 0

  const stats = [
    { label: 'Ingresos totales', value: `${revenue.toFixed(2)}€`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Ventas', value: String(orders?.length ?? 0), icon: ShoppingBag, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Ebooks publicados', value: String(published ?? 0), icon: BookOpen, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Pendientes de revisión', value: String(pending ?? 0), icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Resumen</h1>
        <p className="text-slate-500 text-sm mt-1">Estado general de AprendIA</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon size={18} className={s.color} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {(pending ?? 0) > 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-3">
          <Clock size={16} className="text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800">
            Tienes <strong>{pending}</strong> ebook(s) pendientes de revisión.{' '}
            <a href="/dashboard/ebooks" className="underline font-medium">Revisarlos →</a>
          </p>
        </div>
      )}
    </div>
  )
}
