
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
  
  // Nettoyage moins agressif pour préserver les informations contextuelles
  let cleaned = content
    // Supprimer uniquement les références de citation en fin [1], [2], [3], etc.
    .replace(/\[\d+\](?=\s|$)/g, '')
    // Supprimer les références multiples seulement en fin
    .replace(/(\[\d+\]\s*)+$/g, '')
    // Supprimer les espaces multiples
    .replace(/\s+/g, ' ')
    // Supprimer les espaces en début et fin
    .trim();
  
  // Pour les questions de liste, préserver la structure complète
  if (content.includes('1.') && content.includes('2.')) {
    console.log('📋 Structure de liste détectée - préservation du contenu complet');
    return cleaned;
  }
  
  // Pour les réponses courtes, préserver la réponse complète
  const sentences = cleaned.split(/[.!?]+/);
  if (sentences.length <= 3 || cleaned.length < 150) {
    console.log('📝 Réponse courte détectée - préservation complète');
    return cleaned;
  }
  
  return cleaned;
};

export const searchWithPerplexity = async (query: string, context?: string): Promise<PerplexitySearchResult> => {
  try {
    console.log('🔍 Perplexity search - Query:', query);
    console.log('📝 Perplexity search - Context:', context);
    
    // Détecter l'intention temporelle et adapter la requête
    const temporalIntent = detectTemporalIntent(query);
    console.log('⏰ Intention temporelle détectée:', temporalIntent.type);
    
    // Adapter la requête selon l'intention temporelle
    let optimizedQuery = query;
    
    switch (temporalIntent.type) {
      case 'current':
        optimizedQuery = `${query} - informations actuelles et disponibles maintenant`;
        break;
      case 'recent_past':
        optimizedQuery = `${query} - événements récemment terminés`;
        break;
      case 'future':
        optimizedQuery = `${query} - événements programmés à venir`;
        break;
      case 'historical':
        optimizedQuery = `${query} - données historiques précises`;
        break;
      case 'neutral':
      default:
        optimizedQuery = `${query} - informations vérifiées et précises`;
        break;
    }
    
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

export interface TemporalIntent {
  type: 'current' | 'recent_past' | 'historical' | 'future' | 'neutral';
  context: string;
}

export const detectTemporalIntent = (dilemma: string): TemporalIntent => {
  const lowerDilemma = dilemma.toLowerCase();
  
  // Détection des intentions temporelles spécifiques
  const currentKeywords = [
    'du moment', 'actuellement', 'en cours', 'maintenant', 'aujourd\'hui',
    'cette semaine', 'ce mois', 'disponible', 'ouvert', 'accessible'
  ];
  
  const recentPastKeywords = [
    'dernières', 'récentes', 'terminées', 'passées', 'précédentes',
    'qui viennent de', 'il y a peu', 'récemment fermé'
  ];
  
  const historicalKeywords = [
    'histoire de', 'ancien', 'ancienne', '2020', '2021', '2022', '2023',
    'avant', 'historique', 'passé', 'auparavant'
  ];
  
  const futureKeywords = [
    'à venir', 'prochaine', 'prochain', 'futur', 'bientôt',
    '2026', '2027', 'prévu', 'programmé'
  ];
  
  // Classification par priorité
  if (currentKeywords.some(keyword => lowerDilemma.includes(keyword))) {
    return {
      type: 'current',
      context: 'événements actuellement en cours et disponibles'
    };
  }
  
  if (recentPastKeywords.some(keyword => lowerDilemma.includes(keyword))) {
    return {
      type: 'recent_past',
      context: 'événements récemment terminés (3-6 derniers mois)'
    };
  }
  
  if (futureKeywords.some(keyword => lowerDilemma.includes(keyword))) {
    return {
      type: 'future',
      context: 'événements programmés à venir'
    };
  }
  
  if (historicalKeywords.some(keyword => lowerDilemma.includes(keyword))) {
    return {
      type: 'historical',
      context: 'données historiques selon la période mentionnée'
    };
  }
  
  return {
    type: 'neutral',
    context: 'informations les plus pertinentes selon le contexte'
  };
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
