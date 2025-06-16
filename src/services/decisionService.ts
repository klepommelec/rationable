
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

// Function to generate fallback links based on the dilemma topic
const generateFallbackLinks = (dilemma: string) => {
    const searchQuery = encodeURIComponent(dilemma);
    
    return {
        infoLinks: [
            { title: "Rechercher sur Google", url: `https://www.google.com/search?q=${searchQuery}` },
            { title: "Voir sur Wikipédia", url: `https://fr.wikipedia.org/wiki/Spécial:Recherche/${searchQuery}` }
        ],
        shoppingLinks: [
            { title: "Comparer sur Google Shopping", url: `https://shopping.google.com/search?q=${searchQuery}` },
            { title: "Rechercher sur Amazon", url: `https://www.amazon.fr/s?k=${searchQuery}` },
            { title: "Voir sur Cdiscount", url: `https://www.cdiscount.com/search/10/${searchQuery}.html` }
        ]
    };
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
    const fallbackLinks = generateFallbackLinks(dilemma);
    
    const prompt = `Pour le dilemme "${dilemma}", en utilisant les critères : ${criteriaNames.join(', ')}.

    Générez 3 options détaillées et évaluez-les. Répondez UNIQUEMENT avec un objet JSON valide :
    {
      "recommendation": "Nom de la meilleure option",
      "imageQuery": "english keywords",
      "description": "Description engageante de pourquoi c'est le meilleur choix (2-3 phrases)",
      "infoLinks": [
        { "title": "Guide complet", "url": "https://www.exemple-reel.com/guide" },
        { "title": "Avis d'experts", "url": "https://www.site-fiable.fr/avis" }
      ],
      "shoppingLinks": [
        { "title": "Amazon France", "url": "https://www.amazon.fr/recherche-specifique" },
        { "title": "Fnac", "url": "https://www.fnac.com/produit-concret" }
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
    
    IMPORTANT - Liens fonctionnels obligatoires :
    - Pour infoLinks : utilisez uniquement des sites web réels et populaires comme Wikipedia, sites officiels de marques, guides reconnus, forums spécialisés
    - Pour shoppingLinks : utilisez UNIQUEMENT des sites e-commerce français réels : Amazon.fr, Fnac.com, Cdiscount.com, Darty.com, Boulanger.com, Leclerc.com
    - URLs complètes et fonctionnelles requises
    - Scores entre 0-100, différents pour chaque option
    - imageQuery : 2-3 mots-clés en anglais
    - Options concrètes et spécifiques au dilemme`;

    try {
        const rawResponse = await callOpenAiApi(prompt);
        console.log('✅ [Service] Raw options response received');
        
        let processedResult = validateAndSanitize.result(rawResponse);
        
        // Add fallback links if the AI didn't provide functional ones
        if (!processedResult.infoLinks || processedResult.infoLinks.length === 0) {
            processedResult.infoLinks = fallbackLinks.infoLinks;
        }
        
        if (!processedResult.shoppingLinks || processedResult.shoppingLinks.length === 0) {
            processedResult.shoppingLinks = fallbackLinks.shoppingLinks;
        }
        
        console.log('✅ [Service] Options validation completed', {
            hasRecommendation: !!processedResult.recommendation,
            breakdownCount: processedResult.breakdown.length,
            infoLinksCount: processedResult.infoLinks.length,
            shoppingLinksCount: processedResult.shoppingLinks.length
        });
        
        return processedResult;
    } catch (error) {
        console.error('❌ [Service] Error in generateOptions:', error);
        
        // Return fallback result with functional links
        const fallbackResult: IResult = {
            recommendation: 'Analyse en cours...',
            imageQuery: 'decision making',
            description: 'Une erreur est survenue lors de la génération des options. Utilisez les liens de recherche ci-dessous pour explorer vos options.',
            infoLinks: fallbackLinks.infoLinks,
            shoppingLinks: fallbackLinks.shoppingLinks,
            breakdown: [{
                option: "Option en cours d'analyse",
                pros: ["Recherche en cours"],
                cons: ["Données temporairement indisponibles"],
                score: 75
            }]
        };
        
        return fallbackResult;
    }
};
