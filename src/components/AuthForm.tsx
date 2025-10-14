import { useState } from 'react';
import { authService } from '../lib/auth';
import { licenseService } from '../lib/license';
import { registerSchema, loginSchema } from '../lib/validation';
import { logError } from '../lib/errors';
import { LogIn, UserPlus, Key } from 'lucide-react';
import { z } from 'zod';
import { APP_CONFIG } from '../config/app';

interface AuthFormProps {
  onAuthSuccess: () => void;
}

export default function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [requiresLicense, setRequiresLicense] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate input
      const schema = mode === 'signup' ? registerSchema : loginSchema;
      const validationData = {
        email,
        password,
        ...(mode === 'signup' && { fullName }),
        ...(licenseKey && { licenseKey }),
      };

      try {
        schema.parse(validationData);
      } catch (validationError) {
        if (validationError instanceof z.ZodError) {
          setError(validationError.issues[0].message);
          setLoading(false);
          return;
        }
      }

      if (mode === 'signup') {

        const user = await authService.signUp(email, password, fullName);

        if (licenseKey) {
          const result = await licenseService.activateLicense(
            licenseKey, 
            APP_CONFIG.APP_KEY, 
            APP_CONFIG.APP_SECRET
          );
          if (!result.success) {
            setError(result.message);
            return;
          }

          if (result.expiresAt) {
            const profile = await authService.getCurrentUser();
            if (profile) {
              licenseService.saveOfflineLicense({
                userId: user.id,
                email: profile.email,
                fullName: profile.full_name,
                licenseKey,
                expiresAt: result.expiresAt,
                lastValidated: new Date().toISOString(),
              });
            }
          }
        }

        onAuthSuccess();
      } else {
        await authService.signIn(email, password);

        const user = await authService.getCurrentUser();
        if (!user) {
          setError('فشل تسجيل الدخول');
          return;
        }

        if (licenseKey) {
          const result = await licenseService.activateLicense(
            licenseKey, 
            APP_CONFIG.APP_KEY, 
            APP_CONFIG.APP_SECRET
          );
          if (!result.success) {
            setError(result.message);
            return;
          }
        }

        const licenseCheck = await licenseService.validateAndSyncLicense(
          APP_CONFIG.APP_KEY,
          APP_CONFIG.APP_SECRET
        );

        if (!licenseCheck.isValid) {
          setRequiresLicense(true);
          setError('يجب تفعيل ترخيص للوصول إلى التطبيق');
          return;
        }

        onAuthSuccess();
      }
    } catch (err: any) {
      logError('Auth form submission', err);
      setError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Key className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {mode === 'signin' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
          </h2>
          <p className="mt-2 text-gray-600">
            {mode === 'signin'
              ? 'أدخل بياناتك للوصول إلى التطبيق'
              : 'قم بإنشاء حساب جديد وتفعيل الترخيص'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 text-center">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="أدخل اسمك الكامل"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={mode === 'signup' ? 8 : 1}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              مفتاح الترخيص {mode === 'signin' && !requiresLicense && '(اختياري)'}
            </label>
            <input
              type="text"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
              required={mode === 'signup' || requiresLicense}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
              placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                جاري المعالجة...
              </>
            ) : mode === 'signin' ? (
              <>
                <LogIn className="w-5 h-5" />
                تسجيل الدخول
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                إنشاء حساب
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setError('');
              setRequiresLicense(false);
            }}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {mode === 'signin' ? 'ليس لديك حساب؟ إنشاء حساب جديد' : 'لديك حساب؟ تسجيل الدخول'}
          </button>
        </div>
      </div>
    </div>
  );
}
