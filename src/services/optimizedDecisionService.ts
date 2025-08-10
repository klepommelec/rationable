import { ICriterion, IResult, IBreakdownItem } from '@/types/decision';
import { UploadedFileInfo } from './fileUploadService';
import { searchWithPerplexity } from './perplexityService';
import { callOpenAiApi } from './openai';
import { makeClaudeDecision } from './claudeService';
import { detectQuestionType } from './questionTypeDetector';
import { generateContextualEmoji } from './contextualEmojiService';
import { 
  enrichFactualDescription, 
  improveDescription, 
  detectDilemmaContext 
} from './descriptionEnrichmentService';

// Fonction pour générer une description spécifique à la recommandation
const generateRecommendationDescription = async (
  winner: IBreakdownItem,
  allOptions: IBreakdownItem[],
  dilemma: string
): Promise<string> => {
  const otherOptions = allOptions.filter(opt => opt.option !== winner.option);
  
  const prompt = `Créez une description de recommandation pour cette décision:

DILEMME: "${dilemma}"
OPTION RECOMMANDÉE: "${winner.option}"
AVANTAGES: ${winner.pros.join(', ')}
INCONVÉNIENTS: ${winner.cons?.join(', ') || 'Aucun'}
SCORE: ${winner.score}

${otherOptions.length > 0 ? `AUTRES OPTIONS:
${otherOptions.map(opt => `- ${opt.option} (score: ${opt.score})`).join('\n')}` : ''}

Créez une description en 2-3 phrases qui:
1. Commence par "${winner.option} est recommandé car..."
2. Explique pourquoi cette option surpasse les autres
3. Mentionne les avantages clés spécifiques

Format: Description concise et factuelle.`;

  try {
    const response = await callOpenAiApi(prompt);
    return response.trim();
  } catch (error) {
    console.error('Erreur génération description recommandation:', error);
    return `${winner.option} est recommandé en raison de ses avantages significatifs: ${winner.pros.slice(0, 2).join(' et ')}.`;
  }
};

// Validation stricte des réponses factuelles
const validateFactualResponse = (text: string): { isValid: boolean; error?: string } => {
  if (!text) return { isValid: false, error: 'Réponse vide' };
  
  // Vérifier les noms génériques interdits (plus strict)
  const genericPatterns = [
    /\b(équipe\s*[a-z]|team\s*[a-z])\b/gi,
    /\b(joueur\s*[a-z]|player\s*[a-z])\b/gi,
    /\b(candidat\s*[a-z]|candidate\s*[a-z])\b/gi,
    /\b(option\s*[a-z]|choice\s*[a-z])\b/gi,
    /\b(personne\s*[a-z]|person\s*[a-z])\b/gi,
    /\b(entreprise\s*[a-z]|company\s*[a-z])\b/gi
  ];
  
  const hasGenericNames = genericPatterns.some(pattern => pattern.test(text));
  if (hasGenericNames) {
    return { isValid: false, error: 'Contient des noms génériques' };
  }
  
  // Vérifier si la réponse indique une incapacité à répondre
  const uncertaintyPatterns = [
    /je ne sais pas/i,
    /impossible de/i,
    /données non disponibles/i,
    /information non trouvée/i,
    /uncertain/i,
    /cannot determine/i
  ];
  
  const hasUncertainty = uncertaintyPatterns.some(pattern => pattern.test(text));
  if (hasUncertainty) {
    return { isValid: false, error: 'Réponse incertaine' };
  }
  
  return { isValid: true };
};

