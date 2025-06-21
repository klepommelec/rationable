
import { toast } from "sonner";
import { ICriterion, IResult, IDecision } from '@/types/decision';
import { generateCriteriaOnly, generateOptions } from '@/services/decisionService';
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
        
        console.log("🔄 [ÉCONOMIQUE] Starting optimized options generation", {
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
        setProgressMessage("Optimisation en cours (mode économique)...");
        
        if (isRetry) {
            incrementRetry();
            console.log(`🔄 [ÉCONOMIQUE] Retry attempt #${retryCount + 1}`);
        }

        try {
          console.log("📡 [ÉCONOMIQUE] Calling optimized generateOptions API...");
          const startTime = Date.now();
          
          const apiResult = await generateOptions(dilemma, currentCriteria);
          
          const endTime = Date.now();
          console.log("✅ [ÉCONOMIQUE] API call successful", {
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
            console.log("💾 [ÉCONOMIQUE] Updating existing decision", { decisionId: currentDecisionId });
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
          
          toast.success(isRetry ? "Options générées avec succès (mode économique) !" : "Analyse mise à jour (optimisée) !");
          
        } catch (error) {
          console.error("❌ [ÉCONOMIQUE] Error in generateOptions:", {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            retryCount,
            currentCriteria: currentCriteria.map(c => c.name)
          });
          
          const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
          
          if (retryCount < 2) {
            console.log(`🔄 [ÉCONOMIQUE] Will retry in 1.5s (attempt ${retryCount + 1}/3)`);
            toast.error(`${errorMessage} - Nouvelle tentative...`);
            setTimeout(() => handleGenerateOptions(true), 1500);
          } else {
            console.log("💀 [ÉCONOMIQUE] Max retries reached, giving up");
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
        console.log("🚀 [ÉCONOMIQUE] Starting optimized full analysis", { dilemma: dilemma.substring(0, 50) + "..." });
        setProgressMessage("Génération optimisée des critères...");
        setResult(null);
        setCriteria([]);
        setEmoji('🤔');
        setCurrentDecisionId(null);
        setHasChanges(false);
        resetRetry();
        setLastApiResponse(null);

        try {
          // Phase 1: Générer les critères avec cache intelligent
          console.log("📡 [ÉCONOMIQUE] Phase 1: Generating criteria with cache");
          const response = await generateCriteriaOnly(dilemma);
          console.log("✅ [ÉCONOMIQUE] Optimized criteria generated:", {
            emoji: response.emoji,
            criteriaCount: response.criteria?.length || 0,
            criteria: response.criteria,
            suggestedCategory: response.suggestedCategory
          });
          
          const newCriteria = response.criteria.map((name: string) => ({
            id: crypto.randomUUID(),
            name,
          }));
          
          setCriteria(newCriteria);
          setEmoji(response.emoji || '🤔');
          setSelectedCategory(response.suggestedCategory);
          setAnalysisStep('criteria-loaded');
          
          // Phase 2: Générer automatiquement les options avec optimisations
          setTimeout(async () => {
            console.log("📡 [ÉCONOMIQUE] Phase 2: Auto-generating optimized options");
            setAnalysisStep('loading-options');
            setProgressMessage("Génération optimisée des options...");
            
            try {
              const optionsResult = await generateOptions(dilemma, newCriteria);
              console.log("✅ [ÉCONOMIQUE] Auto-options generated successfully");
              setLastApiResponse(optionsResult);
              setResult(optionsResult);
              
              // Définir les critères de référence
              initialCriteriaRef.current = newCriteria;
              
              const newDecision: IDecision = {
                id: crypto.randomUUID(),
                timestamp: Date.now(),
                dilemma,
                emoji: response.emoji || '🤔',
                criteria: newCriteria,
                result: optionsResult,
                category: response.suggestedCategory
              };
              addDecision(newDecision);
              setCurrentDecisionId(newDecision.id);
              
              setAnalysisStep('done');
              toast.success("Analyse complète générée (mode économique) !");
            } catch (error) {
              console.error("❌ [ÉCONOMIQUE] Error in auto-options generation:", error);
              const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
              toast.error(`Erreur lors de la génération automatique : ${errorMessage}`);
              setAnalysisStep('criteria-loaded');
            } finally {
              setProgressMessage('');
            }
          }, 600); // Réduit à 600ms pour une UX plus rapide
          
        } catch (error) {
          console.error("❌ [ÉCONOMIQUE] Error in analysis start:", error);
          const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
          toast.error(`Erreur lors de l'analyse : ${errorMessage}`);
          setAnalysisStep('idle');
          setProgressMessage('');
        }
    };

    return {
        handleGenerateOptions,
        handleStartAnalysis
    };
};
