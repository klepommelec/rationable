
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
    
    result: (value: any, criteria?: ICriterion[]): IResult => {
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
                score: 75,
                weightedScore: 75
            }]
        };

        if (!value || typeof value !== 'object') {
            console.warn('⚠️ Invalid result object, using fallback');
            return fallbackResult;
        }

        const processedBreakdown = Array.isArray(value.breakdown) && value.breakdown.length > 0
            ? value.breakdown.map((item, index) => {
                const baseScore = typeof item?.score === 'number' && item.score >= 0 && item.score <= 100 
                    ? item.score 
                    : Math.max(50, 80 - (index * 10));
                
                return {
                    option: typeof item?.option === 'string' ? item.option : `Option ${index + 1}`,
                    pros: Array.isArray(item?.pros) ? item.pros.filter(p => typeof p === 'string') : [`Avantage ${index + 1}`],
                    cons: Array.isArray(item?.cons) ? item.cons.filter(c => typeof c === 'string') : [`Inconvénient ${index + 1}`],
                    score: baseScore,
                    weightedScore: baseScore // Will be recalculated if criteria with weights are provided
                };
            })
            : fallbackResult.breakdown;

        // Recalculate weighted scores if criteria with weights are provided
        if (criteria && criteria.length > 0) {
            const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
            const avgWeight = totalWeight / criteria.length;
            
            processedBreakdown.forEach(item => {
                // Apply weight adjustment: scores are adjusted based on how criteria weights deviate from average
                const weightMultiplier = avgWeight / 3; // 3 is the default weight
                item.weightedScore = Math.round(Math.min(100, Math.max(0, item.score * weightMultiplier)));
            });
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
            breakdown: processedBreakdown
        };
    }
};

// Function to recalculate weighted scores based on criteria weights
export const recalculateWeightedScores = (result: IResult, criteria: ICriterion[]): IResult => {
    if (!criteria || criteria.length === 0) {
        return result;
    }

    const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
    const avgWeight = totalWeight / criteria.length;
    const weightMultiplier = avgWeight / 3; // 3 is the default/neutral weight

    const updatedBreakdown = result.breakdown.map(item => ({
        ...item,
        weightedScore: Math.round(Math.min(100, Math.max(0, item.score * weightMultiplier)))
    }));

    // Update recommendation based on new weighted scores
    const topOption = updatedBreakdown.reduce((prev, current) => 
        prev.weightedScore > current.weightedScore ? prev : current
    );

    return {
        ...result,
        recommendation: topOption.option.replace(/^Option\s+\d+:\s*/i, '').trim(),
        breakdown: updatedBreakdown
    };
};

