
-- Add residency tracking columns to members and signup log
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS is_nigeria_based boolean DEFAULT true;
ALTER TABLE public.member_signup_log ADD COLUMN IF NOT EXISTS is_nigeria_based boolean DEFAULT true;

-- Update existing records (all are Nigeria-based as per instructions)
UPDATE public.members SET is_nigeria_based = true WHERE is_nigeria_based IS NULL;
UPDATE public.member_signup_log SET is_nigeria_based = true WHERE is_nigeria_based IS NULL;
