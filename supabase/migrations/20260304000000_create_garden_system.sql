-- Migration: Create Garden System
-- This migration adds a table for tracking garden items and a function to decrement stars.

-- Create garden items table
CREATE TABLE IF NOT EXISTS public.garden_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL, -- 'tree', 'grass', 'house', 'farmer'
    position JSONB NOT NULL DEFAULT '{"x": 0, "y": 0, "z": 0}',
    scale FLOAT DEFAULT 1,
    rotation FLOAT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.garden_items ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'garden_items' AND policyname = 'Users can view their own garden items'
    ) THEN
        CREATE POLICY "Users can view their own garden items" ON public.garden_items
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'garden_items' AND policyname = 'Users can insert their own garden items'
    ) THEN
        CREATE POLICY "Users can insert their own garden items" ON public.garden_items
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'garden_items' AND policyname = 'Users can delete their own garden items'
    ) THEN
        CREATE POLICY "Users can delete their own garden items" ON public.garden_items
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Function to decrement stars for a user (safe spending)
CREATE OR REPLACE FUNCTION public.decrement_stars(user_id uuid, amount integer)
RETURNS integer AS $$
DECLARE
  current_stars integer;
  new_count integer;
BEGIN
  -- Get current stars
  SELECT stars_count INTO current_stars FROM public.profiles WHERE id = user_id;
  
  -- Check if user has enough stars
  IF current_stars < amount THEN
    RAISE EXCEPTION 'Insufficient stars balance';
  END IF;

  UPDATE public.profiles
  SET stars_count = stars_count - amount
  WHERE id = user_id
  RETURNING stars_count INTO new_count;
  
  RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
