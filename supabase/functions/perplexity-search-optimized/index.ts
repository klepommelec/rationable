import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// In-memory cache for the edge function
const cache = new Map<string, {
  content: any;
  timestamp: number;
  expiresAt: number;
}>();

// In-flight requests map for deduplication
const inFlightRequests = new Map<string, Promise<any>>();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate cache key
function generateCacheKey(query: string, context?: string): string {
  const normalizedQuery = query.toLowerCase().trim();
  const contextKey = context ? `_${context}` : '';
  return `perplexity_${normalizedQuery}${contextKey}`;
}

// Get TTL based on temporal intent
function getTTL(temporalIntent?: string): number {
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

// Cleanup expired cache entries
function cleanupCache(): void {
  const now = Date.now();
  for (const [key, cached] of cache.entries()) {
    if (now > cached.expiresAt) {
      cache.delete(key);
    }
  }
}

// Get allowed origin dynamically
function getAllowedOrigin(origin: string | null): string {
  if (!origin) return '*';
  
  const allowedDomains = [
    'https://lovable.dev',
    'https://lovable.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ];
  
  return allowedDomains.includes(origin) ? origin : '*';
}

function getCorsHeaders(origin: string | null) {
  return {
    'Access-Control-Allow-Origin': getAllowedOrigin(origin),
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, context, temporalIntent, language = 'fr' } = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('🔍 Perplexity search request:', { query, context, temporalIntent, language });

    // Generate cache key
    const cacheKey = generateCacheKey(query, context);
    
    // Check cache first
    const now = Date.now();
    const cached = cache.get(cacheKey);
    if (cached && now < cached.expiresAt) {
      console.log('🎯 Returning cached result');
      return new Response(
        JSON.stringify(cached.content),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check for in-flight request
    const inFlightRequest = inFlightRequests.get(cacheKey);
    if (inFlightRequest) {
      console.log('⏳ Waiting for in-flight request');
      const result = await inFlightRequest;
      return new Response(
        JSON.stringify(result),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create new request
    const searchPromise = (async () => {
      try {
        const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
        if (!perplexityApiKey) {
          throw new Error('PERPLEXITY_API_KEY not configured');
        }

        // Get current date for context
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        console.log('🌍 Current year:', currentYear);
        console.log('📅 Current month:', currentMonth);
        console.log('🕐 Current date (UTC):', currentDate.toISOString());

        // Format current date in French
        const monthNames = {
          fr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
               'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
          en: ['January', 'February', 'March', 'April', 'May', 'June',
               'July', 'August', 'September', 'October', 'November', 'December'],
          es: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
               'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
        };

        const months = monthNames[language as keyof typeof monthNames] || monthNames.fr;
        const formattedDate = `${months[currentMonth - 1]} ${currentYear}`;
        console.log('📅 Formatted current date:', formattedDate);

        // Get recency filter based on temporal intent
        function getRecencyFilter(intent?: string): string {
          switch (intent) {
            case 'current':
              return 'day';
            case 'recent_past':
              return 'week';
            case 'future':
              return 'month';
            default:
              return 'month';
          }
        }

        const searchRecencyFilter = getRecencyFilter(temporalIntent);
        console.log('🌐 Language detected:', language);
        console.log('📝 Context for search:', context);

        // Create system prompts based on language and temporal intent
        const systemPrompts = {
          fr: {
            current: `Tu es un assistant de recherche spécialisé dans les informations actuelles et récentes. La date actuelle est ${formattedDate}. Fournis des informations précises, récentes et vérifiables. Privilégie les sources officielles et récentes.`,
            recent_past: `Tu es un assistant de recherche spécialisé dans les événements récents. La date actuelle est ${formattedDate}. Concentre-toi sur les événements et informations des dernières semaines.`,
            future: `Tu es un assistant de recherche spécialisé dans les événements futurs et planifiés. La date actuelle est ${formattedDate}. Recherche des informations sur les événements à venir et les planifications futures.`,
            historical: `Tu es un assistant de recherche spécialisé dans les données historiques précises. Fournis des informations factuelles et vérifiables sur les événements passés.`,
            neutral: `Tu es un assistant de recherche qui fournit des informations précises et vérifiables. La date actuelle est ${formattedDate}. Adapte ta recherche au contexte de la question.`
          },
          en: {
            current: `You are a search assistant specialized in current and recent information. Today's date is ${formattedDate}. Provide accurate, recent, and verifiable information. Prioritize official and recent sources.`,
            recent_past: `You are a search assistant specialized in recent events. Today's date is ${formattedDate}. Focus on events and information from recent weeks.`,
            future: `You are a search assistant specialized in future and planned events. Today's date is ${formattedDate}. Search for information about upcoming events and future plans.`,
            historical: `You are a search assistant specialized in precise historical data. Provide factual and verifiable information about past events.`,
            neutral: `You are a search assistant that provides accurate and verifiable information. Today's date is ${formattedDate}. Adapt your search to the context of the question.`
          }
        };

        const langPrompts = systemPrompts[language as keyof typeof systemPrompts] || systemPrompts.fr;
        const systemPrompt = langPrompts[temporalIntent as keyof typeof langPrompts] || langPrompts.neutral;

        // Optimize query for better search results
        let optimizedQuery = query;
        if (language === 'fr' && temporalIntent === 'current') {
          // Add current context for French queries
          if (!query.toLowerCase().includes('2025') && !query.toLowerCase().includes('actuel')) {
            optimizedQuery = `${query} ${currentYear}`;
          }
        }

        console.log('🔍 Perplexity optimized search query:', optimizedQuery);

        const response = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${perplexityApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'sonar-pro',
            messages: [
              {
                role: 'system',
                content: systemPrompt
              },
              {
                role: 'user',
                content: optimizedQuery
              }
            ],
            temperature: 0.2,
            top_p: 0.9,
            max_tokens: 1500,
            return_images: false,
            return_related_questions: false,
            search_recency_filter: searchRecencyFilter,
            frequency_penalty: 1,
            presence_penalty: 0
          }),
        });

        console.log('📡 Perplexity API response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Perplexity API error:', errorText);
          throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('📊 Perplexity response structure:', {
          hasChoices: !!data.choices,
          choicesLength: data.choices?.length,
          hasMessage: !!data.choices?.[0]?.message,
          hasContent: !!data.choices?.[0]?.message?.content
        });

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          throw new Error('Invalid response structure from Perplexity');
        }

        const content = data.choices[0].message.content;
        const sources = data.choices[0].citations || [];

        const result = {
          content,
          sources,
          timestamp: new Date().toISOString(),
          language,
          temporalIntent,
          provider: 'perplexity'
        };

        // Cache the result with dynamic TTL
        const ttl = getTTL(temporalIntent);
        cache.set(cacheKey, {
          content: result,
          timestamp: now,
          expiresAt: now + ttl
        });

        // Cleanup expired entries periodically
        if (cache.size > 100) {
          cleanupCache();
        }

        console.log('✅ Perplexity search completed successfully - Content preview:', content.substring(0, 150));
        return result;

      } finally {
        // Remove from in-flight requests
        inFlightRequests.delete(cacheKey);
      }
    })();

    // Store the in-flight request
    inFlightRequests.set(cacheKey, searchPromise);

    const result = await searchPromise;
    
    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Error in perplexity-search function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Search failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});