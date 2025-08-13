import { ICriterion, IResult, IBreakdownItem } from '@/types/decision';
import { UploadedFileInfo } from './fileUploadService';
import { searchWithPerplexity } from './perplexityService';
import { callOpenAiApi } from './openai';
import { makeClaudeDecision } from './claudeService';

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
  
  // Nettoyer et valider la réponse, mais préserver le formatage JSON
  let cleaned = text.trim();
  
  return cleaned;
};

// Fonction pour parser une réponse Perplexity et extraire des options multiples
const parseMultipleItemsFromPerplexity = (content: string, dilemma: string): { recommendation: string; breakdown: IBreakdownItem[] } => {
  console.log('🔍 Contenu à parser:', content.substring(0, 300));
  
  let items: string[] = [];
  
  // Pattern spécifique pour les expositions (détecte les titres entre guillemets ou tirets)
  const expositionPattern = /[-–—]\s*([^-–—\n]{10,100})(?:\s*\([^)]+\))?/g;
  let matches = Array.from(content.matchAll(expositionPattern));
  
  if (matches.length >= 2) {
    items = matches.map(match => match[1].trim()).filter(item => item.length > 5);
    console.log('📋 Expositions trouvées via pattern:', items.length);
  }
  
  // Si pas d'expositions, essayer de détecter par parenthèses et dates
  if (items.length < 2) {
    const eventPattern = /([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ][^()\n]{5,80})\s*\([^)]*(?:202[4-5]|janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)[^)]*\)/g;
    matches = Array.from(content.matchAll(eventPattern));
    
    if (matches.length >= 2) {
      items = matches.map(match => match[1].trim()).filter(item => item.length > 5);
      console.log('📅 Événements trouvés via dates:', items.length);
    }
  }
  
  // Pattern pour détecter les noms d'expositions avec des mots clés
  if (items.length < 2) {
    const titlePattern = /(?:exposition|événement|atelier|visite|installation|parcours)[\s:]*([^.\n]{10,80})(?=\s*[-–—(]|\s*$)/gi;
    matches = Array.from(content.matchAll(titlePattern));
    
    if (matches.length >= 2) {
      items = matches.map(match => match[1].trim()).filter(item => item.length > 5);
      console.log('🎨 Événements trouvés via mots-clés:', items.length);
    }
  }
  
  // Dernière tentative: diviser par segments logiques avec des indices forts
  if (items.length < 2) {
    // Chercher des segments séparés par des tirets ou des points
    const segments = content.split(/[-–—]\s+/).filter(s => s.trim().length > 20);
    if (segments.length >= 3) { // Au moins 3 segments (intro + 2 expositions)
      items = segments.slice(1, 6).map(s => s.split('(')[0].trim()); // Prendre les titres avant parenthèses
      console.log('📄 Segments trouvés:', items.length);
    }
  }
  
  // Si toujours pas d'éléments multiples, formater proprement le contenu unique
  if (items.length < 2) {
    console.log('⚠️ Pas d\'éléments multiples détectés');
    // Nettoyer le contenu pour une meilleure présentation
    const cleanedContent = content
      .replace(/\s+/g, ' ')
      .replace(/[-–—]\s*/g, '\n• ')
      .trim();
    
    return {
      recommendation: cleanedContent,
      breakdown: []
    };
  }
  
  // Créer des IBreakdownItem pour chaque élément trouvé
  const breakdown: IBreakdownItem[] = items.slice(0, 5).map((item, index) => ({
    option: extractTitle(item),
    pros: extractPositives(item, content), // Passer le contenu complet pour plus de contexte
    cons: [], 
    score: 90 - (index * 5)
  }));
  
  // Créer une recommandation formatée proprement
  const recommendation = `Voici les principales expositions actuellement disponibles :\n\n• ${breakdown[0].option}\n\nRecommandation : ${breakdown[0].option} semble être l'exposition phare du moment.`;
  
  console.log(`✅ Parser terminé: ${breakdown.length} options créées`);
  
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
const extractPositives = (item: string, fullContent?: string): string[] => {
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
    
    console.log('🔍 Contenu brut de Perplexity (premiers 500 caractères):', content.substring(0, 500));
    
    // Améliorer l'extraction JSON avec plusieurs stratégies
    let parsedResponse;
    let jsonString = content;
    
    try {
      // Stratégie 1: Parser directement
      parsedResponse = JSON.parse(content);
      console.log('✅ Parsing direct réussi');
    } catch (directError) {
      console.log('❌ Parsing direct échoué, essai d\'extraction:', directError.message);
      
      try {
        // Stratégie 2: Extraire le JSON le plus complet possible
        // Trouver la première accolade ouvrante et la dernière fermante
        const firstBrace = content.indexOf('{');
        const lastBrace = content.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          jsonString = content.substring(firstBrace, lastBrace + 1);
          console.log('🔍 JSON extrait (premiers 300 caractères):', jsonString.substring(0, 300));
          
          parsedResponse = JSON.parse(jsonString);
          console.log('✅ Parsing avec extraction réussi');
        } else {
          console.error('❌ Impossible de trouver les accolades JSON');
          throw new Error('Aucune structure JSON valide détectée');
        }
      } catch (extractError) {
        console.error('❌ Parsing avec extraction échoué:', extractError.message);
        console.error('Contenu JSON tenté:', jsonString.substring(0, 200));
        
        // Stratégie 3: Fallback avec critères génériques
        console.log('🔄 Utilisation de critères génériques de fallback');
        const emoji = generateContextualEmoji(dilemma);
        
        // Générer des critères génériques intelligents basés sur le type de question
        const isListQuestion = detectListQuestion(dilemma);
        const genericCriteria = isListQuestion 
          ? ['Disponibilité actuelle', 'Popularité', 'Accessibilité', 'Pertinence']
          : ['Qualité', 'Prix', 'Convenience', 'Durabilité'];
        
        return {
          emoji,
          criteria: genericCriteria,
          suggestedCategory: 'autre',
          provider: 'perplexity-fallback'
        };
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
  forcedType?: 'comparative'
): Promise<IResult> => {
  console.log('🎯 [generateOptimizedDecision] Starting with adaptive approach:', {
    dilemma: dilemma.substring(0, 50) + '...',
    criteriaCount: criteria.length,
    filesCount: files?.length || 0,
    workspaceId: workspaceId || 'none'
  });

  console.log('⚖️ [generateOptimizedDecision] Using unified comparative analysis');
  return await generateComparativeWithOpenAI(dilemma, criteria, files, workspaceId);
};