-- Migration: Initial Star Balance & Welcome Gift
-- Updates the handle_new_user function to give 50 stars to new recruits.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, stars_count, is_admin)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)), 
    50, -- Welcome Gift
    COALESCE((new.raw_user_meta_data->>'is_admin')::boolean, false)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Award 50 stars to any existing user who still has 0 (one-time equalization)
UPDATE public.profiles SET stars_count = 50 WHERE stars_count = 0;
