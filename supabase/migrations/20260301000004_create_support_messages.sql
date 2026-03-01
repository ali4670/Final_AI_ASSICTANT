-- Create support_messages table
CREATE TABLE IF NOT EXISTS public.support_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'archived')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'support_messages' AND policyname = 'Users can insert their own messages'
    ) THEN
        CREATE POLICY "Users can insert their own messages"
            ON public.support_messages
            FOR INSERT
            WITH CHECK (true); -- Allow anonymous or authenticated inserts
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'support_messages' AND policyname = 'Admins can view all messages'
    ) THEN
        CREATE POLICY "Admins can view all messages"
            ON public.support_messages
            FOR ALL
            USING (
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE id = auth.uid() AND is_admin = true
                )
            );
    END IF;
END $$;
