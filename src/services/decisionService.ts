
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
      
      // Chercher le JSON dans le contenu - parsing plus robuste
      let parsedResult: any = {};
      
      // Essayer différents patterns de JSON
      const jsonPatterns = [
        /```json\s*(\{[\s\S]*?\})\s*```/,  // JSON dans des blocs de code
        /\{[\s\S]*?\}/,                     // JSON simple
        /(\{[\s\S]*?\})(?=\n\n|\n$|$)/     // JSON jusqu'à une ligne vide
      ];
      
      let jsonFound = false;
      
      for (const pattern of jsonPatterns) {
        const match = content.match(pattern);
        if (match) {
          try {
            const jsonString = match[1] || match[0];
            // Nettoyer le JSON avant parsing
            const cleanedJson = jsonString
              .replace(/,\s*}/g, '}')           // Supprimer les virgules trailing
              .replace(/,\s*]/g, ']')           // Supprimer les virgules trailing dans arrays
              .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Supprimer caractères de contrôle
              .trim();
            
            parsedResult = JSON.parse(cleanedJson);
            jsonFound = true;
            console.log('✅ JSON parsed successfully with pattern:', pattern.source);
            break;
          } catch (parseError) {
            console.log('❌ Failed to parse with pattern:', pattern.source, parseError);
            continue;
          }
        }
      }
      
      if (!jsonFound) {
        console.log('⚠️ No valid JSON found, using content as fallback');
        // Fallback: extraire des informations du texte brut
        const lines = content.split('\n').filter(line => line.trim());
        parsedResult = {
          recommendation: lines[0] || 'Recommandation basée sur Perplexity',
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
