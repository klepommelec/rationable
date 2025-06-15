
import { ICriterion, IResult } from '@/types/decision';
import { callOpenAiApi } from '@/services/openai';

interface IFullAnalysisResponse {
    criteria: string[];
    result: IResult;
}

export const startAnalysis = async (dilemma: string): Promise<IFullAnalysisResponse> => {
    const prompt = `En tant qu'assistant expert en prise de décision, pour le dilemme : "${dilemma}", veuillez fournir une analyse complète.
    La réponse DOIT être un objet JSON valide. Le champ "imageQuery" DOIT contenir une requête de recherche d'image en ANGLAIS de 2-3 mots-clés.
    JSON attendu :
    {
      "criteria": ["Critère 1", "Critère 2", "Critère 3", "Critère 4"],
      "result": {
        "recommendation": "Option Recommandée",
        "imageQuery": "English search query for a background image, 2-3 keywords",
        "description": "Un texte descriptif (2-3 phrases) et engageant expliquant pourquoi c'est la meilleure option. Sois convaincant.",
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
            "pros": ["Avantage 1"],
            "cons": ["Inconvénient 1"],
            "score": 85
          }
        ]
      }
    }`;

    const response = await callOpenAiApi(prompt);
    const isValidCriteria = response && response.criteria && Array.isArray(response.criteria);
    const apiResult = response.result;
    const isValidResult = apiResult && apiResult.recommendation && apiResult.breakdown && Array.isArray(apiResult.breakdown) && apiResult.breakdown.every(item => typeof item.score === 'number') && apiResult.description && Array.isArray(apiResult.infoLinks) && Array.isArray(apiResult.shoppingLinks) && typeof apiResult.imageQuery === 'string';

    if (isValidCriteria && isValidResult) {
        return response as IFullAnalysisResponse;
    } else {
        throw new Error("La structure de la réponse de l'IA est invalide.");
    }
};

export const generateOptions = async (dilemma: string, criteria: ICriterion[]): Promise<IResult> => {
    const criteriaNames = criteria.map(c => c.name);
    const prompt = `Pour le dilemme "${dilemma}", en utilisant les critères importants : ${criteriaNames.join(', ')}.
    Veuillez générer 3 options, les évaluer (pros/cons, score de 0 à 100) et fournir une recommandation enrichie.
    Le résultat DOIT être un objet JSON valide. Le champ "imageQuery" DOIT contenir une requête de recherche d'image en ANGLAIS de 2-3 mots-clés pour l'option recommandée.
    JSON attendu :
    {
      "recommendation": "Option Recommandée",
      "imageQuery": "English search query for a background image for the recommended option, 2-3 keywords",
      "description": "Un texte descriptif (2-3 phrases) et engageant expliquant pourquoi c'est la meilleure option. Sois convaincant.",
      "infoLinks": [ { "title": "Titre du lien info 1", "url": "https://example.com/info1" } ],
      "shoppingLinks": [ { "title": "Titre du lien achat 1", "url": "https://example.com/shop1" } ],
      "breakdown": [
        {
          "option": "Option 1",
          "pros": ["Avantage 1"],
          "cons": ["Inconvénient 1"],
          "score": 85
        }
      ]
    }`;

    const apiResult: IResult = await callOpenAiApi(prompt);
    const isValidResult = apiResult && apiResult.recommendation && apiResult.breakdown && Array.isArray(apiResult.breakdown) && apiResult.breakdown.every(item => typeof item.score === 'number') && apiResult.description && Array.isArray(apiResult.infoLinks) && Array.isArray(apiResult.shoppingLinks) && typeof apiResult.imageQuery === 'string';

    if (isValidResult) {
        return apiResult;
    } else {
        throw new Error("La structure de la réponse de l'IA pour les options est invalide.");
    }
};
