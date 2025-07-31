import { supabase } from '@/integrations/supabase/client';
import { IBreakdownItem, IDecision } from '@/types/decision';

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
  const searchQuery = encodeURIComponent(`${option} ${category || ''}`);
  const comparisonQuery = encodeURIComponent(`${option} vs alternatives comparison`);
  
  const links = [
    {
      title: `Rechercher "${option}"`,
      url: `https://www.google.fr/search?q=${searchQuery}`
    },
    {
      title: `Comparer "${option}"`,
      url: `https://www.google.fr/search?q=${comparisonQuery}`
    }
  ];

  // Ajouter des liens spécialisés selon la catégorie
  if (category) {
    const categoryLower = category.toLowerCase();
    
    if (['tech', 'technologie'].includes(categoryLower)) {
      links.push({
        title: 'Voir sur TechCrunch',
        url: `https://www.google.fr/search?q=${searchQuery}+site:techcrunch.com`
      });
    } else if (['travel', 'voyages'].includes(categoryLower)) {
      links.push({
        title: 'Voir sur TripAdvisor',
        url: `https://www.google.fr/search?q=${searchQuery}+site:tripadvisor.fr`
      });
    } else if (['finance'].includes(categoryLower)) {
      links.push({
        title: 'Comparer les prix',
        url: `https://www.google.fr/search?q=${searchQuery}&tbm=shop`
      });
    }
  }

  return links;
};