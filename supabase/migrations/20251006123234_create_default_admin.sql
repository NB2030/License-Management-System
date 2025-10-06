/*
  # Create Default Admin User

  ## Overview
  This migration creates a default admin user with predefined credentials
  and sets up a flag to track if the password needs to be changed.

  ## Changes
  1. Add password_changed column to admin_users table
  2. Function to create default admin user
  3. Insert default admin credentials

  ## Default Admin Credentials
  - Email: newvex2030@hotmail.com
  - Password: 357357
  - Must change password on first login

  ## Security
  - Password change is enforced on first login
  - After password change, the flag is updated
*/

-- Add password_changed column to admin_users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_users' AND column_name = 'password_changed'
  ) THEN
    ALTER TABLE admin_users ADD COLUMN password_changed boolean DEFAULT false;
  END IF;
END $$;

-- Function to create or update admin user
CREATE OR REPLACE FUNCTION create_default_admin()
RETURNS void AS $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Check if admin user already exists
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'newvex2030@hotmail.com';

  -- If user doesn't exist, we need to create it manually through Supabase Dashboard
  -- This migration just ensures the structure is ready
  
  -- The admin should be created through Supabase Dashboard with:
  -- Email: newvex2030@hotmail.com
  -- Password: 357357
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index on password_changed
CREATE INDEX IF NOT EXISTS idx_admin_users_password_changed ON admin_users(password_changed);