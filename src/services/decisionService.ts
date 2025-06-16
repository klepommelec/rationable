
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

const validateAndSanitize = {
    emoji: (value: any): string => {
        if (typeof value === 'string' && value.length > 0) {
            return value;
        }
        console.warn('⚠️ Invalid emoji, using default');
        return '🤔';
    },
    
    criteria: (value: any): string[] => {
        if (Array.isArray(value) && value.length >= 2) {
            return value.filter(c => typeof c === 'string' && c.trim().length > 0);
        }
        console.warn('⚠️ Invalid criteria array');
        throw new Error('Critères invalides reçus de l\'IA');
    },
    
    result: (value: any): IResult => {
        const fallbackResult: IResult = {
            recommendation: 'Option recommandée',
            imageQuery: 'decision choice',
            description: 'Analyse en cours de traitement...',
            infoLinks: [{ title: "Guide de décision", url: "https://example.com" }],
            shoppingLinks: [{ title: "Comparateur", url: "https://example.com" }],
            breakdown: [{
                option: "Option par défaut",
                pros: ["En cours d'analyse"],
                cons: ["Données incomplètes"],
                score: 75
            }]
        };

        if (!value || typeof value !== 'object') {
            console.warn('⚠️ Invalid result object, using fallback');
            return fallbackResult;
        }

        return {
            recommendation: typeof value.recommendation === 'string' ? value.recommendation : fallbackResult.recommendation,
            imageQuery: typeof value.imageQuery === 'string' ? value.imageQuery : fallbackResult.imageQuery,
            description: typeof value.description === 'string' ? value.description : fallbackResult.description,
            infoLinks: Array.isArray(value.infoLinks) 
                ? value.infoLinks.filter(link => link && typeof link.title === 'string' && typeof link.url === 'string')
                : fallbackResult.infoLinks,
            shoppingLinks: Array.isArray(value.shoppingLinks)
                ? value.shoppingLinks.filter(link => link && typeof link.title === 'string' && typeof link.url === 'string')
                : fallbackResult.shoppingLinks,
            breakdown: Array.isArray(value.breakdown) && value.breakdown.length > 0
                ? value.breakdown.map((item, index) => ({
                    option: typeof item?.option === 'string' ? item.option : `Option ${index + 1}`,
                    pros: Array.isArray(item?.pros) ? item.pros.filter(p => typeof p === 'string') : [`Avantage ${index + 1}`],
                    cons: Array.isArray(item?.cons) ? item.cons.filter(c => typeof c === 'string') : [`Inconvénient ${index + 1}`],
                    score: typeof item?.score === 'number' && item.score >= 0 && item.score <= 100 
                        ? item.score 
                        : Math.max(50, 80 - (index * 10))
                }))
                : fallbackResult.breakdown
        };
    }
};

export const generateCriteriaOnly = async (dilemma: string): Promise<ICriteriaResponse> => {
    console.log('📡 [Service] generateCriteriaOnly called');
    
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
        console.log('✅ [Service] Raw criteria response received');
        
        return {
            emoji: validateAndSanitize.emoji(response?.emoji),
            criteria: validateAndSanitize.criteria(response?.criteria)
        };
    } catch (error) {
        console.error('❌ [Service] Error in generateCriteriaOnly:', error);
        throw error;
    }
};

export const startAnalysis = async (dilemma: string): Promise<IFullAnalysisResponse> => {
    console.log('📡 [Service] startAnalysis called');
    
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
        console.log('✅ [Service] Raw full analysis response received');
        
        return {
            emoji: validateAndSanitize.emoji(response?.emoji),
            criteria: validateAndSanitize.criteria(response?.criteria),
            result: validateAndSanitize.result(response?.result)
        };
    } catch (error) {
        console.error('❌ [Service] Error in startAnalysis:', error);
        throw error;
    }
};

export const generateOptions = async (dilemma: string, criteria: ICriterion[]): Promise<IResult> => {
    console.log('📡 [Service] generateOptions called', { 
        criteriaCount: criteria.length,
        dilemmaLength: dilemma.length 
    });
    
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
        console.log('✅ [Service] Raw options response received');
        
        const processedResult = validateAndSanitize.result(rawResponse);
        
        console.log('✅ [Service] Options validation completed', {
            hasRecommendation: !!processedResult.recommendation,
            breakdownCount: processedResult.breakdown.length,
            infoLinksCount: processedResult.infoLinks.length
        });
        
        return processedResult;
    } catch (error) {
        console.error('❌ [Service] Error in generateOptions:', error);
        throw new Error(`Erreur lors de la génération des options : ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
};
