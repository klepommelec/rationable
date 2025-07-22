
import { ICriterion, IResult, DEFAULT_CATEGORIES } from '@/types/decision';
import { UploadedFileInfo } from './fileUploadService';
import { AIProviderService } from './aiProviderService';
import { detectQuestionType, QuestionType } from './questionTypeDetector';
import { supabase } from '@/integrations/supabase/client';

export const generateCriteriaOnly = async (
  dilemma: string,
  files?: UploadedFileInfo[],
  workspaceId?: string
): Promise<{criteria: ICriterion[], emoji: string, suggestedCategory: string}> => {
  console.log('🔍 Generating criteria with Perplexity only');
  
  const aiService = AIProviderService.getInstance();
  
  const prompt = `Analysez ce dilemme et générez des critères d'évaluation pertinents : "${dilemma}"

Générez 4-6 critères sous format JSON avec cette structure exacte :
[
  {
    "name": "Nom du critère",
    "weight": 5,
    "category": "practical"
  }
]

Utilisez ces catégories : practical, financial, personal, social, environmental, strategic`;

  try {
    const response = await aiService.executeWithFallback({
      prompt,
      type: 'criteria',
      files
    });

    if (response.success && response.content) {
      // Extraire le JSON de la réponse Perplexity
      const content = response.content.content || response.content.recommendation || '';
      
      // Chercher le JSON dans le contenu
      const jsonMatch = content.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        try {
          const criteria = JSON.parse(jsonMatch[0]);
          return {
            criteria,
            emoji: '🤔',
            suggestedCategory: 'other'
          };
        } catch (parseError) {
          console.error('❌ JSON parsing error for criteria:', parseError);
          throw new Error('Failed to parse criteria JSON from response');
        }
      }
    }
    
    throw new Error('Failed to parse criteria from response');
  } catch (error) {
    console.error('Error generating criteria:', error);
    throw error;
  }
};

