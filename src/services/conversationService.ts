
import { IConversationQuestion, IConversationResponse } from '@/types/conversation';
import { IResult } from '@/types/decision';
import { callOpenAiApi } from '@/services/openai';

export const generateConversationQuestions = async (dilemma: string): Promise<IConversationResponse> => {
    const prompt = `En tant qu'assistant expert en prise de décision, pour le dilemme : "${dilemma}", générez 3-4 questions de clarification stratégiques qui m'aideront à mieux comprendre le contexte et les priorités de l'utilisateur.

    Retournez un objet JSON avec la structure suivante :
    {
      "questions": [
        {
          "id": "question_1",
          "type": "text|choice|scale",
          "question": "Question claire et pertinente",
          "placeholder": "Texte d'aide optionnel",
          "choices": ["Option 1", "Option 2"] // seulement pour type "choice",
          "min": 1, // seulement pour type "scale"
          "max": 5, // seulement pour type "scale"
          "required": true
        }
      ],
      "estimatedTime": "2-3 minutes"
    }

    Types de questions recommandés :
    - "text" : Questions ouvertes pour le contexte
    - "choice" : Questions à choix multiples pour les préférences
    - "scale" : Questions d'échelle (1-5) pour l'importance des critères

    Exemples de bonnes questions :
    - Contexte : "Dans quel contexte allez-vous utiliser principalement [sujet du dilemme] ?"
    - Budget : "Quel est votre budget approximatif ?" (type choice avec fourchettes)
    - Priorités : "Quelle est l'importance de [critère] pour vous ?" (type scale 1-5)
    - Contraintes : "Y a-t-il des contraintes particulières à considérer ?"

    Soyez pertinent et évitez les questions trop génériques.`;

    const response = await callOpenAiApi(prompt);
    
    // Validation de la réponse
    if (!response.questions || !Array.isArray(response.questions)) {
        throw new Error("La structure des questions générées est invalide.");
    }

    // Validation de chaque question
    const validatedQuestions: IConversationQuestion[] = response.questions.map((q: any, index: number) => ({
        id: q.id || `question_${index + 1}`,
        type: ['text', 'choice', 'scale'].includes(q.type) ? q.type : 'text',
        question: q.question || "Question non définie",
        placeholder: q.placeholder,
        choices: q.type === 'choice' ? q.choices : undefined,
        min: q.type === 'scale' ? (q.min || 1) : undefined,
        max: q.type === 'scale' ? (q.max || 5) : undefined,
        required: q.required !== false
    }));

    return {
        questions: validatedQuestions,
        estimatedTime: response.estimatedTime || "2-3 minutes"
    };
};

export const analyzeWithConversationContext = async (
    dilemma: string, 
    conversationAnswers: Record<string, string>
): Promise<{ emoji: string; criteria: string[]; result: IResult }> => {
    const contextualInfo = Object.entries(conversationAnswers)
        .map(([questionId, answer]) => `${questionId}: ${answer}`)
        .join('\n');

    const prompt = `En tant qu'assistant expert en prise de décision, pour le dilemme : "${dilemma}", en tenant compte du contexte suivant obtenu lors de notre conversation :

    CONTEXTE CONVERSATIONNEL :
    ${contextualInfo}

    Veuillez fournir une analyse complète personnalisée basée sur ces informations.
    La réponse DOIT être un objet JSON valide. Le champ "imageQuery" DOIT contenir une requête de recherche d'image en ANGLAIS de 2-3 mots-clés. Le champ "emoji" DOIT contenir un seul emoji unicode pertinent pour le dilemme.
    
    JSON attendu :
    {
      "emoji": "🤔",
      "criteria": ["Critère 1 personnalisé", "Critère 2 personnalisé", "Critère 3 personnalisé", "Critère 4 personnalisé"],
      "result": {
        "recommendation": "Option Recommandée basée sur le contexte",
        "imageQuery": "English search query for a background image, 2-3 keywords",
        "description": "Un texte descriptif (2-3 phrases) personnalisé expliquant pourquoi c'est la meilleure option SELON LE CONTEXTE fourni. Référencez les réponses de l'utilisateur.",
        "infoLinks": [
          { "title": "Titre du lien d'information 1", "url": "https://example.com/info1" },
          { "title": "Titre du lien d'information 2", "url": "https://example.com/info2" }
        ],
        "shoppingLinks": [
          { "title": "Titre du lien d'achat 1", "url": "https://example.com/shop1" },
          { "title": "Titre du lien d'achat 2", "url": "https://example.com/shop2" }
        ],
        "breakdown": [
          {
            "option": "Option 1",
            "pros": ["Avantage 1 personnalisé"],
            "cons": ["Inconvénient 1 personnalisé"],
            "score": 85
          }
        ]
      }
    }

    IMPORTANT : Utilisez le contexte conversationnel pour personnaliser l'analyse. Les critères et recommandations doivent refléter les réponses spécifiques de l'utilisateur.`;

    const response = await callOpenAiApi(prompt);
    
    // Validation similaire à startAnalysis
    const isValidEmoji = response && typeof response.emoji === 'string';
    const isValidCriteria = response && response.criteria && Array.isArray(response.criteria);
    const apiResult = response.result;
    const isValidResult = apiResult && apiResult.recommendation && apiResult.breakdown && Array.isArray(apiResult.breakdown) && apiResult.breakdown.every((item: any) => typeof item.score === 'number') && apiResult.description && Array.isArray(apiResult.infoLinks) && Array.isArray(apiResult.shoppingLinks) && typeof apiResult.imageQuery === 'string';

    if (isValidEmoji && isValidCriteria && isValidResult) {
        return response;
    } else {
        throw new Error("La structure de la réponse de l'IA est invalide.");
    }
};
