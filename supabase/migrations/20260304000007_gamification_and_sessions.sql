-- Gamification and Sessions Migration
-- 1. Expand Profiles Table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS xp integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS level integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS daily_streak integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_study_date date,
ADD COLUMN IF NOT EXISTS badges text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS phone text;

-- 2. Create Study Sessions Table
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  subject text,
  lesson text,
  duration_minutes integer DEFAULT 0,
  completed_at timestamptz DEFAULT now()
);

-- 3. Create Achievements Table
CREATE TABLE IF NOT EXISTS public.achievements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  icon text,
  awarded_at timestamptz DEFAULT now()
);

-- 4. Enable RLS
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- 5. Policies
CREATE POLICY "Users can view their own sessions" ON public.study_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own sessions" ON public.study_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own achievements" ON public.achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can award achievements" ON public.achievements FOR INSERT WITH CHECK (true); -- Ideally restricted but for simplicity here

-- 6. RPC function to update XP and Level
CREATE OR REPLACE FUNCTION public.add_xp(user_id uuid, xp_to_add integer)
RETURNS void AS $$
DECLARE
  current_xp integer;
  current_level integer;
  new_xp integer;
  new_level integer;
BEGIN
  -- Get current values
  SELECT xp, level INTO current_xp, current_level FROM public.profiles WHERE id = user_id;
  
  new_xp := current_xp + xp_to_add;
  -- Simple leveling logic: level = floor(sqrt(xp / 100)) + 1
  new_level := floor(sqrt(new_xp / 100.0)) + 1;
  
  UPDATE public.profiles 
  SET xp = new_xp, level = new_level 
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. RPC for streaks
CREATE OR REPLACE FUNCTION public.update_streak(user_id uuid)
RETURNS integer AS $$
DECLARE
  last_date date;
  today date := current_date;
  current_streak integer;
BEGIN
  SELECT last_study_date, daily_streak INTO last_date, current_streak FROM public.profiles WHERE id = user_id;
  
  IF last_date IS NULL OR last_date < today - interval '1 day' THEN
    current_streak := 1;
  ELSIF last_date = today - interval '1 day' THEN
    current_streak := current_streak + 1;
  END IF;
  
  UPDATE public.profiles 
  SET daily_streak = current_streak, last_study_date = today 
  WHERE id = user_id;
  
  RETURN current_streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
