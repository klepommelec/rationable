import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fonction pour générer des liens de fallback intelligents
const generateFallbackLinks = (dilemma: string, recommendation: string) => {
  const cleanDilemma = encodeURIComponent(dilemma);
  const cleanRecommendation = encodeURIComponent(recommendation);
  
  // Liens d'information
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
      title: `Wikipedia : ${recommendation}`,
      url: `https://fr.wikipedia.org/wiki/Special:Search?search=${cleanRecommendation}`,
      description: `Informations encyclopédiques`
    }
  ];
  
  // Liens d'achat
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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      dilemma, 
      criteria = [], 
      realTimeData = null,
      workspaceData = null,
      model = 'claude-3-5-sonnet-20241022'
    } = await req.json();

    if (!anthropicApiKey) {
      console.error('❌ ANTHROPIC_API_KEY not found in environment');
      throw new Error('Clé API Anthropic non configurée');
    }

    if (!anthropicApiKey.startsWith('sk-ant-api03-') && !anthropicApiKey.startsWith('sk-ant-')) {
      console.error('❌ Invalid API key format. Anthropic keys should start with sk-ant-api03- or sk-ant-');
      throw new Error('Format de clé API Anthropic invalide');
    }

    console.log(`🤖 Using Claude model: ${model}`);
    console.log(`🔑 API Key format: ${anthropicApiKey.substring(0, 10)}...`);

    // Construction du prompt système amélioré avec liens OBLIGATOIRES
    let systemPrompt = `Tu es un assistant expert en prise de décision avec accès aux informations les plus récentes.

IMPORTANT: 
- Analyse en profondeur la question posée
- Si c'est une question sur des événements récents (draft NBA, élections, actualités), utilise tes connaissances les plus à jour
- Pour les questions sportives, considère les performances récentes, les statistiques, et les analyses d'experts
- Sois précis et factuel dans tes réponses

Tu dois répondre EXCLUSIVEMENT en JSON valide, sans texte avant ou après. Le format EXACT attendu est:
{
  "recommendation": "Titre de la recommandation (basé sur les faits)",
  "description": "Description détaillée avec justification factuelle",
  "imageQuery": "Description for generating an image (in English, descriptive)",
  "confidenceLevel": 85,
  "dataFreshness": "very-fresh",
  "breakdown": [
    {
      "option": "Nom de l'option",
      "pros": ["Avantage factuel 1", "Avantage factuel 2"],
      "cons": ["Inconvénient ou limitation 1", "Inconvénient 2"],
      "score": 85
    }
  ],
  "infoLinks": [
    {
      "title": "Guide complet sur [recommendation]",
      "url": "https://www.google.fr/search?q=[recommendation]+guide+complet",
      "description": "Guide détaillé et informations complètes"
    },
    {
      "title": "Avis et comparatifs - [recommendation]",
      "url": "https://www.google.fr/search?q=[recommendation]+avis+test+comparatif",
      "description": "Avis d'experts et tests utilisateurs"
    },
    {
      "title": "Informations techniques - [recommendation]",
      "url": "https://fr.wikipedia.org/wiki/Special:Search?search=[recommendation]",
      "description": "Ressources techniques et encyclopédiques"
    }
  ],
  "shoppingLinks": [
    {
      "title": "Acheter [recommendation] - Amazon",
      "url": "https://www.amazon.fr/s?k=[recommendation]",
      "description": "Voir les prix et disponibilités"
    },
    {
      "title": "Comparer les prix - [recommendation]",
      "url": "https://www.google.fr/search?q=[recommendation]+prix+comparateur+achat&tbm=shop",
      "description": "Comparaison de prix en ligne"
    },
    {
      "title": "Où acheter [recommendation]",
      "url": "https://www.google.fr/search?q=où+acheter+[recommendation]+magasin",
      "description": "Trouver des points de vente"
    }
  ]
}

OBLIGATOIRE : Tu DOIS générer EXACTEMENT 3 infoLinks et 3 shoppingLinks. Remplace [recommendation] par la recommandation réelle dans les URLs et titres. Ces liens sont INDISPENSABLES et ne peuvent être omis.`;

    // Ajout des données temps réel si disponibles
    if (realTimeData?.content) {
      systemPrompt += `\n\nDonnées temps réel disponibles:
${realTimeData.content}
Source: ${realTimeData.provider}
Timestamp: ${realTimeData.timestamp}

UTILISE CES DONNÉES pour enrichir ton analyse et assurer l'exactitude de ta réponse.`;
    }

    if (workspaceData?.documentsUsed > 0) {
      systemPrompt += `\n\nDocuments workspace consultés (${workspaceData.documentsUsed}):
${workspaceData.documentSources.join(', ')}`;
    }

    // Construction du prompt utilisateur amélioré
    let userPrompt = `Question/Dilemme: "${dilemma}"`;
    
    if (criteria.length > 0) {
      userPrompt += `\n\nCritères d'évaluation importants: ${criteria.map(c => c.name).join(', ')}`;
    }

    // Détection du type de question pour adapter l'approche
    const isCurrentEvent = /2024|2025|draft|élection|récent|aujourd'hui|maintenant|current|latest/i.test(dilemma);
    const isSportsRelated = /draft|NBA|football|sport|joueur|équipe|match/i.test(dilemma);
    
    if (isCurrentEvent) {
      userPrompt += `\n\n⚠️ ATTENTION: Cette question concerne des événements récents ou actuels. Utilise tes connaissances les plus à jour.`;
    }
    
    if (isSportsRelated) {
      userPrompt += `\n\n🏀 Question sportive détectée: Base ton analyse sur:
- Performances statistiques récentes
- Potentiel et développement des joueurs
- Impact sur l'équipe et la franchise
- Analyses d'experts et scouts
- Comparaisons objectives`;
    }

    userPrompt += `\n\nFournis une analyse complète avec:
1. Une recommandation claire et factuelle
2. Une justification détaillée basée sur des faits
3. Une évaluation comparative des options (scores 0-100)
4. EXACTEMENT 3 infoLinks ET 3 shoppingLinks avec des URLs réelles et fonctionnelles

RAPPEL IMPORTANT: Les infoLinks et shoppingLinks sont OBLIGATOIRES. Génère des URLs de recherche Google pertinentes en remplaçant [recommendation] par ta recommandation réelle.

Les scores doivent refléter l'évaluation objective selon les critères mentionnés.`;

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
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedResult = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('❌ Erreur parsing JSON:', parseError);
      console.error('Contenu à parser:', content);
      throw new Error('Impossible de parser la réponse Claude en JSON');
    }

    // Validation et enrichissement du résultat avec fallback de liens
    const result = {
      recommendation: parsedResult.recommendation || 'Recommandation non disponible',
      description: parsedResult.description || 'Description non disponible',
      imageQuery: parsedResult.imageQuery || parsedResult.recommendation || 'decision analysis',
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
      }
    };

    // Vérification et génération de liens de fallback si nécessaire
    let infoLinks = Array.isArray(parsedResult.infoLinks) ? parsedResult.infoLinks : [];
    let shoppingLinks = Array.isArray(parsedResult.shoppingLinks) ? parsedResult.shoppingLinks : [];
    
    // Générer des liens de fallback si insuffisants
    if (infoLinks.length < 2 || shoppingLinks.length < 2) {
      console.log('⚠️ Liens insuffisants générés par Claude, ajout de liens de fallback');
      const fallbackLinks = generateFallbackLinks(dilemma, result.recommendation);
      
      if (infoLinks.length < 2) {
        infoLinks = fallbackLinks.infoLinks;
      }
      if (shoppingLinks.length < 2) {
        shoppingLinks = fallbackLinks.shoppingLinks;
      }
    }
    
    result.infoLinks = infoLinks;
    result.shoppingLinks = shoppingLinks;

    console.log('✅ Claude analysis completed successfully with links:', {
      infoLinksCount: result.infoLinks.length,
      shoppingLinksCount: result.shoppingLinks.length
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erreur dans claude-decision-maker:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      aiProvider: {
        provider: 'claude',
        model: 'claude-3-5-sonnet-20241022',
        success: false,
        error: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
