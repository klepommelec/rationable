
import { supabase } from '@/integrations/supabase/client';
import { I18nService, SupportedLanguage } from './i18nService';
import { searchCacheService } from './searchCacheService';

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

export const searchWithPerplexity = async (
  query: string, 
  context?: string, 
  language?: SupportedLanguage
): Promise<PerplexitySearchResult> => {
  try {
    console.log('🔍 Perplexity search - Query:', query);
    console.log('📝 Perplexity search - Context:', context);
    
    // Vérifier le cache d'abord
    const cached = searchCacheService.get(query, context);
    if (cached) {
      console.log('⚡ Using cached search result');
      return {
        content: cached.content.content || cached.content,
        sources: cached.content.sources || [],
        timestamp: new Date(cached.timestamp).toISOString(),
        searchQuery: query,
        requiresRealTimeData: true
      };
    }
    
    // Detect language from query if not provided
    const detectedLanguage = language || I18nService.detectLanguage(query);
    // Remove language mutation - keep UI language independent
    console.log('🌐 Language detected for content:', detectedLanguage);
    
    // Détecter l'intention temporelle et adapter la requête
    const temporalIntent = detectTemporalIntent(query, detectedLanguage);
    console.log('⏰ Intention temporelle détectée:', temporalIntent.type);
    
    // Get localized context suffixes
    const contextSuffixes = {
      current: {
        fr: 'informations actuelles et disponibles maintenant',
        en: 'current information available now',
        es: 'información actual disponible ahora',
        it: 'informazioni attuali disponibili ora',
        de: 'aktuelle verfügbare Informationen'
      },
      recent_past: {
        fr: 'événements récemment terminés',
        en: 'recently concluded events',
        es: 'eventos recientemente concluidos',
        it: 'eventi recentemente conclusi',
        de: 'kürzlich abgeschlossene Ereignisse'
      },
      future: {
        fr: 'événements programmés à venir',
        en: 'scheduled upcoming events',
        es: 'eventos programados próximos',
        it: 'eventi programmati in arrivo',
        de: 'geplante bevorstehende Ereignisse'
      },
      historical: {
        fr: 'données historiques précises',
        en: 'precise historical data',
        es: 'datos históricos precisos',
        it: 'dati storici precisi',
        de: 'präzise historische Daten'
      },
      neutral: {
        fr: 'informations vérifiées et précises',
        en: 'verified and precise information',
        es: 'información verificada y precisa',
        it: 'informazioni verificate e precise',
        de: 'verifizierte und präzise Informationen'
      }
    };
    
    // Adapter la requête selon l'intention temporelle
    let optimizedQuery = query;
    const suffix = contextSuffixes[temporalIntent.type as keyof typeof contextSuffixes][detectedLanguage];
    if (suffix) {
      optimizedQuery = `${query} - ${suffix}`;
    }
    
    // Get localized default context
    const defaultContexts = {
      fr: 'Recherche d\'informations récentes et à jour',
      en: 'Search for recent and up-to-date information',
      es: 'Búsqueda de información reciente y actualizada',
      it: 'Ricerca di informazioni recenti e aggiornate',
      de: 'Suche nach aktuellen und up-to-date Informationen'
    };
    
    const { data, error } = await supabase.functions.invoke('perplexity-search', {
      body: { 
        query: optimizedQuery, 
        context: context || defaultContexts[detectedLanguage] || defaultContexts.fr,
        temporalIntent: temporalIntent.type,
        language: detectedLanguage
      },
    });

    if (error) {
      console.error('❌ Perplexity search error:', error);
      const fallbackMessages = I18nService.getFallbackMessages(detectedLanguage);
      throw new Error(`${fallbackMessages.perplexityError}: ${error.message}`);
    }

    if (!data || !data.content) {
      console.error('❌ Perplexity returned empty data:', data);
      throw new Error('Perplexity returned no content');
    }

    // Nettoyer la réponse avant de la retourner
    const cleanedContent = cleanPerplexityResponse(data.content);
    console.log('✅ Perplexity search successful - Content cleaned and ready');
    
    const result = {
      content: cleanedContent,
      sources: data.sources || [],
      timestamp: data.timestamp || new Date().toISOString(),
      searchQuery: query,
      requiresRealTimeData: true
    };

    // Mettre en cache le résultat
    searchCacheService.set(query, context, {
      content: cleanedContent,
      sources: data.sources || []
    }, 'perplexity');
    
    return result;
  } catch (error) {
    console.error('❌ Perplexity service error:', error);
    throw error;
  }
};

export interface TemporalIntent {
  type: 'current' | 'recent_past' | 'historical' | 'future' | 'neutral';
  context: string;
}

