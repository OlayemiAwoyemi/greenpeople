-- Permanent append-only log of every registration attempt (forensic backup)
CREATE TABLE IF NOT EXISTS public.member_signup_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  state TEXT NOT NULL,
  lga TEXT NOT NULL,
  age_group TEXT NOT NULL,
  gender TEXT NOT NULL,
  has_pvc TEXT NOT NULL,
  reason TEXT,
  member_id UUID,
  succeeded BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.member_signup_log ENABLE ROW LEVEL SECURITY;

-- Anyone (the public registration form) can append a log row
CREATE POLICY "Anyone can append to signup log"
  ON public.member_signup_log
  FOR INSERT
  WITH CHECK (true);

-- Anyone can read the log (gated behind the admin access code in the UI)
CREATE POLICY "Anyone can read signup log"
  ON public.member_signup_log
  FOR SELECT
  USING (true);

-- Note: NO update or delete policies — this table is append-only by design.

CREATE INDEX IF NOT EXISTS idx_signup_log_created_at ON public.member_signup_log (created_at DESC);