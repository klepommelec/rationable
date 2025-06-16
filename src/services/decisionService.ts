
import { ICriterion, IResult } from '@/types/decision';
import { callOpenAiApi } from '@/services/openai';

interface ICriteriaResponse {
    emoji: string;
    criteria: string[];
}

interface IFullAnalysisResponse {
    emoji: string;
    criteria: string[];
    result: IResult;
}

export const generateCriteriaOnly = async (dilemma: string): Promise<ICriteriaResponse> => {
    const prompt = `Pour le dilemme : "${dilemma}", générez un emoji pertinent et 4 critères de décision importants.
    
    Répondez UNIQUEMENT avec un objet JSON valide dans ce format exact :
    {
      "emoji": "🤔",
      "criteria": ["Critère 1", "Critère 2", "Critère 3", "Critère 4"]
    }
    
    Important : 
    - L'emoji doit être un seul caractère emoji
    - Les critères doivent être des phrases courtes et claires
    - Respectez exactement la structure JSON`;

    try {
        const response = await callOpenAiApi(prompt);
        console.log("Raw API response for criteria:", response);
        
        const isValidEmoji = response && typeof response.emoji === 'string' && response.emoji.length > 0;
        const isValidCriteria = response && response.criteria && Array.isArray(response.criteria) && response.criteria.length >= 2;

        if (isValidEmoji && isValidCriteria) {
            return response as ICriteriaResponse;
        } else {
            console.error("Invalid criteria response structure:", response);
            throw new Error("La structure de la réponse de l'IA pour les critères est invalide.");
        }
    } catch (error) {
        console.error("Error in generateCriteriaOnly:", error);
        throw error;
    }
};

export const startAnalysis = async (dilemma: string): Promise<IFullAnalysisResponse> => {
    const prompt = `En tant qu'assistant expert en prise de décision, pour le dilemme : "${dilemma}", veuillez fournir une analyse complète.
    
    Répondez UNIQUEMENT avec un objet JSON valide dans ce format exact :
    {
      "emoji": "🤔",
      "criteria": ["Critère 1", "Critère 2", "Critère 3", "Critère 4"],
      "result": {
        "recommendation": "Option Recommandée",
        "imageQuery": "search keywords",
        "description": "Description engageante de 2-3 phrases",
        "infoLinks": [
          { "title": "Titre du lien", "url": "https://example.com" }
        ],
        "shoppingLinks": [
          { "title": "Titre du lien achat", "url": "https://example.com" }
        ],
        "breakdown": [
          {
            "option": "Option 1",
            "pros": ["Avantage 1", "Avantage 2"],
            "cons": ["Inconvénient 1"],
            "score": 85
          }
        ]
      }
    }
    
    Important :
    - Le score doit être un nombre entre 0 et 100
    - imageQuery en anglais, 2-3 mots-clés
    - Au moins 3 options dans breakdown
    - URLs valides pour les liens`;

    try {
        const response = await callOpenAiApi(prompt);
        console.log("Raw API response for full analysis:", response);
        
        // Validation assouplie avec valeurs par défaut
        const processedResponse = {
            emoji: response?.emoji || '🤔',
            criteria: Array.isArray(response?.criteria) ? response.criteria : [],
            result: {
                recommendation: response?.result?.recommendation || 'Option recommandée',
                imageQuery: response?.result?.imageQuery || 'decision making',
                description: response?.result?.description || 'Analyse en cours...',
                infoLinks: Array.isArray(response?.result?.infoLinks) ? response.result.infoLinks : [],
                shoppingLinks: Array.isArray(response?.result?.shoppingLinks) ? response.result.shoppingLinks : [],
                breakdown: Array.isArray(response?.result?.breakdown) ? response.result.breakdown.map(item => ({
                    option: item.option || 'Option',
                    pros: Array.isArray(item.pros) ? item.pros : [],
                    cons: Array.isArray(item.cons) ? item.cons : [],
                    score: typeof item.score === 'number' ? Math.max(0, Math.min(100, item.score)) : 50
                })) : []
            }
        };

        console.log("Processed response:", processedResponse);
        
        if (processedResponse.criteria.length >= 2 && processedResponse.result.breakdown.length >= 1) {
            return processedResponse as IFullAnalysisResponse;
        } else {
            console.error("Insufficient data in response:", processedResponse);
            throw new Error("Réponse incomplète de l'IA. Veuillez réessayer.");
        }
    } catch (error) {
        console.error("Error in startAnalysis:", error);
        throw error;
    }
};

