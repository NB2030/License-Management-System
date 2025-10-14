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
  async activateLicense(licenseKey: string, appKey: string, appSecret: string): Promise<{ success: boolean; message: string; expiresAt?: string }> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return { success: false, message: 'يجب تسجيل الدخول أولاً' };
      }

      const response = await supabase.functions.invoke('activate-license', {
        body: { licenseKey },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'x-app-key': appKey,
          'x-app-secret': appSecret,
        },
      });

      if (response.error) {
        return { success: false, message: response.error.message || 'حدث خطأ في تفعيل الترخيص' };
      }

      const data = response.data;

      if (!data.success) {
        return { success: false, message: data.message || 'فشل تفعيل الترخيص' };
      }

      return {
        success: true,
        message: data.message || 'تم تفعيل الترخيص بنجاح',
        expiresAt: data.expiresAt,
      };
    } catch (error) {
      logError('License activation', error);
      return { success: false, message: mapErrorToUserMessage(error) };
    }
  },

  async validateLicense(appKey: string, appSecret: string): Promise<{ isValid: boolean; expiresAt?: string; daysRemaining?: number; error?: string }> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return { isValid: false, error: 'يجب تسجيل الدخول أولاً' };
      }

      const response = await supabase.functions.invoke('validate-license-v2', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'x-app-key': appKey,
          'x-app-secret': appSecret,
        },
      });

      if (response.error) {
        return { isValid: false, error: response.error.message };
      }

      const data = response.data;

      if (!data.isValid) {
        return { 
          isValid: false, 
          error: data.message || data.error || 'الترخيص غير صالح' 
        };
      }

      return {
        isValid: true,
        expiresAt: data.expiresAt,
        daysRemaining: data.daysRemaining,
      };
    } catch (error) {
      logError('License validation', error);
      return { isValid: false, error: mapErrorToUserMessage(error) };
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

  async validateAndSyncLicense(appKey: string, appSecret: string): Promise<{ isValid: boolean; isOffline: boolean; expiresAt?: string; daysRemaining?: number }> {
    try {
      const onlineCheck = await this.validateLicense(appKey, appSecret);

      if (onlineCheck.isValid && onlineCheck.expiresAt) {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) {
          return { isValid: false, isOffline: false };
        }
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.user.id)
          .maybeSingle();

        if (user.user && profile) {
          const { data: userLicense } = await supabase
            .from('user_licenses')
            .select('*, licenses(*)')
            .eq('user_id', user.user.id)
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

        return { 
          isValid: true, 
          isOffline: false,
          expiresAt: onlineCheck.expiresAt,
          daysRemaining: onlineCheck.daysRemaining,
        };
      }

      return { isValid: false, isOffline: false };
    } catch (error) {
      const offlineValid = this.checkOfflineLicense();
      return { isValid: offlineValid, isOffline: true };
    }
  },
};
