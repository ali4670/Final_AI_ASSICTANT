-- Add focus biome growth tracking
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS focus_growth_points INTEGER DEFAULT 0;
