
import { useState } from 'react';
import { toast } from "sonner";
import { ICriterion, IResult, AnalysisStep } from '@/types/decision';
import { generateCriteriaProgressive, generateFinalAnalysis } from '@/services/decisionService';

export const useProgressiveAnalysis = () => {
  const [analysisStep, setAnalysisStep] = useState<AnalysisStep>('idle');
  const [generatedCriteria, setGeneratedCriteria] = useState<string[]>([]);
  const [validatedCriteria, setValidatedCriteria] = useState<ICriterion[]>([]);
  const [result, setResult] = useState<IResult | null>(null);
  const [emoji, setEmoji] = useState('🤔');

  const startProgressiveAnalysis = async (dilemma: string) => {
    try {
      setAnalysisStep('generating-criteria');
      setResult(null);
      setValidatedCriteria([]);
      setGeneratedCriteria([]);
      setEmoji('🤔');

      // Génération des critères
      const response = await generateCriteriaProgressive(dilemma);
      setGeneratedCriteria(response.criteria);
      setEmoji(response.emoji || '🤔');
      setAnalysisStep('validating-criteria');
      
    } catch (error) {
      console.error('Erreur lors de la génération des critères:', error);
      toast.error("Erreur lors de la génération des critères");
      setAnalysisStep('idle');
    }
  };

  const handleCriteriaValidation = async (dilemma: string, validatedCriteria: ICriterion[]) => {
    try {
      setValidatedCriteria(validatedCriteria);
      setAnalysisStep('final-analysis');

      // Génération de l'analyse finale
      const finalResult = await generateFinalAnalysis(dilemma, validatedCriteria);
      setResult(finalResult);
      setAnalysisStep('done');
      
      toast.success("Analyse complète générée !");
      
    } catch (error) {
      console.error('Erreur lors de l\'analyse finale:', error);
      toast.error("Erreur lors de l'analyse finale");
      setAnalysisStep('idle');
    }
  };

  const resetAnalysis = () => {
    setAnalysisStep('idle');
    setGeneratedCriteria([]);
    setValidatedCriteria([]);
    setResult(null);
    setEmoji('🤔');
  };

  return {
    analysisStep,
    generatedCriteria,
    validatedCriteria,
    result,
    emoji,
    startProgressiveAnalysis,
    handleCriteriaValidation,
    resetAnalysis,
    setEmoji
  };
};
