import { useState } from 'react';
import { IResult } from '@/types/decision';
import { AnalysisStep } from './useDecisionState';

export interface Analysis {
  id: string;
  dilemma: string;
  displayTitle?: string; // Titre d'affichage pour les questions de suivi
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
    setAnalyses(prev => {
      const next = [...prev, analysis];
      setCurrentAnalysisIndex(next.length - 1); // Pointer vers la nouvelle analyse de façon sûre
      return next;
    });
  };

  const updateCurrentAnalysis = (updates: Partial<Analysis>, targetIndex?: number) => {
    setAnalyses(prev => prev.map((analysis, index) => 
      index === (targetIndex ?? currentAnalysisIndex)
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