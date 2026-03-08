-- Migration: Add AI Planner Support
CREATE TABLE IF NOT EXISTS public.planner_schedules (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  schedule_data jsonb NOT NULL, -- The 7-day plan
  created_at timestamptz DEFAULT now() NOT NULL
);

-- RLS
ALTER TABLE public.planner_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own schedules" 
  ON public.planner_schedules FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own schedules" 
  ON public.planner_schedules FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own schedules" 
  ON public.planner_schedules FOR DELETE 
  USING (auth.uid() = user_id);

-- Index
CREATE INDEX IF NOT EXISTS planner_schedules_user_id_idx ON public.planner_schedules(user_id);
