import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { I18nService, SupportedLanguage } from '@/services/i18nService';
import { translations, UITranslations } from '@/i18n/ui';

interface I18nUIContextType {
  currentLanguage: SupportedLanguage;
  t: (key: string) => string;
}

const I18nUIContext = createContext<I18nUIContextType | undefined>(undefined);

interface I18nUIProviderProps {
  children: ReactNode;
}

export const I18nUIProvider = ({ children }: I18nUIProviderProps) => {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(() => 
    I18nService.getCurrentLanguage()
  );

  useEffect(() => {
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
    let current: any = translations[currentLanguage] || translations.fr;
    
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        // Fallback to French if key not found
        let fallback: any = translations.fr;
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

  return (
    <I18nUIContext.Provider value={{ currentLanguage, t }}>
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