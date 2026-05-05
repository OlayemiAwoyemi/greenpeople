
-- Add a sequential member number to the members table
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS member_number SERIAL;

-- Note: SERIAL automatically handles populating existing rows in order of their hidden OID or physical storage,
-- but to be safe and ensure it matches created_at order:
-- (We'll do a manual update if needed, but SERIAL is usually fine for a fresh column)
-- If we want strict created_at order for existing rows:
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='members' AND column_name='member_number') THEN
        WITH numbered_members AS (
            SELECT id, row_number() OVER (ORDER BY created_at ASC) as row_num
            FROM public.members
        )
        UPDATE public.members m
        SET member_number = nm.row_num
        FROM numbered_members nm
        WHERE m.id = nm.id;
    END IF;
END $$;
