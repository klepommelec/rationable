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

// Détection de questions nécessitant des listes complètes
const detectListQuestion = (dilemma: string): boolean => {
  const listKeywords = [
    'quelles expositions',
    'quels événements', 
    'que puis-je visiter',
    'quelles options',
    'que faire',
    'où aller',
    'quoi voir',
    'expositions temporaires',
    'événements en cours',
    'activités disponibles'
  ];
  
  return listKeywords.some(keyword => 
    dilemma.toLowerCase().includes(keyword.toLowerCase())
  );
};

const cleanAIResponse = (text: string): string => {
  if (!text) return text;
  
  // Nettoyer et valider la réponse
  let cleaned = text
    .replace(/\s+/g, ' ')
    .trim();
  
  return cleaned;
};

// Fonction pour parser une réponse Perplexity et extraire des options multiples
const parseMultipleItemsFromPerplexity = (content: string, dilemma: string): { recommendation: string; breakdown: IBreakdownItem[] } => {
  // Patrons de détection d'éléments multiples
  const patterns = [
    // Pattern pour listes numérotées: "1. Exposition A", "2. Exposition B"
    /(?:^|\n)\d+\.\s*(.+?)(?=\n\d+\.|$)/gs,
    // Pattern pour listes à puces: "- Exposition A", "• Exposition B"  
    /(?:^|\n)[-•*]\s*(.+?)(?=\n[-•*]|$)/gs,
    // Pattern pour noms propres répétés (expositions, musées, etc.)
    /(?:^|\n)([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ][^.\n]{20,}?)(?=\n[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ]|$)/gs
  ];
  
  let items: string[] = [];
  
  // Essayer chaque pattern
  for (const pattern of patterns) {
    const matches = Array.from(content.matchAll(pattern));
    if (matches.length >= 2) { // Au moins 2 éléments trouvés
      items = matches.map(match => match[1].trim()).filter(item => item.length > 10);
      break;
    }
  }
  
  // Si aucun pattern ne fonctionne, essayer de diviser par phrases longues
  if (items.length < 2) {
    const sentences = content.split(/[.!?]\s+/).filter(s => s.length > 30);
    if (sentences.length >= 2) {
      items = sentences.slice(0, 5); // Max 5 options
    }
  }
  
  // Si toujours pas d'éléments multiples, retourner format simple
  if (items.length < 2) {
    return {
      recommendation: content,
      breakdown: []
    };
  }
  
  // Créer des IBreakdownItem pour chaque élément trouvé
  const breakdown: IBreakdownItem[] = items.slice(0, 5).map((item, index) => ({
    option: extractTitle(item),
    pros: extractPositives(item),
    cons: [], // Perplexity ne fournit généralement pas de cons pour les listes factuelles
    score: 90 - (index * 5) // Score décroissant pour l'ordre
  }));
  
  // La première option devient la recommandation
  const recommendation = items[0];
  
  return { recommendation, breakdown };
};

