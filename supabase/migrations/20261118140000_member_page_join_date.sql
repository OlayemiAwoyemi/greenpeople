DROP FUNCTION IF EXISTS public.get_member_page(text);

CREATE FUNCTION public.get_member_page(p_ref text)
RETURNS TABLE (id uuid, full_name text, state text, lga text, gender text,
               has_pvc text, member_number int, joined_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
#variable_conflict use_column
DECLARE d text := regexp_replace(coalesce(p_ref, ''), '\D', '', 'g');
BEGIN
  IF d = '' THEN RETURN; END IF;
  IF length(d) <= 7 THEN
    RETURN QUERY SELECT m.id, m.full_name, m.state, m.lga, m.gender, m.has_pvc,
      m.member_number, m.created_at
      FROM public.members m WHERE m.member_number = d::int LIMIT 1;
  ELSE
    RETURN QUERY SELECT m.id, m.full_name, m.state, m.lga, m.gender, m.has_pvc,
      m.member_number, m.created_at
      FROM public.members m
      WHERE right(regexp_replace(m.phone, '\D', '', 'g'), 10) = right(d, 10) LIMIT 1;
  END IF;
END $$;

GRANT EXECUTE ON FUNCTION public.get_member_page(text) TO anon, authenticated;
