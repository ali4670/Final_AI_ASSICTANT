-- Add is_admin column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Update handle_new_user function to include is_admin from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, stars_count, is_admin)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'username', new.email), 
    0,
    COALESCE((new.raw_user_meta_data->>'is_admin')::boolean, false)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment stars for a user
CREATE OR REPLACE FUNCTION public.increment_stars(user_id uuid)
RETURNS integer AS $$
DECLARE
  new_count integer;
BEGIN
  UPDATE public.profiles
  SET stars_count = stars_count + 1
  WHERE id = user_id
  RETURNING stars_count INTO new_count;
  
  RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing profiles with is_admin from auth.users metadata if available
UPDATE public.profiles p
SET is_admin = COALESCE((u.raw_user_meta_data->>'is_admin')::boolean, false)
FROM auth.users u
WHERE p.id = u.id;
