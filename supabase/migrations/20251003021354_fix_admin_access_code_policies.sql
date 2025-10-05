/*
  # Fix Admin Access Code Policies

  ## Problem
  New users (not authenticated yet) cannot read access codes to verify them during registration.

  ## Solution
  - Allow anonymous users to read active access codes (for verification only)
  - Keep write operations restricted to admins only

  ## Security
  - Only active codes are visible
  - No one can modify codes except admins
*/

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Users can read active access codes" ON admin_access_codes;

-- Allow anyone (including anonymous) to read active codes for verification
CREATE POLICY "Anyone can read active access codes"
  ON admin_access_codes FOR SELECT
  TO public
  USING (is_active = true);

-- Keep admin-only management policy
DROP POLICY IF EXISTS "Admins can manage access codes" ON admin_access_codes;

CREATE POLICY "Admins can manage access codes"
  ON admin_access_codes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );