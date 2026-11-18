-- =====================================================================
-- Security lockdown
--  * Real admin sign-in (Supabase Auth + admin_users + is_admin()).
--  * Members' personal data (phone, age, reason…) is no longer readable
--    by the public. Public features use narrow, read-only functions.
--  * Content tables: anyone can read, only admins can change.
--  * Activity tables: anyone can add a row and read scores, nobody can
--    edit or delete them from the browser.
--  * Chat transcripts and the sign-up log: write-only for the public,
--    readable by admins.
-- =====================================================================

-- ---------- Admins ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id    uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.admin_exists()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_users);
$$;

-- The very first signed-in account becomes the admin. After that, only an
-- existing admin can add more (via add_admin_by_email).
CREATE OR REPLACE FUNCTION public.claim_first_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN false; END IF;
  LOCK TABLE public.admin_users IN EXCLUSIVE MODE;
  IF EXISTS (SELECT 1 FROM public.admin_users) THEN
    RETURN EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid());
  END IF;
  INSERT INTO public.admin_users (user_id) VALUES (auth.uid());
  RETURN true;
END $$;

CREATE OR REPLACE FUNCTION public.add_admin_by_email(p_email text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_id uuid;
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Not allowed'; END IF;
  SELECT id INTO v_id FROM auth.users WHERE lower(email) = lower(trim(p_email));
  IF v_id IS NULL THEN RETURN false; END IF;
  INSERT INTO public.admin_users (user_id) VALUES (v_id) ON CONFLICT DO NOTHING;
  RETURN true;
END $$;

CREATE POLICY "Admins can see admins" ON public.admin_users
  FOR SELECT TO authenticated USING (public.is_admin());

-- ---------- Clear every old policy on the app's tables -----------------
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT policyname, tablename FROM pg_policies
    WHERE schemaname = 'public' AND tablename IN (
      'members','member_signup_log','blog_posts','chat_conversations','chat_messages',
      'finance_entries','social_posts','curriculum_items','lesson_quizzes',
      'page_visits','member_referrals','quiz_attempts','social_clicks','curriculum_reads')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['members','member_signup_log','blog_posts','chat_conversations','chat_messages',
    'finance_entries','social_posts','curriculum_items','lesson_quizzes',
    'page_visits','member_referrals','quiz_attempts','social_clicks','curriculum_reads']
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;

-- ---------- Members: admins only (public goes through functions) -------
CREATE POLICY "Admins read members"   ON public.members FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins update members" ON public.members FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins delete members" ON public.members FOR DELETE TO authenticated USING (public.is_admin());

-- Sign-up log: anyone can write a line, only admins can read it.
CREATE POLICY "Anyone logs a signup"  ON public.member_signup_log FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins read signup log" ON public.member_signup_log FOR SELECT TO authenticated USING (public.is_admin());

-- ---------- Content: public read, admin write --------------------------
CREATE POLICY "Read published posts" ON public.blog_posts FOR SELECT TO anon, authenticated USING (published = true OR public.is_admin());
CREATE POLICY "Admins write posts"   ON public.blog_posts FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['finance_entries','social_posts','curriculum_items','lesson_quizzes']
  LOOP
    EXECUTE format('CREATE POLICY "Anyone reads" ON public.%I FOR SELECT TO anon, authenticated USING (true)', t);
    EXECUTE format('CREATE POLICY "Admins write" ON public.%I FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin())', t);
  END LOOP;
END $$;

-- ---------- Activity: add and read, never edit or delete ---------------
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['page_visits','member_referrals','quiz_attempts','social_clicks','curriculum_reads']
  LOOP
    EXECUTE format('CREATE POLICY "Anyone reads" ON public.%I FOR SELECT TO anon, authenticated USING (true)', t);
    EXECUTE format('CREATE POLICY "Anyone adds"  ON public.%I FOR INSERT TO anon, authenticated WITH CHECK (true)', t);
    EXECUTE format('CREATE POLICY "Admins delete" ON public.%I FOR DELETE TO authenticated USING (public.is_admin())', t);
  END LOOP;
END $$;

-- ---------- Chat: visitors write, admins read --------------------------
CREATE POLICY "Anyone starts a chat"  ON public.chat_conversations FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins read chats"     ON public.chat_conversations FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins delete chats"   ON public.chat_conversations FOR DELETE TO authenticated USING (public.is_admin());
CREATE POLICY "Anyone adds a message" ON public.chat_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins read messages"  ON public.chat_messages FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins delete messages" ON public.chat_messages FOR DELETE TO authenticated USING (public.is_admin());

-- ---------- Storage: blog images uploaded by admins only ---------------
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND cmd IN ('INSERT','UPDATE','DELETE','ALL')
      AND (coalesce(qual,'') || coalesce(with_check,'')) LIKE '%blog-images%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', r.policyname);
  END LOOP;
