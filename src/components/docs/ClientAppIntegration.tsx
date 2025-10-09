import ExportButton from './ExportButton';

const CodeBlock = ({ children }: { children: React.ReactNode }) => (
  <pre className="bg-gray-800 text-white p-4 rounded-lg my-4 overflow-x-auto text-sm" dir="ltr">
    <code>{children}</code>
  </pre>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4 border-b-2 border-gray-200 pb-2">{children}</h2>
);

const SubSectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-xl font-semibold text-gray-700 mt-6 mb-3">{children}</h3>
);

const Highlight = ({ children }: { children: React.ReactNode }) => (
  <code className="bg-gray-200 text-gray-800 px-2 py-1 rounded-md text-sm font-mono">{children}</code>
);

export default function ClientAppIntegrationDocumentation() {
  const pollFunctionCode = `
async function pollForActiveLicense(userId, timeout = 20000, interval = 2500) {
  const startTime = Date.now();

  console.log(\`Starting license poll for user: \${userId}\`);

  while (Date.now() - startTime < timeout) {
    try {
      // Directly query the user_licenses table to see if the trigger has run.
      const { data: license, error } = await supabase
        .from('user_licenses')
        .select('id, is_active')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error("Error while polling for license:", error);
        return false; // Stop polling on error
      }

      if (license) {
        console.log("✅ License found and activated!");
        return true;
      }

      console.log("...license not found yet, waiting...");
      await new Promise(resolve => setTimeout(resolve, interval));

    } catch (e) {
      console.error("An unexpected error occurred during polling:", e);
      return false;
    }
  }

  console.warn("Polling timed out. License not found within the time limit.");
  return false;
}
  `.trim();

  const signupHandlerCode = `
async function handleSignup(email, password) {
  // 1. Attempt to sign the user up
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    console.error("Signup failed:", error.message);
    return;
  }

  if (data.user) {
    // 2. User was created successfully. Now, poll for the license.
    const licenseIsActive = await pollForActiveLicense(data.user.id);

    // 3. Act based on the polling result
    if (licenseIsActive) {
      // SUCCESS: The license is active. Refresh the session.
      await supabase.auth.refreshSession();
      // Safely redirect to the licensed part of your application.
      window.location.href = '/dashboard';
    } else {
      // FAILURE: Polling timed out. Redirect to the inactive license page.
      window.location.href = '/license-inactive';
    }
  }
}
  `.trim();

  const markdownContent = `
# دليل تكامل تطبيق العميل: تفعيل ترخيص Ko-fi التلقائي

يشرح هذا المستند كيفية دمج ميزة تفعيل ترخيص Ko-fi التلقائي بشكل صحيح في تطبيق العميل الخاص بك.

## 1. نظرة عامة على الميزة

النظام الخلفي مجهز الآن بميزة تربط حسابات المستخدمين الجديدة تلقائيًا بالتراخيص المشتراة عبر Ko-fi.

- **كيف تعمل:** عند شراء منتج عبر Ko-fi، يتم إنشاء طلب في قاعدة البيانات يحتوي على البريد الإلكتروني ومفتاح ترخيص جديد. يكون الطلب في البداية "غير معالج".
- **التفعيل التلقائي:** عند تسجيل مستخدم جديد ببريد إلكتروني يطابق طلب Ko-fi غير معالج، يتم تشغيل مُحفِّز (trigger) في قاعدة البيانات يقوم تلقائيًا بتفعيل الترخيص للمستخدم.

## 2. مشكلة تزامن الحالة (مشكلة "التحديث الإجباري")

تنشأ مشكلة شائعة مباشرة بعد التسجيل: قد يعرض التطبيق بشكل غير صحيح أن المستخدم غير مرخص، مما يجبره على تحديث الصفحة يدويًا لرؤية حالة الترخيص الصحيحة.

### السبب: حالة سباق (Race Condition)

يحدث هذا بسبب "سباق" بين تطبيقك الأمامي ومُحفِّز قاعدة البيانات الخلفية. يقوم الواجهة الأمامية بالتحقق من الترخيص قبل أن ينتهي المُحفِّز من عمله.

## 3. الحل: الاستعلام المتكرر (Polling) عن الترخيص

لحل هذه المشكلة، يجب على الواجهة الأمامية الانتظار حتى يكمل المُحفِّز الخلفي عمله. يتم تحقيق ذلك عن طريق "الاستعلام المتكرر" (polling) عن حالة الترخيص.

### الخطوة 1: إضافة دالة الاستعلام المتكرر

أضف الدالة التالية إلى ملفات Supabase المساعدة في تطبيقك. تقوم هذه الدالة بالتحقق من جدول \`user_licenses\` بشكل متكرر.

\`\`\`javascript
${pollFunctionCode}
\`\`\`

### الخطوة 2: دمج الدالة في عملية التسجيل

قم بتعديل دالة التسجيل في تطبيقك. بعد نجاح \`supabase.auth.signUp\`, قم باستدعاء الدالة \`pollForActiveLicense\`.

\`\`\`javascript
${signupHandlerCode}
\`\`\`
  `.trim();

  return (
    <div className="bg-white rounded-xl shadow-sm p-8 relative">
      <ExportButton content={markdownContent} filename="client-integration-guide.md" />

      <SectionTitle>دليل تكامل تطبيق العميل: تفعيل ترخيص Ko-fi التلقائي</SectionTitle>
      <p className="text-gray-600 mb-4">
        يشرح هذا المستند كيفية دمج ميزة تفعيل ترخيص Ko-fi التلقائي بشكل صحيح في تطبيق العميل الخاص بك.
      </p>

      <SectionTitle>1. نظرة عامة على الميزة</SectionTitle>
      <p className="text-gray-600 mb-2">
        النظام الخلفي مجهز الآن بميزة تربط حسابات المستخدمين الجديدة تلقائيًا بالتراخيص المشتراة عبر Ko-fi.
      </p>
      <ul className="list-disc list-inside space-y-2 text-gray-600">
        <li>
          <strong className="font-semibold">كيف تعمل:</strong> عند شراء منتج عبر Ko-fi، يتم إنشاء طلب في قاعدة البيانات يحتوي على البريد الإلكتروني ومفتاح ترخيص جديد. يكون الطلب في البداية "غير معالج".
        </li>
        <li>
          <strong className="font-semibold">التفعيل التلقائي:</strong> عند تسجيل مستخدم جديد ببريد إلكتروني يطابق طلب Ko-fi غير معالج، يتم تشغيل مُحفِّز (trigger) في قاعدة البيانات يقوم تلقائيًا بتفعيل الترخيص للمستخدم.
        </li>
      </ul>

      <SectionTitle>2. مشكلة تزامن الحالة (مشكلة "التحديث الإجباري")</SectionTitle>
      <p className="text-gray-600 mb-2">
        تنشأ مشكلة شائعة مباشرة بعد التسجيل: قد يعرض التطبيق بشكل غير صحيح أن المستخدم غير مرخص، مما يجبره على تحديث الصفحة يدويًا لرؤية حالة الترخيص الصحيحة.
      </p>
      <SubSectionTitle>السبب: حالة سباق (Race Condition)</SubSectionTitle>
      <p className="text-gray-600 mb-2">
        يحدث هذا بسبب "سباق" بين تطبيقك الأمامي ومُحفِّز قاعدة البيانات الخلفية. يقوم الواجهة الأمامية بالتحقق من الترخيص قبل أن ينتهي المُحفِّز من عمله.
      </p>

      <SectionTitle>3. الحل: الاستعلام المتكرر (Polling) عن الترخيص</SectionTitle>
      <p className="text-gray-600 mb-2">
        لحل هذه المشكلة، يجب على الواجهة الأمامية الانتظار حتى يكمل المُحفِّز الخلفي عمله. يتم تحقيق ذلك عن طريق "الاستعلام المتكرر" (polling) عن حالة الترخيص.
      </p>

      <SubSectionTitle>الخطوة 1: إضافة دالة الاستعلام المتكرر</SubSectionTitle>
      <p className="text-gray-600 mb-2">
        أضف الدالة التالية إلى ملفات Supabase المساعدة في تطبيقك. تقوم هذه الدالة بالتحقق من جدول <Highlight>user_licenses</Highlight> بشكل متكرر.
      </p>
      <CodeBlock>{pollFunctionCode}</CodeBlock>

      <SubSectionTitle>الخطوة 2: دمج الدالة في عملية التسجيل</SubSectionTitle>
      <p className="text-gray-600 mb-2">
        قم بتعديل دالة التسجيل في تطبيقك. بعد نجاح <Highlight>supabase.auth.signUp</Highlight>، قم باستدعاء الدالة <Highlight>pollForActiveLicense</Highlight>.
      </p>
      <CodeBlock>{signupHandlerCode}</CodeBlock>
    </div>
  );
}