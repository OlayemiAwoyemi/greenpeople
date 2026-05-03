-- Members: add split name parts + referrer
ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS middle_name text,
  ADD COLUMN IF NOT EXISTS surname text,
  ADD COLUMN IF NOT EXISTS referrer_id uuid;

-- Backfill name parts from full_name
UPDATE public.members
SET
  first_name = COALESCE(first_name, split_part(trim(full_name), ' ', 1)),
  surname = COALESCE(
    surname,
    NULLIF(
      regexp_replace(trim(full_name), '^\S+\s*', ''),
      ''
    )
  )
WHERE full_name IS NOT NULL;

-- For 3+ words: middle = everything between first and last
UPDATE public.members
SET middle_name = NULLIF(
  trim(regexp_replace(
    trim(full_name),
    '^\S+\s+(.*)\s+\S+$',
    '\1'
  )),
  ''
)
WHERE middle_name IS NULL
  AND full_name IS NOT NULL
  AND array_length(string_to_array(trim(regexp_replace(full_name, '\s+', ' ', 'g')), ' '), 1) >= 3;

-- For 3+ words: surname = last word, redo
UPDATE public.members
SET surname = regexp_replace(trim(full_name), '^.*\s+(\S+)$', '\1')
WHERE full_name IS NOT NULL
  AND array_length(string_to_array(trim(regexp_replace(full_name, '\s+', ' ', 'g')), ' '), 1) >= 2;

-- Anti-gaming: unique action per (member, post)
DELETE FROM public.social_clicks a USING public.social_clicks b
  WHERE a.id < b.id AND a.member_id = b.member_id AND a.post_id = b.post_id;
ALTER TABLE public.social_clicks
  ADD CONSTRAINT social_clicks_unique_member_post UNIQUE (member_id, post_id);

DELETE FROM public.curriculum_reads a USING public.curriculum_reads b
  WHERE a.id < b.id AND a.member_id = b.member_id AND a.item_id = b.item_id;
ALTER TABLE public.curriculum_reads
  ADD CONSTRAINT curriculum_reads_unique_member_item UNIQUE (member_id, item_id);

-- Add host (page owner) tracking + visitor hash for visitor-driven clicks
ALTER TABLE public.social_clicks
  ADD COLUMN IF NOT EXISTS host_member_id uuid,
  ADD COLUMN IF NOT EXISTS visitor_hash text;

-- Page visits: unique visitor on each member's public page
CREATE TABLE IF NOT EXISTS public.page_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_member_id uuid NOT NULL,
  visitor_hash text NOT NULL,
  points_awarded integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (host_member_id, visitor_hash)
);
ALTER TABLE public.page_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read page visits" ON public.page_visits FOR SELECT USING (true);
CREATE POLICY "Anyone can insert page visits" ON public.page_visits FOR INSERT WITH CHECK (true);

-- Member referrals (50pt bonus when someone joins via shared link)
CREATE TABLE IF NOT EXISTS public.member_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_member_id uuid NOT NULL UNIQUE,
  points_awarded integer NOT NULL DEFAULT 50,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.member_referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read referrals" ON public.member_referrals FOR SELECT USING (true);
CREATE POLICY "Anyone can insert referrals" ON public.member_referrals FOR INSERT WITH CHECK (true);

-- Lesson quizzes
CREATE TABLE IF NOT EXISTS public.lesson_quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL,
  question text NOT NULL,
  options jsonb NOT NULL,
  correct_index integer NOT NULL,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lesson_quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read quizzes" ON public.lesson_quizzes FOR SELECT USING (true);
CREATE POLICY "Anyone can insert quizzes" ON public.lesson_quizzes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update quizzes" ON public.lesson_quizzes FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete quizzes" ON public.lesson_quizzes FOR DELETE USING (true);

-- Quiz attempts (one per member per item)
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL,
  item_id uuid NOT NULL,
  score integer NOT NULL,
  total integer NOT NULL,
  points_awarded integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (member_id, item_id)
);
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read quiz attempts" ON public.quiz_attempts FOR SELECT USING (true);
CREATE POLICY "Anyone can insert quiz attempts" ON public.quiz_attempts FOR INSERT WITH CHECK (true);