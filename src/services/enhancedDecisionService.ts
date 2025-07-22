
import { ICriterion, IResult } from '@/types/decision';
import { AIProviderService, AIRequest } from './aiProviderService';
import { UploadedFileInfo } from './fileUploadService';
import { getWorkspaceDocumentsForAnalysis, searchRelevantContent } from './workspaceDocumentService';
import { supabase } from '@/integrations/supabase/client';
import { summarizeDecisionDescription } from './descriptionSummaryService';

const aiService = AIProviderService.getInstance();

const cleanAIResponse = (text: string): string => {
  if (!text) return text;
  
  return text
    // Supprimer les séquences numériques en fin de texte (123, 1234, 12345, etc.)
    .replace(/\s*\d{3,6}\s*$/g, '')
    // Supprimer les numéros isolés en fin de phrase
    .replace(/\s+\d{1,3}\s*$/g, '')
    // Supprimer les références malformées
    .replace(/\[\d+\]\s*$/g, '')
    // Supprimer les patterns numériques en milieu de phrase aussi
    .replace(/\s+\d{3,6}(?=\s|$)/g, '')
    // Nettoyer les espaces
    .replace(/\s+/g, ' ')
    .trim();
};

// Fonction pour calculer la fraîcheur des données
const calculateDataFreshness = (realTimeData: any, hasWorkspaceData: boolean): 'very-fresh' | 'fresh' | 'moderate' | 'stale' => {
  console.log('🕒 Calculating data freshness...', { realTimeData: !!realTimeData, hasWorkspaceData });
  
  // Si on a des données temps réel récentes
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
      
      // Données très récentes (moins de 6 heures) avec plusieurs sources
      if (ageInHours < 6 && sourcesCount >= 3) {
        console.log('✅ Data is very fresh');
        return 'very-fresh';
      }
      
      // Données récentes (moins de 24 heures)
      if (ageInHours < 24 && sourcesCount >= 1) {
        console.log('✅ Data is fresh');
        return 'fresh';
      }
      
      // Données modérément récentes (moins de 7 jours)
      if (ageInHours < 168) {
        console.log('⚠️ Data is moderately fresh');
        return 'moderate';
      }
    }
    
    // Si on a des sources mais pas de timestamp fiable
    if (sourcesCount >= 2) {
      console.log('✅ Data is fresh (based on sources count)');
      return 'fresh';
    }
    
    console.log('⚠️ Data is moderate (real-time but limited)');
    return 'moderate';
  }
  
  // Si on a des documents workspace mais pas de données temps réel
  if (hasWorkspaceData) {
    console.log('📚 Data is moderate (workspace documents only)');
    return 'moderate';
  }
  
  // Pas de données récentes
  console.log('❌ Data is stale (no recent data)');
  return 'stale';
};