const cleanAIResponse = (text: string): string => {
  if (!text) return text;
  
  // Nettoyer et valider la réponse
  let cleaned = text
    .replace(/\s+/g, ' ')
    .trim();
  
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

// Génération de réponse factuelle avec Perplexity et système de retry/fallback
export const generateFactualAnswerWithPerplexity = async (
  dilemma: string,
  files?: UploadedFileInfo[],
  workspaceId?: string
): Promise<IResult> => {
  let attempt = 0;
  const maxAttempts = 3; // Augmenter à 3 tentatives
  
  while (attempt < maxAttempts) {
    try {
      attempt++;
      console.log(`🔍 Génération factuelle avec Perplexity (tentative ${attempt}/${maxAttempts})`);
      
      // Prompt ultra-strict selon la tentative
      const strictnessLevel = attempt === 1 ? 'NORMAL' : attempt === 2 ? 'STRICT' : 'ULTRA-STRICT';
      
      const enhancedPrompt = `${dilemma}

RÈGLES ${strictnessLevel} - ABSOLUMENT OBLIGATOIRE :
1. INTERDICTION TOTALE des noms génériques : JAMAIS "Joueur A", "Équipe X", "Candidat Y", "Option 1", etc.
2. SEULS des noms RÉELS et PRÉCIS sont acceptés : "Zaccharie Risacher", "Cooper Flagg", "Victor Wembanyama"
3. Si vous ne trouvez PAS le nom exact, écrivez EXACTEMENT : "Information non disponible"
4. Vérifiez l'année de la question : 2025 a eu lieu, 2026 est dans le futur
5. Réponse en 1 phrase maximum avec UNIQUEMENT le nom réel
6. Supprimez toutes les références [1][2][3]

${attempt > 1 ? 'ATTENTION : Tentative ' + attempt + ' - Soyez encore plus précis !' : ''}

CONTEXTE : Données réelles et vérifiées 2025`;

      const result = await searchWithPerplexity(enhancedPrompt);
      console.log(`📝 Réponse brute tentative ${attempt}:`, result.content);
      
      const validation = validateFactualResponse(result.content);
      
      if (validation.isValid) {
        console.log('✅ Réponse factuelle validée avec succès');
        
        // Enrichir la description factuelle
        const context = detectDilemmaContext(dilemma);
        const enrichedDescription = await enrichFactualDescription(
          dilemma, 
          result.content, 
          context.domain
        );
        
        return {
          recommendation: result.content.trim(),
          description: enrichedDescription,
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
      } else {
        console.warn(`⚠️ Tentative ${attempt} échouée - ${validation.error}`);
        console.warn(`📄 Contenu rejeté: "${result.content}"`);
        
        if (attempt === maxAttempts) {
          console.log('🔄 Échec de toutes les tentatives factuelles → Fallback vers comparative');
          const comparativeQuestion = `Analysez les candidats potentiels pour : ${dilemma}`;
          return await generateComparativeWithOpenAI(comparativeQuestion, [], files, workspaceId);
        }
      }
    } catch (error) {
      console.error(`❌ Erreur tentative ${attempt}:`, error);
      
      if (attempt === maxAttempts) {
        console.log('🔄 Fallback final vers mode comparatif après erreur');
        const comparativeQuestion = `Analysez les options pour : ${dilemma}`;
        return await generateComparativeWithOpenAI(comparativeQuestion, [], files, workspaceId);
      }
    }
  }
  
  throw new Error('Échec après toutes les tentatives');
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
  "description": "Analyse contextuelle spécifique à cette situation précise avec les enjeux particuliers de ce dilemme",
  "recommendationDescription": "Description spécifique expliquant pourquoi la première option est recommandée",
  "options": [
    {
      "name": "Option spécifique 1",
      "pros": ["Avantage détaillé et précis 1", "Avantage détaillé et précis 2"],
      "cons": ["Inconvénient détaillé et précis 1", "Inconvénient détaillé et précis 2"],
      "description": "Description unique et spécifique de cette option précise"
    }
  ]
}

INSTRUCTIONS CRITIQUES:
- Description générale : Soyez SPÉCIFIQUE au dilemme posé, pas de texte générique
- Noms d'options : Précis et directs (ex: "Toyota Corolla", "Bali", "Université Paris-Saclay")
- Pros/cons : Détaillés et factuels, pas de généralités
- Description par option : Unique et personnalisée pour chaque option
- INTERDICTION de phrases génériques comme "Le choix de X est une décision cruciale..."
- Concentrez-vous sur la SPÉCIFICITÉ et l'UTILITÉ de chaque information`;

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

    // Utiliser la description de recommandation ou la générer
    let finalDescription = parsedResponse.recommendationDescription;
    
    if (!finalDescription) {
      finalDescription = await generateRecommendationDescription(winner, breakdown, dilemma);
    }

    const result = {
      recommendation: winner.option,
      description: finalDescription,
      breakdown,
      resultType: 'comparative' as const,
      aiProvider: {
        provider,
        model: provider === 'claude' ? 'claude-sonnet-4-20250514' : 'gpt-4o-mini',
        success: true
      },
      dataFreshness: 'fresh' as const
    };

    // Améliorer la description si elle est toujours générique
    const improvedDescription = await improveDescription(
      result.description,
      dilemma,
      result
    );
    
    return {
      ...result,
      description: improvedDescription
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
  workspaceId?: string,
  forcedType?: 'factual' | 'comparative' | 'simple-choice'
): Promise<IResult> => {
  try {
    const questionType = forcedType ?? detectQuestionType(dilemma);
    
    console.log(`🎯 Type de question utilisé: ${questionType}${forcedType ? ' (forcé)' : ''}`);
    
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