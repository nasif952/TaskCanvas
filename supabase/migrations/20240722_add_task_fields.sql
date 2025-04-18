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