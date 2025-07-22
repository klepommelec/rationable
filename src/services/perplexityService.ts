
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

const cleanPerplexityResponse = (content: string): string => {
  if (!content) return content;
  
  // Supprimer les artefacts numériques parasites
  let cleaned = content
    // Supprimer les séquences numériques en fin de texte (123, 1234, 12345, etc.)
    .replace(/\s*\d{3,6}\s*$/g, '')
    // Supprimer les numéros isolés en fin de phrase
    .replace(/\s+\d{1,3}\s*$/g, '')
    // Supprimer les références de citation malformées
    .replace(/\[\d+\]\s*$/g, '')
    // Supprimer les patterns numériques en milieu de phrase aussi
    .replace(/\s+\d{3,6}(?=\s|$)/g, '')
    // Supprimer les espaces multiples
    .replace(/\s+/g, ' ')
    // Supprimer les espaces en début et fin
    .trim();
  
  return cleaned;
};

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

    // Nettoyer la réponse avant de la retourner
    const cleanedContent = cleanPerplexityResponse(data.content);
    console.log('✅ Perplexity search successful - Content cleaned and ready');
    
    return {
      content: cleanedContent,
      sources: data.sources || [],
      timestamp: data.timestamp || new Date().toISOString(),
      searchQuery: query,
      requiresRealTimeData: true
    };
  } catch (error) {
    console.error('❌ Perplexity service error:', error);
    throw error;
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
