
import { ICriterion, IResult } from '@/types/decision';
import { AIProviderService, AIRequest } from './aiProviderService';
import { UploadedFileInfo } from './fileUploadService';
import { getWorkspaceDocumentsForAnalysis, searchRelevantContent } from './workspaceDocumentService';
import { supabase } from '@/integrations/supabase/client';
import { summarizeDecisionDescription } from './descriptionSummaryService';
import { detectQuestionType, QuestionType } from './questionClassificationService';
import { getLanguagePrompts } from '@/utils/languageDetection';

const aiService = AIProviderService.getInstance();

/** Cache en mémoire pour les résultats de génération d'options (dilemma + critères). TTL 24h. */
const OPTIONS_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const optionsGenerationCache = new Map<string, { result: IResult; timestamp: number }>();

const getOptionsCacheKey = (dilemma: string, criteriaList: string, language?: string, workspaceId?: string): string => {
  return [dilemma.trim().toLowerCase(), criteriaList, language ?? '', workspaceId ?? ''].join('|');
};

const getCachedOptions = (key: string): IResult | null => {
  const entry = optionsGenerationCache.get(key);
  if (!entry || Date.now() - entry.timestamp > OPTIONS_CACHE_TTL_MS) {
    if (entry) optionsGenerationCache.delete(key);
    return null;
  }
  console.log('✅ Options cache hit');
  return entry.result;
};

