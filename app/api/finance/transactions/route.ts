import { createServerSupabase } from '@/lib/supabase'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const month = searchParams.get('month') // YYYY-MM

  const supabase = createServerSupabase()
  let query = supabase
    .from('finance_transactions')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (month) {
    const [y, m] = month.split('-').map(Number)
    const last = new Date(y, m, 0).getDate()
    query = query.gte('date', `${month}-01`).lte('date', `${month}-${String(last).padStart(2, '0')}`)
  }

  const { data, error } = await query
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ transactions: data })
}

export async function POST(req: Request) {
  const body = await req.json()
  const supabase = createServerSupabase()
  const { data, error } = await supabase
    .from('finance_transactions')
    .insert(body)
    .select()
    .single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ transaction: data })
}
