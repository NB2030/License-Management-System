import { Webhook, AlertCircle, ShoppingBag } from 'lucide-react';

export default function KofiWebhookDocumentation() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Webhook className="w-6 h-6 text-blue-600" />
          دليل ربط Ko-fi Webhook
        </h2>
        <div className="prose prose-sm max-w-none text-gray-700 space-y-3">
          <p>
            يمكنك ربط نظام التراخيص مع Ko-fi لتفعيل التراخيص تلقائياً عند الشراء أو التبرع.
          </p>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">1. إعداد Webhook في Ko-fi</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">الخطوة الأولى: الحصول على رمز التحقق</h4>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 mr-4">
              <li>سجل الدخول إلى حسابك في Ko-fi</li>
              <li>اذهب إلى الإعدادات → API</li>
              <li>انسخ "Verification Token"</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-2">الخطوة الثانية: إضافة Webhook URL</h4>
            <div className="bg-gray-100 p-3 rounded-lg mb-2">
              <code className="text-sm break-all">{supabaseUrl}/functions/v1/kofi-webhook</code>
            </div>
            <p className="text-sm text-gray-600">
              أضف هذا الرابط في حقل "Webhook URL" في إعدادات Ko-fi API
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">2. جدول فئات التسعير (Pricing Tiers)</h3>
        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
          <pre className="text-sm">
            <code>{`-- Create pricing_tiers table
CREATE TYPE pricing_tier_type AS ENUM ('product', 'donation');

CREATE TABLE public.pricing_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  duration_days INTEGER NOT NULL,
  tier_type pricing_tier_type NOT NULL DEFAULT 'donation',
  product_identifier TEXT,
  application_id UUID REFERENCES public.applications(id),
  is_flexible_pricing BOOLEAN DEFAULT FALSE,
  days_per_dollar NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.pricing_tiers ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can manage pricing tiers"
  ON public.pricing_tiers FOR ALL
  USING (is_admin(auth.uid()));`}</code>
          </pre>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <p className="text-sm text-blue-800 space-y-2">
            <strong className="block">ملاحظات مهمة:</strong>
            <span className="block">• يجب إضافة فئات التسعير من لوحة الإدارة لربط المبالغ بمدد التراخيص</span>
            <span className="block">• حقل <code className="bg-blue-100 px-1 rounded">application_id</code> يحدد التطبيق الذي سينشأ له الترخيص</span>
            <span className="block">• إذا كان <code className="bg-blue-100 px-1 rounded">application_id</code> فارغاً، سيكون الترخيص متاحاً لجميع التطبيقات</span>
            <span className="block">• التسعير المرن (<code className="bg-blue-100 px-1 rounded">is_flexible_pricing</code>) يسمح بحساب المدة تلقائياً حسب المبلغ المدفوع</span>
          </p>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">3. جدول طلبات Ko-fi (Ko-fi Orders)</h3>
        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
          <pre className="text-sm">
            <code>{`-- Create kofi_orders table
CREATE TABLE public.kofi_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id TEXT NOT NULL UNIQUE,
  timestamp TIMESTAMPTZ NOT NULL,
  type TEXT NOT NULL,
  from_name TEXT,
  amount TEXT NOT NULL,
  email TEXT NOT NULL,
  currency TEXT,
  kofi_transaction_id TEXT,
  verification_token TEXT NOT NULL,
  message TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  is_subscription_payment BOOLEAN DEFAULT FALSE,
  is_first_subscription_payment BOOLEAN DEFAULT FALSE,
  tier_name TEXT,
  url TEXT,
  shop_items JSONB,
  shipping JSONB,
  user_id UUID,
  license_id UUID,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.kofi_orders ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view all kofi orders"
  ON public.kofi_orders FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update kofi orders"
  ON public.kofi_orders FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete kofi orders"
  ON public.kofi_orders FOR DELETE
  USING (is_admin(auth.uid()));`}</code>
          </pre>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">4. Trigger للربط التلقائي</h3>
        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
          <pre className="text-sm">
            <code>{`-- Function to link Ko-fi orders to new profiles
CREATE OR REPLACE FUNCTION public.link_kofi_orders_to_new_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  rec RECORD;
  v_expires_at TIMESTAMPTZ;
BEGIN
  -- Link pending Ko-fi orders by email
  UPDATE public.kofi_orders ko
  SET user_id = NEW.id
  WHERE LOWER(ko.email) = LOWER(NEW.email)
    AND ko.user_id IS NULL;

  -- Process unprocessed orders with licenses
  FOR rec IN
    SELECT ko.id as order_id, ko.license_id, l.duration_days
    FROM public.kofi_orders ko
    JOIN public.licenses l ON l.id = ko.license_id
    WHERE ko.user_id = NEW.id
      AND COALESCE(ko.processed, FALSE) = FALSE
      AND ko.license_id IS NOT NULL
  LOOP
    v_expires_at := NOW() + (rec.duration_days || ' days')::INTERVAL;

    -- Create user_licenses if doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM public.user_licenses ul
      WHERE ul.user_id = NEW.id
        AND ul.license_id = rec.license_id
        AND COALESCE(ul.is_active, TRUE) = TRUE
    ) THEN
      INSERT INTO public.user_licenses (user_id, license_id, expires_at, is_active)
      VALUES (NEW.id, rec.license_id, v_expires_at, TRUE);

      -- Increment activation count
      UPDATE public.licenses
      SET current_activations = LEAST(max_activations, current_activations + 1)
      WHERE id = rec.license_id;
    END IF;

    -- Mark order as processed
    UPDATE public.kofi_orders
    SET processed = TRUE
    WHERE id = rec.order_id;
  END LOOP;

  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER link_kofi_orders_on_profile_create
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.link_kofi_orders_to_new_profile();`}</code>
          </pre>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <p className="text-sm text-blue-800">
            <strong>كيف يعمل:</strong> عندما يسجل مستخدم جديد بنفس البريد الإلكتروني المستخدم في Ko-fi،
            يتم تفعيل ترخيصه تلقائياً
          </p>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-blue-600" />
          كيفية الاستخدام
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">للتبرعات (Donations):</h4>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 mr-4">
              <li>أنشئ فئة تسعير من نوع "Donation" في لوحة الإدارة</li>
              <li>حدد المبلغ ومدة الترخيص بالأيام</li>
              <li><strong>اختر التطبيق</strong> الذي سينشأ له الترخيص (أو اتركه فارغاً لترخيص عام)</li>
              <li>عندما يتبرع شخص بهذا المبلغ، سيتم إنشاء ترخيص تلقائياً مرتبط بالتطبيق المحدد</li>
              <li>إذا سجل المستخدم لاحقاً بنفس البريد، سيُربط الترخيص بحسابه</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-2">للمنتجات (Shop Orders):</h4>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 mr-4">
              <li>أنشئ فئة تسعير من نوع "Product"</li>
              <li>أدخل معرّف المنتج من Ko-fi (Product Identifier)</li>
              <li><strong>حدد التطبيق</strong> الذي سيعمل معه هذا الترخيص</li>
              <li>اختيارياً: فعّل التسعير المرن (Pay What You Want) لحساب المدة حسب المبلغ</li>
              <li>عند شراء المنتج، سيتم التعرف عليه وإنشاء ترخيص خاص بالتطبيق المحدد</li>
            </ol>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
            <h4 className="font-semibold text-green-900 mb-2">💡 ربط التراخيص بالتطبيقات:</h4>
            <p className="text-sm text-green-800">
              عند تحديد تطبيق معين لفئة التسعير، سيتم إنشاء التراخيص مرتبطة بهذا التطبيق تلقائياً. 
              هذا يضمن أن كل ترخيص يعمل فقط مع التطبيق المخصص له، ويمنع استخدام تراخيص تطبيق في تطبيق آخر.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-amber-900 mb-2">نصائح الأمان:</h4>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>• احفظ رمز التحقق (Verification Token) بشكل آمن في Supabase Secrets</li>
              <li>• راجع طلبات Ko-fi بانتظام من لوحة الإدارة</li>
              <li>• تأكد من تفعيل Webhook في Ko-fi بشكل صحيح</li>
              <li>• استخدم فئات تسعير واضحة ومحددة</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">مثال على بيانات Webhook</h3>
        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
          <pre className="text-sm">
            <code>{`{
  "verification_token": "your-verification-token",
  "message_id": "unique-message-id",
  "timestamp": "2024-10-08T12:00:00Z",
  "type": "Donation",
  "from_name": "أحمد محمد",
  "amount": "10.00",
  "email": "ahmed@example.com",
  "currency": "USD",
  "kofi_transaction_id": "txn_12345",
  "message": "شكراً على التطبيق الرائع!",
  "is_public": true
}`}</code>
          </pre>
        </div>
      </section>
    </div>
  );
}
