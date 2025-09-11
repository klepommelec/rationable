import { SupportedLanguage } from '@/i18n/ui';
import { MONTHLY_TEMPLATES_DATA, MonthlyTemplate, MONTHLY_TEMPLATE_LABELS } from '@/data/monthlyTemplates';

/**
 * Get the current month key (format: "YYYY-MM")
 */
export const getCurrentMonthKey = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

/**
 * Extract language code from SupportedLanguage
 */
export const getLanguageCode = (language: SupportedLanguage): 'fr' | 'en' => {
  if (language.startsWith('fr')) return 'fr';
  return 'en'; // Default to English for all other languages
};

/**
 * Get monthly trending templates for a specific context and language
 */
export const getMonthlyTrendingTemplates = (
  context: 'personal' | 'professional',
  language: SupportedLanguage
): MonthlyTemplate[] => {
  const currentMonth = getCurrentMonthKey();
  const languageCode = getLanguageCode(language);
  
  // Filter templates by context, current month, and language
  const filteredTemplates = MONTHLY_TEMPLATES_DATA.templates.filter(template => {
    const isCorrectContext = template.context === context;
    const isCurrentMonth = template.month === MONTHLY_TEMPLATES_DATA.currentMonth;
    const isCorrectLanguage = template.id.endsWith(`-${languageCode}`);
    
    return isCorrectContext && isCurrentMonth && isCorrectLanguage;
  });

  // Return only first 3 templates
  return filteredTemplates.slice(0, 3);
};

/**
 * Get localized labels for the current language
 */
export const getLocalizedLabels = (language: SupportedLanguage) => {
  const languageCode = getLanguageCode(language);
  return MONTHLY_TEMPLATE_LABELS[languageCode];
};

/**
 * Check if it's time to rotate templates (new month)
 * This would be used by an admin function to update templates
 */
export const shouldRotateTemplates = (): boolean => {
  const currentMonth = getCurrentMonthKey();
  return currentMonth !== MONTHLY_TEMPLATES_DATA.currentMonth;
};

/**
 * Archive old templates and set new ones
 * This would be called by an admin function when updating monthly templates
 */
export const rotateMonthlyTemplates = (newTemplates: MonthlyTemplate[]): void => {
  // Move current templates to archived
  const templatesToArchive = MONTHLY_TEMPLATES_DATA.templates.filter(
    template => template.month === MONTHLY_TEMPLATES_DATA.currentMonth
  );
  
  MONTHLY_TEMPLATES_DATA.archived.push(...templatesToArchive);
  
  // Set new templates
  MONTHLY_TEMPLATES_DATA.templates = newTemplates;
  MONTHLY_TEMPLATES_DATA.currentMonth = getCurrentMonthKey();
  
  console.log('Monthly templates rotated successfully');
};