-- Fix critical security issues

-- 1. Create SECURITY DEFINER function to check admin status (prevents infinite recursion in RLS)
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = check_user_id
  );
$$;

-- 2. Fix update_updated_at_column to have proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 3. Remove the dangerous public access policy from admin_access_codes
DROP POLICY IF EXISTS "Anyone can read active access codes" ON public.admin_access_codes;

-- 4. Add admin-only access policy for admin_access_codes
CREATE POLICY "Only admins can read access codes"
ON public.admin_access_codes
FOR SELECT
USING (public.is_admin(auth.uid()));

-- 5. Update all admin_access_codes policies to use the is_admin function
DROP POLICY IF EXISTS "Admins can manage access codes" ON public.admin_access_codes;
CREATE POLICY "Admins can manage access codes"
ON public.admin_access_codes
FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- 6. Add INSERT and UPDATE policies for admin_users table
CREATE POLICY "Users can insert own admin record with valid access code"
ON public.admin_users
FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.admin_access_codes
    WHERE access_code = admin_users.access_code_used
    AND is_active = true
  )
);

CREATE POLICY "Users can update own admin record"
ON public.admin_users
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 7. Update all licenses policies to use is_admin function
DROP POLICY IF EXISTS "Admins can view all licenses" ON public.licenses;
DROP POLICY IF EXISTS "Admins can insert licenses" ON public.licenses;
DROP POLICY IF EXISTS "Admins can update licenses" ON public.licenses;
DROP POLICY IF EXISTS "Admins can delete licenses" ON public.licenses;

CREATE POLICY "Admins can view all licenses"
ON public.licenses
FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert licenses"
ON public.licenses
FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update licenses"
ON public.licenses
FOR UPDATE
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete licenses"
ON public.licenses
FOR DELETE
USING (public.is_admin(auth.uid()));

-- 8. Update user_licenses admin policies to use is_admin function
DROP POLICY IF EXISTS "Admins can view all user licenses" ON public.user_licenses;
DROP POLICY IF EXISTS "Admins can update all user licenses" ON public.user_licenses;

CREATE POLICY "Admins can view all user licenses"
ON public.user_licenses
FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all user licenses"
ON public.user_licenses
FOR UPDATE
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));