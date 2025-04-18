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