
import { ICriterion, IResult } from '@/types/decision';
import { AIProviderService, AIRequest } from './aiProviderService';
import { UploadedFileInfo } from './fileUploadService';
import { getWorkspaceDocumentsForAnalysis, searchRelevantContent } from './workspaceDocumentService';
import { supabase } from '@/integrations/supabase/client';
import { summarizeDecisionDescription } from './descriptionSummaryService';
import { detectQuestionType, QuestionType } from './questionClassificationService';
import { getLanguagePrompts } from '@/utils/languageDetection';

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
  workspaceId?: string,
  language?: 'fr' | 'en' | 'es' | 'it' | 'de'
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

export const generateOptionsWithFallback = async (
  dilemma: string, 
  criteria: ICriterion[], 
  files?: UploadedFileInfo[], 
  workspaceId?: string,
  language?: 'fr' | 'en' | 'es' | 'it' | 'de',
  realTimeSearchEnabled: boolean = true
): Promise<IResult> => {
  console.log('🎯 Generating options with multi-provider fallback');

  // Déterminer le type de question en utilisant le service de classification
  const questionType = await detectQuestionType(dilemma);
  console.log(`🎯 Question type determined: ${questionType}`);

  const criteriaList = criteria.map(c => c.name).join(', ');
  
  // Vérifier si on a besoin de données externes (temps réel ou factuelles)
  const needsExternalData = detectExternalDataNeeded(dilemma, realTimeSearchEnabled);
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
        type: 'search',
        language
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

  // Create localized response format instructions
  const responseInstructions = language === 'fr' ? 
    `IMPORTANT: Vous DEVEZ générer entre 6 et 8 options distinctes et de qualité avec des scores différents (pas tous identiques).

Retournez un objet JSON avec:
1. "recommendation": La meilleure option recommandée (texte court)
2. "description": Explication détaillée de pourquoi cette option est recommandée
3. "imageQuery": Description pour générer une image (en anglais, très descriptive)
4. "confidenceLevel": Niveau de confiance de l'analyse (1-100)
5. "dataFreshness": Fraîcheur des données utilisées ("very-fresh", "fresh", "moderate", "stale")
6. "infoLinks": Tableau de 3-5 liens utiles avec "title" et "url" (obligatoire)
7. "shoppingLinks": Tableau de 2-3 liens d'achat avec "title" et "url" (obligatoire)
8. "breakdown": Tableau de 6-8 objets avec:
   - "option": Nom de l'option (différent pour chaque option)
   - "pros": Tableau des avantages spécifiques
   - "cons": Tableau des inconvénients spécifiques
   - "score": Note sur 100 (VARIEZ les scores: 85-95 pour la meilleure, 70-84 pour les bonnes, 50-69 pour les moyennes)

Générez des options concrètes et pertinentes avec des scores réalistes et variés. Évitez les options génériques sans valeur.

Répondez UNIQUEMENT avec un objet JSON valide.` :
    language === 'en' ? 
    `IMPORTANT: You MUST generate between 6 and 8 distinct quality options with different scores (not all identical).

Return a JSON object with:
1. "recommendation": The best recommended option (short text)
2. "description": Detailed explanation of why this option is recommended
3. "imageQuery": Description to generate an image (in English, very descriptive)
4. "confidenceLevel": Analysis confidence level (1-100)
5. "dataFreshness": Freshness of data used ("very-fresh", "fresh", "moderate", "stale")
6. "infoLinks": Array of 3-5 useful links with "title" and "url" (mandatory)
7. "shoppingLinks": Array of 2-3 purchase links with "title" and "url" (mandatory)
8. "breakdown": Array of 6-8 objects with:
   - "option": Option name (different for each option)
   - "pros": Array of specific advantages
   - "cons": Array of specific disadvantages
   - "score": Score out of 100 (VARY scores: 85-95 for best, 70-84 for good, 50-69 for average)

Generate concrete and relevant options with realistic and varied scores. Avoid generic options without value.

Respond ONLY with a valid JSON object.` :
    language === 'es' ?
    `IMPORTANTE: DEBES generar entre 6 y 8 opciones distintas de calidad con puntuaciones diferentes (no todas idénticas).

Devuelve un objeto JSON con:
1. "recommendation": La mejor opción recomendada (texto corto)
2. "description": Explicación detallada de por qué se recomienda esta opción
3. "imageQuery": Descripción para generar una imagen (en inglés, muy descriptiva)
4. "confidenceLevel": Nivel de confianza del análisis (1-100)
5. "dataFreshness": Frescura de los datos utilizados ("very-fresh", "fresh", "moderate", "stale")
6. "infoLinks": Array de 3-5 enlaces útiles con "title" y "url" (obligatorio)
7. "shoppingLinks": Array de 2-3 enlaces de compra con "title" y "url" (obligatorio)
8. "breakdown": Array de 6-8 objetos con:
   - "option": Nombre de la opción (diferente para cada opción)
   - "pros": Array de ventajas específicas
   - "cons": Array de desventajas específicas
   - "score": Puntuación sobre 100 (VARIA las puntuaciones: 85-95 para la mejor, 70-84 para las buenas, 50-69 para las promedio)

Genera opciones concretas y relevantes con puntuaciones realistas y variadas. Evita opciones genéricas sin valor.

Responde ÚNICAMENTE con un objeto JSON válido.` :
    language === 'it' ?
    `IMPORTANTE: DEVI generare tra 6 e 8 opzioni distinte di qualità con punteggi diversi (non tutti identici).

Restituisci un oggetto JSON con:
1. "recommendation": La migliore opzione raccomandata (testo breve)
2. "description": Spiegazione dettagliata del perché questa opzione è raccomandata
3. "imageQuery": Descrizione per generare un'immagine (in inglese, molto descrittiva)
4. "confidenceLevel": Livello di fiducia dell'analisi (1-100)
5. "dataFreshness": Freschezza dei dati utilizzati ("very-fresh", "fresh", "moderate", "stale")
6. "infoLinks": Array di 3-5 link utili con "title" e "url" (obbligatorio)
7. "shoppingLinks": Array di 2-3 link di acquisto con "title" e "url" (obbligatorio)
8. "breakdown": Array di 6-8 oggetti con:
   - "option": Nome dell'opzione (diverso per ogni opzione)
   - "pros": Array di vantaggi specifici
   - "cons": Array di svantaggi specifici
   - "score": Punteggio su 100 (VARIA i punteggi: 85-95 per il migliore, 70-84 per i buoni, 50-69 per la media)

Genera opzioni concrete e pertinenti con punteggi realistici e variati. Evita opzioni generiche senza valore.

Rispondi SOLO con un oggetto JSON valido.` :
    `WICHTIG: Sie MÜSSEN zwischen 6 und 8 unterschiedliche Qualitätsoptionen mit verschiedenen Bewertungen generieren (nicht alle identisch).

Geben Sie ein JSON-Objekt zurück mit:
1. "recommendation": Die beste empfohlene Option (kurzer Text)
2. "description": Detaillierte Erklärung, warum diese Option empfohlen wird
3. "imageQuery": Beschreibung zur Bildgenerierung (auf Englisch, sehr beschreibend)
4. "confidenceLevel": Vertrauensniveau der Analyse (1-100)
5. "dataFreshness": Aktualität der verwendeten Daten ("very-fresh", "fresh", "moderate", "stale")
6. "infoLinks": Array von 3-5 nützlichen Links mit "title" und "url" (obligatorisch)
7. "shoppingLinks": Array von 2-3 Einkaufslinks mit "title" und "url" (obligatorisch)
8. "breakdown": Array von 6-8 Objekten mit:
   - "option": Optionsname (unterschiedlich für jede Option)
   - "pros": Array spezifischer Vorteile
   - "cons": Array spezifischer Nachteile
   - "score": Bewertung von 100 (VARIIEREN Sie die Bewertungen: 85-95 für die beste, 70-84 für gute, 50-69 für durchschnittliche)

Generieren Sie konkrete und relevante Optionen mit realistischen und varierten Bewertungen. Vermeiden Sie generische Optionen ohne Wert.

Antworten Sie NUR mit einem gültigen JSON-Objekt.`;

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
