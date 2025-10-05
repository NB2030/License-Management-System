/*
  # Admin Access Code System

  ## Overview
  Simple admin access code system - any user who registers can become admin
  by entering the correct access code.

  ## Changes
  1. Create admin_access_codes table
  2. Insert default admin access code: ADMIN-2024-VEX-SECURE
  3. Update admin_users to track which code was used

  ## Default Admin Access Code
  - Code: ADMIN-2024-VEX-SECURE
  - Use this code after registration to gain admin access
*/

-- Create admin_access_codes table
CREATE TABLE IF NOT EXISTS admin_access_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  access_code text UNIQUE NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  total_uses integer DEFAULT 0
);

-- Enable RLS
ALTER TABLE admin_access_codes ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read active codes (for verification)
CREATE POLICY "Users can read active access codes"
  ON admin_access_codes FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Admins can manage codes
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

-- Update admin_users to track access code
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_users' AND column_name = 'access_code_used'
  ) THEN
    ALTER TABLE admin_users ADD COLUMN access_code_used text;
  END IF;
  
  -- Make password_changed default to true
  ALTER TABLE admin_users ALTER COLUMN password_changed SET DEFAULT true;
END $$;

-- Insert default admin access code
INSERT INTO admin_access_codes (access_code, is_active)
VALUES ('ADMIN-2024-VEX-SECURE', true)
ON CONFLICT (access_code) DO NOTHING;

-- Create index
CREATE INDEX IF NOT EXISTS idx_admin_codes_active ON admin_access_codes(access_code) WHERE is_active = true;