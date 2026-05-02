-- Social platforms enum
CREATE TYPE public.social_platform AS ENUM ('x', 'instagram', 'facebook', 'youtube');

-- Social posts/links uploaded by admin
CREATE TABLE public.social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform public.social_platform NOT NULL,
  url TEXT NOT NULL,
  title TEXT,
  points INTEGER NOT NULL DEFAULT 10,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read social posts" ON public.social_posts FOR SELECT USING (true);
CREATE POLICY "Anyone can insert social posts" ON public.social_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update social posts" ON public.social_posts FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete social posts" ON public.social_posts FOR DELETE USING (true);

-- Click events (one row per click; one award per member+post enforced by unique constraint)
CREATE TABLE public.social_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL,
  post_id UUID NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
  points_awarded INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (member_id, post_id)
);
ALTER TABLE public.social_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read clicks" ON public.social_clicks FOR SELECT USING (true);
CREATE POLICY "Anyone can insert clicks" ON public.social_clicks FOR INSERT WITH CHECK (true);

-- Curriculum items for Green Classroom
CREATE TYPE public.curriculum_category AS ENUM ('leadership', 'politics', 'governance', 'life', 'civic_education');

CREATE TABLE public.curriculum_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  category public.curriculum_category NOT NULL DEFAULT 'leadership',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.curriculum_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read curriculum" ON public.curriculum_items FOR SELECT USING (true);
CREATE POLICY "Anyone can insert curriculum" ON public.curriculum_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update curriculum" ON public.curriculum_items FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete curriculum" ON public.curriculum_items FOR DELETE USING (true);

-- Curriculum read tracking
CREATE TABLE public.curriculum_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL,
  item_id UUID NOT NULL REFERENCES public.curriculum_items(id) ON DELETE CASCADE,
  points_awarded INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (member_id, item_id)
);
ALTER TABLE public.curriculum_reads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read curriculum reads" ON public.curriculum_reads FOR SELECT USING (true);
CREATE POLICY "Anyone can insert curriculum reads" ON public.curriculum_reads FOR INSERT WITH CHECK (true);

-- Finance entries for /finance
CREATE TYPE public.finance_kind AS ENUM ('income', 'expenditure');

CREATE TABLE public.finance_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind public.finance_kind NOT NULL,
  description TEXT NOT NULL,
  amount_naira NUMERIC(14, 2) NOT NULL DEFAULT 0,
  source_or_payee TEXT,
  occurred_on DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.finance_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read finance" ON public.finance_entries FOR SELECT USING (true);
CREATE POLICY "Anyone can insert finance" ON public.finance_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update finance" ON public.finance_entries FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete finance" ON public.finance_entries FOR DELETE USING (true);

-- Index for fast leaderboard
CREATE INDEX idx_social_clicks_member ON public.social_clicks(member_id);
CREATE INDEX idx_curriculum_reads_member ON public.curriculum_reads(member_id);