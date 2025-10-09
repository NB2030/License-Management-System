import { supabase } from './supabase';
import { logError } from './errors';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
}

export const authService = {
  async signUp(email: string, password: string, fullName: string) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('No user returned');

    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      email,
      full_name: fullName,
    });

    if (profileError) throw profileError;

    return authData.user;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data.user;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile) return null;

    return {
      id: user.id,
      email: profile.email,
      full_name: profile.full_name,
    };
  },

  async isAdmin(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase.rpc('is_admin', { check_user_id: user.id });
      
      if (error) {
        logError('isAdmin check', error);
        return false;
      }

      return !!data;
    } catch (error) {
      logError('isAdmin check', error);
      return false;
    }
  },

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange((_event: string, session: any) => {
      (async () => {
        if (session?.user) {
          const user = await authService.getCurrentUser();
          callback(user);
        } else {
          callback(null);
        }
      })();
    });
  },
};
