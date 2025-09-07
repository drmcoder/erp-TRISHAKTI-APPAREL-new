// Basic i18n hook for internationalization
import { useState, useCallback } from 'react';

export interface I18nConfig {
  locale: string;
  messages: Record<string, string>;
  fallbackLocale: string;
}

const DEFAULT_LOCALE = 'en';
const FALLBACK_LOCALE = 'en';

// Basic messages for common UI elements
const defaultMessages: Record<string, Record<string, string>> = {
  en: {
    'language.english': 'English',
    'language.nepali': 'नेपाली',
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.error': 'Error',
    'common.success': 'Success'
  },
  ne: {
    'language.english': 'अङ्ग्रेजी',
    'language.nepali': 'नेपाली',
    'common.loading': 'लोड गर्दै...',
    'common.save': 'सुरक्षित गर्नुहोस्',
    'common.cancel': 'रद्द गर्नुहोस्',
    'common.error': 'त्रुटि',
    'common.success': 'सफलता'
  }
};

export const useI18n = () => {
  const [currentLocale, setCurrentLocale] = useState<string>(() => {
    // Get from localStorage or default to English
    return localStorage.getItem('app-locale') || DEFAULT_LOCALE;
  });

  const t = useCallback((key: string, fallback?: string): string => {
    const messages = defaultMessages[currentLocale] || defaultMessages[FALLBACK_LOCALE];
    return messages[key] || fallback || key;
  }, [currentLocale]);

  const changeLanguage = useCallback(async (locale: string): Promise<void> => {
    try {
      setCurrentLocale(locale);
      localStorage.setItem('app-locale', locale);
      
      // Update document direction for RTL languages
      if (locale === 'ar' || locale === 'he') {
        document.documentElement.dir = 'rtl';
      } else {
        document.documentElement.dir = 'ltr';
      }
      
      // Update document lang attribute
      document.documentElement.lang = locale;
      
      console.log(`Language changed to: ${locale}`);
    } catch (error) {
      console.error('Error changing language:', error);
      throw error;
    }
  }, []);

  const getSupportedLanguages = useCallback(() => {
    return [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'ne', name: 'Nepali', nativeName: 'नेपाली' }
    ];
  }, []);

  const isRTL = useCallback((locale?: string) => {
    const checkLocale = locale || currentLocale;
    return ['ar', 'he', 'fa'].includes(checkLocale);
  }, [currentLocale]);

  return {
    currentLocale,
    t,
    changeLanguage,
    getSupportedLanguages,
    isRTL,
    locale: currentLocale // alias for compatibility
  };
};

export default useI18n;