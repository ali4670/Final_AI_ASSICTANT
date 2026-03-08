-- Migration: Fix and Expand Garden System
-- Fixes the 'decrement_stars' signature and adds more robust error handling.

CREATE OR REPLACE FUNCTION public.decrement_stars(user_id uuid, amount int4)
RETURNS int4 AS $$
DECLARE
  current_stars int4;
  new_count int4;
BEGIN
  -- Get current stars
  SELECT stars_count INTO current_stars FROM public.profiles WHERE id = user_id;
  
  -- Check if user exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  -- Check if user has enough stars
  IF current_stars < amount THEN
    RAISE EXCEPTION 'Insufficient stars balance. Required: %, Available: %', amount, current_stars;
  END IF;

  UPDATE public.profiles
  SET stars_count = stars_count - amount
  WHERE id = user_id
  RETURNING stars_count INTO new_count;
  
  RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Overload for safety (handles flipped arguments if client sends them differently)
CREATE OR REPLACE FUNCTION public.decrement_stars(amount int4, user_id uuid)
RETURNS int4 AS $$
BEGIN
  RETURN public.decrement_stars(user_id, amount);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
