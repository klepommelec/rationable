
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
      return new Response(JSON.stringify({ 
        error: 'Perplexity API key not configured',
        requiresRealTimeData: false
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    console.log('🔍 Perplexity search query:', query)
    console.log('📝 Context:', context)

    // Utiliser les nouveaux modèles PPLX 2025 disponibles
    const models = [
      'pplx-70b-online',
      'pplx-7b-online'
    ];

    let lastError: string = '';

    for (const model of models) {
      console.log(`🤖 Trying model: ${model}`);
      
      try {
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${perplexityApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: 'system',
                content: 'You are a research assistant specialized in providing factual, up-to-date information with sources. Focus on recent developments and expert analysis. Always include confidence level in your assessment. Respond in French if the query is in French.'
              },
              {
                role: 'user',
                content: `Recherchez des informations récentes et précises sur: ${query}. Contexte: ${context || 'Recherche générale'}. Fournissez des sources récentes et une analyse d'experts avec des faits vérifiés.`
              }
            ],
            temperature: 0.1,
            max_tokens: 1000,
            top_p: 0.9,
            return_images: false,
            return_related_questions: false,
            search_recency_filter: 'month',
            frequency_penalty: 1,
            presence_penalty: 0
          }),
        })

        console.log(`📡 Perplexity API response status: ${response.status}`);

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`❌ Perplexity API error (${model}):`, {
            status: response.status,
            statusText: response.statusText,
            body: errorText
          })
          
          lastError = `HTTP ${response.status}: ${response.statusText} - ${errorText}`
          
          // Si c'est une erreur 400 avec le premier modèle, essayer le suivant
          if (response.status === 400 && model === models[0]) {
            console.log('🔄 Retrying with smaller model...')
            continue
          }
          
          throw new Error(lastError)
        }

        const data = await response.json()
        console.log('📊 Perplexity response received:', {
          hasChoices: !!data.choices,
          choicesLength: data.choices?.length || 0,
          hasMessage: !!data.choices?.[0]?.message,
          hasContent: !!data.choices?.[0]?.message?.content
        })

        const content = data.choices?.[0]?.message?.content

        if (!content) {
          throw new Error('No content received from Perplexity API')
        }

        console.log('✅ Perplexity search completed successfully')

        return new Response(JSON.stringify({
          content,
          sources: data.citations || [],
          timestamp: new Date().toISOString(),
          searchQuery: query,
          requiresRealTimeData: true,
          model: model
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

      } catch (modelError) {
        console.error(`❌ Error with model ${model}:`, modelError)
        lastError = modelError.message
        
        // Si ce n'est pas le dernier modèle, continuer
        if (model !== models[models.length - 1]) {
          continue
        }
      }
    }

    // Si tous les modèles ont échoué
    throw new Error(`All models failed. Last error: ${lastError}`)

  } catch (error) {
    console.error('❌ Perplexity search error:', error)
    
    return new Response(JSON.stringify({ 
      error: error.message,
      requiresRealTimeData: false,
      fallbackMessage: 'Unable to fetch real-time data. Using AI knowledge base only.',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
