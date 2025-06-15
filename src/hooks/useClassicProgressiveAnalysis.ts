
import { useState, useCallback } from 'react';
import { generateEmojiAndCriteria, generateOptions } from '@/services/decisionService';
import { ICriterion, IResult } from '@/types/decision';

interface IClassicProgressiveState {
  phase: 'idle' | 'generating-emoji' | 'generating-criteria' | 'thinking' | 'analyzing-options' | 'done';
  criteriaGenerated: string[];
  currentCriteriaIndex: number;
}

export const useClassicProgressiveAnalysis = () => {
  const [state, setState] = useState<IClassicProgressiveState>({
    phase: 'idle',
    criteriaGenerated: [],
    currentCriteriaIndex: 0
  });

  const [emoji, setEmoji] = useState<string>('🤔');
  const [criteria, setCriteria] = useState<ICriterion[]>([]);
  const [result, setResult] = useState<IResult | null>(null);

  const startClassicProgressiveAnalysis = useCallback(async (dilemma: string) => {
    setState({
      phase: 'generating-emoji',
      criteriaGenerated: [],
      currentCriteriaIndex: 0
    });

    try {
      // Phase 1: Générer emoji + critères
      const { emoji: generatedEmoji, criteria: criteriaNames } = await generateEmojiAndCriteria(dilemma);
      
      // Afficher l'emoji immédiatement
      setEmoji(generatedEmoji);
      
      setState(prev => ({ ...prev, phase: 'generating-criteria' }));

      // Afficher les critères un par un
      for (let i = 0; i < criteriaNames.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 400)); // Délai entre chaque critère
        setState(prev => ({
          ...prev,
          criteriaGenerated: criteriaNames.slice(0, i + 1),
          currentCriteriaIndex: i
        }));
      }

      // Convertir en objets ICriterion
      const criteriaObjects = criteriaNames.map(name => ({
        id: crypto.randomUUID(),
        name
      }));
      setCriteria(criteriaObjects);

      // Phase 2: Message "L'IA réfléchit..."
      setState(prev => ({ ...prev, phase: 'thinking' }));
      
      // Phase 3: Analyser les options
      setState(prev => ({ ...prev, phase: 'analyzing-options' }));
      const analysisResult = await generateOptions(dilemma, criteriaObjects);
      setResult(analysisResult);

      setState(prev => ({ ...prev, phase: 'done' }));

      return {
        emoji: generatedEmoji,
        criteria: criteriaObjects,
        result: analysisResult
      };
    } catch (error) {
      console.error('Classic progressive analysis error:', error);
      setState(prev => ({ ...prev, phase: 'idle' }));
      throw error;
    }
  }, []);

  const resetAnalysis = useCallback(() => {
    setState({
      phase: 'idle',
      criteriaGenerated: [],
      currentCriteriaIndex: 0
    });
    setEmoji('🤔');
    setCriteria([]);
    setResult(null);
  }, []);

  return {
    state,
    emoji,
    criteria,
    result,
    startClassicProgressiveAnalysis,
    resetAnalysis,
    isAnalyzing: state.phase !== 'idle' && state.phase !== 'done'
  };
};
