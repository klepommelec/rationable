import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      dilemma, 
      criteria = [], 
      realTimeData = null,
      workspaceData = null,
      model = 'claude-sonnet-4-20250514'
    } = await req.json();

    if (!anthropicApiKey) {
      throw new Error('Clé API Anthropic non configurée');
    }

    // Construction du prompt système
    let systemPrompt = `Tu es un assistant expert en prise de décision. Analyse la situation suivante et fournis une recommandation structurée.

IMPORTANT: Tu dois répondre EXCLUSIVEMENT en JSON valide, sans texte avant ou après. Le format EXACT attendu est:
{
  "recommendation": "Titre de la recommandation",
  "description": "Description détaillée de la recommandation",
  "breakdown": [
    {
      "option": "Nom de l'option",
      "pros": ["Avantage 1", "Avantage 2"],
      "cons": ["Inconvénient 1", "Inconvénient 2"],
      "score": 85
    }
  ],
  "infoLinks": [
    {
      "title": "Titre du lien",
      "url": "URL complète",
      "description": "Description optionnelle"
    }
  ],
  "shoppingLinks": [
    {
      "title": "Nom du produit/service",
      "url": "URL d'achat",
      "description": "Prix ou info supplémentaire"
    }
  ]
}`;

    // Ajout des données temps réel si disponibles
    if (realTimeData?.hasRealTimeData) {
      systemPrompt += `\n\nDonnées temps réel disponibles (récupérées ${realTimeData.timestamp}):
Sources: ${realTimeData.sourcesCount}
Requête: ${realTimeData.searchQuery}`;
    }

    // Ajout des données workspace si disponibles
    if (workspaceData?.documentsUsed > 0) {
      systemPrompt += `\n\nDocuments workspace utilisés (${workspaceData.documentsUsed}):
${workspaceData.documentSources.join(', ')}`;
    }

    // Construction du prompt utilisateur
    let userPrompt = `Dilemme: ${dilemma}`;
    
    if (criteria.length > 0) {
      userPrompt += `\n\nCritères importants: ${criteria.map(c => c.name).join(', ')}`;
    }

    userPrompt += `\n\nAnalyse cette situation et fournis:
1. Une recommandation claire
2. Une analyse détaillée des options avec scores (0-100)
3. Des liens informatifs pertinents
4. Des liens d'achat si applicable

Les scores doivent refléter la qualité objective de chaque option selon les critères.`;

    // Appel à l'API Claude
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anthropicApiKey}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 4000,
        temperature: 0.3,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur API Claude:', response.status, errorText);
      throw new Error(`Erreur API Claude: ${response.status}`);
    }

    const data = await response.json();
    console.log('Réponse Claude:', data);

    if (!data.content || !data.content[0] || !data.content[0].text) {
      throw new Error('Format de réponse invalide de Claude');
    }

    const content = data.content[0].text;
    console.log('Contenu brut Claude:', content);

    // Parsing du JSON
    let parsedResult;
    try {
      // Nettoyage du contenu (enlever les balises markdown potentielles)
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedResult = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Erreur parsing JSON:', parseError);
      console.error('Contenu à parser:', content);
      throw new Error('Impossible de parser la réponse Claude en JSON');
    }

    // Validation et enrichissement du résultat
    const result = {
      recommendation: parsedResult.recommendation || 'Recommandation non disponible',
      description: parsedResult.description || 'Description non disponible',
      breakdown: Array.isArray(parsedResult.breakdown) ? parsedResult.breakdown : [],
      infoLinks: Array.isArray(parsedResult.infoLinks) ? parsedResult.infoLinks : [],
      shoppingLinks: Array.isArray(parsedResult.shoppingLinks) ? parsedResult.shoppingLinks : [],
      confidenceLevel: Math.min(95, Math.max(70, parsedResult.breakdown?.[0]?.score || 75)),
      dataFreshness: realTimeData?.hasRealTimeData ? 'very-fresh' : 'moderate',
      realTimeData: realTimeData,
      workspaceData: workspaceData,
      aiProvider: {
        provider: 'claude',
        model: model,
        success: true
      }
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Erreur dans claude-decision-maker:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      aiProvider: {
        provider: 'claude',
        model: 'claude-sonnet-4-20250514',
        success: false,
        error: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});