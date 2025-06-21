
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🚀 Edge Function called');
    const { prompt } = await req.json()
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')

    if (!prompt) {
        console.error('❌ Missing prompt in request');
        return new Response(JSON.stringify({ error: 'Le "prompt" est manquant.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
    
    if (!openAIApiKey) {
      console.error('❌ Missing OPENAI_API_KEY secret');
      return new Response(JSON.stringify({ error: "La clé API OpenAI n'est pas configurée côté serveur." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    console.log('📡 Calling OpenAI API...');
    const startTime = Date.now();

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a world-class decision making assistant. Your responses must be in French and in a valid JSON object format.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        response_format: { type: "json_object" },
      }),
    });

    const duration = Date.now() - startTime;
    console.log(`⏱️ OpenAI API call took ${duration}ms`);

    if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ OpenAI API Error:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(`Erreur de l'API OpenAI: ${errorData.error?.message || response.statusText}`);
    }

    const text = await response.text();
    console.log('📄 Raw OpenAI response length:', text.length);
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('❌ Failed to parse OpenAI response as JSON:', parseError);
      throw new Error('Réponse invalide de OpenAI - JSON malformé');
    }

    if (!data.choices || data.choices.length === 0) {
        console.error("❌ OpenAI API response has no choices:", data);
        throw new Error("La réponse de l'API OpenAI est malformée - aucun choix disponible.");
    }

    const content = data.choices[0].message.content;
    console.log('📋 Content length:', content?.length || 0);
    
    if (!content) {
      console.error("❌ Empty content from OpenAI");
      throw new Error("Contenu vide reçu de OpenAI");
    }

    let jsonContent;
    try {
      jsonContent = JSON.parse(content);
      console.log('✅ Successfully parsed content JSON');
    } catch (contentParseError) {
      console.error("❌ Failed to parse JSON from API response content:", {
        error: contentParseError,
        contentPreview: content.substring(0, 200)
      });
      throw new Error("La réponse de l'API n'était pas un JSON valide.");
    }

    // Log successful response structure (without sensitive data)
    console.log('📊 Response structure:', {
      hasEmoji: !!jsonContent.emoji,
      hasCriteria: Array.isArray(jsonContent.criteria),
      criteriaCount: jsonContent.criteria?.length || 0,
      hasResult: !!jsonContent.result,
      hasRecommendation: !!jsonContent.result?.recommendation,
      hasBreakdown: Array.isArray(jsonContent.result?.breakdown),
      breakdownCount: jsonContent.result?.breakdown?.length || 0
    });
    
    return new Response(JSON.stringify(jsonContent), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
    });

  } catch (error) {
    console.error('💥 Edge Function Error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
