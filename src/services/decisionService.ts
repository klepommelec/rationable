
import { ICriterion, IResult, DEFAULT_CATEGORIES } from '@/types/decision';
import { UploadedFileInfo } from './fileUploadService';
import { AIProviderService } from './aiProviderService';

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
  
  const prompt = `Dilemme: "${dilemma}"

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

  try {
    const response = await aiService.executeWithFallback({
      prompt,
      type: 'options',
      context: `Critères: ${criteria.map(c => c.name).join(', ')}`,
      files
    });

    if (response.success && response.content) {
      const content = response.content.content || response.content.recommendation || '';
      
      // Chercher le JSON dans le contenu
      const jsonMatch = content.match(/\{[\s\S]*?\}/);
      let parsedResult: any = {};
      
      if (jsonMatch) {
        try {
          parsedResult = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
          console.error('❌ JSON parsing error for options:', parseError);
          // Fallback: utiliser le contenu brut
          parsedResult = {
            recommendation: content.split('\n')[0] || 'Recommandation basée sur Perplexity',
            description: content,
            breakdown: []
          };
        }
      } else {
        // Pas de JSON trouvé, utiliser le contenu brut
        parsedResult = {
          recommendation: content.split('\n')[0] || 'Recommandation basée sur Perplexity',
          description: content,
          breakdown: []
        };
      }

      const result = {
        recommendation: parsedResult.recommendation || content.split('\n')[0] || 'Recommandation',
        description: parsedResult.description || content,
        breakdown: parsedResult.breakdown || [],
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
