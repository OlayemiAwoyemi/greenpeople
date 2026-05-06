-- Cleanup test member and reset member_number sequence
DO $$
DECLARE
    target_id UUID;
BEGIN
    -- 1. Find the member ID
    SELECT id INTO target_id FROM public.members WHERE full_name = 'Olayemi Olamide Awoyemi';

    IF target_id IS NOT NULL THEN
        -- 2. Delete from related tables (foreign key cleanup)
        DELETE FROM public.social_clicks WHERE member_id = target_id OR host_member_id = target_id;
        DELETE FROM public.curriculum_reads WHERE member_id = target_id OR host_member_id = target_id;
        DELETE FROM public.page_visits WHERE host_member_id = target_id;
        DELETE FROM public.member_referrals WHERE referrer_id = target_id OR referred_member_id = target_id;
        DELETE FROM public.quiz_attempts WHERE member_id = target_id OR host_member_id = target_id;
        DELETE FROM public.member_signup_log WHERE member_id = target_id;
        
        -- 3. Delete the member
        DELETE FROM public.members WHERE id = target_id;

        -- 4. Reset the sequence for member_number
        PERFORM setval(
            pg_get_serial_sequence('public.members', 'member_number'), 
            COALESCE((SELECT MAX(member_number) FROM public.members), 0)
        );
        
        RAISE NOTICE 'Member Olayemi Olamide Awoyemi and related data removed. Sequence reset.';
    ELSE
        RAISE NOTICE 'Member Olayemi Olamide Awoyemi not found.';
    END IF;
END $$;
