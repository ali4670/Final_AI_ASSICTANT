-- Add phone column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;

-- Update handle_new_user to include phone from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, phone, stars_count, is_admin)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'username', SPLIT_PART(new.email, '@', 1)), 
    new.email,
    new.raw_user_meta_data->>'phone',
    0,
    CASE WHEN new.email = 'aliopooopp3@gmail.com' THEN true ELSE false END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing profiles from auth.users metadata
UPDATE public.profiles p
SET phone = u.raw_user_meta_data->>'phone'
FROM auth.users u
WHERE p.id = u.id AND p.phone IS NULL;
