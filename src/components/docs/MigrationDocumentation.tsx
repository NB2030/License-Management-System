import { Database, AlertCircle } from 'lucide-react';

export default function MigrationDocumentation() {
  return (
    <div className="space-y-6">
      <section className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Database className="w-6 h-6 text-blue-600" />
          دليل ترحيل قاعدة البيانات
        </h2>
        <div className="prose prose-sm max-w-none text-gray-700 space-y-3">
          <p>
            لربط تطبيقك بنظام التراخيص، تحتاج إلى إنشاء جداول قاعدة البيانات التالية في مشروع Supabase الخاص بك.
          </p>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">1. جدول الملفات الشخصية (Profiles)</h3>
        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
          <pre className="text-sm">
            <code>{`-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);`}</code>
          </pre>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">2. جدول التراخيص (Licenses)</h3>
        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
          <pre className="text-sm">
            <code>{`-- Create licenses table
CREATE TABLE public.licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_key TEXT NOT NULL UNIQUE,
  duration_days INTEGER NOT NULL DEFAULT 30,
  max_activations INTEGER NOT NULL DEFAULT 1,
  current_activations INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = check_user_id
  );
$$;

-- Policies
CREATE POLICY "Users can view their license details"
  ON public.licenses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_licenses
      WHERE license_id = licenses.id
        AND user_id = auth.uid()
        AND is_active = TRUE
    )
  );

CREATE POLICY "Admins can view all licenses"
  ON public.licenses FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert licenses"
  ON public.licenses FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update licenses"
  ON public.licenses FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete licenses"
  ON public.licenses FOR DELETE
  USING (is_admin(auth.uid()));`}</code>
          </pre>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">3. جدول تراخيص المستخدمين (User Licenses)</h3>
        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
          <pre className="text-sm">
            <code>{`-- Create user_licenses table
CREATE TABLE public.user_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  license_id UUID NOT NULL REFERENCES public.licenses(id),
  activated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_validated TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_licenses ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own licenses"
  ON public.user_licenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own licenses"
  ON public.user_licenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own licenses"
  ON public.user_licenses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user licenses"
  ON public.user_licenses FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all user licenses"
  ON public.user_licenses FOR UPDATE
  USING (is_admin(auth.uid()));`}</code>
          </pre>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">4. جدول المشرفين (Admin Users)</h3>
        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
          <pre className="text-sm">
            <code>{`-- Create admin_users table
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  access_code_used TEXT,
  password_changed BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own admin record"
  ON public.admin_users FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own admin record"
  ON public.admin_users FOR UPDATE
  USING (user_id = auth.uid());`}</code>
          </pre>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">5. جدول رموز الوصول (Admin Access Codes)</h3>
        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
          <pre className="text-sm">
            <code>{`-- Create admin_access_codes table
CREATE TABLE public.admin_access_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_code TEXT NOT NULL UNIQUE,
  total_uses INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.admin_access_codes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Only admins can read access codes"
  ON public.admin_access_codes FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage access codes"
  ON public.admin_access_codes FOR ALL
  USING (is_admin(auth.uid()));`}</code>
          </pre>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">6. تحديث الطوابع الزمنية تلقائياً</h3>
        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
          <pre className="text-sm">
            <code>{`-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger for profiles table
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();`}</code>
          </pre>
        </div>
      </section>

      <section className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-amber-900 mb-2">ملاحظات مهمة:</h4>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>• تأكد من تفعيل Row Level Security (RLS) على جميع الجداول</li>
              <li>• راجع سياسات الأمان (Policies) وتأكد من مناسبتها لتطبيقك</li>
              <li>• قم بإنشاء مستخدم مشرف أول يدوياً من لوحة تحكم Supabase</li>
              <li>• احفظ نسخة احتياطية من قاعدة البيانات بانتظام</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
