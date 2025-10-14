// ⚠️ IMPORTANT: Do not commit APP_SECRET to version control!
// Store it in environment variables or secure configuration management

export const APP_CONFIG = {
  // Get these values from the Admin Dashboard -> Applications tab
  APP_KEY: import.meta.env.VITE_APP_KEY || '', // e.g., 'app_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
  APP_SECRET: import.meta.env.VITE_APP_SECRET || '', // KEEP THIS SECRET!
};

// Validation function to ensure config is set
export const validateAppConfig = (): boolean => {
  if (!APP_CONFIG.APP_KEY || !APP_CONFIG.APP_SECRET) {
    console.error('❌ Application credentials not configured!');
    console.error('Please set VITE_APP_KEY and VITE_APP_SECRET environment variables.');
    return false;
  }
  return true;
};
