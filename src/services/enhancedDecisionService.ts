
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
    // Nettoyer seulement les espaces multiples sans supprimer de contenu important
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

// Fonction utilitaire pour détecter les requêtes nécessitant des données externes
const detectExternalDataNeeded = (dilemma: string): boolean => {
  const lowerDilemma = dilemma.toLowerCase();
  
  // Questions nécessitant des données factuelles récentes ou spécifiques
  const factualKeywords = [
    // Questions temporelles
    'qui a gagné', 'qui a été', 'qui sera', 'vainqueur', 'gagnant', 'résultat',
    'classement', 'podium', 'champion', 'finale',
    
    // Événements actuels
    'exposition', 'expositions', 'du moment', 'actuellement', 'en cours',
    'programme', 'programmation', 'horaires',
    
    // Informations spécifiques sur des lieux/organisations
    'musée', 'théâtre', 'galerie', 'centre', 'établissement',
    
    // Données temporelles dynamiques
    'maintenant', 'aujourd\'hui', 'cette année', 'ce mois', 'cette semaine',
    'récent', 'dernière', 'nouveau', 'nouvelle', 'tendance', 'actualité',
    
    // Questions directes factuelles
    'quel est', 'quels sont', 'quelles sont', 'où est', 'où sont',
    'combien', 'comment', 'quand', 'pourquoi',
    
    // Sports et compétitions
    'draft', 'NBA', 'football', 'sport', 'joueur', 'équipe', 'match', 
    'championship', 'tournoi', 'compétition', 'ligue'
  ];
  
  // Détection d'années (dynamique pour éviter le hardcoding)
  const currentYear = new Date().getFullYear();
  const yearPattern = new RegExp(`(${currentYear - 1}|${currentYear}|${currentYear + 1}|${currentYear + 2})`, 'i');
  const hasRelevantYear = yearPattern.test(dilemma);
  
  const hasFactualKeyword = factualKeywords.some(keyword => lowerDilemma.includes(keyword));
  
  const needsExternalData = hasFactualKeyword || hasRelevantYear;
  
  console.log('🔍 External data detection:', {
    dilemma: dilemma.substring(0, 50) + '...',
    hasFactualKeyword,
    hasRelevantYear,
    needsExternalData
  });
  
  return needsExternalData;
};