// Extraire le titre/nom principal d'un élément
const extractTitle = (item: string): string => {
  // Chercher un titre entre guillemets ou en début de phrase
  const titleMatch = item.match(/^["\']?([^"'\n(]{3,50})["\']?/);
  if (titleMatch) {
    return titleMatch[1].trim();
  }
  
  // Prendre les premiers mots jusqu'à une date ou parenthèse
  const shortMatch = item.match(/^([^()\n]{3,50})(?:\s*\(|$)/);
  if (shortMatch) {
    return shortMatch[1].trim();
  }
  
  // Fallback: premiers 50 caractères
  return item.substring(0, 50).trim();
};

// Extraire les aspects positifs d'un élément
const extractPositives = (item: string): string[] => {
  const positives: string[] = [];
  
  // Chercher des dates
  const dateMatch = item.match(/(\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}\s+(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)|\d{4})/i);
  if (dateMatch) {
    positives.push(`Disponible ${dateMatch[1]}`);
  }
  
  // Chercher des lieux
  const locationMatch = item.match(/(musée|galerie|centre|salle|lieu|espace)\s+([A-Z][a-z\s]+)/i);
  if (locationMatch) {
    positives.push(`Lieu: ${locationMatch[2].trim()}`);
  }
  
  // Ajouter une description générique si pas d'éléments trouvés
  if (positives.length === 0) {
    positives.push("Option recommandée actuellement");
  }
  
  return positives;
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
    
    // Extraire le JSON de la réponse avec parsing robuste
    let parsedResponse;
    try {
      // D'abord essayer de parser directement
      parsedResponse = JSON.parse(content);
    } catch {
      // Si ça échoue, essayer d'extraire le JSON avec regex
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('Failed to extract JSON from content:', content.substring(0, 200));
        throw new Error('Format de réponse invalide - aucun JSON trouvé');
      }
      try {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('Failed to parse extracted JSON:', jsonMatch[0].substring(0, 200));
        throw new Error('Format de réponse invalide - JSON malformé');
      }
    }
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

// Génération de réponse adaptative avec Perplexity
export const generateAdaptiveAnswerWithPerplexity = async (
  dilemma: string,
  files?: UploadedFileInfo[],
  workspaceId?: string
): Promise<IResult> => {
  try {
    console.log('🔍 Génération adaptative avec Perplexity');
    
    const isListQuestion = detectListQuestion(dilemma);
    console.log(`📋 Question de type liste détectée: ${isListQuestion}`);
    
    // Prompt adaptatif selon le type de question
    const adaptivePrompt = isListQuestion 
      ? `${dilemma}

INSTRUCTIONS SPÉCIALES - LISTE COMPLÈTE :
- Recherchez et listez TOUTES les options disponibles (expositions, événements, activités)
- Incluez les dates, lieux et détails importants
- Format: "Nom 1 (dates/détails), Nom 2 (dates/détails), etc."
- Ne limitez pas votre réponse, soyez exhaustif
- Vérifiez les sources officielles et récentes

CONTEXTE : Données actuelles et complètes 2025`
      : `${dilemma}

INSTRUCTIONS - RÉPONSE PRÉCISE :
- Utilisez UNIQUEMENT des noms réels et précis
- Évitez les termes génériques
- Réponse concise mais complète
- Sources officielles et vérifiées

CONTEXTE : Données réelles et vérifiées 2025`;

    const result = await searchWithPerplexity(adaptivePrompt);
    console.log('📝 Réponse adaptative reçue:', result.content.substring(0, 200));
    
    // Parser la réponse pour extraire des éléments multiples si c'est une question de liste
    const { recommendation, breakdown } = isListQuestion 
      ? parseMultipleItemsFromPerplexity(result.content, dilemma)
      : { recommendation: result.content.trim(), breakdown: [] };
    
    console.log(`📊 Items extraits: ${breakdown.length} options trouvées`);
    if (breakdown.length > 0) {
      console.log(`📋 Options: ${breakdown.map(item => item.option).join(', ')}`);
    }
    
    // Enrichir la description 
    const context = detectDilemmaContext(dilemma);
    const enrichedDescription = await enrichFactualDescription(
      dilemma, 
      recommendation, 
      context.domain
    );
    
    return {
      recommendation,
      description: enrichedDescription,
      breakdown,
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
    console.error('❌ Erreur génération adaptative:', error);
    // Fallback vers mode comparatif
    console.log('🔄 Fallback vers mode comparatif');
    const comparativeQuestion = `Analysez les options pour : ${dilemma}`;
    return await generateComparativeWithOpenAI(comparativeQuestion, [], files, workspaceId);
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

    // Sinon, parser la réponse OpenAI avec parsing robuste
    const content = typeof apiResult === 'string' ? apiResult : apiResult.content || JSON.stringify(apiResult);
    
    let parsedResponse;
    try {
      // D'abord essayer de parser directement le contenu
      parsedResponse = JSON.parse(content);
    } catch {
      // Si ça échoue, essayer d'extraire le JSON avec regex
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('Failed to extract JSON from API content:', content.substring(0, 200));
        throw new Error('Format de réponse invalide - aucun JSON trouvé dans la réponse API');
      }
      try {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('Failed to parse extracted JSON from API:', jsonMatch[0].substring(0, 200));
        throw new Error('Format de réponse invalide - JSON malformé dans la réponse API');
      }
    }
    
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

// Service principal unifié et adaptatif
export const generateOptimizedDecision = async (
  dilemma: string,
  criteria: ICriterion[],
  files?: UploadedFileInfo[],
  workspaceId?: string,
  forcedType?: 'factual' | 'comparative' | 'simple-choice'
): Promise<IResult> => {
  console.log('🎯 [generateOptimizedDecision] Starting with adaptive approach:', {
    dilemma: dilemma.substring(0, 50) + '...',
    criteriaCount: criteria.length,
    filesCount: files?.length || 0,
    workspaceId: workspaceId || 'none'
  });

  // Détecter si c'est une question nécessitant une réponse factuelle directe
  const questionType = forcedType || await detectQuestionType(dilemma);
  console.log('🔍 [generateOptimizedDecision] Question type detected:', questionType);

  try {
    // Pour les questions factuelles, utiliser Perplexity avec approche adaptative
    if (questionType === 'factual') {
      console.log('📋 [generateOptimizedDecision] Using adaptive factual approach with Perplexity');
      const result = await generateAdaptiveAnswerWithPerplexity(dilemma, files, workspaceId);
      // Forcer le type à 'comparative' pour unifier l'interface
      result.resultType = 'comparative';
      return result;
    }

    // Pour les questions comparatives et de choix, utiliser l'analyse complète
    console.log('⚖️ [generateOptimizedDecision] Using comparative analysis with OpenAI/Claude');
    const result = await generateComparativeWithOpenAI(dilemma, criteria, files, workspaceId);
    // Le type reste 'comparative' - pas de modification nécessaire
    return result;
  } catch (error) {
    console.error('❌ [generateOptimizedDecision] Error:', error);
    throw error;
  }
};