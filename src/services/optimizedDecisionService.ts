import { ICriterion, IResult } from '@/types/decision';
import { UploadedFileInfo } from './fileUploadService';
import { searchWithPerplexity } from './perplexityService';
import { callOpenAiApi } from './openai';
import { makeClaudeDecision } from './claudeService';
import { detectQuestionType } from './questionTypeDetector';
import { generateContextualEmoji } from './contextualEmojiService';

const cleanAIResponse = (text: string): string => {
  if (!text) return text;
  return text.replace(/\s+/g, ' ').trim();
};

// Génération des critères avec Perplexity
export const generateCriteriaWithPerplexity = async (
  dilemma: string, 
  files?: UploadedFileInfo[], 
  workspaceId?: string
): Promise<{ emoji: string, criteria: string[], suggestedCategory: string, provider: string }> => {
  try {
    console.log('🔍 Génération des critères avec Perplexity');
    
    const prompt = `Analysez cette question et générez 4-6 critères de décision pertinents :

"${dilemma}"

Répondez UNIQUEMENT avec un JSON dans ce format exact :
{
  "criteria": ["critère 1", "critère 2", "critère 3", "critère 4"],
  "category": "personnelle/professionnelle/achat/voyage/autre"
}`;

    const result = await searchWithPerplexity(prompt);
    const content = cleanAIResponse(result.content);
    
    // Extraire le JSON de la réponse
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Format de réponse invalide');
    }
    
    const parsedResponse = JSON.parse(jsonMatch[0]);
    const emoji = generateContextualEmoji(dilemma);
    
    return {
      emoji,
      criteria: parsedResponse.criteria || [],
      suggestedCategory: parsedResponse.category || 'autre',
      provider: 'perplexity'
    };
  } catch (error) {
    console.error('❌ Erreur génération critères Perplexity:', error);
    throw error;
  }
};

// Génération de réponse factuelle avec Perplexity
export const generateFactualAnswerWithPerplexity = async (
  dilemma: string,
  files?: UploadedFileInfo[],
  workspaceId?: string
): Promise<IResult> => {
  try {
    console.log('🔍 Génération de réponse factuelle avec Perplexity');
    
    const prompt = `Vous devez répondre à cette question avec une réponse factuelle DIRECTE et PRÉCISE :

"${dilemma}"

INSTRUCTIONS CRITIQUES :
- Donnez la réponse factuelle exacte sans introduire d'options ou d'alternatives
- Répondez par le nom, le fait, la date, le chiffre ou l'information demandée
- Utilisez des sources fiables et récentes
- Si c'est une question sur une personne : donnez son nom complet et sa fonction
- Si c'est une question sur un événement récent : donnez la date et les détails précis
- Ne proposez PAS plusieurs options - une seule réponse factuelle

Format attendu : Réponse directe suivie des détails et sources.`;

    const result = await searchWithPerplexity(prompt);
    
    return {
      recommendation: '',
      description: cleanAIResponse(result.content),
      breakdown: [],
      resultType: 'factual',
      realTimeData: {
        hasRealTimeData: true,
        timestamp: new Date().toISOString(),
        sourcesCount: result.sources.length,
        provider: 'perplexity',
        sources: result.sources
      },
      dataFreshness: 'very-fresh'
    };
  } catch (error) {
    console.error('❌ Erreur génération réponse factuelle:', error);
    throw error;
  }
};

// Génération d'options comparatives avec OpenAI/Claude
export const generateComparativeWithOpenAI = async (
  dilemma: string,
  criteria: ICriterion[],
  files?: UploadedFileInfo[],
  workspaceId?: string
): Promise<IResult> => {
  try {
    console.log('🤖 Génération comparative avec OpenAI/Claude');
    
    const prompt = `Analysez cette décision et générez 3-4 options détaillées :

DILEMME: "${dilemma}"

CRITÈRES À ÉVALUER:
${criteria.map((c, i) => `${i + 1}. ${c.name}`).join('\n')}

Répondez avec un JSON dans ce format exact :
{
  "description": "Description détaillée de 3-5 lignes expliquant le contexte et les enjeux",
  "options": [
    {
      "name": "iPhone 15 Pro Max",
      "scores": [85, 78, 92, 88],
      "pros": ["Avantage détaillé 1", "Avantage détaillé 2"],
      "cons": ["Inconvénient détaillé 1", "Inconvénient détaillé 2"],
      "description": "Description complète de l'option"
    }
  ]
}

INSTRUCTIONS CRITIQUES:
- Le nom de l'option doit être direct sans préfixe "Option 1:" ou "Option 2:"
- Les scores doivent être sur 100 (0-100) pour chaque critère (total ${criteria.length} scores)
- Visez des scores réalistes entre 70-95 pour des bonnes options
- Soyez précis et détaillé dans les avantages/inconvénients
- Chaque option doit avoir exactement ${criteria.length} scores`;

    // Essayer OpenAI en premier, puis Claude en fallback
    let apiResult;
    let provider = 'openai';
    
    try {
      apiResult = await callOpenAiApi(prompt, files);
    } catch (openaiError) {
      console.log('🔄 Fallback vers Claude');
      apiResult = await makeClaudeDecision({
        dilemma,
        criteria,
        model: 'claude-sonnet-4-20250514'
      });
      provider = 'claude';
    }

    // Si c'est déjà un objet IResult de Claude, le retourner directement
    if (apiResult.breakdown && Array.isArray(apiResult.breakdown)) {
      return {
        ...apiResult,
        resultType: 'comparative',
        aiProvider: {
          provider,
          model: provider === 'claude' ? 'claude-sonnet-4-20250514' : 'gpt-4o-mini',
          success: true
        }
      };
    }

    // Sinon, parser la réponse OpenAI
    const content = typeof apiResult === 'string' ? apiResult : apiResult.content || JSON.stringify(apiResult);
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('Format de réponse invalide');
    }
    
    const parsedResponse = JSON.parse(jsonMatch[0]);
    
    // Convertir les options au format breakdown
    const breakdown = parsedResponse.options.map((option: any, index: number) => ({
      option: option.name,
      pros: option.pros,
      cons: option.cons,
      score: option.scores.reduce((sum: number, score: number) => sum + score, 0)
    }));
    
    const winner = breakdown.reduce((max: any, option: any) => 
      option.score > max.score ? option : max
    );

    return {
      recommendation: winner.option,
      description: cleanAIResponse(parsedResponse.description),
      breakdown,
      resultType: 'comparative',
      aiProvider: {
        provider,
        model: provider === 'claude' ? 'claude-sonnet-4-20250514' : 'gpt-4o-mini',
        success: true
      },
      dataFreshness: 'fresh'
    };
  } catch (error) {
    console.error('❌ Erreur génération comparative:', error);
    throw error;
  }
};

// Service principal optimisé
export const generateOptimizedDecision = async (
  dilemma: string,
  criteria: ICriterion[],
  files?: UploadedFileInfo[],
  workspaceId?: string
): Promise<IResult> => {
  try {
    const questionType = detectQuestionType(dilemma);
    
    console.log(`🎯 Type de question détecté: ${questionType}`);
    
    if (questionType === 'factual') {
      return await generateFactualAnswerWithPerplexity(dilemma, files, workspaceId);
    } else {
      return await generateComparativeWithOpenAI(dilemma, criteria, files, workspaceId);
    }
  } catch (error) {
    console.error('❌ Erreur service optimisé:', error);
    throw error;
  }
};