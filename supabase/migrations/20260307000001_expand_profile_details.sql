-- Migration: Add Profile Fields for Grade, Bio and Productivity
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS grade text,
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS productivity_score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS study_stats jsonb DEFAULT '{"total_hours": 0, "sessions_completed": 0, "quiz_wins": 0}'::jsonb;
