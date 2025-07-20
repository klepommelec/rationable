
import { supabase } from '@/integrations/supabase/client';

export interface PerplexitySearchResult {
  content: string;
  sources: string[];
  timestamp: string;
  searchQuery: string;
  requiresRealTimeData: boolean;
  error?: string;
  fallbackMessage?: string;
}

export const searchWithPerplexity = async (query: string, context?: string): Promise<PerplexitySearchResult> => {
  try {
    console.log('🔍 Perplexity search - Query:', query);
    console.log('📝 Perplexity search - Context:', context);
    
    // Optimiser la requête pour obtenir des données plus récentes
    const optimizedQuery = `${query} - Données récentes et actuelles 2024-2025`;
    
    const { data, error } = await supabase.functions.invoke('perplexity-search', {
      body: { 
        query: optimizedQuery, 
        context: context || 'Recherche d\'informations récentes et à jour'
      },
    });

    if (error) {
      console.error('❌ Perplexity search error:', error);
      throw new Error(`Perplexity API error: ${error.message}`);
    }

    if (!data || !data.content) {
      console.error('❌ Perplexity returned empty data:', data);
      throw new Error('Perplexity returned no content');
    }

    console.log('✅ Perplexity search successful - Content length:', data.content.length);
    
    return {
      content: data.content,
      sources: data.sources || [],
      timestamp: data.timestamp || new Date().toISOString(),
      searchQuery: query,
      requiresRealTimeData: true
    };
  } catch (error) {
    console.error('❌ Perplexity service error:', error);
    throw error; // Relancer l'erreur pour que le système ne tombe pas en fallback
  }
};

export const detectRealTimeQuery = (dilemma: string): boolean => {
  const realTimeKeywords = [
    'draft', '2024', '2025', '2026', 'élection', 'prochain', 'futur', 'prochaine',
    'récent', 'dernière', 'nouveau', 'nouvelle', 'tendance', 'actualité',
    'maintenant', 'aujourd\'hui', 'cette année', 'ce mois', 'cette semaine',
    'qui a été', 'qui est', 'résultats', 'gagnant', 'vainqueur'
  ];
  
  const lowerDilemma = dilemma.toLowerCase();
  return realTimeKeywords.some(keyword => lowerDilemma.includes(keyword));
};