// Function to generate reliable fallback links based on the dilemma topic
const generateReliableLinks = (dilemma: string, recommendation: string) => {
    const searchQuery = encodeURIComponent(`${recommendation} ${dilemma}`);
    const recommendationQuery = encodeURIComponent(recommendation);
    
    return {
        infoLinks: [
            { title: "Rechercher des guides", url: `https://www.google.fr/search?q=${searchQuery}+guide+comparatif` },
            { title: "Avis et tests", url: `https://www.google.fr/search?q=${searchQuery}+avis+test` }
        ],
        shoppingLinks: [
            { title: "Amazon France", url: `https://www.amazon.fr/s?k=${recommendationQuery}` },
            { title: "Fnac", url: `https://www.fnac.com/SearchResult/ResultList.aspx?Search=${recommendationQuery}` },
            { title: "Google Shopping", url: `https://shopping.google.fr/search?q=${recommendationQuery}` }
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
    const criteriaWithWeights = criteria.map(c => `${c.name} (importance: ${c.weight}/5)`);
    
    const prompt = `Pour le dilemme "${dilemma}", en utilisant les critères avec leur importance : ${criteriaWithWeights.join(', ')}.

    Générez 3 options détaillées et évaluez-les. Tenez compte de l'importance relative de chaque critère dans votre évaluation.

    IMPORTANT pour les liens - NE GÉNÉREZ PAS de liens fictifs. Utilisez UNIQUEMENT cette approche :
    - Pour infoLinks : utilisez "RECHERCHE:" suivi du terme à rechercher
    - Pour shoppingLinks : utilisez "ACHAT:" suivi du produit à acheter

    Répondez UNIQUEMENT avec un objet JSON valide :
    {
      "recommendation": "Nom précis de la meilleure option",
      "imageQuery": "english keywords",
      "description": "Description engageante de pourquoi c'est le meilleur choix (2-3 phrases)",
      "infoLinks": [
        { "title": "Guide comparatif", "url": "RECHERCHE:guide comparatif lunettes de soleil Ray-Ban" },
        { "title": "Avis d'experts", "url": "RECHERCHE:test avis Ray-Ban lunettes soleil" }
      ],
      "shoppingLinks": [
        { "title": "Acheter Ray-Ban", "url": "ACHAT:Ray-Ban lunettes de soleil" },
        { "title": "Comparer les prix", "url": "ACHAT:lunettes de soleil Ray-Ban prix" }
      ],
      "breakdown": [
        {
          "option": "Option 1 spécifique",
          "pros": ["Avantage important 1", "Avantage important 2"],
          "cons": ["Inconvénient notable"],
          "score": 85
        },
        {
          "option": "Option 2 spécifique", 
          "pros": ["Avantage 1"],
          "cons": ["Inconvénient 1", "Inconvénient 2"],
          "score": 70
        },
        {
          "option": "Option 3 spécifique",
          "pros": ["Avantage unique"],
          "cons": ["Inconvénient majeur"],
          "score": 60
        }
      ]
    }
    
    CRITIQUES :
    - Options concrètes et spécifiques au dilemme (pas "Option 1", "Option 2")
    - Scores différents entre 0-100 pour chaque option, pondérés selon l'importance des critères
    - imageQuery : 2-3 mots-clés en anglais
    - Pour les liens, utilisez UNIQUEMENT les préfixes "RECHERCHE:" ou "ACHAT:" comme indiqué`;

    try {
        const rawResponse = await callOpenAiApi(prompt);
        console.log('✅ [Service] Raw options response received');
        
        let processedResult = validateAndSanitize.result(rawResponse, criteria);
        
        // Transform RECHERCHE: and ACHAT: URLs into proper search URLs
        const transformUrl = (link: { title: string; url: string }) => {
            if (link.url.startsWith('RECHERCHE:')) {
                const searchTerm = encodeURIComponent(link.url.replace('RECHERCHE:', '').trim());
                return { ...link, url: `https://www.google.fr/search?q=${searchTerm}` };
            }
            if (link.url.startsWith('ACHAT:')) {
                const searchTerm = encodeURIComponent(link.url.replace('ACHAT:', '').trim());
                return { ...link, url: `https://www.google.fr/search?q=${searchTerm}&tbm=shop` };
            }
            return link;
        };

        processedResult.infoLinks = processedResult.infoLinks.map(transformUrl);
        processedResult.shoppingLinks = processedResult.shoppingLinks.map(transformUrl);
        
        // Add reliable fallback links if needed
        const fallbackLinks = generateReliableLinks(dilemma, processedResult.recommendation);
        
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
        
        // Return fallback result with reliable links
        const fallbackResult: IResult = {
            recommendation: 'Analyse en cours...',
            imageQuery: 'decision making',
            description: 'Une erreur est survenue lors de la génération des options. Utilisez les liens de recherche ci-dessous pour explorer vos options.',
            ...generateReliableLinks(dilemma, 'Analyse en cours...'),
            breakdown: [{
                option: "Option en cours d'analyse",
                pros: ["Recherche en cours"],
                cons: ["Données temporairement indisponibles"],
                score: 75,
                weightedScore: 75
            }]
        };
        
        return fallbackResult;
    }
};
