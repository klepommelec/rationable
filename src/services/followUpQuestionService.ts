import { IResult, IFollowUpQuestion, FollowUpCategory } from '@/types/decision';
import { callOpenAiApi } from './openai';

interface QuestionGenerationRequest {
  dilemma: string;
  result: IResult;
  category?: string;
}

export const generateFollowUpQuestions = async ({
  dilemma,
  result,
  category
}: QuestionGenerationRequest): Promise<IFollowUpQuestion[]> => {
  try {
    console.log('🤔 Génération des questions de suivi...');

    // Analyser le contexte pour adapter les questions
    const context = detectQuestionContext(dilemma, category);
    
    const prompt = buildFollowUpPrompt(dilemma, result, context);
    
    const response = await callOpenAiApi(prompt);
    
    if (response.questions && Array.isArray(response.questions)) {
      const questions: IFollowUpQuestion[] = response.questions.map((q: any, index: number) => ({
        id: `follow-up-${Date.now()}-${index}`,
        text: q.text || q.question,
        category: q.category || 'context'
      }));
      
      console.log(`✅ ${questions.length} questions de suivi générées`);
      return questions;
    }
    
    return [];
  } catch (error) {
    console.error('❌ Erreur lors de la génération des questions de suivi:', error);
    return [];
  }
};

const detectQuestionContext = (dilemma: string, category?: string): string => {
  const dilemmaLower = dilemma.toLowerCase();
  
  // Détecter le domaine principal
  if (category === 'tech' || dilemmaLower.includes('ordinateur') || dilemmaLower.includes('smartphone') || 
      dilemmaLower.includes('logiciel') || dilemmaLower.includes('application')) {
    return 'technologie';
  }
  
  if (category === 'travel' || dilemmaLower.includes('voyage') || dilemmaLower.includes('vacances') || 
      dilemmaLower.includes('destination') || dilemmaLower.includes('hôtel')) {
    return 'voyage';
  }
  
  if (category === 'finance' || dilemmaLower.includes('achat') || dilemmaLower.includes('investir') || 
      dilemmaLower.includes('budget') || dilemmaLower.includes('prix')) {
    return 'finance';
  }
  
  if (category === 'career' || dilemmaLower.includes('travail') || dilemmaLower.includes('emploi') || 
      dilemmaLower.includes('carrière') || dilemmaLower.includes('formation')) {
    return 'carrière';
  }
  
  if (category === 'health' || dilemmaLower.includes('santé') || dilemmaLower.includes('sport') || 
      dilemmaLower.includes('fitness') || dilemmaLower.includes('médical')) {
    return 'santé';
  }
  
  if (category === 'lifestyle' || dilemmaLower.includes('maison') || dilemmaLower.includes('décoration') || 
      dilemmaLower.includes('style') || dilemmaLower.includes('loisir')) {
    return 'style de vie';
  }
  
  return 'général';
};

const buildFollowUpPrompt = (dilemma: string, result: IResult, context: string): string => {
  return `Tu es un assistant IA spécialisé dans l'aide à la prise de décision. 

CONTEXTE:
- Dilemme initial: "${dilemma}"
- Domaine détecté: ${context}
- Recommandation actuelle: "${result.recommendation}"
- Type de résultat: ${result.resultType || 'comparative'}

OBJECTIF:
Génère 3-4 questions de suivi pertinentes qui pourraient aider l'utilisateur à affiner sa décision ou à obtenir des informations complémentaires.

RÈGLES:
1. Les questions doivent être courtes et précises (max 50 caractères)
2. Adapter les questions au domaine détecté (${context})
3. Éviter les questions déjà traitées dans l'analyse
4. Proposer des angles différents : budget, préférences, contexte d'usage, timeline, etc.
5. Utiliser un ton naturel et engageant

CATÉGORIES DISPONIBLES:
- budget: Questions sur les contraintes financières
- preferences: Questions sur les goûts et préférences
- context: Questions sur le contexte d'utilisation  
- requirements: Questions sur les exigences techniques
- timeline: Questions sur les délais et la temporalité
- usage: Questions sur l'usage prévu

EXEMPLES selon le domaine:
${getExampleQuestionsByContext(context)}

Réponds uniquement avec un objet JSON de ce format:
{
  "questions": [
    {"text": "Question courte et engageante?", "category": "budget"},
    {"text": "Autre question pertinente?", "category": "preferences"},
    ...
  ]
}`;
};

const getExampleQuestionsByContext = (context: string): string => {
  const examples = {
    'technologie': `
    - "Quel est votre budget maximum ?" (budget)
    - "Privilégiez-vous la performance ou la simplicité ?" (preferences)
    - "Usage professionnel ou personnel ?" (usage)`,
    
    'voyage': `
    - "Quelle période de l'année ?" (timeline)
    - "Voyage en solo ou en groupe ?" (context)
    - "Budget approximatif par personne ?" (budget)`,
    
    'finance': `
    - "Horizon de placement souhaité ?" (timeline)
    - "Tolérance au risque ?" (preferences)
    - "Montant à investir ?" (budget)`,
    
    'carrière': `
    - "Mobilité géographique possible ?" (context)
    - "Secteur d'activité préféré ?" (preferences)
    - "Disponibilité pour commencer ?" (timeline)`,
    
    'santé': `
    - "Contraintes physiques particulières ?" (requirements)
    - "Temps disponible par semaine ?" (timeline)
    - "Objectif principal ?" (preferences)`,
    
    'style de vie': `
    - "Style préféré ?" (preferences)
    - "Budget disponible ?" (budget)
    - "Délai de réalisation ?" (timeline)`
  };
  
  return examples[context as keyof typeof examples] || examples['général'] || `
    - "Quelles sont vos priorités ?" (preferences)
    - "Quel budget envisagez-vous ?" (budget)
    - "Dans quels délais ?" (timeline)`;
};

// Service pour gérer l'interaction avec une question de suivi
export const handleFollowUpQuestion = async (
  question: IFollowUpQuestion,
  originalDilemma: string,
  currentResult: IResult
): Promise<string> => {
  // Retourner un dilemme enrichi pour relancer l'analyse
  return `${originalDilemma}

Question de suivi: ${question.text}

Contexte précédent: ${currentResult.recommendation}`;
};