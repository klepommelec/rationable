
import { supabase } from '@/integrations/supabase/client';

export type QuestionType = 'factual' | 'comparative' | 'simple-choice';

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

**FACTUAL** - Questions avec UNE seule réponse factuelle précise :
- Questions sur des résultats sportifs précis avec réponse unique ("Qui a été drafté #1 en 2025?")
- Questions sur des dirigeants actuels ("Qui est le président de...")
- Questions sur des records, champions actuels avec nom spécifique
- Questions factuelles avec une seule réponse correcte et vérifiable
- Questions "Qui est...", "Qu'est-ce que..." avec réponse factuelle unique

**COMPARATIVE** - Questions nécessitant analyse et options multiples :
- Questions avec "ou", "vs", "versus", "choisir entre"
- Questions "Qui pourrait être...", "Quelles sont les options..."
- Questions demandant prédictions ou projections futures
- Questions "Quel est le meilleur...", conseils et recommandations
- Questions d'achat, voyages, décisions personnelles
- Questions nécessitant comparaison entre plusieurs alternatives
- TOUTES les questions de suivi sont automatiquement comparatives

**SIMPLE-CHOICE** - Questions de recommandation directe :
- Questions "Quel quartier choisir", "Quelle ville visiter"  
- Questions nécessitant une recommandation personnalisée
- Questions ouvertes nécessitant des critères d'évaluation

Question à analyser : "${question}"

Réponds UNIQUEMENT avec un JSON valide dans ce format exact :
{
  "type": "factual|comparative|simple-choice",
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
      type: data.type as QuestionType,
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
  
  // Patterns factuels simplifiés
  const factualPatterns = [
    /\b(qui est|qui a|qui détient|who is|who has|who holds)\b.*\b(champion|record|gagnant|winner|médaille|medal)\b/i,
    /\b(qu'est-ce que|what is|combien|how much|quand|when)\b/i,
    /\b(résultats?|result|vainqueur|winner|finaliste|finalist)\b/i
  ];
  
  // Patterns comparatifs
  const comparativePatterns = [
    /\b(ou|or|vs|versus|entre|between|comparer|compare)\b/i,
    /\b(différence|difference|lequel|which one|plutôt|rather)\b/i
  ];
  
  // Patterns de recommandation/conseil -> simple-choice
  const recommendationPatterns = [
    /\b(meilleur|best|recommand|recommend|conseil|advice)\b/i,
    /\b(acheter|buy|choisir|choose)\b/i,
    /\b(quel|quelle|which|where|où)\b.*\b(quartier|ville|city|neighborhood|endroit|place)\b/i
  ];
  
  if (factualPatterns.some(p => p.test(question))) {
    return {
      type: 'factual',
      confidence: 70,
      reasoning: 'Détecté comme factuel par pattern regex',
      suggestedApproach: 'Recherche de réponse factuelle directe'
    };
  }
  
  if (recommendationPatterns.some(p => p.test(question))) {
    return {
      type: 'simple-choice',
      confidence: 75,
      reasoning: 'Détecté comme simple-choice/recommandation par pattern regex',
      suggestedApproach: 'Génération de critères et recommandation personnalisée'
    };
  }
  
  if (comparativePatterns.some(p => p.test(question))) {
    return {
      type: 'comparative',
      confidence: 70,
      reasoning: 'Détecté comme comparatif par pattern regex',
      suggestedApproach: 'Génération de critères et comparaison d\'options'
    };
  }
  
  return {
    type: 'simple-choice',
    confidence: 60,
    reasoning: 'Classification par défaut - simple-choice',
    suggestedApproach: 'Génération de recommandation avec alternatives'
  };
};

// Fonction principale exportée qui remplace detectQuestionType
export const detectQuestionType = async (dilemma: string): Promise<QuestionType> => {
  try {
    const classification = await classifyQuestionWithAI(dilemma);
    console.log(`🎯 Final classification: ${classification.type} (confidence: ${classification.confidence}%)`);
    return classification.type;
  } catch (error) {
    console.error('❌ Question classification failed, using fallback');
    const fallback = fallbackToRegexClassification(dilemma);
    return fallback.type;
  }
};

// Export de la fonction de classification complète pour usage avancé
export const getDetailedQuestionClassification = async (dilemma: string): Promise<QuestionClassification> => {
  return await classifyQuestionWithAI(dilemma);
};
