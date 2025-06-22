import { toast } from "sonner";
import { ICriterion, IResult, IDecision } from '@/types/decision';
import { generateCriteriaOnly, generateOptions } from '@/services/decisionService';
import { uploadFilesToStorage, deleteFileFromStorage, UploadedFileInfo } from '@/services/fileUploadService';
import { UploadedFile } from '@/components/FileUpload';
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
    uploadedFiles?: UploadedFile[];
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
    addDecision,
    uploadedFiles = []
}: UseDecisionAPIProps) => {

    const handleGenerateOptions = async (isRetry = false) => {
        const currentCriteria = criteria;
        
        console.log("🔄 [DEBUG] Starting options generation", {
            isRetry,
            retryCount,
            criteriaCount: currentCriteria.length,
            filesCount: uploadedFiles.length,
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
        
        if (isRetry) {
            incrementRetry();
            console.log(`🔄 [DEBUG] Retry attempt #${retryCount + 1}`);
        }

        let uploadedFileInfos: UploadedFileInfo[] = [];

        try {
          // Upload des fichiers si présents
          if (uploadedFiles.length > 0) {
            setProgressMessage("Upload des documents en cours...");
            console.log("📤 [DEBUG] Uploading files to storage...");
            uploadedFileInfos = await uploadFilesToStorage(uploadedFiles);
            console.log("✅ [DEBUG] Files uploaded successfully");
          }
          
          setProgressMessage("Analyse des options en cours...");
          console.log("📡 [DEBUG] Calling generateOptions API...");
          const startTime = Date.now();
          
          const apiResult = await generateOptions(dilemma, currentCriteria, uploadedFileInfos);
          
          const endTime = Date.now();
          console.log("✅ [DEBUG] API call successful", {
            duration: `${endTime - startTime}ms`,
            filesAnalyzed: uploadedFileInfos.length,
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
          console.error("❌ [DEBUG] Error in generateOptions:", {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            retryCount,
            filesCount: uploadedFiles.length
          });
          
          // Nettoyer les fichiers uploadés en cas d'erreur
          if (uploadedFileInfos.length > 0) {
            console.log("🧹 [DEBUG] Cleaning up uploaded files due to error...");
            for (const fileInfo of uploadedFileInfos) {
              try {
                await deleteFileFromStorage(fileInfo.filePath);
              } catch (cleanupError) {
                console.error("❌ [DEBUG] Error cleaning up file:", cleanupError);
              }
            }
          }
          
          const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
          
          if (retryCount < 2) {
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
        console.log("🚀 [DEBUG] Starting full analysis", { 
          dilemma: dilemma.substring(0, 50) + "...",
          filesCount: uploadedFiles.length
        });
        
        setProgressMessage("Génération des critères...");
        setResult(null);
        setCriteria([]);
        setEmoji('🤔');
        setCurrentDecisionId(null);
        setHasChanges(false);
        resetRetry();
        setLastApiResponse(null);

        let uploadedFileInfos: UploadedFileInfo[] = [];

        try {
          // Upload des fichiers si présents
          if (uploadedFiles.length > 0) {
            setProgressMessage("Upload des documents en cours...");
            console.log("📤 [DEBUG] Uploading files for analysis...");
            uploadedFileInfos = await uploadFilesToStorage(uploadedFiles);
            console.log("✅ [DEBUG] Files uploaded for analysis");
          }
          
          // Phase 1: Générer les critères et obtenir la catégorie suggérée
          console.log("📡 [DEBUG] Phase 1: Generating criteria and category");
          setProgressMessage("Analyse du contexte et génération des critères...");
          
          const response = await generateCriteriaOnly(dilemma, uploadedFileInfos);
          console.log("✅ [DEBUG] Criteria and category generated:", {
            emoji: response.emoji,
            criteriaCount: response.criteria?.length || 0,
            criteria: response.criteria,
            suggestedCategory: response.suggestedCategory,
            filesAnalyzed: uploadedFileInfos.length
          });
          
          const newCriteria = response.criteria.map((name: string) => ({
            id: crypto.randomUUID(),
            name,
          }));
          
          setCriteria(newCriteria);
          setEmoji(response.emoji || '🤔');
          setSelectedCategory(response.suggestedCategory);
          setAnalysisStep('criteria-loaded');
          
          // Phase 2: Générer automatiquement les options
          setTimeout(async () => {
            console.log("📡 [DEBUG] Phase 2: Auto-generating options");
            setAnalysisStep('loading-options');
            setProgressMessage("Génération des options...");
            
            try {
              const optionsResult = await generateOptions(dilemma, newCriteria, uploadedFileInfos);
              console.log("✅ [DEBUG] Auto-options generated successfully");
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
              toast.success("Analyse complète générée !");
            } catch (error) {
              console.error("❌ [DEBUG] Error in auto-options generation:", error);
              const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
              toast.error(`Erreur lors de la génération automatique : ${errorMessage}`);
              setAnalysisStep('criteria-loaded');
              
              // Nettoyer les fichiers en cas d'erreur
              if (uploadedFileInfos.length > 0) {
                console.log("🧹 [DEBUG] Cleaning up uploaded files due to error...");
                for (const fileInfo of uploadedFileInfos) {
                  try {
                    await deleteFileFromStorage(fileInfo.filePath);
                  } catch (cleanupError) {
                    console.error("❌ [DEBUG] Error cleaning up file:", cleanupError);
                  }
                }
              }
            } finally {
              setProgressMessage('');
            }
          }, 800);
          
        } catch (error) {
          console.error("❌ [DEBUG] Error in analysis start:", error);
          const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
          toast.error(`Erreur lors de l'analyse : ${errorMessage}`);
          setAnalysisStep('idle');
          setProgressMessage('');
          
          // Nettoyer les fichiers en cas d'erreur
          if (uploadedFileInfos.length > 0) {
            console.log("🧹 [DEBUG] Cleaning up uploaded files due to error...");
            for (const fileInfo of uploadedFileInfos) {
              try {
                await deleteFileFromStorage(fileInfo.filePath);
              } catch (cleanupError) {
                console.error("❌ [DEBUG] Error cleaning up file:", cleanupError);
              }
            }
          }
        }
    };

    return {
        handleGenerateOptions,
        handleStartAnalysis
    };
};
