import { ICriterion, IResult, IBreakdownItem } from '@/types/decision';
import { UploadedFileInfo } from './fileUploadService';
import { searchWithPerplexity } from './perplexityService';
import { callOpenAiApi } from './openai';
import { makeClaudeDecision } from './claudeService';

import { generateContextualEmoji } from './contextualEmojiService';
import { 
  enrichDescription, 
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

// Fonction améliorée pour parser une réponse Perplexity structurée
const parseMultipleItemsFromPerplexity = (content: string, dilemma: string): { recommendation: string; breakdown: IBreakdownItem[] } => {
  console.log('🔍 Parsing contenu structuré:', content.substring(0, 300));
  
  let items: Array<{title: string, description: string, details: string}> = [];
  
  // Pattern principal pour format numéroté : "1. [TITRE] - [Description] - [Détails]"
  const structuredPattern = /(\d+)\.\s*\[([^\]]+)\]\s*-\s*([^-\n]+)(?:\s*-\s*([^-\n]+))?/g;
  let matches = Array.from(content.matchAll(structuredPattern));
  
  if (matches.length >= 2) {
    items = matches.map(match => ({
      title: match[2].trim(),
      description: match[3].trim(),
      details: match[4]?.trim() || ''
    }));
    console.log('✅ Format structuré détecté:', items.length, 'items');
  }
  
  // Pattern alternatif : lignes avec numéros
  if (items.length < 2) {
    const numberedPattern = /(\d+)\.\s*([^\n]{10,100})/g;
    matches = Array.from(content.matchAll(numberedPattern));
    
    if (matches.length >= 2) {
      items = matches.map(match => {
        const fullText = match[2].trim();
        const parts = fullText.split(' - ');
        return {
          title: parts[0]?.trim() || fullText.substring(0, 50),
          description: parts[1]?.trim() || '',
          details: parts[2]?.trim() || ''
        };
      });
      console.log('📋 Format numéroté simple:', items.length, 'items');
    }
  }
  
  // Validation des données extraites
  items = items.filter(item => 
    item.title.length > 3 && 
    item.title.length < 80 &&
    !item.title.toLowerCase().includes('exposition') // Éviter les doublons de mots-clés
  );
  
  // Si échec du parsing structuré, essayer extraction simple mais robuste
  if (items.length < 2) {
    console.log('⚠️ Fallback vers extraction simple');
    const lines = content.split('\n').filter(line => line.trim().length > 20);
    
    items = lines.slice(0, 5).map(line => {
      const cleanLine = line.replace(/^[-•\d.\s]+/, '').trim();
      const parts = cleanLine.split(/\s*[-–—]\s*/);
      
      return {
        title: parts[0]?.trim() || cleanLine.substring(0, 50),
        description: parts[1]?.trim() || 'Information disponible',
        details: parts[2]?.trim() || ''
      };
    }).filter(item => item.title.length > 5);
  }
  
  // Validation finale et nettoyage
  const validatedItems = items.slice(0, 6).filter(item => {
    const isValid = item.title.length >= 5 && 
                   item.title.length <= 80 &&
                   !item.title.match(/^\d+$/) && // Pas que des chiffres
                   item.title.split(' ').length >= 2; // Au moins 2 mots
    
    if (!isValid) {
      console.log('❌ Item rejeté:', item.title);
    }
    return isValid;
  });
  
  if (validatedItems.length < 2) {
    console.log('⚠️ Données insuffisantes après validation');
    return {
      recommendation: content.trim(),
      breakdown: []
    };
  }
  
  // Créer des IBreakdownItem avec données validées
  const breakdown: IBreakdownItem[] = validatedItems.map((item, index) => ({
    option: item.title,
    pros: [
      item.description || 'Information disponible',
      item.details || 'Détails sur site officiel'
    ].filter(Boolean),
    cons: [], 
    score: 95 - (index * 3) // Scores plus proches pour refléter la qualité réelle
  }));
  
  // Recommandation basée sur les vraies données
  const recommendation = `${breakdown.length} options actuellement disponibles. ${breakdown[0].option} ${breakdown[0].pros[0] ? '- ' + breakdown[0].pros[0] : ''}.`;
  
  console.log(`✅ Parsing validé: ${breakdown.length} options, qualité: ${(breakdown.length/validatedItems.length*100).toFixed(0)}%`);
  
  return { recommendation, breakdown };
};