export const generateOptionsWithFallback = async (
  dilemma: string, 
  criteria: ICriterion[], 
  files?: UploadedFileInfo[], 
  workspaceId?: string
): Promise<IResult> => {
  console.log('🎯 Generating options with multi-provider fallback');

  // Déterminer le type de question en utilisant le service de classification
  const questionType = await detectQuestionType(dilemma);
  console.log(`🎯 Question type determined: ${questionType}`);

  const criteriaList = criteria.map(c => c.name).join(', ');
  
  // Vérifier si on a besoin de données externes (temps réel ou factuelles)
  const needsExternalData = detectExternalDataNeeded(dilemma);
  let realTimeContext = '';
  let realTimeData = null;

  if (needsExternalData) {
    console.log('🔍 External data needed, using search providers...');
    
    // Déterminer le contexte de recherche approprié
    let searchContext = 'Informations actuelles et vérifiées';
    
    // Context spécifique selon le type de question
    if (/exposition|musée|galerie/i.test(dilemma)) {
      searchContext = 'Expositions actuelles et événements culturels';
    } else if (/sport|football|NBA|tennis|championnat/i.test(dilemma)) {
      searchContext = 'Résultats sportifs récents et compétitions actuelles';
    } else if (/qui a gagné|vainqueur|gagnant|résultat/i.test(dilemma)) {
      searchContext = 'Résultats récents et informations vérifiées';
    } else if (/élection|politique/i.test(dilemma)) {
      searchContext = 'Actualités politiques et électorales récentes';
    }
    
    try {
      const searchRequest: AIRequest = {
        prompt: dilemma,
        context: searchContext,
        type: 'search'
      };

      console.log('🔍 Searching for external data with context:', searchContext);
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
        
        // Prompt plus strict pour forcer l'utilisation exclusive des données
        realTimeContext = `\n\n🎯 DONNÉES EXTERNES VÉRIFIÉES (${realTimeData.timestamp}, source: ${searchResponse.provider}) 🎯:\n${realTimeData.content}\n\n⚠️ INSTRUCTIONS CRITIQUES ⚠️:\n- Vous DEVEZ utiliser EXCLUSIVEMENT ces données vérifiées\n- IGNOREZ toute connaissance antérieure contradictoire\n- Si les données ci-dessus ne répondent pas complètement, PRÉCISEZ-LE clairement\n- NE générez AUCUNE information qui ne provient pas de ces données\n- Mentionnez l'année actuelle (${new Date().getFullYear()}) quand c'est pertinent`;
        
        console.log('✅ External data retrieved successfully from:', searchResponse.provider);
      }
    } catch (searchError) {
      console.warn('⚠️ External data search failed, continuing without recent data:', searchError);
      realTimeContext = '\n\n⚠️ ATTENTION ⚠️: Données externes non disponibles. VOUS DEVEZ préciser clairement dans votre réponse que vous ne pouvez pas accéder aux informations récentes et que la réponse pourrait être obsolète ou incomplète.';
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
  
  let prompt = '';

  // Approche unifiée pour tous les types de questions
  prompt = `
Analysez ce dilemme et générez EXACTEMENT 3 à 5 options différentes avec évaluation détaillée.

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
6. "infoLinks": Tableau de 3-5 liens utiles avec "title" et "url" (obligatoire)
7. "shoppingLinks": Tableau de 2-3 liens d'achat avec "title" et "url" (obligatoire)
8. "breakdown": Tableau de 3-5 objets avec:
   - "option": Nom de l'option (différent pour chaque option)
   - "pros": Tableau des avantages spécifiques
   - "cons": Tableau des inconvénients spécifiques
   - "score": Note sur 100 (VARIEZ les scores: 85-95 pour la meilleure, 70-84 pour les bonnes, 50-69 pour les moyennes)

Exemple de breakdown attendu:
[
  {"option": "Tesla Model 3", "pros": ["..."], "cons": ["..."], "score": 88},
  {"option": "BMW i4", "pros": ["..."], "cons": ["..."], "score": 82},
  {"option": "Peugeot e-208", "pros": ["..."], "cons": ["..."], "score": 76},
  {"option": "Renault Zoe", "pros": ["..."], "cons": ["..."], "score": 71}
]

Générez des options concrètes et pertinentes avec des scores réalistes et variés.

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
      questionType,
      criteriaList,
      needsExternalData,
      hasExternalData: !!realTimeData?.content,
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
    
    // Garder la description complète - pas de résumé automatique
    if (result.description) {
      // Nettoyer légèrement la description sans la raccourcir
      result.description = result.description.trim();
    }
    
    // Conserver les breakdown items avec un nettoyage minimal
    if (result.breakdown && Array.isArray(result.breakdown)) {
      result.breakdown = result.breakdown.map(item => ({
        ...item,
        option: item.option || '',
        pros: item.pros || [],
        cons: item.cons || []
      }));
    }
    
    // Calculer et assigner la fraîcheur des données
    const calculatedFreshness = calculateDataFreshness(realTimeData, workspaceDocuments.length > 0);
    result.dataFreshness = calculatedFreshness;
    
    console.log(`📊 Data freshness calculated: ${calculatedFreshness}`);
    
    // Ajouter le type de résultat
    // Type unifié supprimé
    
    // Ajouter les métadonnées de données en temps réel (mais sans afficher les sources dans l'UI pour l'instant)
    if (realTimeData) {
      result.realTimeData = {
        hasRealTimeData: !!realTimeData.content,
        timestamp: realTimeData.timestamp,
        sourcesCount: realTimeData.sources?.length || 0,
        searchQuery: realTimeData.searchQuery,
        provider: realTimeData.provider,
        sources: realTimeData.sources || [],
        content: realTimeData.content
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
          option: "Réponse non disponible",
          pros: ["Nécessite une recherche manuelle"],
          cons: ["Données insuffisantes"],
          score: 50
        },
        {
          option: "Option A",
          pros: ["À définir selon le contexte"],
          cons: ["Nécessite une analyse approfondie"],
          score: 45
        },
        {
          option: "Option B", 
          pros: ["À évaluer manuellement"],
          cons: ["Données insuffisantes"],
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
