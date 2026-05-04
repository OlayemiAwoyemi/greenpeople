
-- 1. Remove duplicate members (keep the earliest by created_at).
DELETE FROM public.members
WHERE id IN (
  '89e799b2-8773-41ce-ba16-678080cf1c06',
  '724fa9f8-5f5f-4533-93cf-ad479d581ca4',
  'd15bc84f-68b1-47ec-9a40-10e5146184ba',
  '65306da3-d6c7-444b-87ce-60daafaa023d',
  '0829b61c-86a9-463e-af0c-0be29da8b4dc'
);

-- 2. Phone uniqueness
ALTER TABLE public.members
  ADD CONSTRAINT members_phone_unique UNIQUE (phone);

-- 3. Rich content for lessons
ALTER TABLE public.curriculum_items
  ADD COLUMN IF NOT EXISTS content text;

-- 4. Per-visitor uniqueness on social_clicks
ALTER TABLE public.social_clicks
  DROP CONSTRAINT IF EXISTS social_clicks_unique_member_post;

CREATE UNIQUE INDEX IF NOT EXISTS social_clicks_unique_owner
  ON public.social_clicks (member_id, post_id)
  WHERE host_member_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS social_clicks_unique_visitor
  ON public.social_clicks (host_member_id, post_id, visitor_hash)
  WHERE host_member_id IS NOT NULL;

-- 5. Per-visitor uniqueness on curriculum_reads
ALTER TABLE public.curriculum_reads
  DROP CONSTRAINT IF EXISTS curriculum_reads_unique_member_item;

ALTER TABLE public.curriculum_reads
  ADD COLUMN IF NOT EXISTS host_member_id uuid,
  ADD COLUMN IF NOT EXISTS visitor_hash text;

CREATE UNIQUE INDEX IF NOT EXISTS curriculum_reads_unique_owner
  ON public.curriculum_reads (member_id, item_id)
  WHERE host_member_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS curriculum_reads_unique_visitor
  ON public.curriculum_reads (host_member_id, item_id, visitor_hash)
  WHERE host_member_id IS NOT NULL;
