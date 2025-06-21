
import { toast } from "sonner";
import { ICriterion, IResult, IDecision } from '@/types/decision';
import { generateCompleteAnalysis, generateOptionsOnly } from '@/services/decisionService';
import { AnalysisStep } from './useDecisionState';

interface UseDecisionAPIProps {
    dilemma: string;
    criteria: ICriterion[];
    setResult: (result: IResult | null) => void;
    setLastApiResponse: (response: any) => void;
    setAnalysisStep: (step: AnalysisStep) => void;
    setCriteria: (criteria: ICriterion[]) => void;
    setEmoji: (emoji: string) => void;
    setSelectedCategory: (category: string | undefined) => void;
    setIsUpdating: (updating: boolean) => void;
    setProgressMessage: (message: string) => void;
    retryCount: number;
    incrementRetry: () => void;
    resetRetry: () => void;
    initialCriteriaRef: React.MutableRefObject<ICriterion[]>;
    setHasChanges: (hasChanges: boolean) => void;
    currentDecisionId: string | null;
    setCurrentDecisionId: (id: string | null) => void;
    history: IDecision[];
    updateDecision: (decision: IDecision) => void;
    addDecision: (decision: IDecision) => void;
}

export const useDecisionAPI = ({
    dilemma,
    criteria,
    setResult,
    setLastApiResponse,
    setAnalysisStep,
    setCriteria,
    setEmoji,
    setSelectedCategory,
    setIsUpdating,
    setProgressMessage,
    retryCount,
    incrementRetry,
    resetRetry,
    initialCriteriaRef,
    setHasChanges,
    currentDecisionId,
    setCurrentDecisionId,
    history,
    updateDecision,
    addDecision
}: UseDecisionAPIProps) => {

    const handleGenerateOptions = async (isRetry = false) => {
        const currentCriteria = criteria;
        
        console.log("🔄 [DEBUG] Starting options generation", {
            isRetry,
            retryCount,
            criteriaCount: currentCriteria.length,
            dilemma: dilemma.substring(0, 50) + "..."
        });
        
        if (currentCriteria.length < 2) {
          console.log("❌ [DEBUG] Not enough criteria");
          toast.error("Veuillez définir au moins 2 critères.");
          return;
        }
        if (currentCriteria.some(c => c.name.trim() === '')) {
          console.log("❌ [DEBUG] Empty criteria names found");
          toast.error("Veuillez nommer tous les critères avant de continuer.");
          return;
        }

        setIsUpdating(true);
        setAnalysisStep('loading-options');
        setProgressMessage("Analyse des options en cours...");
        
        if (isRetry) {
            incrementRetry();
            console.log(`🔄 [DEBUG] Retry attempt #${retryCount + 1}`);
        }

        try {
          console.log("📡 [DEBUG] Calling generateOptionsOnly API...");
          const startTime = Date.now();
          
          const apiResult = await generateOptionsOnly(dilemma, currentCriteria);
          
          const endTime = Date.now();
          console.log("✅ [DEBUG] API call successful", {
            duration: `${endTime - startTime}ms`,
            resultStructure: {
              hasRecommendation: !!apiResult.recommendation,
              hasDescription: !!apiResult.description,
              breakdownCount: apiResult.breakdown?.length || 0,
              infoLinksCount: apiResult.infoLinks?.length || 0,
              shoppingLinksCount: apiResult.shoppingLinks?.length || 0
            }
          });
          
          setLastApiResponse(apiResult);
          setResult(apiResult);
          setAnalysisStep('done');
          resetRetry();
          
          // Mettre à jour les critères de référence
          initialCriteriaRef.current = currentCriteria;
          setHasChanges(false);
          
          if (currentDecisionId) {
            console.log("💾 [DEBUG] Updating existing decision", { decisionId: currentDecisionId });
            const decisionToUpdate = history.find(d => d.id === currentDecisionId);
            if (decisionToUpdate) {
                const updated: IDecision = {
                  ...decisionToUpdate,
                  criteria: currentCriteria,
                  result: apiResult
                };
                updateDecision(updated);
            }
          }
          
          toast.success(isRetry ? "Options générées avec succès !" : "Analyse mise à jour !");
          
        } catch (error) {
          console.error("❌ [DEBUG] Error in generateOptionsOnly:", {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            retryCount,
            currentCriteria: currentCriteria.map(c => c.name)
          });
          
          const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
          
          // Check if it's a rate limit error - don't retry
          if (errorMessage.includes('Limite d\'appels API')) {
            toast.error(errorMessage);
            setAnalysisStep('criteria-loaded');
            resetRetry();
          } else if (retryCount < 2) {
            console.log(`🔄 [DEBUG] Will retry in 1.5s (attempt ${retryCount + 1}/3)`);
            toast.error(`${errorMessage} - Nouvelle tentative...`);
            setTimeout(() => handleGenerateOptions(true), 1500);
          } else {
            console.log("💀 [DEBUG] Max retries reached, giving up");
            toast.error(`Impossible de générer les options après ${retryCount + 1} tentatives. ${errorMessage}`);
            setAnalysisStep('criteria-loaded');
            resetRetry();
          }
        } finally {
          setIsUpdating(false);
          setProgressMessage('');
        }
    };

    const handleStartAnalysis = async () => {
        console.log("🚀 [DEBUG] Starting complete analysis", { dilemma: dilemma.substring(0, 50) + "..." });
        setProgressMessage("Analyse complète en cours...");
        setResult(null);
        setCriteria([]);
        setEmoji('🤔');
        setCurrentDecisionId(null);
        setHasChanges(false);
        resetRetry();
        setLastApiResponse(null);
        setAnalysisStep('loading-options');

        try {
          console.log("📡 [DEBUG] Calling generateCompleteAnalysis API...");
          const startTime = Date.now();
          
          const response = await generateCompleteAnalysis(dilemma);
          
          const endTime = Date.now();
          console.log("✅ [DEBUG] Complete analysis generated:", {
            duration: `${endTime - startTime}ms`,
            emoji: response.emoji,
            criteriaCount: response.criteria?.length || 0,
            suggestedCategory: response.suggestedCategory,
            hasResult: !!response.result
          });
          
          const newCriteria = response.criteria.map((name: string) => ({
            id: crypto.randomUUID(),
            name,
          }));
          
          setCriteria(newCriteria);
          setEmoji(response.emoji || '🤔');
          setSelectedCategory(response.suggestedCategory);
          setLastApiResponse(response.result);
          setResult(response.result);
          
          // Définir les critères de référence
          initialCriteriaRef.current = newCriteria;
          
          const newDecision: IDecision = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            dilemma,
            emoji: response.emoji || '🤔',
            criteria: newCriteria,
            result: response.result,
            category: response.suggestedCategory
          };
          addDecision(newDecision);
          setCurrentDecisionId(newDecision.id);
          
          setAnalysisStep('done');
          toast.success("Analyse complète générée !");
          
        } catch (error) {
          console.error("❌ [DEBUG] Error in complete analysis:", error);
          const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
          toast.error(`Erreur lors de l'analyse : ${errorMessage}`);
          setAnalysisStep('idle');
        } finally {
          setProgressMessage('');
        }
    };

    return {
        handleGenerateOptions,
        handleStartAnalysis
    };
};
