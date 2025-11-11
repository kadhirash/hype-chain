-- Migration 002: Add deletion tracking fields
-- Run this in Supabase SQL Editor after migration 001

-- Add deleted_at timestamp and deleted_by wallet address
ALTER TABLE shares 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by TEXT;

-- Add index for faster queries on deletion tracking
CREATE INDEX IF NOT EXISTS idx_shares_deleted_at ON shares(deleted_at) WHERE deleted_at IS NOT NULL;

-- Add comment for clarity
COMMENT ON COLUMN shares.deleted_at IS 'Timestamp when the share was soft-deleted';
COMMENT ON COLUMN shares.deleted_by IS 'Wallet address of user who deleted the share';