export const generateCriteriaWithFallback = async (
  dilemma: string, 
  files?: UploadedFileInfo[], 
  workspaceId?: string
) => {
  console.log('🎯 Generating criteria with multi-provider fallback');

  // Récupérer les documents du workspace si disponibles
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
    
    // Fallback manuel avec critères génériques
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

// Fonction utilitaire pour détecter les requêtes temps réel
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
  
  // Détection spéciale pour les questions sportives récentes
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

  const criteriaList = criteria.map(c => c.name).join(', ');
  
  // Vérifier si on a besoin de données temps réel
  const needsRealTimeData = detectRealTimeQuery(dilemma);
  let realTimeContext = '';
  let realTimeData = null;

  if (needsRealTimeData) {
    console.log('🔍 Real-time data needed, using search providers...');
    
    // Context spécifique pour questions sports récentes
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
          sources: searchResponse.content.sources || [],
          timestamp: searchResponse.content.timestamp || new Date().toISOString(),
          searchQuery: dilemma,
          provider: searchResponse.provider
        };
        
        realTimeContext = `\n\nDONNÉES RÉCENTES ET VÉRIFIÉES (${realTimeData.timestamp}, source: ${searchResponse.provider}):\n${realTimeData.content}\n\nIMPORTANT: Utilisez UNIQUEMENT ces informations récentes pour répondre. Ignorez toute connaissance antérieure qui pourrait être obsolète.`;
        console.log('✅ Real-time data retrieved successfully from:', searchResponse.provider);
      }
    } catch (searchError) {
      console.warn('⚠️ Real-time search failed, continuing without recent data:', searchError);
      realTimeContext = '\n\nATTENTION: Données en temps réel non disponibles. PRÉCISEZ dans votre réponse que vous ne pouvez pas accéder aux informations récentes et que la réponse pourrait être obsolète.';
    }
  }

  // Récupérer les documents du workspace (avec filtrage de pertinence amélioré)
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
  
  let prompt = `
Analysez ce dilemme et générez des options avec évaluation détaillée.

Dilemme: "${dilemma}"
Critères d'évaluation: ${criteriaList}${realTimeContext}${workspaceContext}`;

  if (files && files.length > 0) {
    prompt += `

Documents joints à analyser (${files.length} fichier(s)) :
${files.map(f => `- ${f.fileName} (${f.fileType})`).join('\n')}

Analysez le contenu de ces documents pour enrichir votre analyse et vos recommandations.`;
  }

  prompt += `

Retournez un objet JSON avec:
1. "recommendation": La meilleure option recommandée (texte court)
2. "description": Explication détaillée de pourquoi cette option est recommandée
3. "imageQuery": Description pour générer une image (en anglais, très descriptive)
4. "confidenceLevel": Niveau de confiance de l'analyse (1-100)
5. "dataFreshness": Fraîcheur des données utilisées ("very-fresh", "fresh", "moderate", "stale")
6. "infoLinks": Tableau de 3-5 liens utiles avec "title" et "url" (obligatoire)
7. "shoppingLinks": Tableau de 2-3 liens d'achat avec "title" et "url" (obligatoire)
8. "breakdown": Tableau d'objets avec:
   - "option": Nom de l'option
   - "pros": Tableau des avantages
   - "cons": Tableau des inconvénients  
   - "score": Note sur 100

Générez 3-5 options différentes et pertinentes. Soyez concret et actionnable.

Répondez UNIQUEMENT avec un objet JSON valide.`;

  const request: AIRequest = {
    prompt,
    type: 'options',
    files,
    workspaceId
  };

  try {
    console.log('🔍 Sending request to AI providers:', {
      dilemma,
      criteriaList,
      needsRealTimeData,
      hasRealTimeData: !!realTimeData?.content,
      workspaceDocsFound: workspaceDocuments.length,
      promptLength: prompt.length
    });
    
    const response = await aiService.executeWithFallback(request);
    console.log(`✅ Options generated with ${response.provider}`);
    
    const result = response.content;
    
    // Nettoyer la recommandation
    if (result.recommendation) {
      result.recommendation = cleanAIResponse(result.recommendation);
    }
    
    // Résumer la description automatiquement
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
        // Garder la description originale mais la nettoyer
        result.description = cleanAIResponse(result.description);
      }
    }
    
    // Nettoyer les breakdown items
    if (result.breakdown && Array.isArray(result.breakdown)) {
      result.breakdown = result.breakdown.map(item => ({
        ...item,
        option: cleanAIResponse(item.option || ''),
        pros: item.pros?.map(pro => cleanAIResponse(pro)) || [],
        cons: item.cons?.map(con => cleanAIResponse(con)) || []
      }));
    }
    
    // Calculer et assigner la fraîcheur des données
    const calculatedFreshness = calculateDataFreshness(realTimeData, workspaceDocuments.length > 0);
    result.dataFreshness = calculatedFreshness;
    
    console.log(`📊 Data freshness calculated: ${calculatedFreshness}`);
    
    // Ajouter les métadonnées de données en temps réel
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

    // Ajouter les métadonnées des documents workspace
    if (workspaceDocuments.length > 0) {
      result.workspaceData = {
        documentsUsed: workspaceDocuments.length,
        documentSources: workspaceDocuments.map(doc => doc.document.file_name),
        documentsContent: []
      };
    }

    // Ajouter les métadonnées du fournisseur
    result.aiProvider = {
      provider: response.provider,
      model: response.model,
      success: true
    };
    
    // Fetch social content en parallèle
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
    
    // Fallback manuel avec options génériques
    return {
      recommendation: "Analyse manuelle requise",
      description: "Tous les fournisseurs IA ont échoué. Une analyse manuelle est recommandée pour ce dilemme complexe.",
      imageQuery: "decision making analysis flowchart",
      dataFreshness: "stale" as const,
      infoLinks: [],
      shoppingLinks: [],
      breakdown: [
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
          score: 50
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
