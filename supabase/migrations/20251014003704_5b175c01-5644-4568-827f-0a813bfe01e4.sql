-- Function to link Ko-fi orders and activate licenses when new profile is created
CREATE OR REPLACE FUNCTION public.link_kofi_orders_to_new_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  rec RECORD;
  v_expires_at TIMESTAMPTZ;
BEGIN
  -- Attach any pending Ko-fi orders to this user by email (case-insensitive)
  UPDATE public.kofi_orders ko
  SET user_id = NEW.id
  WHERE LOWER(ko.email) = LOWER(NEW.email)
    AND ko.user_id IS NULL;

  -- For each unprocessed order with a license, create activation if missing
  FOR rec IN
    SELECT ko.id as order_id, ko.license_id, l.duration_days
    FROM public.kofi_orders ko
    JOIN public.licenses l ON l.id = ko.license_id
    WHERE ko.user_id = NEW.id
      AND COALESCE(ko.processed, false) = false
      AND ko.license_id IS NOT NULL
  LOOP
    v_expires_at := NOW() + (rec.duration_days || ' days')::INTERVAL;

    -- Create user_licenses only if it doesn't exist and keep it active
    IF NOT EXISTS (
      SELECT 1 FROM public.user_licenses ul
      WHERE ul.user_id = NEW.id
        AND ul.license_id = rec.license_id
        AND COALESCE(ul.is_active, true) = true
    ) THEN
      INSERT INTO public.user_licenses (user_id, license_id, expires_at, is_active)
      VALUES (NEW.id, rec.license_id, v_expires_at, true);

      -- Increment activation count up to max
      UPDATE public.licenses
      SET current_activations = LEAST(max_activations, current_activations + 1)
      WHERE id = rec.license_id;
    END IF;

    -- Mark order as processed
    UPDATE public.kofi_orders
    SET processed = true
    WHERE id = rec.order_id;
  END LOOP;

  RETURN NEW;
END;
$$;

-- Create trigger on profiles table
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.link_kofi_orders_to_new_profile();