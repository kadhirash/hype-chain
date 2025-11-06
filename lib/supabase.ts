import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for type safety
export type Content = {
  id: string
  nft_address: string
  creator_wallet: string
  title: string
  media_url: string
  total_shares: number
  total_engagements: number
  total_revenue_lamports: number
  created_at: string
}

export type Share = {
  id: string
  content_id: string
  wallet_address: string
  parent_share_id: string | null
  share_depth: number
  click_count: number
  earnings_lamports: number
  share_url: string
  created_at: string
}

export type Engagement = {
  id: string
  share_id: string
  content_id: string
  engagement_type: 'view' | 'click' | 'share'
  wallet_address: string | null
  timestamp: string
}

export type Payout = {
  id: string
  content_id: string
  share_id: string
  wallet_address: string
  amount_lamports: number
  transaction_signature: string
  paid_at: string
}

