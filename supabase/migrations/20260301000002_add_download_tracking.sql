-- Add desktop download tracking to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS has_downloaded_desktop BOOLEAN DEFAULT false;
