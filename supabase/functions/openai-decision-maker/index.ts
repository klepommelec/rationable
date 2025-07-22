
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
)

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🚀 Edge Function called');
    const { prompt, files } = await req.json()
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
    console.log('📁 Files to analyze:', files?.length || 0);
    const startTime = Date.now();

    // Préparer les messages pour OpenAI avec des instructions renforcées
    const messages = [
      { 
        role: 'system', 
        content: `Tu es un expert en prise de décision. Tu dois TOUJOURS respecter le format JSON demandé.
        
        RÈGLES IMPORTANTES:
        1. Si la question est comparative (choix entre plusieurs options), génère EXACTEMENT 4 options différentes
        2. Si la question est factuelle (une seule réponse correcte), génère 1 seule option
        3. Les scores doivent être différents et réalistes (entre 65-90 pour les comparatives)
        4. Chaque option doit avoir des pros et cons spécifiques
        5. Réponds UNIQUEMENT en JSON valide, sans texte avant ou après
        
        La réponse doit être en français et en format JSON.`
      },
      { role: 'user', content: prompt }
    ];

    // Si nous avons des fichiers, les traiter
    if (files && files.length > 0) {
      console.log('🔍 Processing uploaded files...');
      
      for (const fileInfo of files) {
        try {
          console.log(`📄 Processing file: ${fileInfo.fileName} (${fileInfo.fileType})`);
          
          // Télécharger le fichier depuis Supabase Storage
          const { data: fileData, error: downloadError } = await supabase.storage
            .from('decision-files')
            .download(fileInfo.filePath);
            
          if (downloadError) {
            console.error(`❌ Error downloading file ${fileInfo.fileName}:`, downloadError);
            continue;
          }
          
          // Traiter selon le type de fichier
          if (fileInfo.fileType.startsWith('image/')) {
            console.log(`🖼️ Processing image: ${fileInfo.fileName}`);
            
            // Convertir l'image en base64
            const arrayBuffer = await fileData.arrayBuffer();
            const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
            const dataUrl = `data:${fileInfo.fileType};base64,${base64}`;
            
            // Ajouter l'image au message pour GPT-4o vision
            messages.push({
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Voici un document image joint (${fileInfo.fileName}). Analysez son contenu et intégrez les informations pertinentes dans votre analyse du dilemme :`
                },
                {
                  type: 'image_url',
                  image_url: { url: dataUrl }
                }
              ]
            });
          } else if (fileInfo.fileType === 'application/pdf') {
            console.log(`📄 Processing PDF: ${fileInfo.fileName}`);
            
            // Pour les PDFs, on ajoutera l'extraction de texte plus tard
            // Pour l'instant, on informe juste OpenAI qu'il y a un PDF
            messages.push({
              role: 'user',
              content: `Un document PDF a été joint (${fileInfo.fileName}). Veuillez tenir compte de ce contexte dans votre analyse. Note: L'extraction automatique de texte PDF sera implémentée prochainement.`
            });
          } else {
            console.log(`📎 Processing other file type: ${fileInfo.fileName}`);
            messages.push({
              role: 'user',
              content: `Un document a été joint (${fileInfo.fileName}, type: ${fileInfo.fileType}). Veuillez tenir compte de ce contexte dans votre analyse.`
            });
          }
          
        } catch (fileError) {
          console.error(`❌ Error processing file ${fileInfo.fileName}:`, fileError);
        }
      }
    }

    // Utiliser GPT-4.1 pour de meilleures performances
    const model = files && files.some(f => f.fileType.startsWith('image/')) ? 'gpt-4o' : 'gpt-4.1-2025-04-14';
    console.log(`🤖 Using model: ${model}`);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.3,
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

    // Enrichir la réponse avec des métadonnées
    const enrichedResponse = {
      ...jsonContent,
      aiProvider: {
        provider: 'openai',
        model: model,
        success: true
      },
      timestamp: new Date().toISOString(),
      filesProcessed: files?.length || 0
    };

    // Log successful response structure (without sensitive data)
    console.log('📊 Response structure:', {
      hasRecommendation: !!enrichedResponse.recommendation,
      hasDescription: !!enrichedResponse.description,
      hasBreakdown: Array.isArray(enrichedResponse.breakdown),
      breakdownCount: enrichedResponse.breakdown?.length || 0,
      filesProcessed: files?.length || 0
    });
    
    return new Response(JSON.stringify(enrichedResponse), {
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
      aiProvider: {
        provider: 'openai',
        model: 'gpt-4.1-2025-04-14',
        success: false,
        error: error.message
      },
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
