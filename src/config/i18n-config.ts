// Internationalization Configuration
// Comprehensive i18n setup for English and Nepali languages

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Import translation resources
import enCommon from '../locales/en/common.json';
import enNavigation from '../locales/en/navigation.json';
import enOperators from '../locales/en/operators.json';
import enWorkAssignment from '../locales/en/work-assignment.json';
import enProduction from '../locales/en/production.json';
import enQuality from '../locales/en/quality.json';
import enReports from '../locales/en/reports.json';
import enSettings from '../locales/en/settings.json';

import neCommon from '../locales/ne/common.json';
import neNavigation from '../locales/ne/navigation.json';
import neOperators from '../locales/ne/operators.json';
import neWorkAssignment from '../locales/ne/work-assignment.json';
import neProduction from '../locales/ne/production.json';
import neQuality from '../locales/ne/quality.json';
import neReports from '../locales/ne/reports.json';
import neSettings from '../locales/ne/settings.json';

// Language configuration
export const SUPPORTED_LANGUAGES = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    direction: 'ltr'
  },
  {
    code: 'ne',
    name: 'Nepali',
    nativeName: 'नेपाली',
    flag: '🇳🇵',
    direction: 'ltr'
  }
] as const;

export const DEFAULT_LANGUAGE = 'en';
export const FALLBACK_LANGUAGE = 'en';

// Translation resources
const resources = {
  en: {
    common: enCommon,
    navigation: enNavigation,
    operators: enOperators,
    workAssignment: enWorkAssignment,
    production: enProduction,
    quality: enQuality,
    reports: enReports,
    settings: enSettings
  },
  ne: {
    common: neCommon,
    navigation: neNavigation,
    operators: neOperators,
    workAssignment: neWorkAssignment,
    production: neProduction,
    quality: neQuality,
    reports: neReports,
    settings: neSettings
  }
};

// Initialize i18n
const initI18n = () => {
  i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      lng: DEFAULT_LANGUAGE,
      fallbackLng: FALLBACK_LANGUAGE,
      debug: process.env.NODE_ENV === 'development',
      
      // Namespace configuration
      defaultNS: 'common',
      ns: ['common', 'navigation', 'operators', 'workAssignment', 'production', 'quality', 'reports', 'settings'],
      
      // Interpolation configuration
      interpolation: {
        escapeValue: false, // React already escapes
        formatSeparator: ',',
        format: (value, format, lng) => {
          if (format === 'number') {
            return formatNumber(value, lng);
          }
          if (format === 'currency') {
            return formatCurrency(value, lng);
          }
          if (format === 'date') {
            return formatDate(value, lng);
          }
          if (format === 'time') {
            return formatTime(value, lng);
          }
          if (format === 'datetime') {
            return formatDateTime(value, lng);
          }
          return value;
        }
      },
      
      // Language detection options
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        lookupLocalStorage: 'tsa-erp-language',
        caches: ['localStorage'],
        excludeCacheFor: ['cimode']
      },
      
      // Backend configuration for loading translations
      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
        addPath: '/locales/add/{{lng}}/{{ns}}',
        allowMultiLoading: false,
        crossDomain: false,
        withCredentials: false,
        requestOptions: {
          cache: 'default',
          credentials: 'same-origin'
        }
      },
      
      // React i18next options
      react: {
        bindI18n: 'languageChanged',
        bindI18nStore: '',
        transEmptyNodeValue: '',
        transSupportBasicHtmlNodes: true,
        transKeepBasicHtmlNodesFor: ['br', 'strong', 'i'],
        useSuspense: false
      }
    });

  return i18n;
};

// Number formatting utilities
export const formatNumber = (value: number | string, lng: string = i18n.language): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) return value.toString();
  
  switch (lng) {
    case 'ne':
      return new Intl.NumberFormat('ne-NP', {
        useGrouping: true
      }).format(num);
    default:
      return new Intl.NumberFormat('en-US', {
        useGrouping: true
      }).format(num);
  }
};

// Currency formatting utilities
export const formatCurrency = (value: number | string, lng: string = i18n.language): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) return value.toString();
  
  switch (lng) {
    case 'ne':
      return new Intl.NumberFormat('ne-NP', {
        style: 'currency',
        currency: 'NPR',
        currencyDisplay: 'symbol'
      }).format(num);
    default:
      return `৳${new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(num)}`;
  }
};

