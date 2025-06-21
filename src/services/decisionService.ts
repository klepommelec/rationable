
import { ICriterion, IResult, DEFAULT_CATEGORIES } from '@/types/decision';
import { callOpenAiApi } from './openai';

export const generateCompleteAnalysis = async (dilemma: string) => {
  const categories = DEFAULT_CATEGORIES.map(c => `"${c.id}"`).join(',');
  
  const prompt = `Analysez ce dilemme et retournez un JSON avec:
1. "emoji": emoji du dilemme
2. "criteria": 3-4 critères d'évaluation 
3. "suggestedCategory": catégorie parmi [${categories}]
4. "recommendation": meilleure option
5. "description": justification courte
6. "imageQuery": description image (anglais)
7. "infoLinks": [{title,url}] - 2 liens max
8. "shoppingLinks": [{title,url}] - 2 liens max  
9. "breakdown": 3 options avec {option,pros,cons,score}

Dilemme: "${dilemma}"

JSON uniquement:`;

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

export const generateOptionsOnly = async (dilemma: string, criteria: ICriterion[]): Promise<IResult> => {
  const criteriaList = criteria.map(c => c.name).join(', ');
  
  const prompt = `Générez options pour: "${dilemma}"
Critères: ${criteriaList}

JSON avec: recommendation, description, imageQuery, infoLinks(2 max), shoppingLinks(2 max), breakdown(3 options avec pros/cons/score)`;

  return await callOpenAiApi(prompt);
};
