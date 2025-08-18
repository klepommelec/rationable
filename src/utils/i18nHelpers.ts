import { fr, enUS } from 'date-fns/locale';

export const getDateFnsLocale = (language: string) => {
  return language === 'en' ? enUS : fr;
};

export const getLocaleTag = (language: string) => {
  return language === 'en' ? 'en-US' : 'fr-FR';
};

export const getCategoryLabel = (categoryId: string, t: (key: string) => string, fallbackName?: string) => {
  const categoryKey = `categories.${categoryId}`;
  const translated = t(categoryKey);
  
  // If translation equals the key, it means translation is not found, use fallback
  if (translated === categoryKey) {
    return fallbackName || categoryId;
  }
  
  return translated;
};