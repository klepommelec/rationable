
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

// Fonction pour générer des liens de fallback intelligents
const generateFallbackLinks = (dilemma: string, recommendation: string) => {
  const cleanDilemma = encodeURIComponent(dilemma);
  const cleanRecommendation = encodeURIComponent(recommendation);
  
  const infoLinks = [
    {
      title: `Guide complet : ${recommendation}`,
      url: `https://www.google.fr/search?q=${cleanRecommendation}+guide+complet`,
      description: `Guide détaillé sur ${recommendation}`
    },
    {
      title: `Avis et tests : ${recommendation}`,
      url: `https://www.google.fr/search?q=${cleanRecommendation}+avis+test+comparatif`,
      description: `Avis d'experts et tests utilisateurs`
    },
    {
      title: `Informations techniques : ${recommendation}`,
      url: `https://fr.wikipedia.org/wiki/Special:Search?search=${cleanRecommendation}`,
      description: `Ressources techniques et encyclopédiques`
    }
  ];
  
  const shoppingLinks = [
    {
      title: `Acheter ${recommendation} - Amazon`,
      url: `https://www.amazon.fr/s?k=${cleanRecommendation}`,
      description: `Voir les prix sur Amazon`
    },
    {
      title: `Comparer les prix - ${recommendation}`,
      url: `https://www.google.fr/search?q=${cleanRecommendation}+prix+comparateur+achat&tbm=shop`,
      description: `Comparaison de prix en ligne`
    },
    {
      title: `Où acheter ${recommendation}`,
      url: `https://www.google.fr/search?q=où+acheter+${cleanRecommendation}+magasin`,
      description: `Trouver des magasins près de chez vous`
    }
  ];
  
  return { infoLinks, shoppingLinks };
};

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

    // Préparer les messages pour OpenAI avec prompt amélioré pour les liens
    const messages = [
      { role: 'system', content: `You are a world-class decision making assistant. Your responses must be in French and in a valid JSON object format.

IMPORTANT: You MUST ALWAYS include exactly 3 infoLinks and 3 shoppingLinks in your response. These links are MANDATORY and cannot be omitted.

Expected JSON format:
{
  "recommendation": "Your recommendation",
  "description": "Detailed description",
  "imageQuery": "Description for image generation (in English)",
  "confidenceLevel": 85,
  "dataFreshness": "moderate",
  "breakdown": [...],
  "infoLinks": [
    {
      "title": "Complete guide: [recommendation]",
      "url": "https://www.google.fr/search?q=[recommendation]+guide+complet",
      "description": "Detailed guide and complete information"
    },
    {
      "title": "Reviews and comparisons - [recommendation]",
      "url": "https://www.google.fr/search?q=[recommendation]+avis+test+comparatif", 
      "description": "Expert reviews and user tests"
    },
    {
      "title": "Technical information - [recommendation]",
      "url": "https://fr.wikipedia.org/wiki/Special:Search?search=[recommendation]",
      "description": "Technical and encyclopedic resources"
    }
  ],
  "shoppingLinks": [
    {
      "title": "Buy [recommendation] - Amazon",
      "url": "https://www.amazon.fr/s?k=[recommendation]",
      "description": "See prices and availability"
    },
    {
      "title": "Compare prices - [recommendation]",
      "url": "https://www.google.fr/search?q=[recommendation]+prix+comparateur+achat&tbm=shop",
      "description": "Online price comparison"
    },
    {
      "title": "Where to buy [recommendation]",
      "url": "https://www.google.fr/search?q=où+acheter+[recommendation]+magasin",
      "description": "Find retail stores"
    }
  ]
}

Replace [recommendation] with the actual recommendation in URLs and titles. These links are ESSENTIAL and must be included.` },
      { role: 'user', content: prompt }
    ];

    // Si nous avons des fichiers, les traiter
    if (files && files.length > 0) {
      console.log('🔍 Processing uploaded files...');
      
      for (const fileInfo of files) {
        try {
          console.log(`📄 Processing file: ${fileInfo.fileName} (${fileInfo.fileType})`);
          
          const { data: fileData, error: downloadError } = await supabase.storage
            .from('decision-files')
            .download(fileInfo.filePath);
            
          if (downloadError) {
            console.error(`❌ Error downloading file ${fileInfo.fileName}:`, downloadError);
            continue;
          }
          
          if (fileInfo.fileType.startsWith('image/')) {
            console.log(`🖼️ Processing image: ${fileInfo.fileName}`);
            
            const arrayBuffer = await fileData.arrayBuffer();
            const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
            const dataUrl = `data:${fileInfo.fileType};base64,${base64}`;
            
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

    // Vérification et génération de liens de fallback si nécessaire
    let infoLinks = Array.isArray(jsonContent.infoLinks) ? jsonContent.infoLinks : [];
    let shoppingLinks = Array.isArray(jsonContent.shoppingLinks) ? jsonContent.shoppingLinks : [];
    
    // Générer des liens de fallback si insuffisants
    if (infoLinks.length < 2 || shoppingLinks.length < 2) {
      console.log('⚠️ Liens insuffisants générés par OpenAI, ajout de liens de fallback');
      const fallbackLinks = generateFallbackLinks(prompt, jsonContent.recommendation || 'solution recommandée');
      
      if (infoLinks.length < 2) {
        infoLinks = fallbackLinks.infoLinks;
      }
      if (shoppingLinks.length < 2) {
        shoppingLinks = fallbackLinks.shoppingLinks;
      }
    }
    
    jsonContent.infoLinks = infoLinks;
    jsonContent.shoppingLinks = shoppingLinks;

    // Log successful response structure (without sensitive data)
    console.log('📊 Response structure:', {
      hasEmoji: !!jsonContent.emoji,
      hasCriteria: Array.isArray(jsonContent.criteria),
      criteriaCount: jsonContent.criteria?.length || 0,
      hasResult: !!jsonContent.result,
      hasRecommendation: !!jsonContent.result?.recommendation || !!jsonContent.recommendation,
      hasBreakdown: Array.isArray(jsonContent.result?.breakdown) || Array.isArray(jsonContent.breakdown),
      breakdownCount: jsonContent.result?.breakdown?.length || jsonContent.breakdown?.length || 0,
      filesProcessed: files?.length || 0,
      infoLinksCount: infoLinks.length,
      shoppingLinksCount: shoppingLinks.length
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
