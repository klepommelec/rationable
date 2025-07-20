
import { ICriterion, IResult, DEFAULT_CATEGORIES } from '@/types/decision';
import { UploadedFileInfo } from './fileUploadService';
import { AIProviderService } from './aiProviderService';
import { detectQuestionType } from './questionTypeDetector';

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

export const generateOptions = async (
  dilemma: string,
  criteria: ICriterion[],
  files?: UploadedFileInfo[],
  workspaceId?: string
): Promise<IResult> => {
  console.log('🔍 Generating options with Perplexity only');
  
  const aiService = AIProviderService.getInstance();
  const questionType = detectQuestionType(dilemma);
  
  console.log(`📊 Question type detected: ${questionType}`);
  
  let prompt: string;
  
  if (questionType === 'factual') {
    // Pour les questions factuelles : demander une réponse unique et précise
    prompt = `Question factuelle: "${dilemma}"

Fournissez une réponse factuelle précise et actualisée. Cette question a une réponse objective unique.

Répondez au format JSON exact suivant :
{
  "recommendation": "Réponse factuelle précise",
  "description": "Explication détaillée avec des faits récents et vérifiables",
  "breakdown": [
    {
      "option": "Réponse factuelle",
      "score": 100,
      "pros": ["Fait vérifié 1", "Fait vérifié 2", "Information récente"],
      "cons": [],
      "scores": {}
    }
  ]
}`;
  } else {
    // Pour les questions comparatives : maintenir l'approche actuelle
    prompt = `Dilemme: "${dilemma}"

Critères d'évaluation: ${criteria.map(c => c.name).join(', ')}

Analysez ce dilemme en utilisant des données récentes et actuelles. Fournissez une recommandation précise avec des noms réels, des faits concrets, et des informations à jour.

Répondez au format JSON exact suivant :
{
  "recommendation": "Titre de la recommandation",
  "description": "Description détaillée avec informations récentes",
  "breakdown": [
    {
      "option": "Option 1",
      "score": 85,
      "pros": ["Avantage 1", "Avantage 2"],
      "cons": ["Inconvénient 1"],
      "scores": {"critère1": 8, "critère2": 9}
    }
  ]
}`;
  }

  try {
    const response = await aiService.executeWithFallback({
      prompt,
      type: 'options',
      context: questionType === 'comparative' ? `Critères: ${criteria.map(c => c.name).join(', ')}` : 'Question factuelle',
      files
    });

    if (response.success && response.content) {
      const content = response.content.content || response.content.recommendation || '';
      
      console.log('📄 Processing Perplexity content for options...');
      
      let parsedResult: any = null;
      
      // 1. Essayer d'extraire le JSON complet du contenu
      try {
        const cleanContent = content
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .replace(/^\s*json\s*/i, '')
          .trim();
        
        const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonString = jsonMatch[0];
          parsedResult = JSON.parse(jsonString);
          console.log('✅ JSON extracted and parsed successfully');
        }
      } catch (e) {
        console.log('⚠️ Failed to parse JSON, trying text extraction...');
      }
      
      // 2. Si pas de JSON valide, extraire intelligemment du texte
      if (!parsedResult) {
        console.log('📝 Extracting information from text content...');
        
        let recommendation = questionType === 'factual' ? 
          'Réponse factuelle basée sur Perplexity' : 
          'Recommandation basée sur Perplexity';
        let description = content;
        
        const lines = content.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          const cleanLine = line.replace(/["{}\[\],]/g, '').trim();
          if (cleanLine.length > 10 && (
            cleanLine.toLowerCase().includes('recommandation') ||
            cleanLine.toLowerCase().includes('meilleur') ||
            cleanLine.toLowerCase().includes('choix') ||
            (cleanLine.includes(':') && cleanLine.split(':')[1]?.trim())
          )) {
            recommendation = cleanLine.split(':').pop()?.trim() || cleanLine;
            break;
          }
        }
        
        if (recommendation.includes('{') || recommendation.includes('"')) {
          const recMatch = content.match(/"recommendation":\s*"([^"]+)"/);
          if (recMatch) {
            recommendation = recMatch[1];
          } else {
            recommendation = questionType === 'factual' ? 
              'Réponse factuelle avec Perplexity' : 
              'Analyse de décision avec Perplexity';
          }
        }
        
        if (description.includes('{') && description.includes('}')) {
          const descMatch = content.match(/"description":\s*"([^"]+)"/);
          if (descMatch) {
            description = descMatch[1];
          } else {
            const readableText = content
              .replace(/[\{\}"\[\],]/g, ' ')
              .replace(/\s+/g, ' ')
              .trim()
              .split(' ')
              .filter(word => word.length > 2)
              .slice(0, 50)
              .join(' ');
            description = readableText || 'Analyse basée sur des données récentes de Perplexity';
          }
        }
        
        parsedResult = {
          recommendation,
          description,
          breakdown: [
            {
              option: recommendation,
              score: questionType === 'factual' ? 100 : 85,
              pros: questionType === 'factual' ? 
                ['Réponse factuelle vérifiée', 'Données récentes'] : 
                ['Analyse basée sur des données récentes'],
              cons: questionType === 'factual' ? [] : ['Format de réponse simplifié'],
              scores: {}
            }
          ]
        };
      }

      const result: IResult = {
        recommendation: parsedResult.recommendation || content.split('\n')[0] || 'Recommandation',
        description: parsedResult.description || content,
        breakdown: parsedResult.breakdown || [],
        resultType: questionType, // Nouveau champ
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
    
    throw new Error('Failed to generate options');
  } catch (error) {
    console.error('Error generating options:', error);
    throw error;
  }
};

// Réexporter pour compatibilité
export const generateCriteriaWithFallback = generateCriteriaOnly;
export const generateOptionsWithFallback = generateOptions;
export const generateCriteriaOnlyWithFallback = generateCriteriaOnly;
export const generateOptionsWithMultiProvider = generateOptions;
