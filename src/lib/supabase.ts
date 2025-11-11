import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Singleton Supabase client for all database operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// TypeScript types matching database schema

export type Content = {
  id: string
  nft_address: string
  creator_wallet: string
  title: string
  media_url: string
  total_shares: number
  total_engagements: number
  total_revenue_lamports: number  // Stored in lamports (1 SOL = 1B lamports)
  created_at: string
}

export type Share = {
  id: string
  content_id: string
  wallet_address: string
  parent_share_id: string | null  // Parent share in viral tree (null = original creator)
  share_depth: number             // Depth in viral tree (0 = creator)
  click_count: number
  earnings_lamports: number
  share_url: string               // Unique shareable link
  created_at: string
}

export type Engagement = {
  id: string
  share_id: string
  content_id: string
  engagement_type: 'view' | 'click' | 'share'
  wallet_address: string | null   // Optional: only if user is connected
  timestamp: string
}

export type Payout = {
  id: string
  content_id: string
  share_id: string
  wallet_address: string
  amount_lamports: number
  transaction_signature: string   // Somnia blockchain tx hash
  paid_at: string
}

