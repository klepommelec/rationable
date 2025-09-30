import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { I18nService, SupportedLanguage } from '@/services/i18nService';
import { translations, UITranslations } from '@/i18n/ui';
import { getDateFnsLocale, getLocaleTag } from '@/utils/i18nHelpers';

interface I18nUIContextType {
  currentLanguage: SupportedLanguage;
  t: (key: string) => string;
  setLanguage: (language: SupportedLanguage) => void;
  getLocaleTag: () => string;
  getDateFnsLocale: () => import('date-fns').Locale;
}

const I18nUIContext = createContext<I18nUIContextType | undefined>(undefined);

interface I18nUIProviderProps {
  children: ReactNode;
}

export const I18nUIProvider = ({ children }: I18nUIProviderProps) => {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(() => {
    const lang = I18nService.getCurrentLanguage();
    console.log('I18nUIContext - initial language:', lang);
    return lang;
  });

  useEffect(() => {
    // Initialize language with geo-location detection
    const initializeLanguage = async () => {
      await I18nService.initializeLanguageWithGeoLocation();
      setCurrentLanguage(I18nService.getCurrentLanguage());
    };

    initializeLanguage();

    // Listen for language changes
    const handleLanguageChange = () => {
      setCurrentLanguage(I18nService.getCurrentLanguage());
    };

    // Check for language changes periodically or on focus
    window.addEventListener('focus', handleLanguageChange);
    
    return () => {
      window.removeEventListener('focus', handleLanguageChange);
    };
  }, []);

  const t = (key: string): string => {
    const keys = key.split('.');
    let current: any = translations[currentLanguage] || translations.en;
    
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        // Fallback to English if key not found in current language
        let fallback: any = translations.en;
        for (const fallbackKey of keys) {
          if (fallback && typeof fallback === 'object' && fallbackKey in fallback) {
            fallback = fallback[fallbackKey];
          } else {
            return key; // Return key if not found in fallback either
          }
        }
        return typeof fallback === 'string' ? fallback : key;
      }
    }
    
    return typeof current === 'string' ? current : key;
  };

  const setLanguage = (language: SupportedLanguage) => {
    I18nService.setLanguage(language);
    setCurrentLanguage(language);
    // Force a complete re-render by updating the document title
    document.title = document.title; // This triggers a re-render
  };

  return (
    <I18nUIContext.Provider value={{ 
      currentLanguage, 
      t,
      setLanguage,
      getLocaleTag: () => getLocaleTag(currentLanguage),
      getDateFnsLocale: () => getDateFnsLocale(currentLanguage),
    }}>
      {children}
    </I18nUIContext.Provider>
  );
};

export const useI18nUI = (): I18nUIContextType => {
  const context = useContext(I18nUIContext);
  if (!context) {
    throw new Error('useI18nUI must be used within an I18nUIProvider');
  }
  return context;
};