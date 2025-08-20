import { supabase } from '@/integrations/supabase/client';
import { IBreakdownItem, IDecision } from '@/types/decision';
import { I18nService } from './i18nService';

export const generateMoreOptions = async (
  decision: IDecision,
  currentOptions: IBreakdownItem[]
): Promise<IBreakdownItem[]> => {
  const currentOptionNames = currentOptions.map(opt => opt.option);
  
  const payload = {
    dilemma: decision.dilemma,
    criteria: decision.criteria,
    currentOptions: currentOptionNames,
    category: decision.category,
    maxNewOptions: Math.min(5, 10 - currentOptions.length) // Limite à 10 options total
  };

  const { data, error } = await supabase.functions.invoke('openai-decision-maker', {
    body: {
      ...payload,
      requestType: 'expand-options'
    }
  });

  if (error) {
    console.error('Error generating more options:', error);
    throw new Error('Erreur lors de la génération d\'options supplémentaires');
  }

  return data?.newOptions || [];
};

export const generateOptionSearchLinks = (option: string, dilemma: string, category?: string): Array<{title: string, url: string}> => {
  const locale = I18nService.getCurrentLanguage();
  
  // Simplify option name for search
  const cleanOption = option.split(' ').slice(0, 2).join(' ').replace(/[^\w\s]/g, '');
  
  const links = [
    {
      title: I18nService.getSearchLabel(locale),
      url: I18nService.buildGoogleWebUrl(cleanOption, locale)
    },
    {
      title: I18nService.getCompareLabel(locale), 
      url: I18nService.buildGoogleWebUrl(`${cleanOption} avis`, locale)
    }
  ];

  // Add category-specific links only if really relevant
  if (category?.toLowerCase().includes('tech')) {
    links.push({
      title: 'TechCrunch',
      url: I18nService.buildGoogleWebUrl(`${cleanOption} site:techcrunch.com`, locale)
    });
  } else if (category?.toLowerCase().includes('travel')) {
    const domain = locale === 'fr' ? 'tripadvisor.fr' : 'tripadvisor.com';
    links.push({
      title: 'TripAdvisor',
      url: I18nService.buildGoogleWebUrl(`${cleanOption} site:${domain}`, locale)
    });
  }

  return links.slice(0, 3); // Limit to 3 links maximum
};