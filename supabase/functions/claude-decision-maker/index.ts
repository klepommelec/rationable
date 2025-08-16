
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');

// CORS configuration for all environments
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
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

    // Corriger la vérification du format de la clé API pour accepter les nouveaux formats
    if (!anthropicApiKey.startsWith('sk-ant-api03-') && !anthropicApiKey.startsWith('sk-ant-')) {
      console.error('❌ Invalid API key format. Anthropic keys should start with sk-ant-api03- or sk-ant-');
      throw new Error('Format de clé API Anthropic invalide');
    }

    console.log(`🤖 Using Claude model: ${model}`);
    console.log(`🔑 API Key format: ${anthropicApiKey.substring(0, 10)}...`);

    // Détection de la langue et configuration locale
    const detectedLanguage = dilemma ? (() => {
      const lowerText = dilemma.toLowerCase();
      if (lowerText.match(/\b(le|la|les|et|ou|est|sont|avoir|sera|serait|devrait|pourrait)\b/g)) return 'fr';
      if (lowerText.match(/\b(el|la|los|las|y|o|es|son|tener|será|sería|debería|podría)\b/g)) return 'es';
      if (lowerText.match(/\b(il|la|gli|le|e|o|è|sono|avere|sarà|sarebbe|dovrebbe|potrebbe)\b/g)) return 'it';
      if (lowerText.match(/\b(der|die|das|und|oder|ist|sind|haben|wird|würde|sollte|könnte)\b/g)) return 'de';
      if (lowerText.match(/\b(the|and|or|is|are|have|will|would|should|could)\b/g)) return 'en';
      return 'fr'; // default
    })() : 'fr';

    const languageConfig = {
      fr: { buyVerb: 'acheter', currency: '€', country: 'France', domains: 'amazon.fr, fnac.com, darty.com, cdiscount.com' },
      en: { buyVerb: 'buy', currency: '$', country: 'USA', domains: 'amazon.com, bestbuy.com, target.com, walmart.com' },
      es: { buyVerb: 'comprar', currency: '€', country: 'España', domains: 'amazon.es, elcorteingles.es, mediamarkt.es, fnac.es' },
      it: { buyVerb: 'comprare', currency: '€', country: 'Italia', domains: 'amazon.it, mediaworld.it, unieuro.it, eprice.it' },
      de: { buyVerb: 'kaufen', currency: '€', country: 'Deutschland', domains: 'amazon.de, otto.de, mediamarkt.de, saturn.de' }
    };
    const config = languageConfig[detectedLanguage as keyof typeof languageConfig] || languageConfig.fr;

    // Construction du prompt système amélioré
    let systemPrompt = `Tu es un assistant expert en prise de décision avec accès aux informations les plus récentes.

RÈGLES CRITIQUES POUR LA DESCRIPTION:
1. Soyez ULTRA-SPÉCIFIQUE au dilemma posé - pas de texte générique
2. Analysez les ENJEUX PARTICULIERS de cette situation précise
3. Expliquez POURQUOI cette recommandation est la meilleure pour CE cas
4. INTERDICTION ABSOLUE de phrases comme: "Le choix de X", "Cette décision", "Il est important de"
5. Concentrez-vous sur la VALEUR AJOUTÉE et l'UTILITÉ concrète
6. Maximum 150 mots pour la description

RÈGLES CRITIQUES POUR LES LIENS D'ACHAT (shoppingLinks):
- Langue détectée: ${detectedLanguage.toUpperCase()} - Pays: ${config.country}
- Pour les produits/services recommandés, fournir 2-4 liens d'achat PRIORITAIRES:
  1. Page officielle du produit/marque (si applicable)
  2. 1-2 revendeurs officiels majeurs (${config.domains})
  3. 1 option d'occasion certifiée (si pertinent)
- URLs RÉELLES et FONCTIONNELLES uniquement - pas d'exemples
- Si un produit n'est plus vendu neuf, omettre ce type de lien
- ADAPTER PRÉCISÉMENT au contexte par verticale:
  * RESTAURANTS/DINING: 1 site officiel restaurant + 1-2 plateformes de réservation (thefork.fr, opentable.fr, etc.) - JAMAIS de liens hôtels
  * HÉBERGEMENT: 1 site officiel hôtel + 1-2 plateformes de réservation (booking.com, expedia.fr, etc.) - JAMAIS de liens restaurants
  * AUTOMOBILES: 1 lien officiel constructeur + 1-2 concessionnaires/revendeurs + 1-2 occasions certifiées (lacentrale.fr, autoscout24.fr, etc.)
  * VOYAGES/TRANSPORT: 1 lien officiel compagnie + 1-2 plateformes de réservation transport (trainline.com, etc.)
  * ÉLECTRONIQUE: 1 lien constructeur + 1-2 revendeurs tech certifiés + éviter fnac.com (URLs souvent cassées)
  * LOGICIELS: 1 lien éditeur officiel + 1-2 revendeurs de licences certifiés
- VÉRIFICATION DE COHÉRENCE: Si la question porte sur un restaurant, NE JAMAIS proposer de liens hôtels ou inversement
- Format titre: "Nom exact du produit/service chez [Revendeur]"
- Description: "Page officielle" ou "Revendeur certifié" ou "Marché d'occasion" ou "Plateforme de réservation"
- Respecter la langue de l'utilisateur dans les titres et descriptions
- Utiliser les domaines locaux appropriés au pays/langue (ex: .fr pour français, .de pour allemand)

IMPORTANT: 
- Analyse en profondeur la question posée
- Si c'est une question sur des événements récents (draft NBA, élections, actualités), utilise tes connaissances les plus à jour
- Pour les questions sportives, considère les performances récentes, les statistiques, et les analyses d'experts
- Sois précis et factuel dans tes réponses

Tu dois répondre EXCLUSIVEMENT en JSON valide, sans texte avant ou après. Le format EXACT attendu est:
{
  "recommendation": "Titre de la recommandation (basé sur les faits)",
  "description": "Analyse spécifique des enjeux de ce dilemme précis avec justification détaillée de pourquoi cette recommandation est optimale dans ce contexte particulier",
  "imageQuery": "Description for generating an image (in English, descriptive)",
  "confidenceLevel": 85,
  "dataFreshness": "very-fresh",
  "breakdown": [
    {
      "option": "Nom précis de l'option (pas générique)",
      "pros": ["Avantage spécifique et détaillé 1", "Avantage spécifique et détaillé 2"],
      "cons": ["Inconvénient spécifique et détaillé 1", "Inconvénient spécifique et détaillé 2"],
      "score": 85
    }
  ],
  "infoLinks": [
    {
      "title": "Titre du lien informatif",
      "url": "https://example.com",
      "description": "Description de la source"
    }
  ],
  "shoppingLinks": [
    {
      "title": "Titre du lien d'achat spécifique",
      "url": "https://domain.com/product-page",
      "description": "Page officielle du produit ou revendeur certifié"
    }
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

    // Ajout des données workspace si disponibles (mais seulement si pertinentes)
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
4. Des liens vers des sources fiables si applicable

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
      imageQuery: parsedResult.imageQuery || parsedResult.recommendation || 'decision analysis',
      breakdown: Array.isArray(parsedResult.breakdown) ? parsedResult.breakdown : [],
      infoLinks: Array.isArray(parsedResult.infoLinks) ? parsedResult.infoLinks : [],
      shoppingLinks: Array.isArray(parsedResult.shoppingLinks) ? parsedResult.shoppingLinks : [],
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
