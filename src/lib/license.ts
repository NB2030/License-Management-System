import { supabase } from './supabase';
import { logError, mapErrorToUserMessage } from './errors';

const OFFLINE_LICENSE_KEY = 'app_license_offline';

export interface OfflineLicenseData {
  userId: string;
  email: string;
  fullName: string;
  licenseKey: string;
  expiresAt: string;
  lastValidated: string;
}

export const licenseService = {
  async activateLicense(licenseKey: string, userId: string): Promise<{ success: boolean; message: string; expiresAt?: string }> {
    try {
      const { data: license, error: licenseError } = await supabase
        .from('licenses')
        .select('*')
        .eq('license_key', licenseKey)
        .eq('is_active', true)
        .maybeSingle();

      if (licenseError) throw licenseError;
      if (!license) {
        return { success: false, message: 'رمز الترخيص غير صالح أو غير نشط' };
      }

      if (license.current_activations >= license.max_activations) {
        return { success: false, message: 'تم الوصول للحد الأقصى من التفعيلات لهذا الترخيص' };
      }

      const { data: existingLicense } = await supabase
        .from('user_licenses')
        .select('*')
        .eq('user_id', userId)
        .eq('license_id', license.id)
        .maybeSingle();

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + license.duration_days);

      if (existingLicense) {
        const { error: updateError } = await supabase
          .from('user_licenses')
          .update({
            is_active: true,
            expires_at: expiresAt.toISOString(),
            last_validated: new Date().toISOString(),
          })
          .eq('id', existingLicense.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('user_licenses')
          .insert({
            user_id: userId,
            license_id: license.id,
            expires_at: expiresAt.toISOString(),
            is_active: true,
          });

        if (insertError) throw insertError;

        const { error: updateCountError } = await supabase
          .from('licenses')
          .update({
            current_activations: license.current_activations + 1,
          })
          .eq('id', license.id);

        if (updateCountError) throw updateCountError;
      }

      return {
        success: true,
        message: 'تم تفعيل الترخيص بنجاح',
        expiresAt: expiresAt.toISOString(),
      };
  } catch (error) {
    logError('License activation', error);
    return { success: false, message: mapErrorToUserMessage(error) };
  }
  },

  async checkUserLicense(userId: string): Promise<{ isValid: boolean; expiresAt?: string }> {
    try {
      const { data, error } = await supabase
        .from('user_licenses')
        .select('*, licenses(*)')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('expires_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data) return { isValid: false };

      const now = new Date();
      const expiresAt = new Date(data.expires_at);

      if (expiresAt < now) {
        await supabase
          .from('user_licenses')
          .update({ is_active: false })
          .eq('id', data.id);

        return { isValid: false };
      }

      await supabase
        .from('user_licenses')
        .update({ last_validated: new Date().toISOString() })
        .eq('id', data.id);

      return { isValid: true, expiresAt: data.expires_at };
  } catch (error) {
    logError('License check', error);
    return { isValid: false };
  }
  },

  saveOfflineLicense(data: OfflineLicenseData) {
    localStorage.setItem(OFFLINE_LICENSE_KEY, JSON.stringify(data));
  },

  getOfflineLicense(): OfflineLicenseData | null {
    const data = localStorage.getItem(OFFLINE_LICENSE_KEY);
    if (!data) return null;

    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  checkOfflineLicense(): boolean {
    const license = this.getOfflineLicense();
    if (!license) return false;

    const now = new Date();
    const expiresAt = new Date(license.expiresAt);

    return expiresAt > now;
  },

  clearOfflineLicense() {
    localStorage.removeItem(OFFLINE_LICENSE_KEY);
  },

  async validateAndSyncLicense(userId: string): Promise<{ isValid: boolean; isOffline: boolean }> {
    try {
      const onlineCheck = await this.checkUserLicense(userId);

      if (onlineCheck.isValid && onlineCheck.expiresAt) {
        const { data: user } = await supabase.auth.getUser();
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (user.user && profile) {
          const { data: userLicense } = await supabase
            .from('user_licenses')
            .select('*, licenses(*)')
            .eq('user_id', userId)
            .eq('is_active', true)
            .order('expires_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (userLicense && userLicense.licenses) {
            this.saveOfflineLicense({
              userId: profile.id,
              email: profile.email,
              fullName: profile.full_name,
              licenseKey: userLicense.licenses.license_key,
              expiresAt: userLicense.expires_at,
              lastValidated: new Date().toISOString(),
            });
          }
        }

        return { isValid: true, isOffline: false };
      }

      return { isValid: false, isOffline: false };
    } catch (error) {
      const offlineValid = this.checkOfflineLicense();
      return { isValid: offlineValid, isOffline: true };
    }
  },
};
