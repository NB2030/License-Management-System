export const ERROR_MESSAGES: Record<string, string> = {
  'duplicate key': 'هذا العنصر موجود بالفعل',
  'permission denied': 'ليس لديك صلاحية لهذه العملية',
  'not-null constraint': 'معلومات مطلوبة مفقودة',
  'foreign key': 'عنصر مرتبط غير موجود',
  'does not exist': 'العنصر المطلوب غير موجود',
  'violates row-level security': 'ليس لديك صلاحية للوصول',
  'invalid input': 'البيانات المدخلة غير صحيحة',
  'unique constraint': 'هذا العنصر موجود بالفعل',
};

export function mapErrorToUserMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'حدث خطأ غير متوقع';
  }

  const message = error.message.toLowerCase();
  
  for (const [key, userMessage] of Object.entries(ERROR_MESSAGES)) {
    if (message.includes(key)) {
      return userMessage;
    }
  }
  
  return 'حدث خطأ في النظام. يرجى المحاولة مرة أخرى';
}

export function logError(context: string, error: unknown, metadata?: Record<string, any>) {
  const isDev = import.meta.env.DEV;
  
  if (isDev) {
    console.error(`[${context}]`, error, metadata);
  } else {
    console.error(`Error in ${context}`);
  }
}
