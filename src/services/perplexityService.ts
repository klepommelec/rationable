
import { supabase } from '@/integrations/supabase/client';
import { I18nService, SupportedLanguage } from './i18nService';
import { searchCacheService } from './searchCacheService';

// In-flight deduplication map
const pendingRequests = new Map<string, Promise<PerplexitySearchResult>>();

// Dynamic cache with different TTLs based on temporal intent
interface CachedSearchResultWithTTL {
  content: any;
  timestamp: number;
  query: string;
  provider: string;
  expiresAt: number;
}

class DynamicSearchCache {
  private cache = new Map<string, CachedSearchResultWithTTL>();
  
  private getTTL(temporalIntent?: string): number {
    switch (temporalIntent) {
      case 'current':
      case 'recent_past':
        return 10 * 60 * 1000; // 10 minutes
      case 'future':
        return 2 * 60 * 60 * 1000; // 2 hours
      case 'historical':
      case 'neutral':
      default:
        return 24 * 60 * 60 * 1000; // 24 hours
    }
  }
  
  generateCacheKey(query: string, context?: string): string {
    const normalizedQuery = query.toLowerCase().trim();
    const contextKey = context ? `_${context}` : '';
    return `perplexity_${normalizedQuery}${contextKey}`;
  }
  
  get(query: string, context?: string): any | null {
    const key = this.generateCacheKey(query, context);
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.content;
  }
  
  set(query: string, context: string | undefined, content: any, temporalIntent?: string): void {
    const key = this.generateCacheKey(query, context);
    const ttl = this.getTTL(temporalIntent);
    const expiresAt = Date.now() + ttl;
    
    this.cache.set(key, {
      content,
      timestamp: Date.now(),
      query,
      provider: 'perplexity',
      expiresAt
    });
    
    // Persist to localStorage with expiration
    try {
      const persistentCache = JSON.parse(localStorage.getItem('perplexity_cache') || '{}');
      persistentCache[key] = {
        content,
        timestamp: Date.now(),
        query,
        provider: 'perplexity',
        expiresAt
      };
      localStorage.setItem('perplexity_cache', JSON.stringify(persistentCache));
    } catch (error) {
      console.warn('Failed to persist Perplexity cache:', error);
    }
  }
  
  loadFromPersistentCache(): void {
    try {
      const persistentCache = JSON.parse(localStorage.getItem('perplexity_cache') || '{}');
      const now = Date.now();
      
      Object.entries(persistentCache).forEach(([key, cached]) => {
        const item = cached as CachedSearchResultWithTTL;
        if (now < item.expiresAt) {
          this.cache.set(key, item);
        }
      });
    } catch (error) {
      console.warn('Failed to load persistent Perplexity cache:', error);
    }
  }
  
