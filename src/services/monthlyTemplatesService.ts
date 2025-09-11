import { SupportedLanguage } from '@/i18n/ui';
import { supabase } from '@/integrations/supabase/client';

export interface MonthlyTemplate {
  id: string;
  prompt: string;
  context: 'personal' | 'professional';
  month: string;
  news_sources?: Array<{ source: string; category: string }>;
}

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
 * Get monthly trending templates for a specific context and language from database
 */
export const getMonthlyTrendingTemplates = async (
  context: 'personal' | 'professional',
  language: SupportedLanguage
): Promise<MonthlyTemplate[]> => {
  const currentMonth = getCurrentMonthKey();
  const languageCode = getLanguageCode(language);
  
  try {
    const { data: templates, error } = await supabase
      .from('monthly_templates')
      .select('*')
      .eq('month_key', currentMonth)
      .eq('context', context)
      .eq('language', languageCode)
      .eq('is_active', true)
      .limit(3);

    if (error) {
      console.error('Error fetching monthly templates:', error);
      return getFallbackTemplates(context, languageCode, currentMonth);
    }

    if (!templates || templates.length === 0) {
      console.warn('No active templates found, using fallback');
      return getFallbackTemplates(context, languageCode, currentMonth);
    }

    return templates.map(template => ({
      id: template.id,
      prompt: template.prompt,
      context: template.context as 'personal' | 'professional',
      month: template.month_key,
      news_sources: template.news_sources as Array<{ source: string; category: string }>
    }));

  } catch (error) {
    console.error('Database error fetching templates:', error);
    return getFallbackTemplates(context, languageCode, currentMonth);
  }
};

/**
 * Get localized labels for the current language
 */
export const getLocalizedLabels = (language: SupportedLanguage) => {
  const languageCode = getLanguageCode(language);
  const currentMonth = getCurrentMonthKey();
  const [year, month] = currentMonth.split('-');
  const monthNames = {
    fr: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
         'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
    en: ['January', 'February', 'March', 'April', 'May', 'June',
         'July', 'August', 'September', 'October', 'November', 'December']
  };
  
  const monthName = monthNames[languageCode][parseInt(month) - 1];
  
  return {
    fr: {
      trendingThisMonth: `Tendances du mois de ${monthName}`,
      monthlyTrends: "Tendances mensuelles"
    },
    en: {
      trendingThisMonth: `${monthName} Trending Topics`, 
      monthlyTrends: "Monthly Trends"
    }
  }[languageCode];
};

/**
 * Check if templates need to be generated for current month
 */
export const shouldGenerateTemplates = async (): Promise<boolean> => {
  const currentMonth = getCurrentMonthKey();
  
  try {
    const { data, error } = await supabase
      .from('monthly_templates')
      .select('id')
      .eq('month_key', currentMonth)
      .eq('is_active', true)
      .limit(1);

    if (error) {
      console.error('Error checking template existence:', error);
      return true; // Generate if we can't check
    }

    return !data || data.length === 0;
  } catch (error) {
    console.error('Database error checking templates:', error);
    return true;
  }
};

/**
 * Generate new monthly templates using the Edge Function
 */
export const generateMonthlyTemplates = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-monthly-templates', {
      body: {}
    });

    if (error) {
      console.error('Error generating templates:', error);
      return false;
    }

    console.log('Templates generated successfully:', data);
    return true;
  } catch (error) {
    console.error('Error calling generate-monthly-templates function:', error);
    return false;
  }
};

/**
 * Rotate templates to activate new month's templates
 */
export const rotateMonthlyTemplates = async (monthKey?: string): Promise<boolean> => {
  const targetMonth = monthKey || getCurrentMonthKey();
  
  try {
    const { error } = await supabase.rpc('rotate_monthly_templates', {
      new_month_key: targetMonth
    });

    if (error) {
      console.error('Error rotating templates:', error);
      return false;
    }

    console.log('Monthly templates rotated successfully to:', targetMonth);
    return true;
  } catch (error) {
    console.error('Error calling rotate function:', error);
    return false;
  }
};

/**
 * Get fallback templates when database is unavailable
 */
function getFallbackTemplates(
  context: 'personal' | 'professional',
  language: 'fr' | 'en',
  monthKey: string
): MonthlyTemplate[] {
  const fallbackTemplates = {
    personal: {
      fr: [
        'Comment optimiser mon budget personnel ce mois-ci ?',
        'Quels nouveaux objectifs personnels devrais-je me fixer ?',
        'Comment améliorer mon équilibre vie pro/perso ?'
      ],
      en: [
        'How should I optimize my personal budget this month?',
        'What new personal goals should I set?',
        'How can I improve my work-life balance?'
      ]
    },
    professional: {
      fr: [
        'Quelle stratégie professionnelle adopter ce mois-ci ?',
        'Dois-je investir dans de nouvelles compétences ?',
        'Comment améliorer ma productivité au travail ?'
      ],
      en: [
        'What professional strategy should I adopt this month?',
        'Should I invest in new skills?',
        'How can I improve my work productivity?'
      ]
    }
  };

  return fallbackTemplates[context][language].map((prompt, index) => ({
    id: `fallback-${context}-${language}-${index}`,
    prompt,
    context,
    month: monthKey
  }));
}