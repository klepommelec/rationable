import { ICriterion, IResult } from '@/types/decision';
import { UploadedFileInfo } from './fileUploadService';
import { searchWithPerplexity } from './perplexityService';
import { callOpenAiApi } from './openai';
import { makeClaudeDecision } from './claudeService';
import { detectQuestionType } from './questionTypeDetector';
import { generateContextualEmoji } from './contextualEmojiService';

const cleanAIResponse = (text: string): string => {
  if (!text) return text;
  
  // Nettoyer et valider la réponse
  let cleaned = text
    .replace(/\s+/g, ' ')
    .trim();
  
  // Vérifier s'il y a des noms génériques interdits
  const genericNames = [
    /\b(équipe\s*[a-z]|team\s*[a-z])\b/gi,
    /\b(joueur\s*[a-z]|player\s*[a-z])\b/gi,
    /\b(candidat\s*[a-z]|candidate\s*[a-z])\b/gi,
    /\b(option\s*[a-z]|choice\s*[a-z])\b/gi
  ];
  
  const hasGenericNames = genericNames.some(pattern => pattern.test(cleaned));
  
  if (hasGenericNames) {
    console.warn('⚠️ Réponse contient des noms génériques:', cleaned);
    // Marquer la réponse comme nécessitant une amélioration
    cleaned = `[RÉPONSE À AMÉLIORER] ${cleaned}`;
  }
  
  return cleaned;
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
    
    // Optimiser le prompt selon le type de question
    let optimizedPrompt = dilemma;
    
    // Détecter le contexte pour adapter le prompt
    if (/\b(draft|repêchage|premier choix|first pick)\b/i.test(dilemma)) {
      optimizedPrompt += `\n\nCONTEXTE SPORT 2024-2025 - Utilisez uniquement des données récentes et des noms réels de joueurs/équipes`;
    } else if (/\b(président|election|usa|états-unis)\b/i.test(dilemma)) {
      optimizedPrompt += `\n\nCONTEXTE POLITIQUE 2024-2025 - Informations électorales et gouvernementales actuelles`;
    } else if (/\b(champion|record|médaille)\b/i.test(dilemma)) {
      optimizedPrompt += `\n\nCONTEXTE SPORT 2024-2025 - Champions et records actuels uniquement`;
    }
    
    const prompt = `${optimizedPrompt}

IMPÉRATIF - Répondez avec des NOMS RÉELS et des FAITS PRÉCIS :
- AUCUN nom générique comme "Équipe A", "Joueur A", "Candidat X"
- Seulement des noms réels de personnes, équipes, entreprises
- Informations factuelles 2024-2025 uniquement
- Réponse directe en 1-2 phrases maximum
- Pas de références numériques [1][2][3]`;

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
      "pros": ["Avantage détaillé 1", "Avantage détaillé 2"],
      "cons": ["Inconvénient détaillé 1", "Inconvénient détaillé 2"],
      "description": "Description complète de l'option"
    }
  ]
}

INSTRUCTIONS CRITIQUES:
- Le nom de l'option doit être direct sans préfixe "Option 1:" ou "Option 2:"
- Ne plus inclure de scores - supprimez la propriété "scores" complètement
- Soyez précis et détaillé dans les avantages/inconvénients
- Concentrez-vous sur la qualité des pros/cons plutôt que sur les scores`;

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
    
    // Convertir les options au format breakdown (sans scores)
    const breakdown = parsedResponse.options.map((option: any, index: number) => ({
      option: option.name,
      pros: option.pros,
      cons: option.cons,
      score: 0 // Plus de calcul de score
    }));
    
    // Le premier option est considéré comme la recommandation
    const winner = breakdown[0] || breakdown[0];

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