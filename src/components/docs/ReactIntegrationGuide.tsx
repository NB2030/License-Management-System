import { Code, Package, Settings, CheckCircle } from 'lucide-react';

export default function ReactIntegrationGuide() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8 rounded-lg">
        <h1 className="text-4xl font-bold mb-4">⚛️ دليل دمج React</h1>
        <p className="text-xl">
          قوالب جاهزة لدمج نظام الترخيص في تطبيقات React الخاصة بك
        </p>
      </div>

      {/* Quick Start */}
      <section className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold">🚀 البداية السريعة</h2>
        </div>

        <div className="space-y-4">
          <div className="bg-yellow-50 border-r-4 border-yellow-500 p-4 rounded">
            <h3 className="font-bold mb-2">⚠️ قبل البدء</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>احصل على App Key و App Secret من لوحة الإدارة</li>
              <li>قم بإنشاء ملف <code className="bg-gray-200 px-2 py-1 rounded">.env</code> في جذر المشروع</li>
              <li>لا تشارك App Secret في الكود العام أو GitHub</li>
            </ol>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">1️⃣ إنشاء ملف .env</h3>
            <pre className="bg-gray-800 text-white p-4 rounded overflow-x-auto text-sm">
{`# .env - ضع هذا الملف في جذر المشروع
VITE_APP_KEY=app_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_APP_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# تأكد من إضافة .env إلى .gitignore
# لا تشارك هذه القيم أبداً!`}
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">2️⃣ إضافة .env إلى .gitignore</h3>
            <pre className="bg-gray-800 text-white p-4 rounded overflow-x-auto text-sm">
{`# .gitignore
.env
.env.local
.env.*.local`}
            </pre>
          </div>
        </div>
      </section>

      {/* File Structure */}
      <section className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center gap-3 mb-4">
          <Package className="w-8 h-8 text-purple-600" />
          <h2 className="text-2xl font-bold">📁 هيكل الملفات المطلوب</h2>
        </div>

        <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
{`src/
├── config/
│   └── app.ts              # إعدادات التطبيق (App Key & Secret)
├── lib/
│   ├── supabase.ts         # Supabase client
│   ├── auth.ts             # خدمات المصادقة
│   └── license.ts          # خدمات الترخيص
├── components/
│   ├── AuthForm.tsx        # نموذج تسجيل الدخول/التسجيل
│   ├── UserProfile.tsx     # صفحة الملف الشخصي
│   └── LicenseGuard.tsx    # حماية المسارات بالترخيص
└── App.tsx                 # التطبيق الرئيسي`}
        </pre>
      </section>

      {/* Config File */}
      <section className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center gap-3 mb-4">
          <Code className="w-8 h-8 text-green-600" />
          <h2 className="text-2xl font-bold">⚙️ ملف الإعدادات</h2>
        </div>

        <p className="mb-4">
          قم بإنشاء ملف <code className="bg-gray-200 px-2 py-1 rounded">src/config/app.ts</code>:
        </p>

        <pre className="bg-gray-800 text-white p-4 rounded overflow-x-auto text-sm">
{`// src/config/app.ts
// ⚠️ IMPORTANT: Do not commit APP_SECRET to version control!
// Store it in environment variables or secure configuration management

export const APP_CONFIG = {
  // Get these values from the Admin Dashboard -> Applications tab
  APP_KEY: import.meta.env.VITE_APP_KEY || '',
  APP_SECRET: import.meta.env.VITE_APP_SECRET || '',
};

// Validation function to ensure config is set
export const validateAppConfig = (): boolean => {
  if (!APP_CONFIG.APP_KEY || !APP_CONFIG.APP_SECRET) {
    console.error('❌ Application credentials not configured!');
    console.error('Please set VITE_APP_KEY and VITE_APP_SECRET environment variables.');
    return false;
  }
  return true;
};`}
        </pre>
      </section>

      {/* Supabase Client */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">🔧 Supabase Client</h2>
        
        <p className="mb-4">
          قم بإنشاء ملف <code className="bg-gray-200 px-2 py-1 rounded">src/lib/supabase.ts</code>:
        </p>

        <pre className="bg-gray-800 text-white p-4 rounded overflow-x-auto text-sm">
{`// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iwipefxjymkqpsuxkupo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3aXBlZnhqeW1rcXBzdXhrdXBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjYxNDgsImV4cCI6MjA3NDg0MjE0OH0.qj38NOb_tq3hLOvXqlIXkAd7NNbw_EDV3pfQxe6JHPo';

export const supabase = createClient(supabaseUrl, supabaseKey);`}
        </pre>
      </section>

      {/* License Service */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">🎫 خدمة الترخيص</h2>
        
        <p className="mb-4">
          قم بإنشاء ملف <code className="bg-gray-200 px-2 py-1 rounded">src/lib/license.ts</code>:
        </p>

        <pre className="bg-gray-800 text-white p-4 rounded overflow-x-auto text-sm">
{`// src/lib/license.ts
import { supabase } from './supabase';

export const licenseService = {
  // تفعيل الترخيص
  async activateLicense(
    licenseKey: string, 
    appKey: string, 
    appSecret: string
  ): Promise<{ success: boolean; message: string; expiresAt?: string }> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return { success: false, message: 'يجب تسجيل الدخول أولاً' };
      }

      const response = await supabase.functions.invoke('activate-license', {
        body: { licenseKey },
        headers: {
          Authorization: \`Bearer \${session.access_token}\`,
          'x-app-key': appKey,
          'x-app-secret': appSecret,
        },
      });

      if (response.error) {
        return { 
          success: false, 
          message: response.error.message || 'حدث خطأ في تفعيل الترخيص' 
        };
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
      console.error('License activation error:', error);
      return { success: false, message: 'حدث خطأ غير متوقع' };
    }
  },

  // التحقق من صحة الترخيص
  async validateLicense(
    appKey: string, 
    appSecret: string
  ): Promise<{ 
    isValid: boolean; 
    expiresAt?: string; 
    daysRemaining?: number; 
    error?: string 
  }> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return { isValid: false, error: 'يجب تسجيل الدخول أولاً' };
      }

      const response = await supabase.functions.invoke('validate-license-v2', {
        headers: {
          Authorization: \`Bearer \${session.access_token}\`,
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
      console.error('License validation error:', error);
      return { isValid: false, error: 'حدث خطأ غير متوقع' };
    }
  },
};`}
        </pre>
      </section>

      {/* License Guard Component */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">🛡️ مكون حماية الترخيص</h2>
        
        <p className="mb-4">
          استخدم هذا المكون لحماية المسارات وتتطلب ترخيص صالح:
        </p>

        <pre className="bg-gray-800 text-white p-4 rounded overflow-x-auto text-sm">
{`// src/components/LicenseGuard.tsx
import { useState, useEffect, ReactNode } from 'react';
import { licenseService } from '../lib/license';
import { APP_CONFIG } from '../config/app';
import { AlertCircle, Loader2 } from 'lucide-react';

interface LicenseGuardProps {
  children: ReactNode;
}

export default function LicenseGuard({ children }: LicenseGuardProps) {
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [daysRemaining, setDaysRemaining] = useState<number>(0);

  useEffect(() => {
    checkLicense();
  }, []);

  const checkLicense = async () => {
    try {
      const result = await licenseService.validateLicense(
        APP_CONFIG.APP_KEY,
        APP_CONFIG.APP_SECRET
      );

      setIsValid(result.isValid);
      setDaysRemaining(result.daysRemaining || 0);
      
      if (!result.isValid) {
        setError(result.error || 'الترخيص غير صالح');
      }
    } catch (err) {
      setError('حدث خطأ في التحقق من الترخيص');
      setIsValid(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">جاري التحقق من الترخيص...</p>
        </div>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <AlertCircle className="w-8 h-8" />
            <h2 className="text-2xl font-bold">الترخيص غير صالح</h2>
          </div>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={checkLicense}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {daysRemaining < 7 && (
        <div className="bg-yellow-50 border-b border-yellow-200 p-4 text-center">
          <p className="text-yellow-800">
            ⚠️ الترخيص سينتهي خلال {daysRemaining} أيام
          </p>
        </div>
      )}
      {children}
    </>
  );
}`}
        </pre>
      </section>

      {/* Main App Example */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">📱 مثال التطبيق الرئيسي</h2>
        
        <p className="mb-4">استخدم LicenseGuard في التطبيق الرئيسي:</p>

        <pre className="bg-gray-800 text-white p-4 rounded overflow-x-auto text-sm">
{`// src/App.tsx
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import LicenseGuard from './components/LicenseGuard';
import AuthForm from './components/AuthForm';
import UserProfile from './components/UserProfile';
import { validateAppConfig } from './config/app';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Validate app configuration
    if (!validateAppConfig()) {
      console.error('App configuration is invalid!');
    }

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return <AuthForm onAuthSuccess={() => {}} />;
  }

  return (
    <LicenseGuard>
      <UserProfile onLogout={() => setSession(null)} />
    </LicenseGuard>
  );
}

export default App;`}
        </pre>
      </section>

      {/* Usage Examples */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">💡 أمثلة الاستخدام</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">1️⃣ التحقق من الترخيص عند بدء التطبيق</h3>
            <pre className="bg-gray-800 text-white p-4 rounded overflow-x-auto text-sm">
{`import { useEffect } from 'react';
import { licenseService } from './lib/license';
import { APP_CONFIG } from './config/app';

function MyApp() {
  useEffect(() => {
    const checkLicense = async () => {
      const result = await licenseService.validateLicense(
        APP_CONFIG.APP_KEY,
        APP_CONFIG.APP_SECRET
      );
      
      if (!result.isValid) {
        alert('الترخيص غير صالح: ' + result.error);
        // قم بتوجيه المستخدم إلى صفحة تفعيل الترخيص
      } else {
        console.log(\`الترخيص صالح لمدة \${result.daysRemaining} يوم\`);
      }
    };
    
    checkLicense();
  }, []);
  
  return <div>My App</div>;
}`}
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">2️⃣ تفعيل الترخيص</h3>
            <pre className="bg-gray-800 text-white p-4 rounded overflow-x-auto text-sm">
{`import { useState } from 'react';
import { licenseService } from './lib/license';
import { APP_CONFIG } from './config/app';

function ActivateLicense() {
  const [licenseKey, setLicenseKey] = useState('');
  const [message, setMessage] = useState('');

  const handleActivate = async () => {
    const result = await licenseService.activateLicense(
      licenseKey,
      APP_CONFIG.APP_KEY,
      APP_CONFIG.APP_SECRET
    );
    
    if (result.success) {
      setMessage('تم تفعيل الترخيص بنجاح!');
      console.log('ينتهي في:', result.expiresAt);
    } else {
      setMessage('خطأ: ' + result.message);
    }
  };

  return (
    <div>
      <input
        value={licenseKey}
        onChange={(e) => setLicenseKey(e.target.value)}
        placeholder="أدخل مفتاح الترخيص"
      />
      <button onClick={handleActivate}>تفعيل</button>
      {message && <p>{message}</p>}
    </div>
  );
}`}
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">3️⃣ التحقق الدوري من الترخيص</h3>
            <pre className="bg-gray-800 text-white p-4 rounded overflow-x-auto text-sm">
{`import { useEffect, useState } from 'react';
import { licenseService } from './lib/license';
import { APP_CONFIG } from './config/app';

function AppWithPeriodicCheck() {
  const [licenseValid, setLicenseValid] = useState(true);

  useEffect(() => {
    // التحقق كل 10 دقائق
    const interval = setInterval(async () => {
      const result = await licenseService.validateLicense(
        APP_CONFIG.APP_KEY,
        APP_CONFIG.APP_SECRET
      );
      
      setLicenseValid(result.isValid);
      
      if (!result.isValid) {
        alert('انتهت صلاحية الترخيص!');
      }
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, []);

  if (!licenseValid) {
    return <div>الترخيص غير صالح</div>;
  }

  return <div>التطبيق</div>;
}`}
            </pre>
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
          <h2 className="text-2xl font-bold">✅ أفضل الممارسات</h2>
        </div>

        <div className="space-y-4">
          <div className="border-r-4 border-green-500 bg-green-50 p-4 rounded">
            <h3 className="font-bold mb-2">✅ افعل:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>احفظ App Secret في متغيرات البيئة (.env)</li>
              <li>أضف .env إلى .gitignore</li>
              <li>قم بالتحقق من الترخيص عند بدء التطبيق</li>
              <li>استخدم HTTPS فقط</li>
              <li>عرض رسائل واضحة للمستخدم عند انتهاء الترخيص</li>
              <li>قم بالتحقق الدوري من صلاحية الترخيص</li>
            </ul>
          </div>

          <div className="border-r-4 border-red-500 bg-red-50 p-4 rounded">
            <h3 className="font-bold mb-2">⛔ لا تفعل:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>لا تضع App Secret في الكود مباشرة</li>
              <li>لا تشارك App Secret في GitHub أو أي مكان عام</li>
              <li>لا تخزن App Secret في localStorage</li>
              <li>لا تستخدم HTTP (استخدم HTTPS فقط)</li>
              <li>لا تتجاهل أخطاء التحقق من الترخيص</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Troubleshooting */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">🔧 حل المشاكل الشائعة</h2>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-bold mb-2">❌ "Invalid application credentials"</h3>
            <p className="text-sm mb-2">الحل:</p>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>تحقق من صحة App Key و App Secret في ملف .env</li>
              <li>تأكد من أن التطبيق نشط (is_active = true) في لوحة الإدارة</li>
              <li>تحقق من عدم وجود مسافات إضافية في القيم</li>
            </ul>
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-bold mb-2">❌ "No active license found"</h3>
            <p className="text-sm mb-2">الحل:</p>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>تأكد من تفعيل الترخيص أولاً</li>
              <li>تحقق من أن الترخيص مرتبط بالتطبيق الصحيح</li>
              <li>تأكد من عدم انتهاء صلاحية الترخيص</li>
            </ul>
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-bold mb-2">❌ متغيرات البيئة لا تعمل</h3>
            <p className="text-sm mb-2">الحل:</p>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>تأكد من أن اسم الملف .env وليس env.txt</li>
              <li>أعد تشغيل خادم التطوير بعد إنشاء ملف .env</li>
              <li>تأكد من استخدام VITE_ كبادئة للمتغيرات (في Vite)</li>
              <li>في Create React App استخدم REACT_APP_ كبادئة</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
