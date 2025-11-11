# 🔴 Database Migration Required

Before using the delete functionality, you must run the following SQL in your Supabase SQL Editor:

## Migration: Add is_deleted column to shares table

```sql
-- Add is_deleted column for soft delete functionality
ALTER TABLE shares 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_shares_is_deleted ON shares(is_deleted);
```

## How to Run:

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the SQL above
6. Click **Run** or press `Cmd/Ctrl + Enter`

## Verify it worked:

Run this query to confirm the column exists:

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'shares' AND column_name = 'is_deleted';
```

You should see one row returned with:
- column_name: `is_deleted`
- data_type: `boolean`
- is_nullable: `YES`

## After running the migration:

- Restart your dev server: `npm run dev`
- Run tests: `npm run test:run`
- The delete functionality will now work!

