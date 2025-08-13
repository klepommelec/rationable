import { callOpenAiApi } from './openai';
import { IResult, IFollowUpQuestion } from '@/types/decision';
import { I18nService, SupportedLanguage } from './i18nService';

interface QuickAnswerRequest {
  question: IFollowUpQuestion;
  originalDilemma: string;
  result: IResult;
  language?: SupportedLanguage;
}

export const generateQuickAnswer = async ({ 
  question, 
  originalDilemma, 
  result,
  language
}: QuickAnswerRequest): Promise<string> => {
  try {
    console.log('🚀 Génération de réponse rapide...');
    
    const detectedLanguage = language || I18nService.detectLanguage(originalDilemma);
    
    // Extraire les données temps réel si disponibles
    let realTimeContext = '';
    if (result.realTimeData?.content) {
      realTimeContext = `\n\nDONNÉES RÉCENTES VÉRIFIÉES (${result.realTimeData.timestamp}):\n${result.realTimeData.content}\n\nIMPORTANT: Utilisez EXCLUSIVEMENT ces informations récentes pour répondre. Ignorez toute connaissance antérieure contradictoire.`;
      console.log('📊 Utilisation des données temps réel pour la réponse rapide');
    }
    
    const prompt = buildQuickAnswerPrompt(question, originalDilemma, result, detectedLanguage, realTimeContext);
    
    const response = await callOpenAiApi(prompt);
    
    console.log('✅ Réponse rapide générée avec contexte à jour');
    const fallbackMessages = I18nService.getFallbackMessages(detectedLanguage);
    return response.answer || response.content || fallbackMessages.noAnswerGenerated;
  } catch (error) {
    console.error('❌ Erreur génération réponse rapide:', error);
    const detectedLanguage = language || I18nService.detectLanguage(originalDilemma);
    const fallbackMessages = I18nService.getFallbackMessages(detectedLanguage);
    throw new Error(fallbackMessages.quickAnswerError);
  }
};

