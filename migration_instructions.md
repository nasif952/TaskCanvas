# Task Fields Migration Instructions

## To Apply the Migration

To add the missing task fields (priority, labels, estimated_time, actual_time) to your database:

1. Connect to your Supabase project:
```bash
npx supabase link --project-ref your-project-ref
```

2. Push the migration to your Supabase project:
```bash
npx supabase db push
```

Or if you prefer to apply it manually:

```sql
-- Run this in your Supabase SQL Editor
-- Migration: Add priority, labels, estimated_time, and actual_time fields to tasks table
ALTER TABLE public.tasks
ADD COLUMN priority text NULL,
ADD COLUMN labels text[] NULL,
ADD COLUMN estimated_time integer NULL,
ADD COLUMN actual_time integer NULL;

-- Add constraint to ensure priority is only allowed values
ALTER TABLE public.tasks
ADD CONSTRAINT tasks_priority_check CHECK (
  priority IS NULL OR 
  priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'urgent'::text])
);

-- Update all existing tasks to set medium priority for cleaner data
UPDATE public.tasks
SET priority = 'medium'
WHERE priority IS NULL;

-- Add indexes for potential filtering/searching
CREATE INDEX idx_tasks_priority ON public.tasks(priority);
CREATE INDEX idx_tasks_labels ON public.tasks USING GIN(labels);
```

## If Something Goes Wrong (Rollback)

If you need to undo these changes:

1. Using Supabase CLI:
```bash
npx supabase db execute --file ./supabase/migrations/20240722_rollback_task_fields.sql
```

2. Or run this SQL manually in your Supabase SQL Editor:
```sql
-- Rollback: Remove priority, labels, estimated_time, and actual_time fields from tasks table

-- Drop indexes first
DROP INDEX IF EXISTS idx_tasks_priority;
DROP INDEX IF EXISTS idx_tasks_labels;

-- Drop constraint
ALTER TABLE public.tasks
DROP CONSTRAINT IF EXISTS tasks_priority_check;

-- Remove columns
ALTER TABLE public.tasks
DROP COLUMN IF EXISTS priority,
DROP COLUMN IF EXISTS labels,
DROP COLUMN IF EXISTS estimated_time,
DROP COLUMN IF EXISTS actual_time;
```

## Verification

After applying the migration, you can verify it worked by running:
```sql
-- Check if columns exist
SELECT 
  column_name, 
  data_type 
FROM 
  information_schema.columns 
WHERE 
  table_name = 'tasks' 
  AND column_name IN ('priority', 'labels', 'estimated_time', 'actual_time');
```

You should see all four new columns in the result. 