// Validation des données extraites
const validateParsedData = (items: Array<{title: string, description: string}>): boolean => {
  if (items.length < 2) return false;
  
  // Vérifier que les titres ne sont pas trop similaires (éviter les doublons)
  const titles = items.map(item => item.title.toLowerCase());
  const uniqueTitles = new Set(titles);
  
  if (uniqueTitles.size < titles.length * 0.8) {
    console.log('⚠️ Trop de titres similaires détectés');
    return false;
  }
  
  // Vérifier la qualité des titres
  const validTitles = items.filter(item => {
    const title = item.title;
    return title.length >= 5 && 
           title.length <= 100 &&
           title.split(' ').length >= 2 &&
           !title.match(/^\d+\.?\s*$/) &&
           !title.toLowerCase().includes('exposition temporaire') // Éviter les généralités
  });
  
  return validTitles.length >= 2;
};

// Extraire des informations contextuelles (dates, lieux) avec détection d'année dynamique
const extractContextualInfo = (text: string): {dates: string[], locations: string[]} => {
  const dates: string[] = [];
  const locations: string[] = [];
  
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  
  // Dates plus précises avec années dynamiques
  const datePatterns = [
    new RegExp(`(\\d{1,2}\\/\\d{1,2}\\/${currentYear}|\\d{1,2}\\/\\d{1,2}\\/${nextYear})`, 'g'),
    new RegExp(`(\\d{1,2}\\s+(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\\s+${currentYear}|\\d{1,2}\\s+(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\\s+${nextYear})`, 'gi'),
    /(jusqu'au\s+\d{1,2}\s+\w+)/gi,
    /(du\s+\d{1,2}\s+\w+\s+au\s+\d{1,2}\s+\w+)/gi
  ];
  
  datePatterns.forEach(pattern => {
    const matches = Array.from(text.matchAll(pattern));
    dates.push(...matches.map(m => m[1]));
  });
  
  // Lieux officiels
  const locationPatterns = [
    /(Musée\s+[A-Z][a-zA-Zàâäéèêëïîôöùûüÿç\s-]+)/g,
    /(Galerie\s+[A-Z][a-zA-Zàâäéèêëïîôöùûüÿç\s-]+)/g,
    /(Centre\s+[A-Z][a-zA-Zàâäéèêëïîôöùûüÿç\s-]+)/g
  ];
  
  locationPatterns.forEach(pattern => {
    const matches = Array.from(text.matchAll(pattern));
    locations.push(...matches.map(m => m[1].trim()));
  });
  
  return { dates, locations };
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
    
    // Détecter l'intention temporelle pour adapter le prompt
    const { detectTemporalIntent } = await import('./perplexityService');
    const temporalIntent = detectTemporalIntent(dilemma);
    console.log('⏰ Intention temporelle pour la question:', temporalIntent.type);
    
    // Prompt adaptatif selon le type de question ET l'intention temporelle
    const adaptivePrompt = isListQuestion 
      ? `${dilemma}

INSTRUCTIONS CRITIQUES - FORMAT STRUCTURÉ :
- Listez EXACTEMENT les options avec ce format :
  1. [NOM PRÉCIS] - [Description courte] - [Date/Lieu si applicable]
  2. [NOM PRÉCIS] - [Description courte] - [Date/Lieu si applicable]
  etc.

- EXIGENCES STRICTES :
  • Noms officiels UNIQUEMENT (pas de descriptions génériques)
  • Dates réelles vérifiées avec dates de début ET de fin
  • Lieux exacts et officiels
  • Minimum 3 options, maximum 8

- INTENTION TEMPORELLE : ${temporalIntent.context}
- SOURCES : Utilisez uniquement sites officiels, musées, organismes publics

CONTEXTE TEMPOREL : Recherche pour ${temporalIntent.type} - ${new Date().toLocaleDateString('fr-FR')}`
      : `${dilemma}

INSTRUCTIONS PRÉCISES - RÉPONSE FACTUELLE :
- Réponse DIRECTE avec noms officiels exacts
- Pas de généralisation ou approximation  
- Format : Nom précis + détail essentiel
- Sources gouvernementales/officielles UNIQUEMENT

- INTENTION TEMPORELLE : ${temporalIntent.context}
- CONTEXTE : ${temporalIntent.type} - ${new Date().toLocaleDateString('fr-FR')}`;

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
    const enrichedDescription = await enrichDescription(
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
    
    const prompt = `Analysez cette décision et générez 6-8 options détaillées et pertinentes :

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