-- Migration for Resumes and System Settings
-- Created on: 2026-03-01

-- Resumes table
CREATE TABLE IF NOT EXISTS public.resumes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'Untitled Resume',
    content JSONB DEFAULT '{}',
    template_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for Resumes
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'resumes' AND policyname = 'Users can manage their own resumes'
    ) THEN
        CREATE POLICY "Users can manage their own resumes"
            ON public.resumes
            FOR ALL
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- System Settings table (Admin Only)
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for System Settings
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'system_settings' AND policyname = 'Admins can manage system settings'
    ) THEN
        CREATE POLICY "Admins can manage system settings"
            ON public.system_settings
            FOR ALL
            USING (
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE id = auth.uid() AND is_admin = true
                )
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'system_settings' AND policyname = 'Authenticated users can read settings'
    ) THEN
        CREATE POLICY "Authenticated users can read settings"
            ON public.system_settings
            FOR SELECT
            TO authenticated
            USING (true);
    END IF;
END $$;

-- Insert default settings if they don't exist
INSERT INTO public.system_settings (key, value, description)
VALUES 
('GROQ_API_KEY', '', 'API Key for Groq Cloud'),
('OPENAI_API_KEY', '', 'API Key for OpenAI'),
('SPOTIFY_CLIENT_ID', '', 'Spotify Application Client ID'),
('SPOTIFY_CLIENT_SECRET', '', 'Spotify Application Client Secret'),
('MONGO_URI', '', 'MongoDB Connection String (Optional)')
ON CONFLICT (key) DO NOTHING;
