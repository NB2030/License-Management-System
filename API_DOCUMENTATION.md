# 🚀 License Service API - التوثيق الشامل

خدمة تراخيص مستقلة بالكامل مع API جاهز للاستخدام في جميع مشاريعك. لا حاجة لربط Supabase أو أي قاعدة بيانات - فقط استخدم الـ API!

## 📌 معلومات الخدمة

**Base URL:**
```
https://iwipefxjymkqpsuxkupo.supabase.co/functions/v1/license-service-api
```

**كود الوصول للمشرف:**
```
ADMIN-2024-VEX-SECURE
```

استخدم هذا الكود لإنشاء حساب مشرف وإدارة التراخيص.

---

## 🔐 نقاط النهاية (Endpoints)

### 1. تسجيل مستخدم جديد
إنشاء حساب جديد في النظام.

**الطريقة:** `POST`
**المسار:** `/register`
**URL الكامل:**
```
https://iwipefxjymkqpsuxkupo.supabase.co/functions/v1/license-service-api/register
```

**Body (JSON):**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "اسم المستخدم"
}
```

**الاستجابة الناجحة:**
```json
{
  "success": true,
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "fullName": "اسم المستخدم"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**مثال بـ JavaScript:**
```javascript
const response = await fetch('https://iwipefxjymkqpsuxkupo.supabase.co/functions/v1/license-service-api/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    fullName: 'اسم المستخدم'
  })
});

const data = await response.json();
console.log(data.token); // احفظ هذا التوكن
```

---

### 2. تسجيل الدخول
تسجيل دخول مستخدم موجود.

**الطريقة:** `POST`
**المسار:** `/login`
**URL الكامل:**
```
https://iwipefxjymkqpsuxkupo.supabase.co/functions/v1/license-service-api/login
```

**Body (JSON):**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**الاستجابة الناجحة:**
```json
{
  "success": true,
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "fullName": "اسم المستخدم"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**مثال بـ JavaScript:**
```javascript
const response = await fetch('https://iwipefxjymkqpsuxkupo.supabase.co/functions/v1/license-service-api/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const data = await response.json();
localStorage.setItem('userToken', data.token);
```

---

### 3. تفعيل الترخيص
تفعيل ترخيص للمستخدم.

**الطريقة:** `POST`
**المسار:** `/activate`
**URL الكامل:**
```
https://iwipefxjymkqpsuxkupo.supabase.co/functions/v1/license-service-api/activate
```

**Body (JSON):**
```json
{
  "licenseKey": "XXXXX-XXXXX-XXXXX-XXXXX",
  "token": "user-token-here"
}
```

**الاستجابة الناجحة:**
```json
{
  "success": true,
  "message": "License activated successfully",
  "expiresAt": "2024-11-02T10:30:00.000Z"
}
```

**الاستجابة الفاشلة:**
```json
{
  "success": false,
  "message": "Invalid or inactive license"
}
```

**مثال بـ JavaScript:**
```javascript
const token = localStorage.getItem('userToken');

const response = await fetch('https://iwipefxjymkqpsuxkupo.supabase.co/functions/v1/license-service-api/activate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    licenseKey: 'XXXXX-XXXXX-XXXXX-XXXXX',
    token: token
  })
});

const data = await response.json();
if (data.success) {
  console.log('تم التفعيل حتى:', data.expiresAt);
}
```

---

### 4. التحقق من صلاحية الترخيص
التحقق من أن المستخدم لديه ترخيص نشط.

**الطريقة:** `POST`
**المسار:** `/validate`
**URL الكامل:**
```
https://iwipefxjymkqpsuxkupo.supabase.co/functions/v1/license-service-api/validate
```

**Body (JSON):**
```json
{
  "token": "user-token-here"
}
```

**الاستجابة الناجحة:**
```json
{
  "isValid": true,
  "expiresAt": "2024-11-02T10:30:00.000Z",
  "daysLeft": 25,
  "license": {
    "key": "XXXXX-XXXXX-XXXXX-XXXXX",
    "durationDays": 30
  }
}
```

**الاستجابة الفاشلة:**
```json
{
  "isValid": false,
  "message": "No active license found"
}
```

**مثال بـ JavaScript:**
```javascript
const token = localStorage.getItem('userToken');

const response = await fetch('https://iwipefxjymkqpsuxkupo.supabase.co/functions/v1/license-service-api/validate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    token: token
  })
});

const data = await response.json();
if (data.isValid) {
  console.log(`الترخيص صالح - متبقي ${data.daysLeft} يوم`);
} else {
  console.log('الترخيص منتهي أو غير موجود');
}
```

---

### 5. معلومات الخدمة
الحصول على معلومات عن الخدمة ونقاط النهاية المتاحة.

**الطريقة:** `GET`
**المسار:** `/info`
**URL الكامل:**
```
https://iwipefxjymkqpsuxkupo.supabase.co/functions/v1/license-service-api/info
```

**الاستجابة:**
```json
{
  "service": "License Service API",
  "version": "1.0.0",
  "endpoints": {
    "register": "POST /license-service-api/register",
    "login": "POST /license-service-api/login",
    "activate": "POST /license-service-api/activate",
    "validate": "POST /license-service-api/validate"
  }
}
```

---

## 💻 أمثلة كاملة للتكامل

### مثال 1: React App - نظام تسجيل الدخول الكامل

```jsx
import { useState, useEffect } from 'react';

const API_BASE = 'https://iwipefxjymkqpsuxkupo.supabase.co/functions/v1/license-service-api';

