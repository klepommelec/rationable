
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
      return new Response(JSON.stringify({ 
        error: 'Perplexity API key not configured',
        requiresRealTimeData: false
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    console.log('🔍 Perplexity search query:', query)

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a research assistant. Provide factual, up-to-date information with sources. Focus on recent developments and expert analysis. Always include confidence level in your assessment.'
          },
          {
            role: 'user',
            content: `Research the following topic with latest information: ${query}. Context: ${context || 'General inquiry'}. Provide recent sources and expert analysis.`
          }
        ],
        temperature: 0.2,
        max_tokens: 1000,
        return_images: false,
        return_related_questions: false,
        search_recency_filter: 'month',
      }),
    })

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error('No content received from Perplexity')
    }

    console.log('✅ Perplexity search completed')

    return new Response(JSON.stringify({
      content,
      sources: data.citations || [],
      timestamp: new Date().toISOString(),
      searchQuery: query,
      requiresRealTimeData: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('❌ Perplexity search error:', error)
    
    return new Response(JSON.stringify({ 
      error: error.message,
      requiresRealTimeData: false,
      fallbackMessage: 'Unable to fetch real-time data. Using AI knowledge base only.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
