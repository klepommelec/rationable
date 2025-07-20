
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
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: 'You are a real-time information specialist. Provide accurate, up-to-date information with specific names, dates, and facts. Always include the most recent data available. Avoid generic responses like "Player A" or "Team X". Give precise, factual answers with real names and current information. If the question is in French, respond in French.'
          },
          {
            role: 'user',
            content: `Question: ${query}\n\nContexte: ${context || 'Recherche d\'informations actuelles et précises'}\n\nFournissez une réponse précise avec des noms réels, des dates exactes, et les informations les plus récentes disponibles. Évitez les réponses génériques.`
          }
        ],
        temperature: 0.1, // Très bas pour des réponses factuelles
        max_tokens: 1200,
        top_p: 0.9,
        return_images: false,
        return_related_questions: false,
        search_recency_filter: 'month', // Prioriser les données récentes
        frequency_penalty: 0.5,
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
