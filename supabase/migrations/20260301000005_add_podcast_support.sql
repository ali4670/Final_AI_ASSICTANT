-- Add podcast support to neural summaries
ALTER TABLE public.neural_summaries ADD COLUMN IF NOT EXISTS podcast_url TEXT;
