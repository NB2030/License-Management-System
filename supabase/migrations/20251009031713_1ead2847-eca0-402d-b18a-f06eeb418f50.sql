-- Function to update user_licenses expiry when license duration changes
CREATE OR REPLACE FUNCTION update_user_licenses_expiry()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only update if duration_days has changed
  IF NEW.duration_days != OLD.duration_days THEN
    -- Update all active user_licenses for this license
    UPDATE user_licenses
    SET expires_at = activated_at + (NEW.duration_days || ' days')::interval
    WHERE license_id = NEW.id
      AND is_active = true;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically update user licenses when license duration changes
DROP TRIGGER IF EXISTS trigger_update_user_licenses_expiry ON licenses;
CREATE TRIGGER trigger_update_user_licenses_expiry
  AFTER UPDATE ON licenses
  FOR EACH ROW
  WHEN (OLD.duration_days IS DISTINCT FROM NEW.duration_days)
  EXECUTE FUNCTION update_user_licenses_expiry();

-- Function to delete user account completely (from auth.users)
CREATE OR REPLACE FUNCTION delete_user_account(user_uuid UUID)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result_message text;
BEGIN
  -- Delete from auth.users (this will cascade to profiles and user_licenses)
  DELETE FROM auth.users WHERE id = user_uuid;
  
  IF FOUND THEN
    result_message := 'User account deleted successfully';
  ELSE
    result_message := 'User not found';
  END IF;
  
  RETURN json_build_object('success', FOUND, 'message', result_message);
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'message', SQLERRM);
END;
$$;