const buildQuickAnswerPrompt = (
  question: IFollowUpQuestion, 
  originalDilemma: string, 
  result: IResult,
  language: SupportedLanguage,
  realTimeContext: string = ''
): string => {
  const recommendedOption = result.recommendation;
  
  const prompts = {
    fr: {
      context: 'CONTEXTE',
      originalDilemma: 'Dilemme original',
      mainRecommendation: 'Recommandation principale',
      description: 'Description',
      userQuestion: 'QUESTION DE L\'UTILISATEUR',
      instructions: 'Instructions',
      rules: [
        'Réponds de manière COURTE et ACTIONNABLE (maximum 2-3 phrases)',
        `Sois SPÉCIFIQUE à la recommandation "${recommendedOption}"`,
        'Donne des conseils PRATIQUES et CONCRETS',
        'Focus sur l\'ACTION que l\'utilisateur peut prendre',
        'Évite les généralités - sois précis'
      ],
      responseTypes: 'Types de réponses selon la catégorie',
      categories: {
        next_steps: 'Donne les étapes concrètes à suivre',
        practical_info: 'Fournis les informations pratiques (prix, horaires, accès)',
        alternatives: 'Propose des plans B spécifiques',
        optimization: 'Donne des conseils pour optimiser l\'expérience',
        preparation: 'Indique ce qu\'il faut préparer/savoir'
      },
      conclusion: 'Réponds directement sans introduction, de manière conversationnelle et utile.'
    },
    en: {
      context: 'CONTEXT',
      originalDilemma: 'Original dilemma',
      mainRecommendation: 'Main recommendation',
      description: 'Description',
      userQuestion: 'USER QUESTION',
      instructions: 'Instructions',
      rules: [
        'Answer in a SHORT and ACTIONABLE way (maximum 2-3 sentences)',
        `Be SPECIFIC to the recommendation "${recommendedOption}"`,
        'Give PRACTICAL and CONCRETE advice',
        'Focus on the ACTION the user can take',
        'Avoid generalities - be precise'
      ],
      responseTypes: 'Response types by category',
      categories: {
        next_steps: 'Give concrete steps to follow',
        practical_info: 'Provide practical information (prices, schedules, access)',
        alternatives: 'Suggest specific plan B options',
        optimization: 'Give advice to optimize the experience',
        preparation: 'Indicate what to prepare/know'
      },
      conclusion: 'Answer directly without introduction, in a conversational and useful manner.'
    },
    es: {
      context: 'CONTEXTO',
      originalDilemma: 'Dilema original',
      mainRecommendation: 'Recomendación principal',
      description: 'Descripción',
      userQuestion: 'PREGUNTA DEL USUARIO',
      instructions: 'Instrucciones',
      rules: [
        'Responde de manera CORTA y ACCIONABLE (máximo 2-3 frases)',
        `Sé ESPECÍFICO con la recomendación "${recommendedOption}"`,
        'Da consejos PRÁCTICOS y CONCRETOS',
        'Enfócate en la ACCIÓN que el usuario puede tomar',
        'Evita generalidades - sé preciso'
      ],
      responseTypes: 'Tipos de respuesta según la categoría',
      categories: {
        next_steps: 'Da los pasos concretos a seguir',
        practical_info: 'Proporciona información práctica (precios, horarios, acceso)',
        alternatives: 'Propone planes B específicos',
        optimization: 'Da consejos para optimizar la experiencia',
        preparation: 'Indica qué preparar/saber'
      },
      conclusion: 'Responde directamente sin introducción, de manera conversacional y útil.'
    },
    it: {
      context: 'CONTESTO',
      originalDilemma: 'Dilemma originale',
      mainRecommendation: 'Raccomandazione principale',
      description: 'Descrizione',
      userQuestion: 'DOMANDA DELL\'UTENTE',
      instructions: 'Istruzioni',
      rules: [
        'Rispondi in modo BREVE e AZIONABILE (massimo 2-3 frasi)',
        `Sii SPECIFICO per la raccomandazione "${recommendedOption}"`,
        'Dai consigli PRATICI e CONCRETI',
        'Concentrati sull\'AZIONE che l\'utente può intraprendere',
        'Evita generalità - sii preciso'
      ],
      responseTypes: 'Tipi di risposta per categoria',
      categories: {
        next_steps: 'Dai i passi concreti da seguire',
        practical_info: 'Fornisci informazioni pratiche (prezzi, orari, accesso)',
        alternatives: 'Proponi piani B specifici',
        optimization: 'Dai consigli per ottimizzare l\'esperienza',
        preparation: 'Indica cosa preparare/sapere'
      },
      conclusion: 'Rispondi direttamente senza introduzione, in modo conversazionale e utile.'
    },
    de: {
      context: 'KONTEXT',
      originalDilemma: 'Ursprüngliches Dilemma',
      mainRecommendation: 'Hauptempfehlung',
      description: 'Beschreibung',
      userQuestion: 'BENUTZERFRAGE',
      instructions: 'Anweisungen',
      rules: [
        'Antworte KURZ und UMSETZBAR (maximal 2-3 Sätze)',
        `Sei SPEZIFISCH für die Empfehlung "${recommendedOption}"`,
        'Gib PRAKTISCHE und KONKRETE Ratschläge',
        'Fokussiere dich auf die AKTION, die der Benutzer unternehmen kann',
        'Vermeide Verallgemeinerungen - sei präzise'
      ],
      responseTypes: 'Antworttypen nach Kategorie',
      categories: {
        next_steps: 'Gib konkrete Schritte vor',
        practical_info: 'Liefere praktische Informationen (Preise, Zeiten, Zugang)',
        alternatives: 'Schlage spezifische Plan-B-Optionen vor',
        optimization: 'Gib Ratschläge zur Optimierung der Erfahrung',
        preparation: 'Zeige auf, was vorbereitet/gewusst werden muss'
      },
      conclusion: 'Antworte direkt ohne Einleitung, auf eine gesprächige und nützliche Weise.'
    }
  };
  
  const prompt = prompts[language] || prompts.fr;
  
  return `
${prompt.context}:
- ${prompt.originalDilemma}: "${originalDilemma}"
- ${prompt.mainRecommendation}: "${recommendedOption}"
- ${prompt.description}: "${result.description}"${realTimeContext}

${prompt.userQuestion}: "${question.text}"

${prompt.instructions}:
${prompt.rules.map((rule, index) => `${index + 1}. ${rule}`).join('\n')}

${prompt.responseTypes}:
- next_steps: ${prompt.categories.next_steps}
- practical_info: ${prompt.categories.practical_info}
- alternatives: ${prompt.categories.alternatives}
- optimization: ${prompt.categories.optimization}
- preparation: ${prompt.categories.preparation}

${prompt.conclusion}
`;
};