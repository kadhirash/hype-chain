# Database Migrations

## How to Run

These migrations need to be run manually in your Supabase SQL editor:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the migrations in order

## Migrations

### 001_add_is_deleted_to_shares.sql
Adds soft delete capability to shares table.

**Run this in Supabase SQL Editor:**
```sql
ALTER TABLE shares 
ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;

CREATE INDEX idx_shares_is_deleted ON shares(is_deleted);
```

This allows shares to be marked as deleted while preserving the viral chain structure for analytics.

