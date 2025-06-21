
import { ICriterion, IResult, DEFAULT_CATEGORIES } from '@/types/decision';
import { callOpenAiApi } from './openai';

export const generateCompleteAnalysis = async (dilemma: string) => {
  const prompt = `
Analysez ce dilemme et retournez une réponse JSON COMPLÈTE avec tous les éléments suivants :

1. "emoji": Un emoji représentant le dilemma (ex: 💻, ✈️, 🏠, etc.)
2. "criteria": Une liste de 3-5 critères importants pour évaluer les options
3. "suggestedCategory": L'ID de la catégorie la plus appropriée parmi : ${DEFAULT_CATEGORIES.map(c => `"${c.id}" (${c.name} ${c.emoji})`).join(', ')}
4. "recommendation": La meilleure option recommandée (texte court)
5. "description": Explication détaillée de pourquoi cette option est recommandée
6. "imageQuery": Description pour générer une image (en anglais, très descriptive)
7. "infoLinks": Tableau de liens utiles avec "title" et "url"
8. "shoppingLinks": Tableau de liens d'achat avec "title" et "url"
9. "breakdown": Tableau de 3 objets avec:
   - "option": Nom de l'option
   - "pros": Tableau des avantages
   - "cons": Tableau des inconvénients
   - "score": Note sur 100

Dilemme: "${dilemma}"

Répondez UNIQUEMENT avec un objet JSON valide contenant TOUS ces éléments. Soyez concret et actionnable.

Exemple de format:
{
  "emoji": "💻",
  "criteria": ["Performance", "Prix", "Facilité d'utilisation"],
  "suggestedCategory": "tech",
  "recommendation": "MacBook Air M2",
  "description": "Le MacBook Air M2 offre le meilleur équilibre...",
  "imageQuery": "modern laptop computer on clean desk",
  "infoLinks": [{"title": "Test MacBook Air", "url": "https://example.com"}],
  "shoppingLinks": [{"title": "Apple Store", "url": "https://apple.com"}],
  "breakdown": [
    {
      "option": "MacBook Air M2",
      "pros": ["Excellente autonomie", "Performance élevée"],
      "cons": ["Prix élevé"],
      "score": 88
    }
  ]
}`;

  const response = await callOpenAiApi(prompt);
  
  return {
    emoji: response.emoji || '🤔',
    criteria: response.criteria || [],
    suggestedCategory: response.suggestedCategory,
    result: {
      recommendation: response.recommendation || '',
      description: response.description || '',
      imageQuery: response.imageQuery || '',
      infoLinks: response.infoLinks || [],
      shoppingLinks: response.shoppingLinks || [],
      breakdown: response.breakdown || []
    }
  };
};

// Fonction simplifiée pour régénérer seulement les options
export const generateOptionsOnly = async (dilemma: string, criteria: ICriterion[]): Promise<IResult> => {
  const criteriaList = criteria.map(c => c.name).join(', ');
  
  const prompt = `
Générez uniquement les options pour ce dilemme avec les critères donnés.

Dilemme: "${dilemma}"
Critères: ${criteriaList}

Retournez un objet JSON avec:
1. "recommendation": La meilleure option recommandée
2. "description": Explication détaillée
3. "imageQuery": Description pour image (en anglais)
4. "infoLinks": Liens utiles
5. "shoppingLinks": Liens d'achat
6. "breakdown": 3 options avec pros/cons/score

Répondez UNIQUEMENT avec un objet JSON valide.`;

  return await callOpenAiApi(prompt);
};
