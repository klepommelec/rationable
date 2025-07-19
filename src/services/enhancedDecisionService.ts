
import { ICriterion, IResult } from '@/types/decision';
import { AIProviderService, AIRequest } from './aiProviderService';
import { UploadedFileInfo } from './fileUploadService';
import { getWorkspaceDocumentsForAnalysis, searchRelevantContent } from './workspaceDocumentService';
import { supabase } from '@/integrations/supabase/client';

const aiService = AIProviderService.getInstance();

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
    let searchContext = 'Current sports events and recent information';
    
    if (isNBADraft) {
      searchContext = 'NBA Draft 2025 first pick selection results recent news';
    }
    
    try {
      const searchRequest: AIRequest = {
        prompt: isNBADraft ? `NBA Draft 2025 first overall pick winner results ${dilemma}` : dilemma,
        context: searchContext,
        type: 'search'
      };

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
      }
    } catch (searchError) {
      console.warn('⚠️ Real-time search failed, continuing without recent data:', searchError);
      realTimeContext = '\n\nATTENTION: Données en temps réel non disponibles. PRÉCISEZ dans votre réponse que vous ne pouvez pas accéder aux informations récentes et que la réponse pourrait être obsolète.';
    }
  }

  // Récupérer les documents du workspace
  let workspaceContext = '';
  let workspaceDocuments = [];
  
  if (workspaceId) {
    console.log('📚 Fetching workspace documents for options generation...');
    workspaceDocuments = await getWorkspaceDocumentsForAnalysis(workspaceId, dilemma);
    
    if (workspaceDocuments.length > 0) {
      const relevantContent = searchRelevantContent(workspaceDocuments, dilemma, 15);
      if (relevantContent) {
        workspaceContext = `\n\n${relevantContent}`;
        console.log(`✅ Using ${workspaceDocuments.length} workspace documents for analysis`);
      }
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
6. "infoLinks": Tableau de liens utiles avec "title" et "url"
7. "shoppingLinks": Tableau de liens d'achat avec "title" et "url"
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
      promptLength: prompt.length
    });
    
    const response = await aiService.executeWithFallback(request);
    console.log(`✅ Options generated with ${response.provider}`);
    console.log('📝 Response preview:', {
      recommendation: response.content?.recommendation,
      hasBreakdown: Array.isArray(response.content?.breakdown),
      breakdownLength: response.content?.breakdown?.length || 0
    });
    
    const result = response.content;
    
    // Ajouter les métadonnées de données en temps réel
    if (realTimeData) {
      result.realTimeData = {
        hasRealTimeData: !!realTimeData.content,
        timestamp: realTimeData.timestamp,
        sourcesCount: realTimeData.sources?.length || 0,
        searchQuery: realTimeData.searchQuery,
        provider: realTimeData.provider
      };
    }

    // Ajouter les métadonnées des documents workspace
    if (workspaceDocuments.length > 0) {
      result.workspaceData = {
        documentsUsed: workspaceDocuments.length,
        documentSources: workspaceDocuments.map(doc => doc.document.file_name)
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
      confidenceLevel: 20,
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
        documentSources: workspaceDocuments.map(doc => doc.document.file_name)
      } : undefined
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
  
  return hasRealTimeKeyword || (isSportsQuery && isRecentYear);
};