// Date formatting utilities
export const formatDate = (value: Date | string | number, lng: string = i18n.language): string => {
  const date = new Date(value);
  
  if (isNaN(date.getTime())) return value.toString();
  
  switch (lng) {
    case 'ne':
      return new Intl.DateTimeFormat('ne-NP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    default:
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
  }
};

// Time formatting utilities
export const formatTime = (value: Date | string | number, lng: string = i18n.language): string => {
  const date = new Date(value);
  
  if (isNaN(date.getTime())) return value.toString();
  
  switch (lng) {
    case 'ne':
      return new Intl.DateTimeFormat('ne-NP', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(date);
    default:
      return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(date);
  }
};

// DateTime formatting utilities
export const formatDateTime = (value: Date | string | number, lng: string = i18n.language): string => {
  const date = new Date(value);
  
  if (isNaN(date.getTime())) return value.toString();
  
  switch (lng) {
    case 'ne':
      return new Intl.DateTimeFormat('ne-NP', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    default:
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
  }
};

// Relative time formatting
export const formatRelativeTime = (value: Date | string | number, lng: string = i18n.language): string => {
  const date = new Date(value);
  const now = new Date();
  
  if (isNaN(date.getTime())) return value.toString();
  
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  const rtf = new Intl.RelativeTimeFormat(lng === 'ne' ? 'ne-NP' : 'en-US', {
    numeric: 'auto',
    style: 'short'
  });
  
  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, 'second');
  } else if (diffInMinutes < 60) {
    return rtf.format(-diffInMinutes, 'minute');
  } else if (diffInHours < 24) {
    return rtf.format(-diffInHours, 'hour');
  } else if (diffInDays < 7) {
    return rtf.format(-diffInDays, 'day');
  } else {
    return formatDate(date, lng);
  }
};

// Nepali number conversion utilities
export const convertToNepaliNumbers = (value: string | number): string => {
  const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
  let result = value.toString();
  englishDigits.forEach((digit, index) => {
    result = result.replace(new RegExp(digit, 'g'), nepaliDigits[index]);
  });
  
  return result;
};

export const convertToEnglishNumbers = (value: string): string => {
  const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
  let result = value;
  nepaliDigits.forEach((digit, index) => {
    result = result.replace(new RegExp(digit, 'g'), englishDigits[index]);
  });
  
  return result;
};

// Language utility functions
export const getCurrentLanguage = (): string => {
  return i18n.language || DEFAULT_LANGUAGE;
};

export const changeLanguage = async (lng: string): Promise<void> => {
  try {
    await i18n.changeLanguage(lng);
    localStorage.setItem('tsa-erp-language', lng);
    
    // Update document direction if needed
    const language = SUPPORTED_LANGUAGES.find(l => l.code === lng);
    if (language) {
      document.documentElement.dir = language.direction;
    }
    
    console.log(`Language changed to: ${lng}`);
  } catch (error) {
    console.error('Failed to change language:', error);
    throw error;
  }
};

export const getLanguageInfo = (code: string) => {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
};

export const isRTL = (lng: string = i18n.language): boolean => {
  const language = getLanguageInfo(lng);
  return language?.direction === 'rtl';
};

// Translation key validation (development only)
export const validateTranslationKeys = () => {
  if (process.env.NODE_ENV !== 'development') return;
  
  const englishKeys = extractKeysFromObject(resources.en, '');
  const nepaliKeys = extractKeysFromObject(resources.ne, '');
  
  const missingInNepali = englishKeys.filter(key => !nepaliKeys.includes(key));
  const missingInEnglish = nepaliKeys.filter(key => !englishKeys.includes(key));
  
  if (missingInNepali.length > 0) {
    console.warn('Missing Nepali translations:', missingInNepali);
  }
  
  if (missingInEnglish.length > 0) {
    console.warn('Missing English translations:', missingInEnglish);
  }
};

// Helper function to extract keys from nested object
const extractKeysFromObject = (obj: any, prefix: string): string[] => {
  let keys: string[] = [];
  
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = keys.concat(extractKeysFromObject(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  
  return keys;
};

// Export configured i18n instance
export default initI18n();