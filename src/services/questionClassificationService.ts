import { supabase } from '@/integrations/supabase/client';

export type QuestionType = 'comparative';

export interface QuestionClassification {
  type: QuestionType;
  confidence: number;
  reasoning: string;
  suggestedApproach: string;
}

export const classifyQuestionWithAI = async (question: string): Promise<QuestionClassification> => {
  try {
    console.log(`🔍 AI Classification - Analyzing question: "${question}"`);
    
    const classificationPrompt = `Analyse cette question et détermine son type selon ces critères précis :

**COMPARATIVE** - Toutes les questions sont analysées de manière comparative :
- Questions ouvertes sur les meilleures options ("Quelles sont les meilleures...", "Que choisir...")
- Questions de conseil avec plusieurs alternatives possibles
- Questions nécessitant une analyse de pros/cons
- Questions avec critères de sélection multiples
- Questions binaires transformées en analyse comparative
- Questions avec options prédéfinies analysées comparativement

Question à analyser : "${question}"

Réponds UNIQUEMENT avec un JSON valide dans ce format exact :
{
  "type": "comparative",
  "confidence": 85,
  "reasoning": "Explication claire du choix",
  "suggestedApproach": "Comment traiter cette question"
}`;

    const { data, error } = await supabase.functions.invoke('openai-decision-maker', {
      body: { 
        prompt: classificationPrompt
      },
    });

    if (error) {
      console.error("❌ AI Classification error:", error);
      throw new Error(`Erreur de classification IA: ${error.message}`);
    }

    if (!data || !data.type) {
      throw new Error('Classification IA invalide - pas de type retourné');
    }

    console.log(`✅ AI Classification successful:`, {
      type: data.type,
      confidence: data.confidence,
      reasoning: data.reasoning?.substring(0, 100) + "..."
    });

    return {
      type: 'comparative' as QuestionType,
      confidence: data.confidence || 80,
      reasoning: data.reasoning || 'Classification par IA',
      suggestedApproach: data.suggestedApproach || 'Approche standard'
    };

  } catch (error) {
    console.error('❌ AI Classification failed:', error);
    // Fallback vers le système existant en cas d'erreur
    return fallbackToRegexClassification(question);
  }
};

// Fonction de fallback utilisant le système regex existant
const fallbackToRegexClassification = (question: string): QuestionClassification => {
  console.log('🔄 Using regex fallback for classification');
  
  const lowerQuestion = question.toLowerCase();
  
  // Patterns unifiés - tout est maintenant comparatif
  const allPatterns = [
    /\b(quelles|quels|what|which|où|where|comment|how|meilleur|best)\b/i,
    /\b(options|choix|alternatives|possibilités|solutions)\b/i,
    /\b(recommand|conseil|suggest|advice)\b/i,
    /\b(ou|or|vs|versus|entre|between|comparer|compare)\b/i,
    /\b(différence|difference|lequel|which one|plutôt|rather)\b/i,
    /\b(meilleur|best|recommand|recommend|conseil|advice)\b/i,
    /\b(acheter|buy|choisir|choose)\b/i,
    /\b(quel|quelle|which|where|où)\b.*\b(quartier|ville|city|neighborhood|endroit|place)\b/i
  ];
  
  // Tous les types de questions sont maintenant traités de manière comparative
  if (allPatterns.some(p => p.test(question))) {
    return {
      type: 'comparative',
      confidence: 70,
      reasoning: 'Détecté comme comparatif par pattern regex',
      suggestedApproach: 'Génération de critères et comparaison d\'options'
    };
  }
  
  return {
    type: 'comparative',
    confidence: 60,
    reasoning: 'Classification par défaut - comparative pour analyse approfondie',
    suggestedApproach: 'Génération de critères et analyse comparative'
  };
};

// Fonction principale exportée qui remplace detectQuestionType
export const detectQuestionType = async (dilemma: string): Promise<QuestionType> => {
  console.log(`🎯 Unified classification: always comparative for "${dilemma.substring(0, 50)}..."`);
  return 'comparative';
};

// Export de la fonction de classification complète pour usage avancé
export const getDetailedQuestionClassification = async (dilemma: string): Promise<QuestionClassification> => {
  return await classifyQuestionWithAI(dilemma);
};