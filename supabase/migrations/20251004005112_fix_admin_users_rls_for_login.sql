/*
  # Fix Admin Users RLS for Login
  
  1. Changes
    - Drop the existing restrictive policy that creates circular dependency
    - Add new policy that allows authenticated users to read their own admin record
    - This allows the login flow to check if user is an admin after authentication
  
  2. Security
    - Users can only read their own admin record
    - Still maintains security by checking auth.uid()
*/

-- Drop the old policy
DROP POLICY IF EXISTS "Admins can view all admin users" ON admin_users;

-- Allow authenticated users to read their own admin record
CREATE POLICY "Users can read own admin record"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow admins to read all admin records
CREATE POLICY "Admins can read all admin records"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );
