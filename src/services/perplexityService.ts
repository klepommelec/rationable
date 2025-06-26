
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
    console.log('🔍 Optimized Perplexity search:', query);
    
    const { data, error } = await supabase.functions.invoke('perplexity-search', {
      body: { query, context },
    });

    if (error) {
      console.error('Perplexity search error:', error);
      return {
        content: '',
        sources: [],
        timestamp: new Date().toISOString(),
        searchQuery: query,
        requiresRealTimeData: false,
        error: error.message,
        fallbackMessage: 'Unable to fetch real-time data. Using AI knowledge base only.'
      };
    }

    console.log('✅ Perplexity search completed successfully');
    return data;
  } catch (error) {
    console.error('Perplexity service error:', error);
    return {
      content: '',
      sources: [],
      timestamp: new Date().toISOString(),
      searchQuery: query,
      requiresRealTimeData: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      fallbackMessage: 'Unable to fetch real-time data. Using AI knowledge base only.'
    };
  }
};

export const detectRealTimeQuery = (dilemma: string): boolean => {
  const realTimeKeywords = [
    'draft', '2024', '2025', '2026', 'élection', 'prochain', 'futur', 'prochaine',
    'récent', 'dernière', 'nouveau', 'nouvelle', 'tendance', 'actualité',
    'maintenant', 'aujourd\'hui', 'cette année', 'ce mois', 'cette semaine'
  ];
  
  const lowerDilemma = dilemma.toLowerCase();
  return realTimeKeywords.some(keyword => lowerDilemma.includes(keyword));
};