  cleanup(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now > cached.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

const dynamicCache = new DynamicSearchCache();
dynamicCache.loadFromPersistentCache();

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
    // Check if real-time search is enabled
    const realTimeSearchEnabled = localStorage.getItem('realTimeSearchEnabled');
    if (realTimeSearchEnabled === 'false') {
      console.log('🚫 Perplexity search disabled by user preference');
      throw new Error('Real-time search is disabled. Enable it in settings to use web search.');
    }

    // Emit event for credit tracking
    window.dispatchEvent(new CustomEvent('perplexity-call', { 
      detail: { query, context, timestamp: Date.now() } 
    }));
    
    console.log('🔍 Perplexity search - Query:', query);
    console.log('📝 Perplexity search - Context:', context);
    
    // Check dynamic cache first
    const cachedResult = dynamicCache.get(query, context);
    if (cachedResult) {
      console.log('⚡ Using cached Perplexity result');
      return cachedResult;
    }
    
    // Check for in-flight request (deduplication)
    const pendingKey = dynamicCache.generateCacheKey(query, context);
    const pendingRequest = pendingRequests.get(pendingKey);
    if (pendingRequest) {
      console.log('⏳ Returning pending Perplexity request');
      return pendingRequest;
    }
    
    // Detect temporal intent for caching TTL
    const temporalIntent = detectTemporalIntent(query, language);
    console.log('⏰ Temporal intent for caching:', temporalIntent.type);

    // Create and store the pending request
    const searchPromise = (async () => {
      try {
        // Detect language from query if not provided
        const detectedLanguage = language || I18nService.detectLanguage(query);
        console.log('🌐 Language detected for content:', detectedLanguage);
        
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
            query, 
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

        // Clean response and prepare result
        const cleanedContent = cleanPerplexityResponse(data.content);
        const result = {
          content: cleanedContent,
          sources: data.sources || [],
          timestamp: data.timestamp || new Date().toISOString(),
          searchQuery: query,
          requiresRealTimeData: true
        };

        // Cache the result with dynamic TTL based on temporal intent
        dynamicCache.set(query, context, result, temporalIntent.type);
        
        console.log('✅ Perplexity search successful - Content cached');
        return result;
      } finally {
        // Remove from pending requests and cleanup
        pendingRequests.delete(pendingKey);
        dynamicCache.cleanup();
      }
    })();

    // Store the pending request for deduplication
    pendingRequests.set(pendingKey, searchPromise);
    
    return searchPromise;
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
  const currentYear = new Date().getFullYear();
  
  // Real-time indicators by language (more specific)
  const realTimeKeywords = {
    fr: [
      'aujourd\'hui', 'maintenant', 'actuellement', 'ce matin', 'cet après-midi', 'ce soir',
      'cette semaine', 'ce mois-ci', 'en ce moment', 'présentement', 'horaires',
      'ouvert maintenant', 'fermé maintenant', 'disponible maintenant', 'stock actuel',
      'tarif actuel', 'prix actuel', 'météo aujourd\'hui', 'trafic maintenant',
      'actualité', 'dernières nouvelles', 'récemment', 'cette année'
    ],
    en: [
      'today', 'right now', 'currently', 'this morning', 'this afternoon', 'tonight',
      'this week', 'this month', 'at the moment', 'schedule today', 'hours today',
      'open now', 'closed now', 'available now', 'current stock', 'current price',
      'current rate', 'weather today', 'traffic now', 'latest news', 'recent news',
      'this year', 'recently'
    ],
    es: [
      'hoy', 'ahora mismo', 'actualmente', 'esta mañana', 'esta tarde', 'esta noche',
      'esta semana', 'este mes', 'en este momento', 'horario hoy',
      'abierto ahora', 'cerrado ahora', 'disponible ahora', 'precio actual',
      'clima hoy', 'tráfico ahora', 'noticias recientes', 'este año'
    ]
  };
  
  const keywords = realTimeKeywords[language || 'en'] || realTimeKeywords.en;
  const lowerDilemma = dilemma.toLowerCase();
  
  // Check for explicit real-time keywords (more strict matching)
  const hasRealTimeKeywords = keywords.some(keyword => 
    lowerDilemma.includes(keyword.toLowerCase())
  );
  
  // Check for current year with specific context (more strict)
  const hasCurrentYearWithContext = lowerDilemma.includes(`${currentYear}`) && 
    (lowerDilemma.includes('horaire') || lowerDilemma.includes('schedule') || 
     lowerDilemma.includes('price') || lowerDilemma.includes('prix') ||
     lowerDilemma.includes('ouvert') || lowerDilemma.includes('open') ||
     lowerDilemma.includes('disponible') || lowerDilemma.includes('available'));
  
  // More specific temporal expressions
  const hasSpecificTimeReference = /\b(ce soir|tonight|this morning|cet après-midi|this afternoon)\b/i.test(dilemma);
  
  console.log('🕐 Real-time detection (strict):', {
    hasRealTimeKeywords,
    hasCurrentYearWithContext,
    hasSpecificTimeReference,
    result: hasRealTimeKeywords || hasCurrentYearWithContext || hasSpecificTimeReference
  });
  
  return hasRealTimeKeywords || hasCurrentYearWithContext || hasSpecificTimeReference;
};
