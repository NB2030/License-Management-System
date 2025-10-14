-- License System 2.0: Multi-Application Support
-- This migration adds support for multiple applications with secure API authentication

-- Create applications table
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  app_key TEXT NOT NULL UNIQUE,
  app_secret TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add application_id to licenses table
ALTER TABLE public.licenses 
ADD COLUMN IF NOT EXISTS application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_licenses_application_id ON public.licenses(application_id);
CREATE INDEX IF NOT EXISTS idx_applications_app_key ON public.applications(app_key);

-- Enable RLS on applications table
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for applications
CREATE POLICY "Admins can view all applications"
  ON public.applications
  FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert applications"
  ON public.applications
  FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update applications"
  ON public.applications
  FOR UPDATE
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete applications"
  ON public.applications
  FOR DELETE
  USING (is_admin(auth.uid()));

-- Function to generate secure app keys
CREATE OR REPLACE FUNCTION public.generate_app_key()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  key_prefix TEXT := 'app';
  random_part TEXT;
BEGIN
  random_part := encode(gen_random_bytes(16), 'hex');
  RETURN key_prefix || '_' || random_part;
END;
$$;

-- Function to generate secure app secrets
CREATE OR REPLACE FUNCTION public.generate_app_secret()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$;

-- Function to validate application credentials
CREATE OR REPLACE FUNCTION public.validate_app_credentials(
  p_app_key TEXT,
  p_app_secret TEXT
)
RETURNS TABLE(
  valid BOOLEAN,
  application_id UUID,
  application_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    true AS valid,
    a.id AS application_id,
    a.name AS application_name
  FROM public.applications a
  WHERE a.app_key = p_app_key
    AND a.app_secret = p_app_secret
    AND a.is_active = true;
END;
$$;

-- Trigger to update updated_at on applications
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE public.applications IS 'Stores registered applications that can use the license system';
COMMENT ON COLUMN public.applications.app_key IS 'Public application key for identification';
COMMENT ON COLUMN public.applications.app_secret IS 'Secret key for secure authentication (store securely on client)';
COMMENT ON COLUMN public.licenses.application_id IS 'The application this license is valid for';