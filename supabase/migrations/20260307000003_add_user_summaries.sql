-- Migration: Add User Summaries and Document Summary Flags
-- 1. Create User Summaries Table
CREATE TABLE IF NOT EXISTS public.user_summaries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  document_id uuid REFERENCES public.documents(id) ON DELETE SET NULL,
  title text NOT NULL,
  content text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 2. Add Summary Flags to Documents
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS is_summary boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS summary_status text DEFAULT 'pending' CHECK (summary_status IN ('pending', 'approved', 'rejected'));

-- 3. Enable RLS
ALTER TABLE public.user_summaries ENABLE ROW LEVEL SECURITY;

-- 4. Policies for User Summaries
CREATE POLICY "Users can view all approved summaries" 
  ON public.user_summaries FOR SELECT 
  USING (status = 'approved' OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own summaries" 
  ON public.user_summaries FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own summaries" 
  ON public.user_summaries FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own summaries" 
  ON public.user_summaries FOR DELETE 
  USING (auth.uid() = user_id);

-- 5. Admin Policy (if needed, but profiles.is_admin handles it usually)
CREATE POLICY "Admins can view and update all summaries" 
  ON public.user_summaries FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- 6. Indexes
CREATE INDEX IF NOT EXISTS user_summaries_user_id_idx ON public.user_summaries(user_id);
CREATE INDEX IF NOT EXISTS user_summaries_status_idx ON public.user_summaries(status);
CREATE INDEX IF NOT EXISTS documents_is_summary_idx ON public.documents(is_summary);