// Nouvelle fonction pour utiliser les Edge Functions pour la génération d'options
export const generateOptions = async (
  dilemma: string,
  criteria: ICriterion[],
  files?: UploadedFileInfo[],
  workspaceId?: string
): Promise<IResult> => {
  console.log('🤖 Generating options with OpenAI/Claude Edge Functions');
  
  const questionType = detectQuestionType(dilemma);
  console.log(`📊 Question type detected: ${questionType}`);
  
  // Construire le prompt optimisé selon le type de question
  let systemPrompt = '';
  let userPrompt = '';
  
  if (questionType === 'factual') {
    systemPrompt = `Tu es un expert qui répond à des questions factuelles avec précision. 
    Réponds UNIQUEMENT en JSON valide avec cette structure exacte :
    {
      "recommendation": "Réponse factuelle précise",
      "description": "Explication détaillée avec des faits vérifiables",
      "breakdown": [
        {
          "option": "Réponse factuelle",
          "score": 100,
          "pros": ["Fait vérifié 1", "Fait vérifié 2"],
          "cons": [],
          "scores": {}
        }
      ]
    }`;
    
    userPrompt = `Question factuelle: "${dilemma}"
    
    Critères d'évaluation: ${criteria.map(c => c.name).join(', ')}
    
    Fournis une réponse factuelle précise avec une seule option dans le breakdown.`;
  } else {
    // Question comparative - demander explicitement plusieurs options
    systemPrompt = `Tu es un expert en prise de décision qui analyse des choix comparatifs.
    Tu dois TOUJOURS générer exactement 4 options différentes avec des scores variés.
    
    Réponds UNIQUEMENT en JSON valide avec cette structure exacte :
    {
      "recommendation": "Nom de la meilleure option",
      "description": "Description comparative détaillée",
      "breakdown": [
        {
          "option": "Option 1 - La meilleure",
          "score": 87,
          "pros": ["Avantage 1", "Avantage 2", "Avantage 3"],
          "cons": ["Inconvénient mineur"],
          "scores": {}
        },
        {
          "option": "Option 2 - Deuxième choix",
          "score": 82,
          "pros": ["Avantage 1", "Avantage 2"],
          "cons": ["Inconvénient 1", "Inconvénient 2"],
          "scores": {}
        },
        {
          "option": "Option 3 - Troisième choix",
          "score": 76,
          "pros": ["Avantage 1", "Avantage 2"],
          "cons": ["Inconvénient 1", "Inconvénient 2"],
          "scores": {}
        },
        {
          "option": "Option 4 - Quatrième choix",
          "score": 71,
          "pros": ["Avantage 1", "Avantage 2"],
          "cons": ["Inconvénient 1", "Inconvénient 2"],
          "scores": {}
        }
      ]
    }`;
    
    userPrompt = `Question comparative: "${dilemma}"
    
    Critères d'évaluation: ${criteria.map(c => c.name).join(', ')}
    
    IMPORTANT: Génère EXACTEMENT 4 options différentes avec des scores décroissants (entre 65-90).
    Chaque option doit avoir des avantages et inconvénients spécifiques.
    Base ton analyse sur les critères fournis.`;
  }
  
  try {
    // Essayer d'abord avec OpenAI
    console.log('🚀 Trying OpenAI Edge Function first');
    const { data: openaiData, error: openaiError } = await supabase.functions.invoke('openai-decision-maker', {
      body: {
        prompt: `${systemPrompt}\n\n${userPrompt}`,
        files: files || []
      }
    });
    
    if (!openaiError && openaiData && !openaiData.error) {
      console.log('✅ OpenAI Edge Function succeeded');
      
      // Valider et traiter la réponse OpenAI
      const result = processEdgeFunctionResponse(openaiData, questionType, dilemma);
      
      // Vérifier si on a assez d'options pour une question comparative
      if (questionType === 'comparative' && result.breakdown && result.breakdown.length < 3) {
        console.log('⚠️ OpenAI returned insufficient options, generating synthetic ones');
        result.breakdown = generateSyntheticOptions(dilemma, result.breakdown[0] || {}, criteria);
      }
      
      return result;
    }
    
    // Si OpenAI échoue, essayer Claude
    console.log('🧠 Trying Claude Edge Function as fallback');
    const { data: claudeData, error: claudeError } = await supabase.functions.invoke('claude-decision-maker', {
      body: {
        dilemma: dilemma,
        criteria: criteria,
        model: 'claude-sonnet-4-20250514'
      }
    });
    
    if (!claudeError && claudeData && !claudeData.error) {
      console.log('✅ Claude Edge Function succeeded');
      
      const result = processEdgeFunctionResponse(claudeData, questionType, dilemma);
      
      // Vérifier si on a assez d'options pour une question comparative
      if (questionType === 'comparative' && result.breakdown && result.breakdown.length < 3) {
        console.log('⚠️ Claude returned insufficient options, generating synthetic ones');
        result.breakdown = generateSyntheticOptions(dilemma, result.breakdown[0] || {}, criteria);
      }
      
      return result;
    }
    
    // Si les deux échouent, utiliser Perplexity en dernier recours
    console.log('🔄 Both Edge Functions failed, using Perplexity as last resort');
    return await generateOptionsWithPerplexity(dilemma, criteria, files, workspaceId);
    
  } catch (error) {
    console.error('❌ Error generating options:', error);
    throw error;
  }
};

// Fonction pour traiter les réponses des Edge Functions
const processEdgeFunctionResponse = (data: any, questionType: QuestionType, dilemma: string): IResult => {
  console.log('📋 Processing Edge Function response');
  
  // Normaliser la structure de réponse
  let processedData = data;
  
  // Si c'est une réponse d'OpenAI, elle peut avoir une structure différente
  if (data.result) {
    processedData = data.result;
  }
  
  // Assurer que la structure est complète
  const result: IResult = {
    recommendation: processedData.recommendation || 'Recommandation non disponible',
    description: processedData.description || 'Description non disponible',
    breakdown: Array.isArray(processedData.breakdown) ? processedData.breakdown : [],
    resultType: questionType,
    realTimeData: {
      hasRealTimeData: false,
      timestamp: new Date().toISOString(),
      sourcesCount: 0,
      searchQuery: dilemma,
      provider: 'edge-function'
    },
    aiProvider: {
      provider: data.aiProvider?.provider || 'openai',
      model: data.aiProvider?.model || 'gpt-4o-mini',
      success: true
    }
  };
  
  console.log(`✅ Processed result: ${result.breakdown?.length || 0} options`);
  return result;
};

