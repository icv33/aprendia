export const dynamic = 'force-dynamic'

import { createServerSupabase } from '@/lib/supabase'
import { EbooksClient } from './EbooksClient'

export const metadata = { title: 'Ebooks | AprendIA' }

export default async function EbooksPage() {
  const supabase = createServerSupabase()
  const { data: ebooks } = await supabase
    .from('ebooks')
    .select('*')
    .order('created_at', { ascending: false })

  return <EbooksClient ebooks={ebooks ?? []} />
}
