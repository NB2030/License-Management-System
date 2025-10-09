import { z } from 'zod';

export const emailSchema = z
  .string()
  .trim()
  .email('البريد الإلكتروني غير صحيح')
  .max(255, 'البريد الإلكتروني طويل جداً');

export const passwordSchema = z
  .string()
  .min(8, 'يجب أن تكون كلمة المرور 8 أحرف على الأقل')
  .max(128, 'كلمة المرور طويلة جداً')
  .regex(/[A-Z]/, 'يجب أن تحتوي على حرف كبير')
  .regex(/[a-z]/, 'يجب أن تحتوي على حرف صغير')
  .regex(/[0-9]/, 'يجب أن تحتوي على رقم');

export const fullNameSchema = z
  .string()
  .trim()
  .min(2, 'الاسم قصير جداً')
  .max(100, 'الاسم طويل جداً')
  .regex(/^[\u0600-\u06FFa-zA-Z\s]+$/, 'يُسمح بالأحرف العربية والإنجليزية فقط');

export const licenseKeySchema = z
  .string()
  .trim()
  .length(23, 'صيغة مفتاح الترخيص غير صحيحة')
  .regex(/^[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}$/, 'صيغة مفتاح الترخيص غير صحيحة');

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: fullNameSchema,
  licenseKey: licenseKeySchema.optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
  licenseKey: licenseKeySchema.optional(),
});

export const adminLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});
