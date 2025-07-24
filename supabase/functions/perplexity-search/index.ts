
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query, context } = await req.json()
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY')

    if (!perplexityApiKey) {
      console.error('❌ PERPLEXITY_API_KEY not found in environment')
      throw new Error('Perplexity API key not configured')
    }

    console.log('🔍 Perplexity optimized search query:', query)
    console.log('📝 Context for search:', context)

    // Utiliser sonar-pro en priorité pour les meilleures données récentes
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online', // Modèle plus puissant pour données récentes
        messages: [
          {
            role: 'system',
            content: 'You are a specialist in CURRENT 2024-2025 information. CRITICAL: Always use the most recent data from 2024-2025. Completely ignore any information from 2023 or earlier years. For sports questions, only use the latest drafts, transfers, results from 2024-2025. If asked in French, respond in French with direct, factual answers.'
          },
          {
            role: 'user',
            content: `${query}\n\nCRITICAL REQUIREMENT: Use ONLY 2024-2025 data. Ignore all information from 2023 and earlier. For NBA draft questions specifically, Cooper Flagg was selected #1 in 2024, NOT Victor Wembanyama (who was 2023). Always verify you're using current 2024-2025 information, not outdated data.`
          }
        ],
        temperature: 0.05, // Encore plus bas pour plus de précision
        max_tokens: 500,
        top_p: 0.8,
        return_images: false,
        return_related_questions: false,
        search_recency_filter: 'day',
        search_domain_filter: [], // Pas de restriction de domaine
        frequency_penalty: 1.0, // Maximum pour éviter les répétitions d'anciennes infos
        presence_penalty: 0
      }),
    })

    console.log(`📡 Perplexity API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Perplexity API error:`, {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      })
      
      throw new Error(`Perplexity API failed: HTTP ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('📊 Perplexity response structure:', {
      hasChoices: !!data.choices,
      choicesLength: data.choices?.length || 0,
      hasMessage: !!data.choices?.[0]?.message,
      hasContent: !!data.choices?.[0]?.message?.content
    })

    const content = data.choices?.[0]?.message?.content

    if (!content) {
      throw new Error('No content received from Perplexity API')
    }

    console.log('✅ Perplexity search completed successfully - Content preview:', content.substring(0, 200))

    return new Response(JSON.stringify({
      content,
      sources: data.citations || [],
      timestamp: new Date().toISOString(),
      searchQuery: query,
      requiresRealTimeData: true,
      model: 'sonar-pro'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('❌ Perplexity search error:', error)
    
    return new Response(JSON.stringify({ 
      error: error.message,
      requiresRealTimeData: false,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
