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
  // Extraire l'option recommandée et ses détails
  const recommendedOption = result.recommendation;
  const breakdown = result.breakdown || [];
  const recommendedBreakdown = breakdown.find(item => 
    item.option.toLowerCase().includes(recommendedOption.toLowerCase()) ||
    recommendedOption.toLowerCase().includes(item.option.toLowerCase())
  );

  return `Tu es un assistant IA spécialisé dans l'aide à la prise de décision. 

CONTEXTE:
- Dilemme initial: "${dilemma}"
- Option RECOMMANDÉE: "${recommendedOption}"
- Description: "${result.description}"
- Domaine: ${context}

${recommendedBreakdown ? `
DÉTAILS DE LA RECOMMANDATION:
- Option: ${recommendedBreakdown.option}
- Score: ${recommendedBreakdown.score}/10
- Avantages: ${recommendedBreakdown.pros.join(', ')}
- Inconvénients: ${recommendedBreakdown.cons.join(', ')}
` : ''}

OBJECTIF:
Génère 3-4 questions de suivi SPÉCIFIQUES à l'option recommandée "${recommendedOption}" pour aider l'utilisateur à valider, affiner ou mieux comprendre cette recommandation précise.

RÈGLES CRITIQUES:
1. Les questions doivent être SPÉCIFIQUES à "${recommendedOption}" (pas générales)
2. Questions courtes et précises (max 60 caractères)
3. Se concentrer sur les aspects non couverts ou à clarifier pour cette option
4. Utiliser les inconvénients identifiés pour poser des questions de validation
5. Proposer des questions qui aident à confirmer si cette option convient vraiment

TYPES DE QUESTIONS À PRIVILÉGIER:
- Validation des caractéristiques de "${recommendedOption}"
- Contexte d'usage spécifique de cette option
- Contraintes ou limitations liées à "${recommendedOption}"
- Aspects financiers spécifiques à cette recommandation
- Comparaison avec des variantes proches

EXEMPLES selon le domaine:
${getSpecificExamplesByContext(context, recommendedOption)}

Réponds uniquement avec un objet JSON de ce format:
{
  "questions": [
    {"text": "Question spécifique à ${recommendedOption}?", "category": "validation"},
    {"text": "Autre question ciblée?", "category": "context"},
    ...
  ]
}`;
};

const getSpecificExamplesByContext = (context: string, recommendedOption: string): string => {
  const examples = {
    'technologie': `
    - "${recommendedOption} dépasse-t-il votre budget ?" (budget)
    - "Utiliserez-vous ${recommendedOption} pour du gaming ?" (usage)
    - "La taille de ${recommendedOption} vous convient-elle ?" (requirements)`,
    
    'voyage': `
    - "Avez-vous des contraintes de dates pour ${recommendedOption} ?" (timeline)
    - "${recommendedOption} convient-il pour un voyage en famille ?" (context)
    - "Le budget de ${recommendedOption} inclut-il tout ?" (budget)`,
    
    'finance': `
    - "Êtes-vous à l'aise avec le risque de ${recommendedOption} ?" (preferences)
    - "Pouvez-vous bloquer l'argent pour ${recommendedOption} ?" (timeline)
    - "Le rendement de ${recommendedOption} vous suffit-il ?" (requirements)`,
    
    'carrière': `
    - "Le salaire proposé pour ${recommendedOption} vous convient-il ?" (budget)
    - "${recommendedOption} correspond-il à vos valeurs ?" (preferences)
    - "Êtes-vous prêt à déménager pour ${recommendedOption} ?" (context)`,
    
    'santé': `
    - "Avez-vous des contre-indications pour ${recommendedOption} ?" (requirements)
    - "Combien de temps consacrer à ${recommendedOption} ?" (timeline)
    - "${recommendedOption} convient-il à votre niveau ?" (context)`,
    
    'style de vie': `
    - "Le style de ${recommendedOption} vous plaît-il ?" (preferences)
    - "${recommendedOption} s'adapte-t-il à votre espace ?" (context)
    - "Le prix de ${recommendedOption} est-il justifié ?" (budget)`
  };
  
  return examples[context as keyof typeof examples] || `
    - "${recommendedOption} répond-il à vos attentes ?" (preferences)
    - "Le coût de ${recommendedOption} est-il acceptable ?" (budget)
    - "Quand commencer avec ${recommendedOption} ?" (timeline)`;
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