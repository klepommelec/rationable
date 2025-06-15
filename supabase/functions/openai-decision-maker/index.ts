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
    const { prompt } = await req.json()
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')

    if (!prompt) {
        return new Response(JSON.stringify({ error: 'Le "prompt" est manquant.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
    
    if (!openAIApiKey) {
      console.error('Missing OPENAI_API_KEY secret.');
      return new Response(JSON.stringify({ error: "La clé API OpenAI n'est pas configurée côté serveur." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

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

    if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenAI API Error:", errorData);
        throw new Error(`Erreur de l'API OpenAI: ${errorData.error?.message || response.statusText}`);
    }

    // Fix for text encoding issues
    const text = await response.text();
    const data = JSON.parse(text);

    if (!data.choices || data.choices.length === 0) {
        console.error("OpenAI API response has no choices:", data);
        throw new Error("La réponse de l'API OpenAI est malformée.");
    }

    const content = data.choices[0].message.content;
    let jsonContent;
    try {
      // We parse it here to ensure it's valid JSON before sending to client
      jsonContent = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse JSON from API response content:", content);
      throw new Error("La réponse de l'API n'était pas un JSON valide.");
    }
    
    return new Response(JSON.stringify(jsonContent), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
    });


  } catch (error) {
    console.error(error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
