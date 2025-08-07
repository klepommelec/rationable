import { callOpenAiApi } from './openai';
import { IResult, IFollowUpQuestion } from '@/types/decision';

interface QuickAnswerRequest {
  question: IFollowUpQuestion;
  originalDilemma: string;
  result: IResult;
}

export const generateQuickAnswer = async ({ 
  question, 
  originalDilemma, 
  result 
}: QuickAnswerRequest): Promise<string> => {
  try {
    const prompt = buildQuickAnswerPrompt(question, originalDilemma, result);
    
    const response = await callOpenAiApi(prompt);
    
    return response.answer || response.content || "Désolé, je n'ai pas pu générer une réponse pour cette question.";
  } catch (error) {
    console.error('Error generating quick answer:', error);
    throw new Error('Impossible de générer une réponse rapide');
  }
};

const buildQuickAnswerPrompt = (
  question: IFollowUpQuestion, 
  originalDilemma: string, 
  result: IResult
): string => {
  const recommendedOption = result.recommendation;
  
  return `
CONTEXTE:
- Dilemme original: "${originalDilemma}"
- Recommandation principale: "${recommendedOption}"
- Description: "${result.description}"

QUESTION DE L'UTILISATEUR: "${question.text}"

Instructions:
1. Réponds de manière COURTE et ACTIONNABLE (maximum 2-3 phrases)
2. Sois SPÉCIFIQUE à la recommandation "${recommendedOption}"
3. Donne des conseils PRATIQUES et CONCRETS
4. Focus sur l'ACTION que l'utilisateur peut prendre
5. Évite les généralités - sois précis

Types de réponses selon la catégorie:
- next_steps: Donne les étapes concrètes à suivre
- practical_info: Fournis les informations pratiques (prix, horaires, accès)
- alternatives: Propose des plans B spécifiques
- optimization: Donne des conseils pour optimiser l'expérience
- preparation: Indique ce qu'il faut préparer/savoir

Réponds directement sans introduction, de manière conversationnelle et utile.
`;
};