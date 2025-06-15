
import { useState, useCallback } from 'react';
import { ProgressiveAnalysisService } from '@/services/progressiveAnalysisService';
import { IProgressiveState } from '@/types/progressive';
import { ICriterion, IResult } from '@/types/decision';

export const useProgressiveAnalysis = () => {
  const [progressiveState, setProgressiveState] = useState<IProgressiveState>({
    phase: 'idle',
    progress: 0,
    message: '',
    criteriaGenerated: [],
    optionsAnalyzed: 0,
    totalOptions: 0
  });

  const [generatedCriteria, setGeneratedCriteria] = useState<ICriterion[]>([]);
  const [finalResult, setFinalResult] = useState<IResult | null>(null);
  const [emoji, setEmoji] = useState<string>('🤔');

  const startProgressiveAnalysis = useCallback(async (dilemma: string) => {
    const service = new ProgressiveAnalysisService(setProgressiveState);
    
    try {
      // Phase 1: Générer l'emoji
      const generatedEmoji = await service.generateEmoji(dilemma);
      setEmoji(generatedEmoji);

      // Phase 2: Générer les critères progressivement
      const criteriaNames = await service.generateCriteriaProgressively(dilemma);
      const criteriaObjects = criteriaNames.map(name => ({
        id: crypto.randomUUID(),
        name
      }));
      setGeneratedCriteria(criteriaObjects);

      // Phase 3: Analyser les options progressivement
      const result = await service.analyzeOptionsProgressively(dilemma, criteriaNames);
      setFinalResult(result);

      return {
        emoji: generatedEmoji,
        criteria: criteriaObjects,
        result
      };
    } catch (error) {
      console.error('Progressive analysis error:', error);
      throw error;
    }
  }, []);

  const resetProgressiveAnalysis = useCallback(() => {
    setProgressiveState({
      phase: 'idle',
      progress: 0,
      message: '',
      criteriaGenerated: [],
      optionsAnalyzed: 0,
      totalOptions: 0
    });
    setGeneratedCriteria([]);
    setFinalResult(null);
    setEmoji('🤔');
  }, []);

  return {
    progressiveState,
    generatedCriteria,
    finalResult,
    emoji,
    startProgressiveAnalysis,
    resetProgressiveAnalysis,
    isAnalyzing: progressiveState.phase !== 'idle' && progressiveState.phase !== 'done'
  };
};