export const generateOptions = async (dilemma: string, criteria: ICriterion[]): Promise<IResult> => {
    const criteriaNames = criteria.map(c => c.name);
    const prompt = `Pour le dilemme "${dilemma}", en utilisant les critères : ${criteriaNames.join(', ')}.

    Générez 3 options détaillées et évaluez-les. Répondez UNIQUEMENT avec un objet JSON valide :
    {
      "recommendation": "Nom de la meilleure option",
      "imageQuery": "english keywords",
      "description": "Description engageante de pourquoi c'est le meilleur choix (2-3 phrases)",
      "infoLinks": [
        { "title": "Guide complet", "url": "https://example.com/guide" },
        { "title": "Comparatif détaillé", "url": "https://example.com/comparatif" }
      ],
      "shoppingLinks": [
        { "title": "Acheter ici", "url": "https://example.com/buy" },
        { "title": "Meilleur prix", "url": "https://example.com/price" }
      ],
      "breakdown": [
        {
          "option": "Option 1",
          "pros": ["Avantage important 1", "Avantage important 2"],
          "cons": ["Inconvénient notable"],
          "score": 85
        },
        {
          "option": "Option 2", 
          "pros": ["Avantage 1"],
          "cons": ["Inconvénient 1", "Inconvénient 2"],
          "score": 70
        },
        {
          "option": "Option 3",
          "pros": ["Avantage unique"],
          "cons": ["Inconvénient majeur"],
          "score": 60
        }
      ]
    }
    
    Règles importantes :
    - Scores entre 0-100, différents pour chaque option
    - imageQuery : 2-3 mots-clés en anglais
    - URLs réalistes et pertinentes
    - Options concrètes et spécifiques au dilemme`;

    try {
        const rawResponse = await callOpenAiApi(prompt);
        console.log("Raw API response for options:", rawResponse);
        
        // Validation assouplie avec valeurs par défaut robustes
        const processedResult: IResult = {
            recommendation: rawResponse?.recommendation || 'Option recommandée',
            imageQuery: rawResponse?.imageQuery || 'decision choice',
            description: rawResponse?.description || 'Analyse complète de vos options disponibles.',
            infoLinks: Array.isArray(rawResponse?.infoLinks) ? rawResponse.infoLinks.filter(link => 
                link && typeof link.title === 'string' && typeof link.url === 'string'
            ) : [
                { title: "Guide de décision", url: "https://example.com/guide" }
            ],
            shoppingLinks: Array.isArray(rawResponse?.shoppingLinks) ? rawResponse.shoppingLinks.filter(link => 
                link && typeof link.title === 'string' && typeof link.url === 'string'
            ) : [
                { title: "Comparateur de prix", url: "https://example.com/compare" }
            ],
            breakdown: Array.isArray(rawResponse?.breakdown) && rawResponse.breakdown.length > 0 ? 
                rawResponse.breakdown.map((item, index) => ({
                    option: item?.option || `Option ${index + 1}`,
                    pros: Array.isArray(item?.pros) ? item.pros : [`Avantage de l'option ${index + 1}`],
                    cons: Array.isArray(item?.cons) ? item.cons : [`Inconvénient de l'option ${index + 1}`],
                    score: typeof item?.score === 'number' ? Math.max(0, Math.min(100, item.score)) : Math.max(50, 80 - (index * 10))
                })) : [
                {
                    option: "Option par défaut",
                    pros: ["Analyse en cours"],
                    cons: ["Données insuffisantes"],
                    score: 75
                }
            ]
        };

        console.log("Final processed result:", processedResult);
        
        // Validation minimale
        if (processedResult.breakdown.length >= 1) {
            return processedResult;
        } else {
            console.error("No valid options in breakdown");
            throw new Error("Impossible de générer des options valides. Veuillez réessayer.");
        }
    } catch (error) {
        console.error("Error in generateOptions:", error);
        throw new Error(`Erreur lors de la génération des options : ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
};
