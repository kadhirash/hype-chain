-- Migration 003: Add deletion tracking for content
-- Run this in Supabase SQL Editor after migration 002

-- Add is_deleted flag to content table
ALTER TABLE content 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by TEXT;

-- Add index for faster queries on deleted content
CREATE INDEX IF NOT EXISTS idx_content_is_deleted ON content(is_deleted);

-- Add comment for clarity
COMMENT ON COLUMN content.is_deleted IS 'Whether the content has been soft-deleted by creator';
COMMENT ON COLUMN content.deleted_at IS 'Timestamp when the content was deleted';
COMMENT ON COLUMN content.deleted_by IS 'Wallet address of creator who deleted the content';

