import { useState } from 'react';
import { Code, Key, User, Copy, CheckCircle } from 'lucide-react';

export default function ApiDocumentation() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Code className="w-6 h-6 text-blue-600" />
          نظرة عامة على النظام
        </h2>
        <div className="prose prose-sm max-w-none text-gray-700 space-y-3">
          <p>
            نظام التراخيص هذا يوفر حلاً متكاملاً لإدارة التراخيص والاشتراكات في تطبيقاتك.
            يدعم النظام:
          </p>
          <ul className="list-disc list-inside space-y-2 mr-4">
            <li>إنشاء وإدارة تراخيص بمدد محددة</li>
            <li>تفعيل التراخيص للمستخدمين</li>
            <li>التحقق من صلاحية التراخيص</li>
            <li>دعم الوصول غير المتصل بالإنترنت</li>
            <li>لوحة تحكم للمشرفين</li>
          </ul>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Key className="w-6 h-6 text-blue-600" />
          المرحلة 1: إعداد Supabase Client
        </h2>
        <p className="text-gray-700 mb-4">
          قم بإنشاء ملف لإعداد Supabase في تطبيقك:
        </p>

        <div className="relative">
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <button
              onClick={() =>
                copyToClipboard(
                  `import { createClient } from '@supabase/supabase-js';\n\nconst supabaseUrl = '${supabaseUrl}';\nconst supabaseAnonKey = 'YOUR_ANON_KEY';\n\nexport const supabase = createClient(supabaseUrl, supabaseAnonKey);`,
                  'setup'
                )
              }
              className="absolute top-2 left-2 p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
            >
              {copiedCode === 'setup' ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
            <pre className="text-sm">
              <code>{`// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = '${supabaseUrl}';
const supabaseAnonKey = 'YOUR_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);`}</code>
            </pre>
          </div>
        </div>

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>ملاحظة:</strong> استبدل YOUR_ANON_KEY بمفتاح API الخاص بك من لوحة تحكم Supabase
          </p>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-6 h-6 text-blue-600" />
          المرحلة 2: إنشاء نظام التسجيل والدخول
        </h2>

        <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">1. التسجيل (Sign Up)</h3>
        <div className="relative">
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <button
              onClick={() =>
                copyToClipboard(
                  `async function signUp(email: string, password: string, fullName: string) {\n  const { data: authData, error: authError } = await supabase.auth.signUp({\n    email,\n    password,\n  });\n\n  if (authError) throw authError;\n\n  const { error: profileError } = await supabase.from('profiles').insert({\n    id: authData.user.id,\n    email,\n    full_name: fullName,\n  });\n\n  if (profileError) throw profileError;\n  return authData.user;\n}`,
                  'signup'
                )
              }
              className="absolute top-2 left-2 p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
            >
              {copiedCode === 'signup' ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
            <pre className="text-sm">
              <code>{`// التسجيل
async function signUp(email: string, password: string, fullName: string) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) throw authError;

  const { error: profileError } = await supabase.from('profiles').insert({
    id: authData.user.id,
    email,
    full_name: fullName,
  });

  if (profileError) throw profileError;
  return authData.user;
}`}</code>
            </pre>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">2. تسجيل الدخول (Sign In)</h3>
        <div className="relative">
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <button
              onClick={() =>
                copyToClipboard(
                  `async function signIn(email: string, password: string) {\n  const { data, error } = await supabase.auth.signInWithPassword({\n    email,\n    password,\n  });\n\n  if (error) throw error;\n  return data.user;\n}`,
                  'signin'
                )
              }
              className="absolute top-2 left-2 p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
            >
              {copiedCode === 'signin' ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
            <pre className="text-sm">
              <code>{`// تسجيل الدخول
async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data.user;
}`}</code>
            </pre>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Key className="w-6 h-6 text-blue-600" />
          المرحلة 3: تفعيل الترخيص
        </h2>

        <p className="text-gray-700 mb-4">
          بعد تسجيل الدخول، استخدم Edge Function لتفعيل الترخيص:
        </p>

        <div className="relative">
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <button
              onClick={() =>
                copyToClipboard(
                  `async function activateLicense(licenseKey: string) {\n  const { data: { session } } = await supabase.auth.getSession();\n\n  if (!session) {\n    throw new Error('يجب تسجيل الدخول أولاً');\n  }\n\n  const response = await fetch(\n    '${supabaseUrl}/functions/v1/activate-license',\n    {\n      method: 'POST',\n      headers: {\n        'Content-Type': 'application/json',\n        'Authorization': \`Bearer \${session.access_token}\`,\n      },\n      body: JSON.stringify({ licenseKey }),\n    }\n  );\n\n  const data = await response.json();\n\n  if (!data.success) {\n    throw new Error(data.message);\n  }\n\n  return data;\n}`,
                  'activate'
                )
              }
              className="absolute top-2 left-2 p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
            >
              {copiedCode === 'activate' ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
            <pre className="text-sm">
              <code>{`async function activateLicense(licenseKey: string) {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('يجب تسجيل الدخول أولاً');
  }

  const response = await fetch(
    '${supabaseUrl}/functions/v1/activate-license',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${session.access_token}\`,
      },
      body: JSON.stringify({ licenseKey }),
    }
  );

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message);
  }

  return data;
}`}</code>
            </pre>
          </div>
        </div>

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>ملاحظة:</strong> يتطلب هذا Edge Function توكن المصادقة في الـ Authorization header
          </p>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          المرحلة 4: التحقق من صلاحية الترخيص
        </h2>

        <p className="text-gray-700 mb-4">
          استخدم Edge Function للتحقق من أن المستخدم لديه ترخيص نشط:
        </p>

        <div className="relative">
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <button
              onClick={() =>
                copyToClipboard(
                  `async function checkUserLicense() {\n  const { data: { session } } = await supabase.auth.getSession();\n\n  if (!session) {\n    throw new Error('يجب تسجيل الدخول أولاً');\n  }\n\n  const response = await fetch(\n    '${supabaseUrl}/functions/v1/validate-license',\n    {\n      method: 'GET',\n      headers: {\n        'Authorization': \`Bearer \${session.access_token}\`,\n      },\n    }\n  );\n\n  const data = await response.json();\n\n  if (!data.isValid) {\n    return { isValid: false, message: data.message };\n  }\n\n  return {\n    isValid: true,\n    expiresAt: data.expiresAt,\n    license: data.license\n  };\n}`,
                  'check'
                )
              }
              className="absolute top-2 left-2 p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
            >
              {copiedCode === 'check' ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
            <pre className="text-sm">
              <code>{`async function checkUserLicense() {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('يجب تسجيل الدخول أولاً');
  }

  const response = await fetch(
    '${supabaseUrl}/functions/v1/validate-license',
    {
      method: 'GET',
      headers: {
        'Authorization': \`Bearer \${session.access_token}\`,
      },
    }
  );

  const data = await response.json();

  if (!data.isValid) {
    return { isValid: false, message: data.message };
  }

  return {
    isValid: true,
    expiresAt: data.expiresAt,
    license: data.license
  };
}`}</code>
            </pre>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          المرحلة 5: دعم الوصول غير المتصل
        </h2>

        <p className="text-gray-700 mb-4">
          لدعم الوصول غير المتصل، احفظ بيانات الترخيص في localStorage:
        </p>

        <div className="relative">
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <button
              onClick={() =>
                copyToClipboard(
                  `const OFFLINE_LICENSE_KEY = 'app_license_offline';\n\nfunction saveOfflineLicense(data) {\n  localStorage.setItem(OFFLINE_LICENSE_KEY, JSON.stringify({\n    userId: data.userId,\n    email: data.email,\n    fullName: data.fullName,\n    licenseKey: data.licenseKey,\n    expiresAt: data.expiresAt,\n    lastValidated: new Date().toISOString(),\n  }));\n}\n\nfunction checkOfflineLicense() {\n  const data = localStorage.getItem(OFFLINE_LICENSE_KEY);\n  if (!data) return false;\n\n  const license = JSON.parse(data);\n  const now = new Date();\n  const expiresAt = new Date(license.expiresAt);\n\n  return expiresAt > now;\n}`,
                  'offline'
                )
              }
              className="absolute top-2 left-2 p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
            >
              {copiedCode === 'offline' ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
            <pre className="text-sm">
              <code>{`const OFFLINE_LICENSE_KEY = 'app_license_offline';

function saveOfflineLicense(data) {
  localStorage.setItem(OFFLINE_LICENSE_KEY, JSON.stringify({
    userId: data.userId,
    email: data.email,
    fullName: data.fullName,
    licenseKey: data.licenseKey,
    expiresAt: data.expiresAt,
    lastValidated: new Date().toISOString(),
  }));
}

function checkOfflineLicense() {
  const data = localStorage.getItem(OFFLINE_LICENSE_KEY);
  if (!data) return false;

  const license = JSON.parse(data);
  const now = new Date();
  const expiresAt = new Date(license.expiresAt);

  return expiresAt > now;
}`}</code>
            </pre>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Edge Functions API</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">1. تفعيل الترخيص</h3>
            <div className="bg-gray-100 p-3 rounded-lg mb-2">
              <code className="text-sm">POST {supabaseUrl}/functions/v1/activate-license</code>
            </div>
            <p className="text-sm text-gray-600 mb-2">Headers:</p>
            <div className="bg-gray-900 text-gray-100 p-3 rounded-lg text-sm mb-2">
              <pre>{`Authorization: Bearer <access_token>
Content-Type: application/json`}</pre>
            </div>
            <p className="text-sm text-gray-600 mb-2">Body:</p>
            <div className="bg-gray-900 text-gray-100 p-3 rounded-lg text-sm mb-2">
              <pre>{`{
  "licenseKey": "XXXXX-XXXXX-XXXXX-XXXXX"
}`}</pre>
            </div>
            <p className="text-sm text-gray-600 mb-2">Response:</p>
            <div className="bg-gray-900 text-gray-100 p-3 rounded-lg text-sm">
              <pre>{`{
  "success": true,
  "message": "License activated successfully",
  "expiresAt": "2024-11-05T12:00:00.000Z"
}`}</pre>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">2. التحقق من الترخيص</h3>
            <div className="bg-gray-100 p-3 rounded-lg mb-2">
              <code className="text-sm">GET {supabaseUrl}/functions/v1/validate-license</code>
            </div>
            <p className="text-sm text-gray-600 mb-2">Headers:</p>
            <div className="bg-gray-900 text-gray-100 p-3 rounded-lg text-sm mb-2">
              <pre>{`Authorization: Bearer <access_token>`}</pre>
            </div>
            <p className="text-sm text-gray-600 mb-2">Response:</p>
            <div className="bg-gray-900 text-gray-100 p-3 rounded-lg text-sm">
              <pre>{`{
  "isValid": true,
  "expiresAt": "2024-11-05T12:00:00.000Z",
  "daysLeft": 25,
  "license": {
    "key": "XXXXX-XXXXX-XXXXX-XXXXX",
    "durationDays": 30
  }
}`}</pre>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
