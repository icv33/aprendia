import { createClient } from '@supabase/supabase-js'

export function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

export function createServerSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export type Ebook = {
  id: string
  title: string
  slug: string
  tagline: string
  description: string
  content: EbookContent | null
  price: number
  original_price: number | null
  pdf_path: string | null
  cover_image: string | null
  status: 'pending' | 'approved' | 'published' | 'rejected'
  stripe_product_id: string | null
  stripe_price_id: string | null
  created_at: string
  published_at: string | null
}

export type EbookContent = {
  subtitle: string
  promise: string
  problem: string
  solution: string
  modules: { title: string; description: string }[]
  bonuses: { title: string; description: string; value: string }[]
  faqs: { question: string; answer: string }[]
  testimonials: { name: string; role: string; text: string; rating: number }[]
  tiktok_scripts: string[]
}

export type Order = {
  id: string
  ebook_id: string
  customer_email: string
  customer_name: string | null
  amount: number
  stripe_session_id: string
  status: 'pending' | 'paid' | 'failed'
  pdf_sent: boolean
  created_at: string
}
