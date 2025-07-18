import { supabase } from '@/integrations/supabase/client';
import { ICriterion, IResult } from '@/types/decision';

export interface ClaudeDecisionRequest {
  dilemma: string;
  criteria: ICriterion[];
  realTimeData?: any;
  workspaceData?: any;
  model?: string;
}

export const makeClaudeDecision = async (request: ClaudeDecisionRequest): Promise<IResult> => {
  try {
    console.log('🧠 Appel à Claude pour la décision:', request.dilemma);

    const { data, error } = await supabase.functions.invoke('claude-decision-maker', {
      body: {
        dilemma: request.dilemma,
        criteria: request.criteria,
        realTimeData: request.realTimeData,
        workspaceData: request.workspaceData,
        model: request.model || 'claude-sonnet-4-20250514'
      }
    });

    if (error) {
      console.error('❌ Erreur Claude:', error);
      throw new Error(`Erreur Claude: ${error.message}`);
    }

    if (!data) {
      throw new Error('Aucune donnée reçue de Claude');
    }

    // Si c'est une erreur encapsulée dans la réponse
    if (data.error) {
      throw new Error(data.error);
    }

    console.log('✅ Décision Claude générée avec succès');
    return data as IResult;

  } catch (error) {
    console.error('❌ Erreur service Claude:', error);
    throw error;
  }
};

// Service spécialisé pour les analyses complexes
export const makeComplexAnalysis = async (
  dilemma: string, 
  criteria: ICriterion[],
  additionalContext?: string
): Promise<IResult> => {
  return makeClaudeDecision({
    dilemma: additionalContext ? `${dilemma}\n\nContexte supplémentaire: ${additionalContext}` : dilemma,
    criteria,
    model: 'claude-opus-4-20250514' // Modèle le plus puissant pour les analyses complexes
  });
};

// Service rapide pour les décisions simples
export const makeQuickDecision = async (
  dilemma: string, 
  criteria: ICriterion[]
): Promise<IResult> => {
  return makeClaudeDecision({
    dilemma,
    criteria,
    model: 'claude-3-5-haiku-20241022' // Modèle le plus rapide
  });
};