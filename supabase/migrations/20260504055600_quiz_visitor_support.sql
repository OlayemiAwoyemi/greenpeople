
-- Add visitor tracking columns to quiz_attempts
ALTER TABLE public.quiz_attempts
  ADD COLUMN IF NOT EXISTS host_member_id uuid,
  ADD COLUMN IF NOT EXISTS visitor_hash text;

-- Remove the old unconditional unique constraint
ALTER TABLE public.quiz_attempts DROP CONSTRAINT IF EXISTS quiz_attempts_member_id_item_id_key;

-- Create a new unique constraint for owners (host_member_id is null)
CREATE UNIQUE INDEX IF NOT EXISTS quiz_attempts_unique_owner
  ON public.quiz_attempts (member_id, item_id)
  WHERE host_member_id IS NULL;

-- Create a new unique constraint for visitors (host_member_id is not null)
CREATE UNIQUE INDEX IF NOT EXISTS quiz_attempts_unique_visitor
  ON public.quiz_attempts (host_member_id, item_id, visitor_hash)
  WHERE host_member_id IS NOT NULL;
