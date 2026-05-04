export const dynamic = 'force-dynamic'

import { createServerSupabase } from '@/lib/supabase'
import { DashboardHome } from '@/components/dashboard/DashboardHome'

export const metadata = { title: 'Resumen | AprendIA' }

export default async function DashboardPage() {
  const supabase = createServerSupabase()

  const [{ count: pendingContent }, { data: orders }] = await Promise.all([
    supabase.from('ebooks').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase
      .from('orders')
      .select('amount, created_at, status, pdf_sent, customer_name, customer_email')
      .order('created_at', { ascending: false }),
  ])

  return (
    <DashboardHome
      orders={(orders ?? []).map((o) => ({
        amount: Number(o.amount),
        created_at: o.created_at,
        status: o.status,
        pdf_sent: o.pdf_sent,
        customer_name: o.customer_name,
        customer_email: o.customer_email,
      }))}
      pendingContent={pendingContent ?? 0}
    />
  )
}