END $$;

CREATE POLICY "Admins upload blog images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'blog-images' AND public.is_admin());
CREATE POLICY "Admins change blog images" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'blog-images' AND public.is_admin());
CREATE POLICY "Admins remove blog images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'blog-images' AND public.is_admin());

-- ---------- Public, read-only functions --------------------------------

-- Headline numbers for the live counter and momentum section.
CREATE OR REPLACE FUNCTION public.public_member_stats()
RETURNS TABLE (members bigint, pvc_holders bigint, states bigint, lgas bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT count(*),
         count(*) FILTER (WHERE has_pvc = 'Yes'),
         count(DISTINCT state),
         count(DISTINCT state || '|' || lga)
  FROM public.members;
$$;

-- Recent "why I joined" quotes. First name and surname initial only.
CREATE OR REPLACE FUNCTION public.public_testimonials(p_limit int DEFAULT 20)
RETURNS TABLE (full_name text, state text, reason text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT trim(split_part(m.full_name, ' ', 1) || ' ' ||
              CASE WHEN position(' ' in trim(m.full_name)) > 0
                   THEN left(reverse(split_part(reverse(trim(m.full_name)), ' ', 1)), 1) || '.'
                   ELSE '' END),
         m.state, m.reason
  FROM public.members m
  WHERE m.reason IS NOT NULL AND m.reason <> ''
  ORDER BY m.created_at DESC
  LIMIT least(greatest(p_limit, 1), 50);
$$;

-- Names, states and member numbers for the leaderboard. No phone numbers.
CREATE OR REPLACE FUNCTION public.public_member_directory()
RETURNS TABLE (id uuid, full_name text, state text, member_number int)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT m.id, m.full_name, m.state, m.member_number FROM public.members m;
$$;

-- One member's public page. Accepts a member number (short) or the phone
-- number people already shared (long), so old links keep working.
CREATE OR REPLACE FUNCTION public.get_member_page(p_ref text)
RETURNS TABLE (id uuid, full_name text, state text, lga text, gender text, has_pvc text, member_number int)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
#variable_conflict use_column
DECLARE d text := regexp_replace(coalesce(p_ref, ''), '\D', '', 'g');
BEGIN
  IF d = '' THEN RETURN; END IF;
  IF length(d) <= 7 THEN
    RETURN QUERY SELECT m.id, m.full_name, m.state, m.lga, m.gender, m.has_pvc, m.member_number
      FROM public.members m WHERE m.member_number = d::int LIMIT 1;
  ELSE
    -- Compare the last 10 digits so 0803…, 803… and 234803… all match.
    RETURN QUERY SELECT m.id, m.full_name, m.state, m.lga, m.gender, m.has_pvc, m.member_number
      FROM public.members m
      WHERE right(regexp_replace(m.phone, '\D', '', 'g'), 10) = right(d, 10)
      LIMIT 1;
  END IF;
END $$;

-- Join form: adds the member and hands back their id and number.
CREATE OR REPLACE FUNCTION public.register_member(p jsonb)
RETURNS TABLE (id uuid, member_number int)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
#variable_conflict use_column
BEGIN
  RETURN QUERY
  INSERT INTO public.members AS m (full_name, first_name, middle_name, surname, phone, state, lga,
                                   age_group, gender, has_pvc, reason, is_nigeria_based, referrer_id)
  VALUES (
    left(p->>'full_name', 200), left(p->>'first_name', 80), nullif(left(p->>'middle_name', 80), ''),
    left(p->>'surname', 80), left(p->>'phone', 30), left(p->>'state', 60), left(p->>'lga', 80),
    left(p->>'age_group', 30), left(p->>'gender', 30), left(p->>'has_pvc', 10),
    nullif(left(p->>'reason', 1000), ''), (p->>'is_nigeria_based')::boolean,
    nullif(p->>'referrer_id', '')::uuid)
  RETURNING m.id, m.member_number;
END $$;

REVOKE ALL ON FUNCTION public.claim_first_admin(), public.add_admin_by_email(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.is_admin(), public.admin_exists(), public.public_member_stats(),
  public.public_testimonials(int), public.public_member_directory(), public.get_member_page(text),
  public.register_member(jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_first_admin(), public.add_admin_by_email(text) TO authenticated;
