-- Migration: Update increment_stars to support amount
-- This version adds an optional amount parameter (defaulting to 1)

CREATE OR REPLACE FUNCTION public.increment_stars(user_id uuid, amount integer DEFAULT 1)
RETURNS integer AS $$
DECLARE
  new_count integer;
BEGIN
  UPDATE public.profiles
  SET stars_count = stars_count + amount
  WHERE id = user_id
  RETURNING stars_count INTO new_count;
  
  RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Overload to maintain backward compatibility if called without keywords in some environments
CREATE OR REPLACE FUNCTION public.increment_stars(amount integer, user_id uuid)
RETURNS integer AS $$
BEGIN
  RETURN public.increment_stars(user_id, amount);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