export const detectTemporalIntent = (dilemma: string, language?: SupportedLanguage): TemporalIntent => {
  const detectedLanguage = language || I18nService.detectLanguage(dilemma);
  const keywords = I18nService.getTemporalKeywords(detectedLanguage);
  const lowerDilemma = dilemma.toLowerCase();
  const currentYear = I18nService.getCurrentYear();
  
  // Use dynamic year detection from I18nService
  const detectedYears = I18nService.detectYearsInText(dilemma);
  
  // Classification des années détectées
  const futureYears = detectedYears.filter(year => year > currentYear);
  const pastYears = detectedYears.filter(year => year < currentYear);
  const currentYearDetected = detectedYears.includes(currentYear);
  
  // Get localized context messages
  const contextMessages = {
    future: {
      fr: (years: number[]) => `événements programmés à venir${years.length > 0 ? ` (${years.join(', ')})` : ''}`,
      en: (years: number[]) => `scheduled upcoming events${years.length > 0 ? ` (${years.join(', ')})` : ''}`,
      es: (years: number[]) => `eventos programados próximos${years.length > 0 ? ` (${years.join(', ')})` : ''}`,
      it: (years: number[]) => `eventi programmati in arrivo${years.length > 0 ? ` (${years.join(', ')})` : ''}`,
      de: (years: number[]) => `geplante bevorstehende Ereignisse${years.length > 0 ? ` (${years.join(', ')})` : ''}`
    },
    current: {
      fr: (year: number) => `événements actuellement en cours et disponibles (${year})`,
      en: (year: number) => `events currently happening and available (${year})`,
      es: (year: number) => `eventos que están ocurriendo actualmente y disponibles (${year})`,
      it: (year: number) => `eventi attualmente in corso e disponibili (${year})`,
      de: (year: number) => `derzeit stattfindende und verfügbare Ereignisse (${year})`
    },
    recentPast: {
      fr: 'événements récemment terminés (derniers mois)',
      en: 'recently concluded events (recent months)',
      es: 'eventos recientemente concluidos (meses recientes)',
      it: 'eventi recentemente conclusi (mesi recenti)',
      de: 'kürzlich abgeschlossene Ereignisse (letzte Monate)'
    },
    historical: {
      fr: (years: number[]) => `données historiques${years.length > 0 ? ` (${years.join(', ')})` : ''}`,
      en: (years: number[]) => `historical data${years.length > 0 ? ` (${years.join(', ')})` : ''}`,
      es: (years: number[]) => `datos históricos${years.length > 0 ? ` (${years.join(', ')})` : ''}`,
      it: (years: number[]) => `dati storici${years.length > 0 ? ` (${years.join(', ')})` : ''}`,
      de: (years: number[]) => `historische Daten${years.length > 0 ? ` (${years.join(', ')})` : ''}`
    },
    neutral: {
      fr: 'informations les plus pertinentes selon le contexte',
      en: 'most relevant information according to context',
      es: 'información más relevante según el contexto',
      it: 'informazioni più rilevanti secondo il contesto',
      de: 'relevanteste Informationen je nach Kontext'
    }
  };
  
  // Classification par priorité avec logique dynamique des années
  if (futureYears.length > 0 || keywords.future.some(keyword => lowerDilemma.includes(keyword))) {
    return {
      type: 'future',
      context: contextMessages.future[detectedLanguage](futureYears)
    };
  }
  
  if (keywords.current.some(keyword => lowerDilemma.includes(keyword)) || currentYearDetected) {
    return {
      type: 'current',
      context: contextMessages.current[detectedLanguage](currentYear)
    };
  }
  
  if (keywords.recentPast.some(keyword => lowerDilemma.includes(keyword))) {
    return {
      type: 'recent_past',
      context: contextMessages.recentPast[detectedLanguage]
    };
  }
  
  if (pastYears.length > 0 || keywords.historical.some(keyword => lowerDilemma.includes(keyword))) {
    return {
      type: 'historical',
      context: contextMessages.historical[detectedLanguage](pastYears)
    };
  }
  
  return {
    type: 'neutral',
    context: contextMessages.neutral[detectedLanguage]
  };
};

export const detectRealTimeQuery = (dilemma: string, language?: SupportedLanguage): boolean => {
  const detectedLanguage = language || I18nService.detectLanguage(dilemma);
  const keywords = I18nService.getTemporalKeywords(detectedLanguage);
  
  // Use dynamic year detection instead of hardcoded years
  const detectedYears = I18nService.detectYearsInText(dilemma);
  const currentYear = I18nService.getCurrentYear();
  
  // Check for recent years (current year and next 2 years)
  const relevantYears = detectedYears.some(year => 
    year >= currentYear && year <= currentYear + 2
  );
  
  const lowerDilemma = dilemma.toLowerCase();
  
  // Combine all real-time keywords from the language config
  const allRealTimeKeywords = keywords.realTime;
  
  return relevantYears || allRealTimeKeywords.some(keyword => lowerDilemma.includes(keyword));
};