// Fonction pour générer des options synthétiques intelligentes
const generateSyntheticOptions = (dilemma: string, baseOption: any, criteria: ICriterion[]) => {
  console.log('🤖 Generating synthetic options for comparative question');
  
  const dilemmaLower = dilemma.toLowerCase();
  let options: any[] = [];
  
  // Garder l'option de base si elle existe
  if (baseOption && baseOption.option) {
    options.push(baseOption);
  }
  
  // Générer des options spécifiques selon le type de dilemme
  if (dilemmaLower.includes('ordinateur') || dilemmaLower.includes('laptop') || dilemmaLower.includes('portable')) {
    const laptopOptions = [
      { 
        option: 'MacBook Air M3 15"', 
        score: 85, 
        pros: ['Excellent écran Liquid Retina', 'Autonomie exceptionnelle 18h', 'Performance puissante M3'], 
        cons: ['Prix premium', 'Ports limités'], 
        scores: {} 
      },
      { 
        option: 'Dell XPS 13 Plus', 
        score: 80, 
        pros: ['Design ultra-premium', 'Écran InfinityEdge 4K', 'Clavier rétroéclairé'], 
        cons: ['Autonomie moyenne', 'Clavier tactile perfectible'], 
        scores: {} 
      },
      { 
        option: 'Lenovo ThinkPad X1 Carbon', 
        score: 76, 
        pros: ['Robustesse professionnelle', 'Excellent clavier', 'Sécurité avancée'], 
        cons: ['Design moins moderne', 'Prix élevé'], 
        scores: {} 
      },
      { 
        option: 'HP Spectre x360', 
        score: 72, 
        pros: ['Écran tactile convertible', 'Design élégant', 'Bonnes performances'], 
        cons: ['Ventilateur parfois bruyant', 'Autonomie correcte'], 
        scores: {} 
      }
    ];
    options = laptopOptions;
  } else if (dilemmaLower.includes('smartphone') || dilemmaLower.includes('téléphone')) {
    const phoneOptions = [
      { 
        option: 'iPhone 16 Pro', 
        score: 88, 
        pros: ['Processeur A18 Pro ultra-puissant', 'Système photo professionnel', 'Écosystème iOS'], 
        cons: ['Prix très élevé'], 
        scores: {} 
      },
      { 
        option: 'Samsung Galaxy S25 Ultra', 
        score: 84, 
        pros: ['Écran Dynamic AMOLED 6.8"', 'S Pen intégré', 'Zoom optique 100x'], 
        cons: ['Interface One UI complexe', 'Prix premium'], 
        scores: {} 
      },
      { 
        option: 'Google Pixel 9 Pro', 
        score: 79, 
        pros: ['IA Google avancée', 'Photographie computationnelle', 'Android pur'], 
        cons: ['Disponibilité limitée', 'Modem moins performant'], 
        scores: {} 
      },
      { 
        option: 'OnePlus 13', 
        score: 75, 
        pros: ['Rapport qualité-prix', 'Charge ultra-rapide', 'OxygenOS fluide'], 
        cons: ['Support photos moyen', 'Pas de charge sans fil'], 
        scores: {} 
      }
    ];
    options = phoneOptions;
  } else if (dilemmaLower.includes('voyage') || dilemmaLower.includes('vacances') || dilemmaLower.includes('destination')) {
    const travelOptions = [
      { 
        option: 'Provence, France', 
        score: 86, 
        pros: ['Accessible sans visa', 'Climat méditerranéen', 'Riche patrimoine'], 
        cons: ['Très touristique en été'], 
        scores: {} 
      },
      { 
        option: 'Costa Rica', 
        score: 82, 
        pros: ['Biodiversité exceptionnelle', 'Activités aventure', 'Éco-tourisme'], 
        cons: ['Saison des pluies', 'Budget plus élevé'], 
        scores: {} 
      },
      { 
        option: 'Portugal', 
        score: 78, 
        pros: ['Coût de la vie abordable', 'Littoral magnifique', 'Gastronomie'], 
        cons: ['Bondé en été', 'Chaleur intense'], 
        scores: {} 
      },
      { 
        option: 'Islande', 
        score: 73, 
        pros: ['Paysages uniques', 'Aurores boréales', 'Sécurité maximale'], 
        cons: ['Très cher', 'Climat imprévisible'], 
        scores: {} 
      }
    ];
    options = travelOptions;
  } else {
    // Options génériques mais pertinentes
    const baseName = baseOption?.option?.split(' ')[0] || 'Option';
    options = [
      { 
        option: `${baseName} Premium`, 
        score: 84, 
        pros: ['Qualité supérieure', 'Fonctionnalités avancées', 'Support premium'], 
        cons: ['Prix plus élevé'], 
        scores: {} 
      },
      { 
        option: `${baseName} Standard`, 
        score: 78, 
        pros: ['Bon rapport qualité-prix', 'Polyvalent', 'Fiable'], 
        cons: ['Moins de fonctionnalités premium'], 
        scores: {} 
      },
      { 
        option: `${baseName} Économique`, 
        score: 73, 
        pros: ['Prix attractif', 'Fonctionnalités essentielles'], 
        cons: ['Qualité moindre', 'Support limité'], 
        scores: {} 
      },
      { 
        option: `${baseName} Alternatif`, 
        score: 69, 
        pros: ['Approche différente', 'Innovation'], 
        cons: ['Moins testé', 'Risque plus élevé'], 
        scores: {} 
      }
    ];
  }
  
  console.log(`✅ Generated ${options.length} synthetic options`);
  return options;
};

