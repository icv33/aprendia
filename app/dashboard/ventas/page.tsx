export const dynamic = 'force-dynamic'

import { createServerSupabase } from '@/lib/supabase'
import { ShoppingBag, Mail, CheckCircle } from 'lucide-react'

export const metadata = { title: 'Ventas | AprendIA' }

export default async function VentasPage() {
  const supabase = createServerSupabase()
  const { data: orders } = await supabase
    .from('orders')
    .select(`*, ebooks(title)`)
    .order('created_at', { ascending: false })

  const revenue = orders?.filter(o => o.status === 'paid').reduce((sum, o) => sum + Number(o.amount), 0) ?? 0

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Ventas</h1>
        <p className="text-slate-500 text-sm mt-1">
          {orders?.length ?? 0} ventas · {revenue.toFixed(2)}€ en total
        </p>
      </div>

      {!orders?.length ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <ShoppingBag size={40} className="mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500 font-medium">Sin ventas todavía</p>
          <p className="text-slate-400 text-sm mt-1">Publica tu primer ebook para empezar a vender</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ebook</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Importe</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">PDF</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">{order.customer_name ?? '—'}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Mail size={10} />
                      {order.customer_email}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-slate-700">
                    {(order.ebooks as { title: string } | null)?.title ?? '—'}
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-900">{Number(order.amount).toFixed(2)}€</td>
                  <td className="px-5 py-4">
                    {order.pdf_sent ? (
                      <span className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
                        <CheckCircle size={12} /> Enviado
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">Pendiente</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-slate-500 text-xs">
                    {new Date(order.created_at).toLocaleDateString('es-ES', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
