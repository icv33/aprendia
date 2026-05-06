import { createServerSupabase } from '@/lib/supabase'
import { FinanceMain } from '@/components/dashboard/finance/FinanceMain'

export const metadata = { title: 'Finanzas | AprendIA' }

export default async function FinanzasPage() {
  const supabase = createServerSupabase()
  const now = new Date()
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()

  const { data } = await supabase
    .from('finance_transactions')
    .select('*')
    .gte('date', `${month}-01`)
    .lte('date', `${month}-${String(lastDay).padStart(2, '0')}`)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  return <FinanceMain initialTransactions={data ?? []} />
}
