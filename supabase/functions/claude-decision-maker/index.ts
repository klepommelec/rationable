
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
      console.error('❌ ANTHROPIC_API_KEY not found in environment');
      throw new Error('Clé API Anthropic non configurée');
    }

    // Corriger la vérification du format de la clé API pour accepter les nouveaux formats
    if (!anthropicApiKey.startsWith('sk-ant-api03-') && !anthropicApiKey.startsWith('sk-ant-')) {
      console.error('❌ Invalid API key format. Anthropic keys should start with sk-ant-api03- or sk-ant-');
      throw new Error('Format de clé API Anthropic invalide');
    }

    console.log(`🤖 Using Claude model: ${model}`);
    console.log(`🔑 API Key format: ${anthropicApiKey.substring(0, 10)}...`);

    // Détecter le type de question
    const dilemmaLower = dilemma.toLowerCase();
    const isFactual = /qui\s+(est|a|sont)|qu'est-ce\s+(que|qui)|comment\s+|pourquoi\s+|quelle?\s+est|combien\s+|définition\s+de|expliquer\s+|what\s+is|who\s+is|how\s+|why\s+/.test(dilemmaLower);
    const isComparative = /choisir|meilleur|mieux|préférer|comparer|versus|ou\s+|alternative|option|choix|sélectionner|recommander|conseiller|quel|quelle|lequel|entre|différence|choose|better|best|prefer|compare|vs|or|alternative|option|choice|select|recommend|which|between|difference/.test(dilemmaLower);

    // Construction du prompt système amélioré
    let systemPrompt = `Tu es un assistant expert en prise de décision avec accès aux informations les plus récentes.

RÈGLES IMPORTANTES:
1. Si la question est COMPARATIVE (choix entre plusieurs options), génère EXACTEMENT 4 options différentes dans le breakdown
2. Si la question est FACTUELLE (une seule réponse correcte), génère 1 seule option dans le breakdown
3. Les scores doivent être différents et réalistes (entre 65-90 pour les comparatives, 90-100 pour les factuelles)
4. Chaque option doit avoir des pros et cons spécifiques et pertinents
5. Base ton analyse sur les critères fournis

DÉTECTION DE TYPE:
- Question détectée comme: ${isFactual ? 'FACTUELLE' : (isComparative ? 'COMPARATIVE' : 'COMPARATIVE par défaut')}
- ${isFactual ? 'Fournis UNE réponse précise et factuelle' : 'Fournis QUATRE options différentes avec analyse comparative'}

Tu dois répondre EXCLUSIVEMENT en JSON valide, sans texte avant ou après. Le format EXACT attendu est:
{
  "recommendation": "Titre de la recommandation principale",
  "description": "Description détaillée avec justification",
  "breakdown": [
    {
      "option": "Nom de l'option",
      "pros": ["Avantage 1", "Avantage 2", "Avantage 3"],
      "cons": ["Inconvénient 1", "Inconvénient 2"],
      "score": 85
    }${isFactual ? '' : `,
    {
      "option": "Nom de l'option 2",
      "pros": ["Avantage 1", "Avantage 2"],
      "cons": ["Inconvénient 1", "Inconvénient 2"],
      "score": 80
    },
    {
      "option": "Nom de l'option 3",
      "pros": ["Avantage 1", "Avantage 2"],
      "cons": ["Inconvénient 1", "Inconvénient 2"],
      "score": 75
    },
    {
      "option": "Nom de l'option 4",
      "pros": ["Avantage 1", "Avantage 2"],
      "cons": ["Inconvénient 1", "Inconvénient 2"],
      "score": 70
    }`}
  ]
}`;

    // Ajout des données temps réel si disponibles
    if (realTimeData?.content) {
      systemPrompt += `\n\nDonnées temps réel disponibles:
${realTimeData.content}
Source: ${realTimeData.provider}
Timestamp: ${realTimeData.timestamp}

UTILISE CES DONNÉES pour enrichir ton analyse et assurer l'exactitude de ta réponse.`;
    }

    // Ajout des données workspace si disponibles
    if (workspaceData?.documentsUsed > 0) {
      systemPrompt += `\n\nDocuments workspace consultés (${workspaceData.documentsUsed}):
${workspaceData.documentSources.join(', ')}`;
    }

    // Construction du prompt utilisateur amélioré
    let userPrompt = `${isFactual ? 'Question factuelle' : 'Question comparative'}: "${dilemma}"`;
    
    if (criteria.length > 0) {
      userPrompt += `\n\nCritères d'évaluation importants: ${criteria.map(c => c.name).join(', ')}`;
    }

    if (isFactual) {
      userPrompt += `\n\nFournis UNE réponse factuelle précise avec une seule option dans le breakdown.`;
    } else {
      userPrompt += `\n\nFournis EXACTEMENT 4 options différentes avec des scores décroissants.
      Chaque option doit être distincte avec ses propres avantages et inconvénients.
      Base ton analyse sur les critères mentionnés.`;
    }

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

    console.log(`📡 Claude API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur API Claude:', response.status, errorText);
      throw new Error(`Erreur API Claude: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('📊 Réponse Claude reçue:', {
      hasContent: !!data.content,
      contentLength: data.content?.length || 0
    });

    if (!data.content || !data.content[0] || !data.content[0].text) {
      throw new Error('Format de réponse invalide de Claude');
    }

    const content = data.content[0].text;
    console.log('📝 Contenu brut Claude (preview):', content.substring(0, 200) + '...');

    // Parsing du JSON
    let parsedResult;
    try {
      // Nettoyage du contenu (enlever les balises markdown potentielles)
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedResult = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('❌ Erreur parsing JSON:', parseError);
      console.error('Contenu à parser:', content);
      throw new Error('Impossible de parser la réponse Claude en JSON');
    }

    // Validation et enrichissement du résultat
    const result = {
      recommendation: parsedResult.recommendation || 'Recommandation non disponible',
      description: parsedResult.description || 'Description non disponible',
      breakdown: Array.isArray(parsedResult.breakdown) ? parsedResult.breakdown : [],
      confidenceLevel: parsedResult.confidenceLevel || Math.min(95, Math.max(70, parsedResult.breakdown?.[0]?.score || 75)),
      dataFreshness: parsedResult.dataFreshness || (realTimeData?.content ? 'very-fresh' : 'moderate'),
      realTimeData: realTimeData ? {
        hasRealTimeData: !!realTimeData.content,
        timestamp: realTimeData.timestamp,
        sourcesCount: realTimeData.sources?.length || 0,
        searchQuery: realTimeData.searchQuery,
        provider: realTimeData.provider
      } : undefined,
      workspaceData: workspaceData,
      aiProvider: {
        provider: 'claude',
        model: model,
        success: true
      },
      timestamp: new Date().toISOString()
    };

    // Log du résultat
    console.log('📊 Résultat final:', {
      hasRecommendation: !!result.recommendation,
      hasDescription: !!result.description,
      breakdownCount: result.breakdown?.length || 0,
      questionType: isFactual ? 'factual' : 'comparative'
    });

    console.log('✅ Claude analysis completed successfully');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erreur dans claude-decision-maker:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      aiProvider: {
        provider: 'claude',
        model: 'claude-sonnet-4-20250514',
        success: false,
        error: error.message
      },
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
