export default function LicenseSystem2Documentation() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8" dir="rtl">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg">
        <h1 className="text-4xl font-bold mb-4">📱 نظام الترخيص 2.0</h1>
        <p className="text-xl">
          نظام ترخيص متقدم مع دعم التطبيقات المتعددة والمصادقة الآمنة
        </p>
      </div>

      {/* Overview */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">🎯 نظرة عامة</h2>
        <p className="mb-4">
          نظام الترخيص 2.0 هو ترقية شاملة تدعم إدارة تطبيقات متعددة مع نظام مصادقة قوي وآمن.
          كل تطبيق يحصل على مفاتيح خاصة به (App Key & App Secret) ويمكن ربط التراخيص بتطبيقات محددة.
        </p>
        
        <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded">
          <h3 className="font-bold mb-2">✨ الميزات الجديدة:</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>دعم التطبيقات المتعددة (Multi-Application Support)</li>
            <li>مصادقة آمنة باستخدام App Key و App Secret</li>
            <li>ربط التراخيص بتطبيقات محددة</li>
            <li>API محدث مع نقاط نهاية جديدة</li>
            <li>لوحة تحكم محسنة لإدارة التطبيقات</li>
          </ul>
        </div>
      </section>

      {/* Applications Management */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">🔑 إدارة التطبيقات</h2>
        
        <h3 className="text-xl font-semibold mb-3">إنشاء تطبيق جديد</h3>
        <ol className="list-decimal list-inside space-y-3 mb-6">
          <li>انتقل إلى لوحة الادمن → تبويب "التطبيقات"</li>
          <li>اضغط على زر "تطبيق جديد"</li>
          <li>أدخل اسم التطبيق والوصف (اختياري)</li>
          <li>اضغط "إنشاء" - سيتم إنشاء App Key و App Secret تلقائياً</li>
          <li>⚠️ <strong>مهم جداً:</strong> احفظ App Secret في مكان آمن - لن تتمكن من رؤيته مرة أخرى!</li>
        </ol>

        <div className="bg-yellow-50 border-r-4 border-yellow-500 p-4 rounded mb-4">
          <h4 className="font-bold mb-2">🔐 أمان بيانات الاعتماد</h4>
          <p>
            App Key: مفتاح عام يمكن مشاركته (يستخدم لتحديد التطبيق)<br/>
            App Secret: مفتاح سري يجب حفظه بشكل آمن (يستخدم للمصادقة)
          </p>
        </div>

        <h3 className="text-xl font-semibold mb-3">إدارة التطبيقات الموجودة</h3>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>تعديل:</strong> يمكنك تعديل اسم التطبيق والوصف</li>
          <li><strong>تعطيل/تفعيل:</strong> توقف مؤقت لقبول طلبات التحقق من الترخيص</li>
          <li><strong>حذف:</strong> سيتم حذف جميع التراخيص المرتبطة بالتطبيق</li>
        </ul>
      </section>

      {/* License Creation */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">📝 إنشاء التراخيص</h2>
        
        <p className="mb-4">
          عند إنشاء ترخيص جديد، يجب تحديد التطبيق المرتبط به:
        </p>

        <ol className="list-decimal list-inside space-y-3">
          <li>انتقل إلى لوحة الادمن → تبويب "التراخيص"</li>
          <li>اضغط على "إنشاء ترخيص جديد"</li>
          <li>اختر التطبيق من القائمة المنسدلة</li>
          <li>حدد المدة (بالأيام) والحد الأقصى للتفعيلات</li>
          <li>أضف ملاحظات (اختياري)</li>
          <li>اضغط "إنشاء"</li>
        </ol>

        <div className="bg-green-50 border-r-4 border-green-500 p-4 rounded mt-4">
          <p className="font-semibold">
            💡 الترخيص سيعمل فقط مع التطبيق المحدد ولن يقبل من تطبيقات أخرى
          </p>
        </div>
      </section>

      {/* API Integration */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">🔌 دمج API في التطبيق</h2>
        
        <h3 className="text-xl font-semibold mb-3">التحقق من صحة الترخيص (Validate License)</h3>
        
        <div className="bg-gray-100 p-4 rounded-lg mb-4">
          <p className="font-mono text-sm mb-2">POST /functions/v1/validate-license-v2</p>
          
          <h4 className="font-bold mt-4 mb-2">Headers المطلوبة:</h4>
          <pre className="bg-gray-800 text-white p-4 rounded overflow-x-auto text-sm">
{`Authorization: Bearer [USER_JWT_TOKEN]
x-app-key: [YOUR_APP_KEY]
x-app-secret: [YOUR_APP_SECRET]
Content-Type: application/json`}
          </pre>

          <h4 className="font-bold mt-4 mb-2">مثال على الاستخدام (JavaScript):</h4>
          <pre className="bg-gray-800 text-white p-4 rounded overflow-x-auto text-sm">
{`const validateLicense = async (userToken, appKey, appSecret) => {
  const response = await fetch(
    'https://iwipefxjymkqpsuxkupo.supabase.co/functions/v1/validate-license-v2',
    {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${userToken}\`,
        'x-app-key': appKey,
        'x-app-secret': appSecret,
        'Content-Type': 'application/json'
      }
    }
  );
  
  const data = await response.json();
  
  if (data.isValid) {
    console.log('الترخيص صالح!');
    console.log('ينتهي في:', data.expiresAt);
    console.log('الأيام المتبقية:', data.daysRemaining);
    console.log('التطبيق:', data.application.name);
  } else {
    console.log('الترخيص غير صالح:', data.message || data.error);
  }
  
  return data;
};`}
          </pre>
        </div>

        <h3 className="text-xl font-semibold mb-3">الاستجابة (Response)</h3>
        
        <h4 className="font-semibold mb-2">عند النجاح:</h4>
        <pre className="bg-gray-800 text-white p-4 rounded overflow-x-auto text-sm mb-4">
{`{
  "isValid": true,
  "expiresAt": "2024-12-31T23:59:59.000Z",
  "daysRemaining": 90,
  "license": {
    "id": "xxx-xxx-xxx",
    "key": "XXXXX-XXXXX-XXXXX-XXXXX",
    "durationDays": 365
  },
  "application": {
    "id": "xxx-xxx-xxx",
    "name": "My App"
  }
}`}
        </pre>

        <h4 className="font-semibold mb-2">عند الفشل:</h4>
        <pre className="bg-gray-800 text-white p-4 rounded overflow-x-auto text-sm">
{`{
  "isValid": false,
  "error": "Invalid application credentials"
  // أو
  "message": "No active license found for this application"
  // أو
  "message": "License has expired"
}`}
        </pre>
      </section>

      {/* Security Best Practices */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">🛡️ أفضل ممارسات الأمان</h2>
        
        <div className="space-y-4">
          <div className="border-r-4 border-red-500 bg-red-50 p-4 rounded">
            <h3 className="font-bold mb-2">⛔ لا تفعل:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>لا تشارك App Secret في الكود العام أو GitHub</li>
              <li>لا تضع App Secret في التطبيقات من جانب العميل (Frontend)</li>
              <li>لا تخزن App Secret في localStorage أو sessionStorage</li>
            </ul>
          </div>

          <div className="border-r-4 border-green-500 bg-green-50 p-4 rounded">
            <h3 className="font-bold mb-2">✅ افعل:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>احفظ App Secret في متغيرات البيئة (Environment Variables)</li>
              <li>استخدم HTTPS فقط للتواصل مع API</li>
              <li>قم بالتحقق من الترخيص عند كل بدء تشغيل للتطبيق</li>
              <li>قم بتحديث last_validated بشكل دوري للمراقبة</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Implementation Example */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">💻 مثال تطبيق كامل</h2>
        
        <p className="mb-4">
          مثال على تطبيق React يستخدم نظام الترخيص 2.0:
        </p>

        <pre className="bg-gray-800 text-white p-4 rounded overflow-x-auto text-sm">
{`import { useEffect, useState } from 'react';

const APP_KEY = process.env.REACT_APP_LICENSE_KEY;
const APP_SECRET = process.env.REACT_APP_LICENSE_SECRET;

function App() {
  const [licenseValid, setLicenseValid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    // الحصول على token المستخدم من Supabase Auth
    const checkLicense = async () => {
      if (!userToken) return;
      
      try {
        const response = await fetch(
          'https://iwipefxjymkqpsuxkupo.supabase.co/functions/v1/validate-license-v2',
          {
            method: 'POST',
            headers: {
              'Authorization': \`Bearer \${userToken}\`,
              'x-app-key': APP_KEY,
              'x-app-secret': APP_SECRET,
              'Content-Type': 'application/json'
            }
          }
        );
        
        const data = await response.json();
        setLicenseValid(data.isValid);
        
        if (data.isValid) {
          console.log(\`الترخيص صالح لمدة \${data.daysRemaining} يوم\`);
        }
      } catch (error) {
        console.error('خطأ في التحقق من الترخيص:', error);
        setLicenseValid(false);
      } finally {
        setLoading(false);
      }
    };

    checkLicense();
  }, [userToken]);

  if (loading) {
    return <div>جاري التحقق من الترخيص...</div>;
  }

  if (!licenseValid) {
    return (
      <div className="error">
        <h1>⚠️ الترخيص غير صالح</h1>
        <p>يرجى تفعيل الترخيص للمتابعة</p>
      </div>
    );
  }

  return (
    <div className="app">
      <h1>التطبيق</h1>
      {/* محتوى التطبيق هنا */}
    </div>
  );
}

export default App;`}
        </pre>
      </section>

      {/* Database Schema */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">🗄️ مخطط قاعدة البيانات</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">جدول applications</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>id: معرف فريد للتطبيق</li>
              <li>name: اسم التطبيق</li>
              <li>description: وصف التطبيق (اختياري)</li>
              <li>app_key: المفتاح العام (يتم إنشاؤه تلقائياً)</li>
              <li>app_secret: المفتاح السري (يتم إنشاؤه تلقائياً)</li>
              <li>is_active: حالة التطبيق (نشط/معطل)</li>
              <li>created_by: معرف المسؤول الذي أنشأ التطبيق</li>
              <li>created_at, updated_at: تواريخ الإنشاء والتحديث</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">تحديثات على جدول licenses</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>application_id: ربط الترخيص بتطبيق محدد (مطلوب)</li>
              <li>جميع الحقول الأخرى كما هي</li>
            </ul>
          </div>
        </div>
      </section>


      {/* Support */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">💬 الدعم والمساعدة</h2>
        
        <p className="mb-4">
          إذا واجهت أي مشاكل أو كان لديك استفسارات:
        </p>
        
        <ul className="list-disc list-inside space-y-2">
          <li>تحقق من console logs في المتصفح للحصول على تفاصيل الأخطاء</li>
          <li>تأكد من صحة App Key و App Secret</li>
          <li>تحقق من أن التطبيق نشط (is_active = true)</li>
          <li>تأكد من أن الترخيص مرتبط بالتطبيق الصحيح</li>
          <li>راجع edge function logs في لوحة تحكم Supabase</li>
        </ul>
      </section>
    </div>
  );
}
