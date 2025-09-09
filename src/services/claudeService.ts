import { supabase } from '@/integrations/supabase/client';
import { ICriterion, IResult } from '@/types/decision';
import { I18nService, SupportedLanguage } from './i18nService';

export interface ClaudeDecisionRequest {
  dilemma: string;
  criteria: ICriterion[];
  realTimeData?: any;
  workspaceData?: any;
  model?: string;
  language?: SupportedLanguage;
}

export const makeClaudeDecision = async (request: ClaudeDecisionRequest): Promise<IResult> => {
  try {
    const detectedLanguage = request.language || I18nService.getCurrentLanguage();
    
    console.log('🧠 Appel à Claude pour la décision:', request.dilemma);
    console.log('🌐 Langue détectée:', detectedLanguage);

    const { data, error } = await supabase.functions.invoke('claude-decision-maker', {
      body: {
        dilemma: request.dilemma,
        criteria: request.criteria,
        realTimeData: request.realTimeData,
        workspaceData: request.workspaceData,
        model: request.model || 'claude-sonnet-4-20250514',
        language: detectedLanguage
      }
    });

    if (error) {
      console.error('❌ Erreur Claude:', error);
      const fallbackMessages = I18nService.getFallbackMessages(detectedLanguage);
      throw new Error(`${fallbackMessages.claudeError}: ${error.message}`);
    }

    if (!data) {
      const fallbackMessages = I18nService.getFallbackMessages(detectedLanguage);
      throw new Error(fallbackMessages.claudeError);
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
  additionalContext?: string,
  language?: SupportedLanguage
): Promise<IResult> => {
  const detectedLanguage = language || I18nService.getCurrentLanguage();
  
  // Get context labels in the detected language
  const contextLabels = {
    fr: 'Contexte supplémentaire',
    en: 'Additional context',
    es: 'Contexto adicional',
    it: 'Contesto aggiuntivo',
    de: 'Zusätzlicher Kontext'
  };
  
  const contextLabel = contextLabels[detectedLanguage] || contextLabels.fr;
  
  return makeClaudeDecision({
    dilemma: additionalContext ? `${dilemma}\n\n${contextLabel}: ${additionalContext}` : dilemma,
    criteria,
    model: 'claude-opus-4-20250514', // Modèle le plus puissant pour les analyses complexes
    language: detectedLanguage
  });
};

// Service rapide pour les décisions simples
export const makeQuickDecision = async (
  dilemma: string, 
  criteria: ICriterion[],
  language?: SupportedLanguage
): Promise<IResult> => {
  const detectedLanguage = language || I18nService.getCurrentLanguage();
  
  return makeClaudeDecision({
    dilemma,
    criteria,
    model: 'claude-3-5-haiku-20241022', // Modèle le plus rapide
    language: detectedLanguage
  });
};