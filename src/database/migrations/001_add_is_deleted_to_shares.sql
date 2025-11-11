-- Add is_deleted column to shares table
-- Allows soft deletion while preserving viral chain structure for analytics

ALTER TABLE shares 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

-- Add index for querying deleted shares
CREATE INDEX IF NOT EXISTS idx_shares_is_deleted ON shares(is_deleted);

