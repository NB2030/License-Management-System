import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Environment variables:', {
    url: supabaseUrl,
    key: supabaseAnonKey ? 'present' : 'missing',
    allEnv: import.meta.env
  });
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
}

export interface License {
  id: string;
  license_key: string;
  duration_days: number;
  max_activations: number;
  current_activations: number;
  is_active: boolean;
  created_at: string;
  created_by: string;
  notes: string;
}

export interface UserLicense {
  id: string;
  user_id: string;
  license_id: string;
  activated_at: string;
  expires_at: string;
  is_active: boolean;
  last_validated: string;
}

export interface UserLicenseWithDetails extends UserLicense {
  profiles?: Profile;
  licenses?: License;
}
