
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

    // Préparer les messages pour OpenAI avec prompt amélioré
    const systemPrompt = `You are a world-class decision making assistant. Your responses must be in French and in a valid JSON object format.

RÈGLES CRITIQUES POUR LA DESCRIPTION:
1. Soyez ULTRA-SPÉCIFIQUE au dilemme posé - pas de texte générique
2. Analysez les ENJEUX PARTICULIERS de cette situation précise
3. Expliquez POURQUOI cette recommandation est la meilleure pour CE cas
4. INTERDICTION ABSOLUE de phrases comme: "Le choix de X", "Cette décision", "Il est important de"
5. Concentrez-vous sur la VALEUR AJOUTÉE et l'UTILITÉ concrète
6. Maximum 150 mots pour la description

INSTRUCTIONS POUR LES NOMS D'OPTIONS:
- Utilisez des noms PRÉCIS et SPÉCIFIQUES (ex: "Toyota Corolla", "Bali", "Université Paris-Saclay")
- JAMAIS de noms génériques comme "Option A", "Choix 1", "Produit X"
- Soyez factuels et concrets dans tous les aspects`;

    const messages = [
      { role: 'system', content: systemPrompt },
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

    // Utiliser GPT-4o pour supporter l'analyse d'images
    const model = files && files.some(f => f.fileType.startsWith('image/')) ? 'gpt-4o' : 'gpt-4o-mini';
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
      breakdownCount: jsonContent.result?.breakdown?.length || 0,
      filesProcessed: files?.length || 0
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
