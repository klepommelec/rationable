
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
    const { query, context, temporalIntent } = await req.json()
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY')
    
    // Adaptateur dynamique pour le filtre de récence
    const getRecencyFilter = (intent: string) => {
      switch (intent) {
        case 'current': return 'week'
        case 'recent_past': return 'month'
        case 'future': return 'year' // Pour trouver les annonces et prévisions
        case 'historical': return 'all'
        default: return 'month'
      }
    }
    
    const recencyFilter = getRecencyFilter(temporalIntent || 'neutral')
    const currentDate = new Date().toLocaleDateString('fr-FR', { 
      month: 'long', 
      year: 'numeric' 
    })
    
    // Prompt système adaptatif selon l'intention temporelle
    let systemPrompt = `You are a knowledgeable information specialist. Current date: ${currentDate}. `
    
    switch (temporalIntent) {
      case 'future':
        systemPrompt += 'Search for future events, official announcements, planned schedules, and upcoming information. Look for the latest available forecasts, qualifications, and official calendars.'
        break
      case 'current':
        systemPrompt += 'Search ONLY for events currently happening, exhibitions currently open, and information available right now.'
        break
      case 'recent_past':
        systemPrompt += 'Search for recently concluded events, latest results, and information from recent months.'
        break
      case 'historical':
        systemPrompt += 'Search historical archives and past information according to the mentioned timeframe.'
        break
      default:
        systemPrompt += 'Search official websites, recent news, and reliable sources to find current information.'
    }
    
    systemPrompt += ' RESPONSE RULES: 1) For lists, provide ALL available items with complete details. 2) For single questions, be concise but precise. 3) Use real, specific names - never generic terms. 4) Remove citation numbers. 5) Answer in the same language as the question.'

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
            content: systemPrompt
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.1,
        max_tokens: 1500,
        top_p: 0.9,
        return_images: false,
        return_related_questions: false,
        search_recency_filter: recencyFilter,
        frequency_penalty: 1.0,
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
