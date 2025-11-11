-- HypeChain Database Schema
-- Proof-of-Hype: On-chain viral attribution system built on Somnia
-- Real-time tracking via Data Streams SDK

-- Content: NFT-backed viral content
CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nft_address TEXT NOT NULL UNIQUE,
  creator_wallet TEXT NOT NULL,
  title TEXT NOT NULL,
  media_url TEXT NOT NULL,
  total_shares INTEGER DEFAULT 0,
  total_engagements INTEGER DEFAULT 0,
  total_revenue_lamports BIGINT DEFAULT 0,  -- 1 SOL = 1,000,000,000 lamports
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shares: Viral attribution chain with parent-child tree structure
CREATE TABLE shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  parent_share_id UUID REFERENCES shares(id) ON DELETE SET NULL,
  share_depth INTEGER DEFAULT 0,  -- Depth in viral tree (0 = creator)
  click_count INTEGER DEFAULT 0,
  earnings_lamports BIGINT DEFAULT 0,
  share_url TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Engagements: Real-time event stream for Data Streams visualization
CREATE TABLE engagements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id UUID NOT NULL REFERENCES shares(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  engagement_type TEXT NOT NULL CHECK (engagement_type IN ('view', 'click', 'share')),
  wallet_address TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payouts: Immutable on-chain distribution audit trail
CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  share_id UUID NOT NULL REFERENCES shares(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  amount_lamports BIGINT NOT NULL,
  transaction_signature TEXT NOT NULL UNIQUE,  -- Somnia blockchain tx hash
  paid_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for viral tree queries and real-time feeds
CREATE INDEX idx_shares_content ON shares(content_id);
CREATE INDEX idx_shares_parent ON shares(parent_share_id);
CREATE INDEX idx_shares_wallet ON shares(wallet_address);
CREATE INDEX idx_engagements_timestamp ON engagements(timestamp DESC);
CREATE INDEX idx_payouts_wallet ON payouts(wallet_address);
