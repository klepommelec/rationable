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
  const currentLanguage = I18nService.getCurrentLanguage();
  const searchQuery = encodeURIComponent(`${option} ${category || ''}`);
  const comparisonQuery = encodeURIComponent(`${option} vs alternatives comparison`);
  
  const links = [
    {
      title: `${I18nService.getSearchLabel(currentLanguage)} "${option}"`,
      url: I18nService.buildGoogleWebUrl(`${option} ${category || ''}`, currentLanguage)
    },
    {
      title: `${I18nService.getCompareLabel(currentLanguage)} "${option}"`,
      url: I18nService.buildGoogleWebUrl(`${option} vs alternatives comparison`, currentLanguage)
    }
  ];

  // Ajouter des liens spécialisés selon la catégorie
  if (category) {
    const categoryLower = category.toLowerCase();
    
    if (['tech', 'technologie'].includes(categoryLower)) {
      const techLabel = currentLanguage === 'fr' ? 'Voir sur TechCrunch' :
                       currentLanguage === 'es' ? 'Ver en TechCrunch' :
                       currentLanguage === 'it' ? 'Vedi su TechCrunch' :
                       currentLanguage === 'de' ? 'Auf TechCrunch ansehen' :
                       'View on TechCrunch';
      links.push({
        title: techLabel,
        url: I18nService.buildGoogleWebUrl(`${option} site:techcrunch.com`, currentLanguage)
      });
    } else if (['travel', 'voyages'].includes(categoryLower)) {
      const tripAdvisorDomain = currentLanguage === 'fr' ? 'tripadvisor.fr' :
                               currentLanguage === 'es' ? 'tripadvisor.es' :
                               currentLanguage === 'it' ? 'tripadvisor.it' :
                               currentLanguage === 'de' ? 'tripadvisor.de' :
                               'tripadvisor.com';
      const tripLabel = currentLanguage === 'fr' ? 'Voir sur TripAdvisor' :
                       currentLanguage === 'es' ? 'Ver en TripAdvisor' :
                       currentLanguage === 'it' ? 'Vedi su TripAdvisor' :
                       currentLanguage === 'de' ? 'Auf TripAdvisor ansehen' :
                       'View on TripAdvisor';
      links.push({
        title: tripLabel,
        url: I18nService.buildGoogleWebUrl(`${option} site:${tripAdvisorDomain}`, currentLanguage)
      });
    } else if (['finance'].includes(categoryLower)) {
      const priceLabel = currentLanguage === 'fr' ? 'Comparer les prix' :
                        currentLanguage === 'es' ? 'Comparar precios' :
                        currentLanguage === 'it' ? 'Confronta i prezzi' :
                        currentLanguage === 'de' ? 'Preise vergleichen' :
                        'Compare prices';
      links.push({
        title: priceLabel,
        url: I18nService.buildGoogleShoppingUrl(option, currentLanguage)
      });
    }
  }

  return links;
};