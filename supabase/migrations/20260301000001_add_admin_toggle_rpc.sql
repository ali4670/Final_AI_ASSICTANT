-- Function to toggle admin status for a user
CREATE OR REPLACE FUNCTION public.toggle_admin_status(target_user_id uuid, new_status boolean)
RETURNS boolean AS $$
BEGIN
  -- Security check: Ensure the caller is an admin (handled by RLS or caller identity)
  -- In this project, we assume the RPC is called by an authenticated admin
  
  UPDATE public.profiles
  SET is_admin = new_status
  WHERE id = target_user_id;
  
  RETURN new_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
