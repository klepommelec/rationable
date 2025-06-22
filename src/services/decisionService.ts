
import { ICriterion, IResult, DEFAULT_CATEGORIES } from '@/types/decision';
import { callOpenAiApi } from './openai';

export const generateCriteriaOnly = async (dilemma: string) => {
  const prompt = `
Analysez ce dilemme et retournez une réponse JSON avec les éléments suivants :

1. "emoji": Un emoji représentant le dilemme (ex: 💻, ✈️, 🏠, etc.)
2. "criteria": Une liste de 3-6 critères importants pour évaluer les options de ce dilemme
3. "suggestedCategory": L'ID de la catégorie la plus appropriée parmi : ${DEFAULT_CATEGORIES.map(c => `"${c.id}" (${c.name} ${c.emoji})`).join(', ')}

Dilemme: "${dilemma}"

Répondez UNIQUEMENT avec un objet JSON valide contenant "emoji", "criteria" et "suggestedCategory".

Exemple de format:
{
  "emoji": "💻",
  "criteria": ["Performance", "Prix", "Facilité d'utilisation"],
  "suggestedCategory": "tech"
}`;

  const response = await callOpenAiApi(prompt);
  
  return {
    emoji: response.emoji || '🤔',
    criteria: response.criteria || [],
    suggestedCategory: response.suggestedCategory
  };
};

export const generateOptions = async (dilemma: string, criteria: ICriterion[]): Promise<IResult> => {
  const criteriaList = criteria.map(c => c.name).join(', ');
  
  const prompt = `
Analysez ce dilemme et générez des options avec évaluation détaillée.

Dilemme: "${dilemma}"
Critères d'évaluation: ${criteriaList}

Retournez un objet JSON avec:
1. "recommendation": La meilleure option recommandée (texte court)
2. "description": Explication détaillée de pourquoi cette option est recommandée
3. "imageQuery": Description pour générer une image (en anglais, très descriptive)
4. "infoLinks": Tableau de liens utiles avec "title" et "url"
5. "shoppingLinks": Tableau de liens d'achat avec "title" et "url"  
6. "breakdown": Tableau d'objets avec:
   - "option": Nom de l'option
   - "pros": Tableau des avantages
   - "cons": Tableau des inconvénients  
   - "score": Note sur 100

Générez 3-5 options différentes et pertinentes. Soyez concret et actionnable.

Répondez UNIQUEMENT avec un objet JSON valide.`;

  return await callOpenAiApi(prompt);
};