function App() {
  const [user, setUser] = useState(null);
  const [licenseValid, setLicenseValid] = useState(false);

  useEffect(() => {
    checkLicense();
  }, []);

  const checkLicense = async () => {
    const token = localStorage.getItem('userToken');
    if (!token) return;

    const res = await fetch(`${API_BASE}/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });

    const data = await res.json();
    setLicenseValid(data.isValid);
  };

  const handleRegister = async (email, password, fullName) => {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullName })
    });

    const data = await res.json();
    if (data.success) {
      localStorage.setItem('userToken', data.token);
      setUser(data.user);
    }
  };

  const handleActivateLicense = async (licenseKey) => {
    const token = localStorage.getItem('userToken');

    const res = await fetch(`${API_BASE}/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey, token })
    });

    const data = await res.json();
    if (data.success) {
      setLicenseValid(true);
    }
    return data;
  };

  if (!user) {
    return <LoginForm onLogin={handleRegister} />;
  }

  if (!licenseValid) {
    return <LicenseActivation onActivate={handleActivateLicense} />;
  }

  return <YourApp user={user} />;
}
```

### مثال 2: دعم الوصول غير المتصل

```javascript
// حفظ بيانات الترخيص محلياً
async function validateAndCache() {
  const token = localStorage.getItem('userToken');

  try {
    const res = await fetch(`${API_BASE}/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });

    const data = await res.json();

    if (data.isValid) {
      // حفظ بيانات الترخيص للوصول غير المتصل
      localStorage.setItem('licenseCache', JSON.stringify({
        expiresAt: data.expiresAt,
        lastChecked: new Date().toISOString()
      }));
      return true;
    }
  } catch (error) {
    // إذا فشل الاتصال، تحقق من الكاش المحلي
    const cache = localStorage.getItem('licenseCache');
    if (cache) {
      const { expiresAt } = JSON.parse(cache);
      return new Date(expiresAt) > new Date();
    }
  }

  return false;
}
```

---

## 🔧 إدارة التراخيص (للمشرفين)

### الوصول للوحة الإدارة

1. افتح التطبيق
2. أنشئ حساباً جديداً أو سجل دخول
3. أدخل كود الوصول: `ADMIN-2024-VEX-SECURE`
4. ستحصل على وصول للوحة الإدارة

### إنشاء ترخيص جديد

من لوحة الإدارة:
1. اضغط "إنشاء ترخيص جديد"
2. حدد مدة الترخيص (بالأيام)
3. حدد عدد التفعيلات المسموحة
4. انسخ مفتاح الترخيص المُنشأ
5. أعطه لمستخدميك

---

## 🎯 سير العمل الموصى به

### في تطبيقك:

```
1. المستخدم يفتح التطبيق
   ↓
2. التحقق من وجود توكن محفوظ
   ↓
3. إذا لا يوجد توكن → التسجيل/تسجيل الدخول
   ↓
4. بعد الدخول → التحقق من الترخيص
   ↓
5. إذا لا يوجد ترخيص → طلب مفتاح الترخيص
   ↓
6. تفعيل الترخيص
   ↓
7. حفظ بيانات الترخيص للوصول غير المتصل
   ↓
8. السماح بالوصول للتطبيق
```

---

## ⚠️ معالجة الأخطاء

جميع نقاط النهاية تُرجع أخطاء بصيغة موحدة:

```json
{
  "error": "رسالة الخطأ"
}
```

**أكواد الحالة:**
- `200`: نجحت العملية
- `400`: خطأ في البيانات المرسلة
- `401`: مشكلة في المصادقة
- `404`: نقطة النهاية غير موجودة
- `500`: خطأ في الخادم

---

## 📱 أمثلة للغات أخرى

### Python

```python
import requests

API_BASE = "https://iwipefxjymkqpsuxkupo.supabase.co/functions/v1/license-service-api"

# التسجيل
response = requests.post(f"{API_BASE}/register", json={
    "email": "user@example.com",
    "password": "password123",
    "fullName": "اسم المستخدم"
})
data = response.json()
token = data["token"]

# تفعيل الترخيص
response = requests.post(f"{API_BASE}/activate", json={
    "licenseKey": "XXXXX-XXXXX-XXXXX-XXXXX",
    "token": token
})
print(response.json())
```

### PHP

```php
<?php
$apiBase = "https://iwipefxjymkqpsuxkupo.supabase.co/functions/v1/license-service-api";

// التسجيل
$data = [
    'email' => 'user@example.com',
    'password' => 'password123',
    'fullName' => 'اسم المستخدم'
];

$ch = curl_init("$apiBase/register");
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

$response = json_decode(curl_exec($ch), true);
$token = $response['token'];

curl_close($ch);
?>
```

---

## 🚀 الخلاصة

هذه خدمة مستقلة بالكامل:
- ✅ لا حاجة لـ Supabase في مشروعك
- ✅ لا حاجة لقاعدة بيانات
- ✅ فقط استخدم الـ API
- ✅ يعمل مع أي لغة برمجة
- ✅ يعمل مع أي إطار عمل
- ✅ دعم الوصول غير المتصل

**كل ما تحتاجه:**
1. Base URL
2. كود الوصول للمشرف (لإنشاء التراخيص)
3. استدعاءات API بسيطة

---

## 📞 الدعم

للمشاكل أو الأسئلة، راجع ملف `SETUP.md` أو التوثيق داخل لوحة الإدارة.
