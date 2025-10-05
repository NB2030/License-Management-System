import { useState, useEffect } from 'react';
import { authService, AuthUser } from '../lib/auth';
import { licenseService } from '../lib/license';
import { supabase, UserLicenseWithDetails } from '../lib/supabase';
import { User, Key, Calendar, LogOut, Wifi, WifiOff } from 'lucide-react';

interface UserProfileProps {
  onLogout: () => void;
}

export default function UserProfile({ onLogout }: UserProfileProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [licenses, setLicenses] = useState<UserLicenseWithDetails[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);

        const { data } = await supabase
          .from('user_licenses')
          .select('*, licenses(*)')
          .eq('user_id', currentUser.id)
          .order('activated_at', { ascending: false });

        if (data) setLicenses(data);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.signOut();
    licenseService.clearOfflineLicense();
    onLogout();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const activeLicense = licenses.find(
    (l) => l.is_active && new Date(l.expires_at) > new Date()
  );

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{user?.full_name}</h2>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  isOnline ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                }`}
              >
                {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                <span className="text-sm font-medium">
                  {isOnline ? 'متصل' : 'غير متصل'}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                تسجيل الخروج
              </button>
            </div>
          </div>

          {activeLicense ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-700 mb-2">
                <Key className="w-5 h-5" />
                <span className="font-semibold">حالة الترخيص: نشط</span>
              </div>
              <div className="space-y-2 text-sm text-green-700">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    ينتهي في: {new Date(activeLicense.expires_at).toLocaleDateString('ar-SA')}
                  </span>
                </div>
                <p>
                  الأيام المتبقية:{' '}
                  {Math.ceil(
                    (new Date(activeLicense.expires_at).getTime() - new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}{' '}
                  يوم
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-700">
                <Key className="w-5 h-5" />
                <span className="font-semibold">لا يوجد ترخيص نشط</span>
              </div>
              <p className="text-sm text-yellow-600 mt-2">
                الرجاء تفعيل ترخيص للاستمرار في استخدام التطبيق
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">سجل التراخيص</h3>
          </div>

          <div className="divide-y divide-gray-200">
            {licenses.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                لا توجد تراخيص مسجلة
              </div>
            ) : (
              licenses.map((license) => {
                const isExpired = new Date(license.expires_at) < new Date();
                const isActive = license.is_active && !isExpired;

                return (
                  <div key={license.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                            {license.licenses?.license_key}
                          </code>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              isActive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {isActive ? 'نشط' : isExpired ? 'منتهي' : 'غير نشط'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>تاريخ التفعيل: {new Date(license.activated_at).toLocaleDateString('ar-SA')}</p>
                          <p>تاريخ الانتهاء: {new Date(license.expires_at).toLocaleDateString('ar-SA')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {!isOnline && (
          <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-700">
              أنت تعمل حاليًا في وضع عدم الاتصال. سيتم مزامنة بياناتك عند الاتصال بالإنترنت.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
