import { useState } from 'react';
import { IResult } from '@/types/decision';
import { AnalysisStep } from './useDecisionState';

export interface Analysis {
  id: string;
  dilemma: string;
  emoji: string;
  result: IResult | null;
  analysisStep: AnalysisStep;
  criteria: any[];
  category?: string;
}

export const useMultiAnalysis = () => {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [currentAnalysisIndex, setCurrentAnalysisIndex] = useState(0);

  const addAnalysis = (analysis: Analysis) => {
    setAnalyses(prev => [...prev, analysis]);
    setCurrentAnalysisIndex(analyses.length); // Pointer vers la nouvelle analyse
  };

  const updateCurrentAnalysis = (updates: Partial<Analysis>) => {
    setAnalyses(prev => prev.map((analysis, index) => 
      index === currentAnalysisIndex 
        ? { ...analysis, ...updates }
        : analysis
    ));
  };

  const getCurrentAnalysis = (): Analysis | null => {
    return analyses[currentAnalysisIndex] || null;
  };

  const navigateToAnalysis = (index: number) => {
    if (index >= 0 && index < analyses.length) {
      setCurrentAnalysisIndex(index);
    }
  };

  const clearAnalyses = () => {
    setAnalyses([]);
    setCurrentAnalysisIndex(0);
  };

  return {
    analyses,
    currentAnalysisIndex,
    getCurrentAnalysis,
    addAnalysis,
    updateCurrentAnalysis,
    navigateToAnalysis,
    clearAnalyses
  };
};