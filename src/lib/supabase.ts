export { supabase } from '../integrations/supabase/client';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface License {
  id: string;
  license_key: string;
  duration_days: number;
  max_activations: number;
  current_activations: number;
  is_active: boolean | null;
  created_at: string | null;
  created_by: string | null;
  notes: string | null;
}

export interface UserLicense {
  id: string;
  user_id: string;
  license_id: string;
  activated_at: string | null;
  expires_at: string;
  is_active: boolean | null;
  last_validated: string | null;
}

export interface Application {
  id: string;
  name: string;
  description: string | null;
  app_key: string;
  app_secret: string;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserLicenseWithDetails extends UserLicense {
  profiles?: Profile;
  licenses?: License;
}