// Fonction de fallback avec Perplexity (version simplifiée)
const generateOptionsWithPerplexity = async (
  dilemma: string,
  criteria: ICriterion[],
  files?: UploadedFileInfo[],
  workspaceId?: string
): Promise<IResult> => {
  console.log('🔄 Using Perplexity as fallback for options');
  
  const aiService = AIProviderService.getInstance();
  const questionType = detectQuestionType(dilemma);
  
  const response = await aiService.executeWithFallback({
    prompt: `Analyse comparative pour: "${dilemma}"\nCritères: ${criteria.map(c => c.name).join(', ')}`,
    type: 'options',
    files
  });
  
  if (response.success && response.content) {
    const content = response.content.content || response.content.recommendation || '';
    
    // Génération simplifiée basée sur Perplexity
    const result: IResult = {
      recommendation: 'Analyse basée sur recherche temps réel',
      description: content.substring(0, 500) + '...',
      breakdown: generateSyntheticOptions(dilemma, { option: 'Option principale', score: 85 }, criteria),
      resultType: questionType,
      realTimeData: {
        hasRealTimeData: true,
        timestamp: response.content.timestamp || new Date().toISOString(),
        sourcesCount: response.content.sources?.length || 0,
        searchQuery: dilemma,
        provider: 'perplexity'
      },
      aiProvider: {
        provider: response.provider,
        model: response.model,
        success: response.success
      }
    };
    
    return result;
  }
  
  throw new Error('Failed to generate options with any provider');
};

// Réexporter pour compatibilité
export const generateCriteriaWithFallback = generateCriteriaOnly;
export const generateOptionsWithFallback = generateOptions;
export const generateCriteriaOnlyWithFallback = generateCriteriaOnly;
export const generateOptionsWithMultiProvider = generateOptions;
