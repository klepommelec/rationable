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
  const detectedVertical = I18nService.detectVertical(dilemma + ' ' + option);
  
  // Use full context for better search relevance
  const contextualOption = option.replace(/^Option\s+\d+:\s*/i, '').trim();
  const searchContext = dilemma ? `${contextualOption} ${dilemma}` : contextualOption;
  
  const links = [];

  // Primary search - contextual with dilemma
  links.push({
    title: I18nService.getSearchLabel(locale),
    url: I18nService.buildGoogleWebUrl(searchContext, locale)
  });

  // Secondary search - reviews/comparison based on vertical
  if (detectedVertical === 'automotive') {
    const reviewQuery = locale === 'fr' ? `${contextualOption} test avis` : 
                       locale === 'es' ? `${contextualOption} prueba opiniones` :
                       locale === 'it' ? `${contextualOption} test recensioni` :
                       locale === 'de' ? `${contextualOption} test bewertungen` :
                       `${contextualOption} test review`;
    links.push({
      title: locale === 'fr' ? 'Tests & Avis' : 
             locale === 'es' ? 'Pruebas y Opiniones' :
             locale === 'it' ? 'Test e Recensioni' :
             locale === 'de' ? 'Tests & Bewertungen' :
             'Tests & Reviews',
      url: I18nService.buildGoogleWebUrl(reviewQuery, locale)
    });
  } else if (detectedVertical === 'software' || detectedVertical === 'tech') {
    const techQuery = locale === 'fr' ? `${contextualOption} comparatif` : 
                     locale === 'es' ? `${contextualOption} comparativa` :
                     locale === 'it' ? `${contextualOption} confronto` :
                     locale === 'de' ? `${contextualOption} vergleich` :
                     `${contextualOption} comparison`;
    links.push({
      title: I18nService.getCompareLabel(locale),
      url: I18nService.buildGoogleWebUrl(techQuery, locale)
    });
  } else {
    // Generic comparison/reviews
    const reviewQuery = locale === 'fr' ? `${contextualOption} avis` : 
                       locale === 'es' ? `${contextualOption} opiniones` :
                       locale === 'it' ? `${contextualOption} recensioni` :
                       locale === 'de' ? `${contextualOption} bewertungen` :
                       `${contextualOption} reviews`;
    links.push({
      title: I18nService.getCompareLabel(locale),
      url: I18nService.buildGoogleWebUrl(reviewQuery, locale)
    });
  }

  // Vertical-specific third link
  if (detectedVertical === 'automotive') {
    links.push({
      title: locale === 'fr' ? 'Spécifications' : 
             locale === 'es' ? 'Especificaciones' :
             locale === 'it' ? 'Specifiche' :
             locale === 'de' ? 'Spezifikationen' :
             'Specifications',
      url: I18nService.buildGoogleWebUrl(`${contextualOption} specifications fiche technique`, locale)
    });
  } else if (detectedVertical === 'software' || category?.toLowerCase().includes('tech')) {
    links.push({
      title: 'TechCrunch',
      url: I18nService.buildGoogleWebUrl(`${contextualOption} site:techcrunch.com`, locale)
    });
  } else if (detectedVertical === 'travel' || category?.toLowerCase().includes('travel')) {
    const domain = locale === 'fr' ? 'tripadvisor.fr' : 'tripadvisor.com';
    links.push({
      title: 'TripAdvisor',
      url: I18nService.buildGoogleWebUrl(`${contextualOption} site:${domain}`, locale)
    });
  }

  return links.slice(0, 3); // Limit to 3 links maximum
};