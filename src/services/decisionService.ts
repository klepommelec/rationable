
import { ICriterion, IResult, DEFAULT_CATEGORIES } from '@/types/decision';
import { UploadedFileInfo } from './fileUploadService';
import { AIProviderService } from './aiProviderService';

export const generateCriteriaOnly = async (
  dilemma: string,
  files?: UploadedFileInfo[]
): Promise<ICriterion[]> => {
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
      // Extraire le JSON de la réponse
      const jsonMatch = response.content.content?.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
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
  files?: UploadedFileInfo[]
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
      const result = {
        recommendation: response.content.recommendation || response.content.content,
        description: response.content.description || response.content.content,
        breakdown: response.content.breakdown || [],
        realTimeData: {
          hasRealTimeData: true,
          timestamp: response.content.timestamp,
          sourcesCount: response.content.sources?.length || 0,
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
