import React, { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { 
  Globe, 
  Check,
  Languages,
  Settings
} from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';
import { toast } from 'sonner';

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  isRTL?: boolean;
}

const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    isRTL: false
  },
  {
    code: 'ne',
    name: 'Nepali',
    nativeName: 'नेपाली',
    flag: '🇳🇵',
    isRTL: false
  }
];

interface LanguageSwitcherProps {
  variant?: 'compact' | 'full' | 'dropdown';
  showFlag?: boolean;
  showNativeName?: boolean;
  placement?: 'header' | 'sidebar' | 'floating';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'compact',
  showFlag = true,
  showNativeName = true,
  placement = 'header'
}) => {
  const { currentLanguage, changeLanguage, isChanging } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage) 
    || SUPPORTED_LANGUAGES[0];

  const handleLanguageChange = async (languageCode: string) => {
    try {
      await changeLanguage(languageCode);
      const selectedLang = SUPPORTED_LANGUAGES.find(lang => lang.code === languageCode);
      
      toast.success(
        languageCode === 'en' 
          ? `Language changed to ${selectedLang?.name}`
          : `भाषा ${selectedLang?.nativeName} मा परिवर्तन गरियो`,
        {
          duration: 3000,
        }
      );
      
      setIsOpen(false);
    } catch (error) {
      toast.error(
        currentLanguage === 'en' 
          ? 'Failed to change language'
          : 'भाषा परिवर्तन गर्न असफल भयो'
      );
    }
  };

  // Compact variant - just a button with current language
  if (variant === 'compact') {
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-auto px-2 font-medium"
            disabled={isChanging}
          >
            {showFlag && <span className="mr-1">{currentLang.flag}</span>}
            <span className="text-sm">
              {showNativeName ? currentLang.nativeName : currentLang.code.toUpperCase()}
            </span>
            <Globe className="ml-1 h-3 w-3" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent 
          className="w-48 p-2" 
          align={placement === 'header' ? 'end' : 'start'}
          side={placement === 'sidebar' ? 'right' : 'bottom'}
        >
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground px-2 py-1">
              {currentLanguage === 'en' ? 'Select Language' : 'भाषा छान्नुहोस्'}
            </div>
            {SUPPORTED_LANGUAGES.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                disabled={isChanging}
                className={`w-full flex items-center justify-between px-2 py-2 text-sm rounded-md transition-colors ${
                  currentLanguage === language.code
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-muted'
                } ${isChanging ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center space-x-2">
                  <span>{language.flag}</span>
                  <div className="text-left">
                    <div className="font-medium">{language.nativeName}</div>
                    <div className="text-xs text-muted-foreground">{language.name}</div>
                  </div>
                </div>
                {currentLanguage === language.code && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Dropdown variant - using Select component
  if (variant === 'dropdown') {
    return (
      <Select 
        value={currentLanguage} 
        onValueChange={handleLanguageChange}
        disabled={isChanging}
      >
        <SelectTrigger className="w-auto min-w-[140px]">
          <div className="flex items-center space-x-2">
            {showFlag && <span>{currentLang.flag}</span>}
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent>
          {SUPPORTED_LANGUAGES.map((language) => (
            <SelectItem key={language.code} value={language.code}>
              <div className="flex items-center space-x-2">
                <span>{language.flag}</span>
                <div>
                  <div className="font-medium">{language.nativeName}</div>
                  <div className="text-xs text-muted-foreground">{language.name}</div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  // Full variant - with more detailed information
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Languages className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">
          {currentLanguage === 'en' ? 'Language' : 'भाषा'}
        </span>
      </div>
      
      <div className="space-y-2">
        {SUPPORTED_LANGUAGES.map((language) => (
          <button
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            disabled={isChanging}
            className={`w-full flex items-center justify-between p-3 border rounded-lg transition-colors ${
              currentLanguage === language.code
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-muted-foreground hover:bg-muted/50'
            } ${isChanging ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{language.flag}</span>
              <div className="text-left">
                <div className="font-semibold">{language.nativeName}</div>
                <div className="text-sm text-muted-foreground">{language.name}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {currentLanguage === language.code && (
                <Badge variant="secondary" className="text-xs">
                  {currentLanguage === 'en' ? 'Current' : 'हालको'}
                </Badge>
              )}
              {currentLanguage === language.code && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Language Settings */}
      <div className="pt-3 border-t">
        <button
          className="w-full flex items-center space-x-2 p-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => {
            // Could open language preferences modal
            toast.info(
              currentLanguage === 'en' 
                ? 'Language preferences coming soon'
                : 'भाषा प्राथमिकताहरू चाँडै आउँदैछ'
            );
          }}
        >
          <Settings className="h-4 w-4" />
          <span>
            {currentLanguage === 'en' ? 'Language Preferences' : 'भाषा प्राथमिकताहरू'}
          </span>
        </button>
      </div>
    </div>
  );
};

// Simple flag-only variant for space-constrained areas
export const LanguageSwitcherCompact: React.FC = () => {
  const { currentLanguage, changeLanguage, isChanging } = useI18n();
  const currentLang = SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage) 
    || SUPPORTED_LANGUAGES[0];

  const toggleLanguage = () => {
    const nextLanguage = currentLanguage === 'en' ? 'ne' : 'en';
    changeLanguage(nextLanguage);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0"
      onClick={toggleLanguage}
      disabled={isChanging}
      title={
        currentLanguage === 'en' 
          ? `Switch to Nepali (${SUPPORTED_LANGUAGES[1].nativeName})`
          : `Switch to English (${SUPPORTED_LANGUAGES[0].name})`
      }
    >
      <span className="text-base">{currentLang.flag}</span>
    </Button>
  );
};

// Hook for getting language-aware text direction
export const useLanguageDirection = () => {
  const { currentLanguage } = useI18n();
  const currentLang = SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage);
  
  return {
    direction: currentLang?.isRTL ? 'rtl' : 'ltr',
    isRTL: currentLang?.isRTL || false,
    className: currentLang?.isRTL ? 'rtl' : 'ltr'
  };
};

// Language-aware number and date formatting
export const useLanguageFormatting = () => {
  const { currentLanguage } = useI18n();
  
  const formatNumber = (number: number, options?: Intl.NumberFormatOptions) => {
    const locale = currentLanguage === 'ne' ? 'ne-NP' : 'en-US';
    return new Intl.NumberFormat(locale, options).format(number);
  };
  
  const formatCurrency = (amount: number, currency: string = 'NPR') => {
    const locale = currentLanguage === 'ne' ? 'ne-NP' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };
  
  const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions) => {
    const locale = currentLanguage === 'ne' ? 'ne-NP' : 'en-US';
    return new Intl.DateTimeFormat(locale, options).format(date);
  };
  
  const formatRelativeTime = (date: Date) => {
    const locale = currentLanguage === 'ne' ? 'ne-NP' : 'en-US';
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    const diff = date.getTime() - Date.now();
    const days = Math.round(diff / (1000 * 60 * 60 * 24));
    
    if (Math.abs(days) < 1) {
      const hours = Math.round(diff / (1000 * 60 * 60));
      if (Math.abs(hours) < 1) {
        const minutes = Math.round(diff / (1000 * 60));
        return rtf.format(minutes, 'minute');
      }
      return rtf.format(hours, 'hour');
    }
    
    return rtf.format(days, 'day');
  };
  
  return {
    formatNumber,
    formatCurrency,
    formatDate,
    formatRelativeTime,
    locale: currentLanguage === 'ne' ? 'ne-NP' : 'en-US'
  };
};

export default LanguageSwitcher;