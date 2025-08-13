import { useState, useCallback } from 'react';
import { ICriterion, IResult } from '@/types/decision';
import { generateCriteriaWithFallback, generateOptionsWithFallback } from '@/services/enhancedDecisionService';
import { UploadedFileInfo } from '@/services/fileUploadService';

interface UseParallelAnalysisProps {
  setProgressMessage: (message: string) => void;
  setAnalysisStep: (step: 'idle' | 'loading-criteria' | 'criteria-loaded' | 'loading-options' | 'done') => void;
  setResult: (result: IResult) => void;
  setCriteria: (criteria: ICriterion[]) => void;
  setEmoji: (emoji: string) => void;
  setSelectedCategory: (category: string) => void;
  setHasChanges: (changes: boolean) => void;
}

export const useParallelAnalysis = ({
  setProgressMessage,
  setAnalysisStep,
  setResult,
  setCriteria,
  setEmoji,
  setSelectedCategory,
  setHasChanges
}: UseParallelAnalysisProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const executeParallelAnalysis = useCallback(async (
    dilemma: string,
    files?: UploadedFileInfo[],
    workspaceId?: string
  ) => {
    if (isAnalyzing) return null;
    
    setIsAnalyzing(true);
    setAnalysisStep('loading-criteria');
    setProgressMessage('Génération des critères et recherche en parallèle...');

    try {
      // Phase 1: Génération des critères en parallèle avec upload de fichiers
      console.log('⚡ Starting parallel criteria generation and file processing...');
      
      const criteriaPromise = generateCriteriaWithFallback(dilemma, files, workspaceId);
      
      // Attendre la génération des critères (rapide)
      const criteriaResult = await criteriaPromise;
      
      console.log('✅ Criteria generated, updating UI immediately...');
      
      // Mise à jour immédiate de l'interface avec les critères
      const criteriaObjects = criteriaResult.criteria.map((name: string, index: number) => ({
        id: (index + 1).toString(),
        name,
        weight: 20
      }));
      
      setCriteria(criteriaObjects);
      setEmoji(criteriaResult.emoji);
      if (criteriaResult.suggestedCategory) {
        setSelectedCategory(criteriaResult.suggestedCategory);
      }
      setHasChanges(true);
      
      // Changer immédiatement le step pour montrer les critères à l'utilisateur
      setAnalysisStep('criteria-loaded');
      setProgressMessage('Critères générés ! Génération des options...');
      
      // Phase 2: Génération des options (plus lente) 
      console.log('⚡ Starting options generation with criteria...');
      setAnalysisStep('loading-options');
      
      const result = await generateOptionsWithFallback(dilemma, criteriaObjects, files, workspaceId);
      
      console.log('✅ Options generated successfully');
      setResult(result);
      setAnalysisStep('done');
      setProgressMessage('Analyse terminée !');
      
      return result;
      
    } catch (error) {
      console.error('❌ Parallel analysis failed:', error);
      setAnalysisStep('idle');
      setProgressMessage('');
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  }, [isAnalyzing, setProgressMessage, setAnalysisStep, setResult, setCriteria, setEmoji, setSelectedCategory, setHasChanges]);

  return {
    executeParallelAnalysis,
    isAnalyzing
  };
};