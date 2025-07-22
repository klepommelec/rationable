import { ICriterion, IResult } from '@/types/decision';
import { AIProviderService, AIRequest } from './aiProviderService';
import { UploadedFileInfo } from './fileUploadService';
import { getWorkspaceDocumentsForAnalysis, searchRelevantContent } from './workspaceDocumentService';
import { supabase } from '@/integrations/supabase/client';
import { summarizeDecisionDescription } from './descriptionSummaryService';
import { detectQuestionType, QuestionType } from './questionClassificationService';

const aiService = AIProviderService.getInstance();

const cleanAIResponse = (text: string): string => {
  if (!text) return text;
  
  return text
    .replace(/\s*\d{3,6}\s*$/g, '')
    .replace(/\s+\d{1,3}\s*$/g, '')
    .replace(/\[\d+\]\s*$/g, '')
    .replace(/\s+\d{3,6}(?=\s|$)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// Fonction pour générer des liens de fallback intelligents
const generateFallbackLinks = (dilemma: string, recommendation: string) => {
  const cleanDilemma = encodeURIComponent(dilemma);
  const cleanRecommendation = encodeURIComponent(recommendation || 'solution');
  
  console.log('🔗 Generating fallback links for:', { dilemma: dilemma.substring(0, 50), recommendation });
  
  const infoLinks = [
    {
      title: `Guide complet : ${recommendation || 'Solution'}`,
      url: `https://www.google.fr/search?q=${cleanRecommendation}+guide+complet`,
      description: `Guide détaillé sur ${recommendation || 'la solution recommandée'}`
    },
    {
      title: `Avis et tests : ${recommendation || 'Solution'}`,
      url: `https://www.google.fr/search?q=${cleanRecommendation}+avis+test+comparatif`,
      description: `Avis d'experts et tests utilisateurs`
    },
    {
      title: `Informations complémentaires`,
      url: `https://fr.wikipedia.org/wiki/Special:Search?search=${cleanRecommendation}`,
      description: `Ressources encyclopédiques et techniques`
    }
  ];
  
  const shoppingLinks = [
    {
      title: `Acheter ${recommendation || 'produit recommandé'} - Amazon`,
      url: `https://www.amazon.fr/s?k=${cleanRecommendation}`,
      description: `Voir les prix sur Amazon`
    },
    {
      title: `Comparer les prix - ${recommendation || 'Produit'}`,
      url: `https://www.google.fr/search?q=${cleanRecommendation}+prix+comparateur+achat&tbm=shop`,
      description: `Comparaison de prix en ligne`
    },
    {
      title: `Où acheter ${recommendation || 'ce produit'}`,
      url: `https://www.google.fr/search?q=où+acheter+${cleanRecommendation}+magasin`,
      description: `Trouver des points de vente`
    }
  ];
  
  return { infoLinks, shoppingLinks };
};

// Fonction pour valider et compléter les liens
const validateAndEnhanceLinks = (result: any, dilemma: string): void => {
  const recommendation = result.recommendation || 'solution recommandée';
  
  // Vérifier les infoLinks
  if (!Array.isArray(result.infoLinks) || result.infoLinks.length < 2) {
    console.log('⚠️ Missing or insufficient infoLinks, generating fallbacks');
    const fallbackLinks = generateFallbackLinks(dilemma, recommendation);
    result.infoLinks = fallbackLinks.infoLinks;
  }
  
  // Vérifier les shoppingLinks
  if (!Array.isArray(result.shoppingLinks) || result.shoppingLinks.length < 2) {
    console.log('⚠️ Missing or insufficient shoppingLinks, generating fallbacks');
    const fallbackLinks = generateFallbackLinks(dilemma, recommendation);
    result.shoppingLinks = fallbackLinks.shoppingLinks;
  }
  
  console.log('✅ Links validation completed:', {
    infoLinksCount: result.infoLinks?.length || 0,
    shoppingLinksCount: result.shoppingLinks?.length || 0
  });
};

// Fonction pour calculer la fraîcheur des données
const calculateDataFreshness = (realTimeData: any, hasWorkspaceData: boolean): 'very-fresh' | 'fresh' | 'moderate' | 'stale' => {
  console.log('🕒 Calculating data freshness...', { realTimeData: !!realTimeData, hasWorkspaceData });
  
  if (realTimeData?.hasRealTimeData && realTimeData.content) {
    const timestamp = realTimeData.timestamp;
    const sourcesCount = realTimeData.sourcesCount || realTimeData.sources?.length || 0;
    
    if (timestamp) {
      const dataAge = Date.now() - new Date(timestamp).getTime();
      const ageInHours = dataAge / (1000 * 60 * 60);
      
      console.log('📊 Data age analysis:', {
        ageInHours: Math.round(ageInHours),
        sourcesCount,
        provider: realTimeData.provider
      });
      
      if (ageInHours < 6 && sourcesCount >= 3) {
        console.log('✅ Data is very fresh');
        return 'very-fresh';
      }
      
      if (ageInHours < 24 && sourcesCount >= 1) {
        console.log('✅ Data is fresh');
        return 'fresh';
      }
      
      if (ageInHours < 168) {
        console.log('⚠️ Data is moderately fresh');
        return 'moderate';
      }
    }
    
    if (sourcesCount >= 2) {
      console.log('✅ Data is fresh (based on sources count)');
      return 'fresh';
    }
    
    console.log('⚠️ Data is moderate (real-time but limited)');
    return 'moderate';
  }
  
  if (hasWorkspaceData) {
    console.log('📚 Data is moderate (workspace documents only)');
    return 'moderate';
  }
  
  console.log('❌ Data is stale (no recent data)');
  return 'stale';
};

export const generateCriteriaWithFallback = async (
  dilemma: string, 
  files?: UploadedFileInfo[], 
  workspaceId?: string
) => {
  console.log('🎯 Generating criteria with multi-provider fallback');

  let workspaceContext = '';
  let workspaceDocuments = [];
  
  if (workspaceId) {
    console.log('📚 Fetching workspace documents for criteria generation...');
    workspaceDocuments = await getWorkspaceDocumentsForAnalysis(workspaceId, dilemma);
    
    if (workspaceDocuments.length > 0) {
      const relevantContent = searchRelevantContent(workspaceDocuments, dilemma, 8);
      if (relevantContent) {
        workspaceContext = `\n\n${relevantContent}`;
        console.log(`✅ Using ${workspaceDocuments.length} workspace documents for context`);
      }
    }
  }

  let prompt = `
Analysez ce dilemme et retournez une réponse JSON avec les éléments suivants :

1. "emoji": Un emoji représentant le dilemme (ex: 💻, ✈️, 🏠, etc.)
2. "criteria": Une liste de 3-6 critères importants pour évaluer les options de ce dilemme
3. "suggestedCategory": L'ID de la catégorie la plus appropriée

Dilemme: "${dilemma}"${workspaceContext}`;

  if (files && files.length > 0) {
    prompt += `

Documents joints à analyser (${files.length} fichier(s)) :
${files.map(f => `- ${f.fileName} (${f.fileType})`).join('\n')}

Analysez le contenu de ces documents pour mieux comprendre le contexte du dilemme et ajustez les critères en conséquence.`;
  }

  prompt += `

Répondez UNIQUEMENT avec un objet JSON valide contenant "emoji", "criteria" et "suggestedCategory".

Exemple de format:
{
  "emoji": "💻",
  "criteria": ["Performance", "Prix", "Facilité d'utilisation"],
  "suggestedCategory": "tech"
}`;

  const request: AIRequest = {
    prompt,
    type: 'criteria',
    files,
    workspaceId
  };

  try {
    const response = await aiService.executeWithFallback(request);
    console.log(`✅ Criteria generated with ${response.provider}`);
    
    return {
      emoji: response.content.emoji || '🤔',
      criteria: response.content.criteria || [],
      suggestedCategory: response.content.suggestedCategory,
      provider: response.provider,
      workspaceDocumentsUsed: workspaceDocuments.length
    };
  } catch (error) {
    console.error('❌ All providers failed for criteria generation:', error);
    
    return {
      emoji: '🤔',
      criteria: ['Coût', 'Qualité', 'Facilité', 'Temps', 'Impact'],
      suggestedCategory: 'general',
      provider: 'fallback',
      error: error instanceof Error ? error.message : 'Unknown error',
      workspaceDocumentsUsed: workspaceDocuments.length
    };
  }
};

const detectRealTimeQuery = (dilemma: string): boolean => {
  const realTimeKeywords = [
    'draft', '2024', '2025', '2026', 'élection', 'prochain', 'futur', 'prochaine',
    'récent', 'dernière', 'nouveau', 'nouvelle', 'tendance', 'actualité',
    'maintenant', 'aujourd\'hui', 'cette année', 'ce mois', 'cette semaine',
    'current', 'latest', 'recent', 'now', 'today', 'this year', 'premier choix',
    'qui a été', 'qui sera', 'quel est', 'résultat', 'gagnant', 'classement'
  ];
  
  const lowerDilemma = dilemma.toLowerCase();
  const hasRealTimeKeyword = realTimeKeywords.some(keyword => lowerDilemma.includes(keyword));
  
  const isSportsQuery = /draft|NBA|football|sport|joueur|équipe|match|championship/i.test(dilemma);
  const isRecentYear = /(2024|2025|2026)/i.test(dilemma);
  
  const needsRealTime = hasRealTimeKeyword || (isSportsQuery && isRecentYear);
  
  console.log('🕒 Real-time detection:', {
    dilemma: dilemma.substring(0, 50) + '...',
    hasRealTimeKeyword,
    isSportsQuery,
    isRecentYear,
    needsRealTime
  });
  
  return needsRealTime;
};

export const generateOptionsWithFallback = async (
  dilemma: string, 
  criteria: ICriterion[], 
  files?: UploadedFileInfo[], 
  workspaceId?: string
): Promise<IResult> => {
  console.log('🎯 Generating options with multi-provider fallback');

  const questionType = await detectQuestionType(dilemma);
  console.log(`🎯 Question type determined: ${questionType}`);

  const criteriaList = criteria.map(c => c.name).join(', ');
  
  const needsRealTimeData = detectRealTimeQuery(dilemma);
  let realTimeContext = '';
  let realTimeData = null;

  if (needsRealTimeData) {
    console.log('🔍 Real-time data needed, using search providers...');
    
    const isNBADraft = /draft.*NBA.*202[4-9]/i.test(dilemma);
    const isNBATopic = /NBA|basketball/i.test(dilemma);
    let searchContext = 'Current sports events and recent information';
    
    if (isNBADraft) {
      searchContext = 'NBA Draft 2025 first pick selection results recent news';
    } else if (isNBATopic) {
      searchContext = 'NBA recent news and current season information';
    }
    
    try {
      const searchRequest: AIRequest = {
        prompt: isNBADraft ? `NBA Draft 2025 first overall pick winner results ${dilemma}` : dilemma,
        context: searchContext,
        type: 'search'
      };

      console.log('🔍 Searching for real-time data with context:', searchContext);
      const searchResponse = await aiService.executeWithFallback(searchRequest);
      
      if (searchResponse.success && searchResponse.content) {
        realTimeData = {
          content: searchResponse.content.content || searchResponse.content,
          sources: searchResponse.content.sources || searchResponse.content.citations || [],
          timestamp: searchResponse.content.timestamp || new Date().toISOString(),
          searchQuery: dilemma,
          provider: searchResponse.provider,
          hasRealTimeData: true
        };
        
        realTimeContext = `\n\nDONNÉES RÉCENTES ET VÉRIFIÉES (${realTimeData.timestamp}, source: ${searchResponse.provider}):\n${realTimeData.content}\n\nIMPORTANT: Utilisez UNIQUEMENT ces informations récentes pour répondre. Ignorez toute connaissance antérieure qui pourrait être obsolète.`;
        console.log('✅ Real-time data retrieved successfully from:', searchResponse.provider);
      }
    } catch (searchError) {
      console.warn('⚠️ Real-time search failed, continuing without recent data:', searchError);
      realTimeContext = '\n\nATTENTION: Données en temps réel non disponibles. PRÉCISEZ dans votre réponse que vous ne pouvez pas accéder aux informations récentes et que la réponse pourrait être obsolète.';
    }
  }

  let workspaceContext = '';
  let workspaceDocuments = [];
  
  if (workspaceId) {
    console.log('📚 Fetching workspace documents for options generation...');
    workspaceDocuments = await getWorkspaceDocumentsForAnalysis(workspaceId, dilemma);
    
    if (workspaceDocuments.length > 0) {
      const relevantContent = searchRelevantContent(workspaceDocuments, dilemma, 15);
      if (relevantContent) {
        workspaceContext = `\n\n${relevantContent}`;
        console.log(`✅ Using ${workspaceDocuments.length} relevant workspace documents for analysis`);
      }
    } else {
      console.log('📝 No relevant workspace documents found for this query');
    }
  }
  
  let prompt = '';

  if (questionType === 'factual') {
    prompt = `
Analysez cette question factuelle et donnez LA réponse précise et directe.

Question: "${dilemma}"${realTimeContext}${workspaceContext}`;

    if (files && files.length > 0) {
      prompt += `

Documents joints à analyser (${files.length} fichier(s)) :
${files.map(f => `- ${f.fileName} (${f.fileType})`).join('\n')}

Utilisez ces documents pour enrichir votre réponse factuelle.`;
    }

    prompt += `

Retournez un objet JSON avec:
1. "recommendation": LA réponse factuelle directe (texte court et précis)
2. "description": Explication détaillée de cette réponse avec preuves et sources
3. "imageQuery": Description pour générer une image (en anglais, très descriptive)
4. "confidenceLevel": Niveau de confiance de la réponse (1-100)
5. "dataFreshness": Fraîcheur des données utilisées ("very-fresh", "fresh", "moderate", "stale")
6. "infoLinks": Tableau de EXACTEMENT 3 liens utiles avec "title", "url" et "description" (OBLIGATOIRE)
7. "shoppingLinks": Tableau de EXACTEMENT 3 liens d'achat avec "title", "url" et "description" (OBLIGATOIRE)
8. "breakdown": Tableau avec UN SEUL objet contenant:
   - "option": La réponse factuelle
   - "pros": Tableau des éléments factuels positifs/caractéristiques
   - "cons": Tableau des limitations/précisions (si applicable)
   - "score": 100 (réponse factuelle = score maximal)

IMPORTANT: Les infoLinks et shoppingLinks sont OBLIGATOIRES et doivent contenir exactement 3 éléments chacun.

Répondez UNIQUEMENT avec un objet JSON valide.`;

  } else {
    prompt = `
Analysez ce dilemme de choix et générez EXACTEMENT 3 à 5 options différentes avec évaluation détaillée.

Dilemma: "${dilemma}"
Critères d'évaluation: ${criteriaList}${realTimeContext}${workspaceContext}`;

    if (files && files.length > 0) {
      prompt += `

Documents joints à analyser (${files.length} fichier(s)) :
${files.map(f => `- ${f.fileName} (${f.fileType})`).join('\n')}

Analysez le contenu de ces documents pour enrichir votre analyse et vos recommandations.`;
    }

    prompt += `

IMPORTANT: Vous DEVEZ générer entre 3 et 5 options distinctes avec des scores différents (pas tous identiques).

Retournez un objet JSON avec:
1. "recommendation": La meilleure option recommandée (texte court)
2. "description": Explication détaillée de pourquoi cette option est recommandée
3. "imageQuery": Description pour générer une image (en anglais, très descriptive)
4. "confidenceLevel": Niveau de confiance de l'analyse (1-100)
5. "dataFreshness": Fraîcheur des données utilisées ("very-fresh", "fresh", "moderate", "stale")
6. "infoLinks": Tableau de EXACTEMENT 3 liens utiles avec "title", "url" et "description" (OBLIGATOIRE)
7. "shoppingLinks": Tableau de EXACTEMENT 3 liens d'achat avec "title", "url" et "description" (OBLIGATOIRE)
8. "breakdown": Tableau de 3-5 objets avec:
   - "option": Nom de l'option (différent pour chaque option)
   - "pros": Tableau des avantages spécifiques
   - "cons": Tableau des inconvénients spécifiques
   - "score": Note sur 100 (VARIEZ les scores: 85-95 pour la meilleure, 70-84 pour les bonnes, 50-69 pour les moyennes)

IMPORTANT: Les infoLinks et shoppingLinks sont OBLIGATOIRES et doivent contenir exactement 3 éléments chacun avec des URLs réelles.

Répondez UNIQUEMENT avec un objet JSON valide.`;
  }

  const request: AIRequest = {
    prompt,
    type: 'options',
    files,
    workspaceId
  };

  try {
    console.log('🔍 Sending request to AI providers:', {
      dilemma,
      questionType,
      criteriaList,
      needsRealTimeData,
      hasRealTimeData: !!realTimeData?.content,
      workspaceDocsFound: workspaceDocuments.length,
      promptLength: prompt.length
    });
    
    const response = await aiService.executeWithFallback(request);
    console.log(`✅ Options generated with ${response.provider}`);
    
    const result = response.content;
    
    if (result.recommendation) {
      result.recommendation = cleanAIResponse(result.recommendation);
    }
    
    if (result.description && result.recommendation) {
      console.log('📝 Summarizing description...');
      try {
        const summarizedDescription = await summarizeDecisionDescription(
          result.description,
          result.recommendation,
          dilemma
        );
        result.description = summarizedDescription;
        console.log('✅ Description summarized successfully');
      } catch (summaryError) {
        console.warn('⚠️ Failed to summarize description, keeping original:', summaryError);
        result.description = cleanAIResponse(result.description);
      }
    }
    
    if (result.breakdown && Array.isArray(result.breakdown)) {
      result.breakdown = result.breakdown.map(item => ({
        ...item,
        option: cleanAIResponse(item.option || ''),
        pros: item.pros?.map(pro => cleanAIResponse(pro)) || [],
        cons: item.cons?.map(con => cleanAIResponse(con)) || []
      }));
    }
    
    validateAndEnhanceLinks(result, dilemma);
    
    const calculatedFreshness = calculateDataFreshness(realTimeData, workspaceDocuments.length > 0);
    result.dataFreshness = calculatedFreshness;
    
    console.log(`📊 Data freshness calculated: ${calculatedFreshness}`);
    
    result.resultType = questionType;
    
    if (realTimeData) {
      result.realTimeData = {
        hasRealTimeData: !!realTimeData.content,
        timestamp: realTimeData.timestamp,
        sourcesCount: realTimeData.sources?.length || 0,
        searchQuery: realTimeData.searchQuery,
        provider: realTimeData.provider,
        sources: realTimeData.sources || []
      };
    }

    if (workspaceDocuments.length > 0) {
      result.workspaceData = {
        documentsUsed: workspaceDocuments.length,
        documentSources: workspaceDocuments.map(doc => doc.document.file_name),
        documentsContent: []
      };
    }

    result.aiProvider = {
      provider: response.provider,
      model: response.model,
      success: true
    };
    
    try {
      console.log('🔍 Fetching social content for:', result.recommendation);
      const { data: socialData, error } = await supabase.functions.invoke('social-content-fetcher', {
        body: { 
          query: result.recommendation,
          dilemma: dilemma,
          recommendation: result.recommendation
        }
      });
      
      if (error) {
        console.error('❌ Error fetching social content:', error);
      } else if (socialData?.youtubeVideos && socialData.youtubeVideos.length > 0) {
        console.log(`✅ Found ${socialData.youtubeVideos.length} YouTube videos`);
        result.socialContent = {
          youtubeVideos: socialData.youtubeVideos
        };
      }
    } catch (socialError) {
      console.error('❌ Social content fetch failed:', socialError);
    }
    
    return result;
  } catch (error) {
    console.error('❌ All providers failed for options generation:', error);
    
    const fallbackLinks = generateFallbackLinks(dilemma, 'solution recommandée');
    
    return {
      recommendation: "Analyse manuelle requise",
      description: "Tous les fournisseurs IA ont échoué. Une analyse manuelle est recommandée pour ce dilemme complexe.",
      imageQuery: "decision making analysis flowchart",
      dataFreshness: "stale" as const,
      resultType: questionType,
      infoLinks: fallbackLinks.infoLinks,
      shoppingLinks: fallbackLinks.shoppingLinks,
      breakdown: questionType === 'factual' ? [
        {
          option: "Réponse non disponible",
          pros: ["Nécessite une recherche manuelle"],
          cons: ["Données insuffisantes"],
          score: 50
        }
      ] : [
        {
          option: "Option A",
          pros: ["À définir selon le contexte"],
          cons: ["Nécessite une analyse approfondie"],
          score: 50
        },
        {
          option: "Option B", 
          pros: ["À évaluer manuellement"],
          cons: ["Données insuffisantes"],
          score: 45
        },
        {
          option: "Option C", 
          pros: ["Analyse manuelle requise"],
          cons: ["Informations limitées"],
          score: 40
        }
      ],
      aiProvider: {
        provider: 'fallback' as any,
        model: 'manual',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      workspaceData: workspaceDocuments.length > 0 ? {
        documentsUsed: workspaceDocuments.length,
        documentsContent: [],
        documentSources: workspaceDocuments.map(doc => doc.document.file_name)
      } : undefined
    };
  }
};