const setCachedOptions = (key: string, result: IResult): void => {
  optionsGenerationCache.set(key, { result, timestamp: Date.now() });
  if (optionsGenerationCache.size > 100) {
    const oldest = [...optionsGenerationCache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
    if (oldest) optionsGenerationCache.delete(oldest[0]);
  }
};

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
  workspaceId?: string,
  language?: 'fr' | 'en' | 'es' | 'it' | 'de',
  realTimeSearchEnabled: boolean = true
) => {
  console.log('🎯 Generating criteria with multi-provider fallback');
  console.log(`🤖 AI Analysis enabled: ${realTimeSearchEnabled}`);

  // Si l'IA est désactivée, utiliser des critères manuels basiques
  if (!realTimeSearchEnabled) {
    console.log('🚫 AI disabled - using manual criteria');
    return generateManualCriteria(dilemma, language);
  }

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

  // Get language-specific prompts
  const languagePrompts = getLanguagePrompts(language);
  
  let prompt = `${languagePrompts.systemInstruction}

${languagePrompts.criteriaInstruction}

${language === 'fr' ? 'Dilemme' : language === 'en' ? 'Dilemma' : language === 'es' ? 'Dilema' : language === 'it' ? 'Dilemma' : 'Dilemma'}: "${dilemma}"${workspaceContext}`;

  if (files && files.length > 0) {
    const attachedDocsText = language === 'fr' ? 'Documents joints à analyser' : 
                           language === 'en' ? 'Attached documents to analyze' :
                           language === 'es' ? 'Documentos adjuntos para analizar' :
                           language === 'it' ? 'Documenti allegati da analizzare' :
                           'Angehängte Dokumente zur Analyse';
    
    const fileText = language === 'fr' ? 'fichier(s)' : 
                    language === 'en' ? 'file(s)' :
                    language === 'es' ? 'archivo(s)' :
                    language === 'it' ? 'file' :
                    'Datei(en)';
    
    const analyzeText = language === 'fr' ? 'Analysez le contenu de ces documents pour mieux comprendre le contexte du dilemme et ajustez les critères en conséquence.' :
                       language === 'en' ? 'Analyze the content of these documents to better understand the context of the dilemma and adjust the criteria accordingly.' :
                       language === 'es' ? 'Analiza el contenido de estos documentos para comprender mejor el contexto del dilema y ajusta los criterios en consecuencia.' :
                       language === 'it' ? 'Analizza il contenuto di questi documenti per comprendere meglio il contesto del dilemma e regola i criteri di conseguenza.' :
                       'Analysieren Sie den Inhalt dieser Dokumente, um den Kontext des Dilemmas besser zu verstehen und die Kriterien entsprechend anzupassen.';
    
    prompt += `

${attachedDocsText} (${files.length} ${fileText}) :
${files.map(f => `- ${f.fileName} (${f.fileType})`).join('\n')}

${analyzeText}`;
  }

  const respondText = language === 'fr' ? 'Répondez UNIQUEMENT avec un objet JSON valide contenant "emoji", "criteria" et "suggestedCategory".' :
                     language === 'en' ? 'Respond ONLY with a valid JSON object containing "emoji", "criteria" and "suggestedCategory".' :
                     language === 'es' ? 'Responde ÚNICAMENTE con un objeto JSON válido que contenga "emoji", "criteria" y "suggestedCategory".' :
                     language === 'it' ? 'Rispondi SOLO con un oggetto JSON valido contenente "emoji", "criteria" e "suggestedCategory".' :
                     'Antworten Sie NUR mit einem gültigen JSON-Objekt, das "emoji", "criteria" und "suggestedCategory" enthält.';

  prompt += `

${respondText}

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
    workspaceId,
    language
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

// Fonction utilitaire pour détecter les requêtes nécessitant des données externes (OPTIMISÉE avec kill switch)
const detectExternalDataNeeded = (dilemma: string, realTimeSearchEnabled: boolean = true): boolean => {
  // Si la recherche en temps réel est désactivée, pas de données externes
  if (!realTimeSearchEnabled) {
    console.log('🚫 Real-time search disabled - no external search');
    return false;
  }
  
  const lowerDilemma = dilemma.toLowerCase();
  
  // Mots-clés négatifs - questions génériques qui n'ont PAS besoin de données externes
  const negativeKeywords = [
    'préférez-vous', 'choisir entre', 'que penses-tu', 'ton avis', 'votre opinion',
    'recommandez-vous', 'suggestions', 'conseils', 'vaut-il mieux',
    'devrais-je', 'dois-je', 'comment faire', 'lequel choisir',
    'avantages et inconvénients', 'pros and cons', 'mieux', 'plutôt',
    'ou bien', 'alternative', 'option', 'solution'
  ];
  
  // Si c'est une question générique/d'opinion, pas besoin de données externes
  const isGenericQuestion = negativeKeywords.some(keyword => lowerDilemma.includes(keyword));
  if (isGenericQuestion) {
    console.log('🚫 Generic question detected - no external search needed');
    return false;
  }
  
  // Questions nécessitant des données factuelles récentes ou spécifiques (TRÈS RÉDUITE)
  const factualKeywords = [
    // Questions temporelles critiques uniquement
    'qui a gagné', 'vainqueur', 'gagnant', 'résultat aujourd\'hui', 'classement actuel',
    
    // Événements actuels très précis
    'exposition actuellement', 'programme ce soir', 'en cours maintenant',
    'ouvert aujourd\'hui', 'fermé aujourd\'hui',
    
    // Prix et disponibilité actuels
    'prix actuel', 'stock actuel', 'disponible maintenant'
  ];
  
  // Détection d'années (plus restrictive - seulement année courante avec contexte)
  const currentYear = new Date().getFullYear();
  const hasCurrentYearWithRealTimeContext = lowerDilemma.includes(`${currentYear}`) && 
    (lowerDilemma.includes('horaire') || lowerDilemma.includes('prix') || 
     lowerDilemma.includes('programme') || lowerDilemma.includes('résultat'));
  
  const hasFactualKeyword = factualKeywords.some(keyword => lowerDilemma.includes(keyword));
  
  const needsExternalData = hasFactualKeyword || hasCurrentYearWithRealTimeContext;
  
  console.log('🔍 External data detection (optimized with kill switch):', {
    dilemma: dilemma.substring(0, 50) + '...',
    realTimeSearchEnabled,
    isGenericQuestion,
    hasFactualKeyword,
    hasCurrentYearWithRealTimeContext,
    needsExternalData
  });
  
  return needsExternalData;
};

// Critères manuels basiques quand l'IA est désactivée
const generateManualCriteria = async (
  dilemma: string, 
  language: 'fr' | 'en' | 'es' | 'it' | 'de' = 'fr'
): Promise<{ criteria: string[], suggestedCategory?: string }> => {
  console.log('📝 Generating manual criteria (AI disabled)');
  
  // Critères génériques basiques (format string pour compatibilité)
  const basicCriteria = [
    'Coût',
    'Temps', 
    'Qualité',
    'Risque',
    'Impact',
    'Faisabilité'
  ];

  return {
    criteria: basicCriteria,
    suggestedCategory: 'manual'
  };
};

// Mode manuel simplifié quand l'IA est désactivée
const generateManualOptions = async (
  dilemma: string, 
  criteria: ICriterion[], 
  language: 'fr' | 'en' | 'es' | 'it' | 'de' = 'fr'
): Promise<IResult> => {
  console.log('📝 Generating manual options (AI disabled)');
  
  const criteriaList = criteria.map(c => c.name).join(', ');
  
  // Générer des options basiques sans IA
  const basicOptions = [
    {
      title: "Option 1",
      description: "Première option à considérer pour votre décision",
      pros: ["Avantage 1", "Avantage 2"],
      cons: ["Inconvénient 1", "Inconvénient 2"]
    },
    {
      title: "Option 2", 
      description: "Deuxième option à considérer pour votre décision",
      pros: ["Avantage 1", "Avantage 2"],
      cons: ["Inconvénient 1", "Inconvénient 2"]
    },
    {
      title: "Option 3",
      description: "Troisième option à considérer pour votre décision", 
      pros: ["Avantage 1", "Avantage 2"],
      cons: ["Inconvénient 1", "Inconvénient 2"]
    }
  ];

  return {
    options: basicOptions,
    recommendation: "Mode manuel activé - Veuillez personnaliser ces options selon vos besoins",
    description: `Analyse manuelle de votre décision : "${dilemma}". Critères considérés : ${criteriaList}`,
    criteria: criteria,
    questionType: 'manual',
    realTimeData: null,
    workspaceData: null
  };
};

export const generateOptionsWithFallback = async (
  dilemma: string, 
  criteria: ICriterion[], 
  files?: UploadedFileInfo[], 
  workspaceId?: string,
  language?: 'fr' | 'en' | 'es' | 'it' | 'de',
  realTimeSearchEnabled: boolean = true
): Promise<IResult> => {
  console.log('🎯 Generating options with multi-provider fallback');
  console.log(`🤖 AI Analysis enabled: ${realTimeSearchEnabled}`);

  // Si l'IA est désactivée, utiliser un mode manuel simplifié
  if (!realTimeSearchEnabled) {
    console.log('🚫 AI disabled - using manual mode');
    return generateManualOptions(dilemma, criteria, language);
  }

  const criteriaList = criteria.map(c => c.name).join(', ');

  // Cache : retourner le résultat en cache si même dilemma + critères (sans fichiers)
  if (!files?.length) {
    const cacheKey = getOptionsCacheKey(dilemma, criteriaList, language, workspaceId);
    const cached = getCachedOptions(cacheKey);
    if (cached) return cached;
  }

  // Déterminer le type de question en utilisant le service de classification
  const questionType = await detectQuestionType(dilemma);
  console.log(`🎯 Question type determined: ${questionType}`);
  
  // Paralléliser : données externes et documents workspace en même temps
  const needsExternalData = detectExternalDataNeeded(dilemma, realTimeSearchEnabled);

  const fetchExternalData = async (): Promise<{ realTimeContext: string; realTimeData: any }> => {
    if (!needsExternalData) return { realTimeContext: '', realTimeData: null };
    console.log('🔍 External data needed, using search providers...');
    let searchContext = 'Informations actuelles et vérifiées';
    if (/exposition|musée|galerie/i.test(dilemma)) searchContext = 'Expositions actuelles et événements culturels';
    else if (/sport|football|NBA|tennis|championnat/i.test(dilemma)) searchContext = 'Résultats sportifs récents et compétitions actuelles';
    else if (/qui a gagné|vainqueur|gagnant|résultat/i.test(dilemma)) searchContext = 'Résultats récents et informations vérifiées';
    else if (/élection|politique/i.test(dilemma)) searchContext = 'Actualités politiques et électorales récentes';
    try {
      const searchResponse = await aiService.executeWithFallback({ prompt: dilemma, context: searchContext, type: 'search', language });
      if (searchResponse.success && searchResponse.content) {
        const realTimeData = {
          content: searchResponse.content.content || searchResponse.content,
          sources: searchResponse.content.sources || searchResponse.content.citations || [],
          timestamp: searchResponse.content.timestamp || new Date().toISOString(),
          searchQuery: dilemma,
          provider: searchResponse.provider,
          hasRealTimeData: true
        };
        const realTimeContext = `\n\n🎯 DONNÉES EXTERNES VÉRIFIÉES (${realTimeData.timestamp}, source: ${searchResponse.provider}) 🎯:\n${realTimeData.content}\n\n⚠️ INSTRUCTIONS CRITIQUES ⚠️:\n- Vous DEVEZ utiliser EXCLUSIVEMENT ces données vérifiées\n- IGNOREZ toute connaissance antérieure contradictoire\n- Si les données ci-dessus ne répondent pas complètement, PRÉCISEZ-LE clairement\n- NE générez AUCUNE information qui ne provient pas de ces données\n- Mentionnez l'année actuelle (${new Date().getFullYear()}) quand c'est pertinent`;
        console.log('✅ External data retrieved successfully from:', searchResponse.provider);
        return { realTimeContext, realTimeData };
      }
    } catch (searchError) {
      console.warn('⚠️ External data search failed, continuing without recent data:', searchError);
    }
    return { realTimeContext: '\n\n⚠️ ATTENTION ⚠️: Données externes non disponibles. VOUS DEVEZ préciser clairement dans votre réponse que vous ne pouvez pas accéder aux informations récentes et que la réponse pourrait être obsolète ou incomplète.', realTimeData: null };
  };

  const fetchWorkspaceContext = async (): Promise<{ workspaceContext: string; workspaceDocuments: any[] }> => {
    if (!workspaceId) return { workspaceContext: '', workspaceDocuments: [] };
    console.log('📚 Fetching workspace documents for options generation...');
    const workspaceDocuments = await getWorkspaceDocumentsForAnalysis(workspaceId, dilemma);
    if (workspaceDocuments.length === 0) {
      console.log('📝 No relevant workspace documents found for this query');
      return { workspaceContext: '', workspaceDocuments: [] };
    }
    const relevantContent = searchRelevantContent(workspaceDocuments, dilemma, 15);
    const workspaceContext = relevantContent ? `\n\n${relevantContent}` : '';
    if (workspaceContext) console.log(`✅ Using ${workspaceDocuments.length} relevant workspace documents for analysis`);
    return { workspaceContext, workspaceDocuments };
  };

  const [{ realTimeContext, realTimeData }, { workspaceContext, workspaceDocuments }] = await Promise.all([
    fetchExternalData(),
    fetchWorkspaceContext()
  ]);
  
  // Get language-specific prompts
  const languagePrompts = getLanguagePrompts(language);
  
  const dilemmaText = language === 'fr' ? 'Dilemme' : 
                     language === 'en' ? 'Dilemma' :
                     language === 'es' ? 'Dilema' :
                     language === 'it' ? 'Dilemma' :
                     'Dilemma';
  
  const criteriaText = language === 'fr' ? 'Critères d\'évaluation' :
                      language === 'en' ? 'Evaluation criteria' :
                      language === 'es' ? 'Criterios de evaluación' :
                      language === 'it' ? 'Criteri di valutazione' :
                      'Bewertungskriterien';

  let prompt = `${languagePrompts.systemInstruction}

${languagePrompts.optionsInstruction}

${dilemmaText}: "${dilemma}"
${criteriaText}: ${criteriaList}${realTimeContext}${workspaceContext}`;

  if (files && files.length > 0) {
    const attachedDocsText = language === 'fr' ? 'Documents joints à analyser' : 
                           language === 'en' ? 'Attached documents to analyze' :
                           language === 'es' ? 'Documentos adjuntos para analizar' :
                           language === 'it' ? 'Documenti allegati da analizzare' :
                           'Angehängte Dokumente zur Analyse';
    
    const fileText = language === 'fr' ? 'fichier(s)' : 
                    language === 'en' ? 'file(s)' :
                    language === 'es' ? 'archivo(s)' :
                    language === 'it' ? 'file' :
                    'Datei(en)';
    
    const analyzeText = language === 'fr' ? 'Analysez le contenu de ces documents pour enrichir votre analyse et vos recommandations.' :
                       language === 'en' ? 'Analyze the content of these documents to enrich your analysis and recommendations.' :
                       language === 'es' ? 'Analiza el contenido de estos documentos para enriquecer tu análisis y recomendaciones.' :
                       language === 'it' ? 'Analizza il contenuto di questi documenti per arricchire la tua analisi e le tue raccomandazioni.' :
                       'Analysieren Sie den Inhalt dieser Dokumente, um Ihre Analyse und Empfehlungen zu bereichern.';
    
    prompt += `

${attachedDocsText} (${files.length} ${fileText}) :
${files.map(f => `- ${f.fileName} (${f.fileType})`).join('\n')}

${analyzeText}`;
  }

  // Instructions de réponse allégées : 4-6 options, liens optionnels (une seule langue selon language)
  const responseInstructions = language === 'fr' ?
    `Générez entre 4 et 6 options distinctes avec des scores variés. JSON avec: "recommendation", "description", "confidenceLevel" (1-100), "dataFreshness" ("very-fresh"|"fresh"|"moderate"|"stale"), "infoLinks" et "shoppingLinks" (optionnels, tableaux avec "title"/"url"), "breakdown": tableau de 4-6 objets avec "option", "description" (2-3 lignes), "pros", "cons", "score" (85-95 meilleure, 70-84 bonnes, 50-69 moyennes). Répondez UNIQUEMENT en JSON valide.` :
    language === 'en' ?
    `Generate 4 to 6 distinct options with varied scores. JSON with: "recommendation", "description", "confidenceLevel" (1-100), "dataFreshness" ("very-fresh"|"fresh"|"moderate"|"stale"), "infoLinks" and "shoppingLinks" (optional, arrays with "title"/"url"), "breakdown": array of 4-6 objects with "option", "description" (2-3 lines), "pros", "cons", "score" (85-95 best, 70-84 good, 50-69 average). Respond ONLY with valid JSON.` :
    language === 'es' ?
    `Genera 4 a 6 opciones distintas con puntuaciones variadas. JSON con: "recommendation", "description", "confidenceLevel" (1-100), "dataFreshness", "infoLinks" y "shoppingLinks" (opcionales), "breakdown": array de 4-6 objetos con "option", "description", "pros", "cons", "score". Responde ÚNICAMENTE en JSON válido.` :
    language === 'it' ?
    `Genera 4-6 opzioni distinte con punteggi variati. JSON con: "recommendation", "description", "confidenceLevel", "dataFreshness", "infoLinks" e "shoppingLinks" (opzionali), "breakdown": array di 4-6 oggetti con "option", "description", "pros", "cons", "score". Rispondi SOLO con JSON valido.` :
    `Generieren Sie 4-6 Optionen mit variierten Bewertungen. JSON mit: "recommendation", "description", "confidenceLevel", "dataFreshness", "infoLinks" und "shoppingLinks" (optional), "breakdown": Array mit 4-6 Objekten mit "option", "description", "pros", "cons", "score". Antworten Sie NUR mit gültigem JSON.`;

  // Use the complete localized instruction from languagePrompts
  prompt += `

${responseInstructions}`;

  // The responseInstructions now contains all the JSON structure requirements in the right language

  const request: AIRequest = {
    prompt,
    type: 'options',
    files,
    workspaceId,
    language
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
        description: item.description || undefined,
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

    if (!files?.length) setCachedOptions(getOptionsCacheKey(dilemma, criteriaList, language, workspaceId), result);
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
