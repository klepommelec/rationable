import { toast } from "sonner";
import { ICriterion, IResult, IDecision } from '@/types/decision';
import { generateCriteriaOnly, generateOptions } from '@/services/decisionService';
import { uploadFilesToStorage, deleteFileFromStorage, UploadedFileInfo } from '@/services/fileUploadService';
import { UploadedFile } from '@/components/FileUpload';
import { AnalysisStep } from './useDecisionState';
import { useWorkspaceContext } from './useWorkspaceContext';
import { generateContextualEmoji } from '@/services/contextualEmojiService';

interface UseDecisionAPIProps {
    dilemma: string;
    criteria: ICriterion[];
    setResult: (result: IResult | null) => void;
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
    const { getCurrentWorkspaceId, shouldUseWorkspaceDocuments } = useWorkspaceContext();

    const handleGenerateOptions = async (isRetry = false) => {
        const currentCriteria = criteria;
        const workspaceId = shouldUseWorkspaceDocuments() ? getCurrentWorkspaceId() : undefined;
        
        // Importer la détection de type de question
        const { detectQuestionType } = await import('@/services/questionTypeDetector');
        const questionType = detectQuestionType(dilemma);
        
        console.log("🔄 [DEBUG] Starting options generation", {
            isRetry,
            retryCount,
            questionType,
            criteriaCount: currentCriteria.length,
            filesCount: uploadedFiles.length,
            workspaceId: workspaceId || 'none',
            dilemma: dilemma.substring(0, 50) + "..."
        });
        
        // Pour les questions comparatives seulement, vérifier les critères
        if (questionType === 'comparative') {
            if (currentCriteria.length < 2) {
              console.log("❌ [DEBUG] Not enough criteria for comparative question");
              toast.error("Veuillez définir au moins 2 critères.");
              return;
            }
            if (currentCriteria.some(c => c.name.trim() === '')) {
              console.log("❌ [DEBUG] Empty criteria names found");
              toast.error("Veuillez nommer tous les critères avant de continuer.");
              return;
            }
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
          
          const progressMessage = questionType === 'factual' 
            ? "Recherche de la réponse factuelle..."
            : questionType === 'simple-choice'
            ? "Recherche de la meilleure recommandation..."
            : "Analyse des options en cours...";
          
          setProgressMessage(workspaceId ? `${progressMessage} avec documents workspace` : progressMessage);
          console.log("📡 [DEBUG] Calling generateOptions API...");
          const startTime = Date.now();
          
          const apiResult = await generateOptions(dilemma, currentCriteria, uploadedFileInfos, workspaceId);
          
          const endTime = Date.now();
          console.log("✅ [DEBUG] API call successful", {
            duration: `${endTime - startTime}ms`,
            filesAnalyzed: uploadedFileInfos.length,
            workspaceDocsUsed: apiResult.workspaceData?.documentsUsed || 0,
            questionType,
            resultStructure: {
              hasRecommendation: !!apiResult.recommendation,
              hasDescription: !!apiResult.description,
              breakdownCount: apiResult.breakdown?.length || 0,
              infoLinksCount: apiResult.infoLinks?.length || 0,
              shoppingLinksCount: apiResult.shoppingLinks?.length || 0
            }
          });
          
          // Marquer le type de résultat
          apiResult.resultType = questionType;
          
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
          
          let successMessage;
          if (apiResult.workspaceData?.documentsUsed) {
            successMessage = `Analyse générée avec ${apiResult.workspaceData.documentsUsed} document(s) de votre workspace !`;
          } else {
            successMessage = questionType === 'factual' 
              ? "Réponse factuelle trouvée !"
              : questionType === 'simple-choice'
              ? "Recommandation générée !"
              : isRetry ? "Options générées avec succès !" : "Analyse mise à jour !";
          }
          
          toast.success(successMessage);
          
        } catch (error) {
          console.error("❌ [DEBUG] Error in generateOptions:", {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            retryCount,
            filesCount: uploadedFiles.length,
            workspaceId,
            questionType
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
        const workspaceId = shouldUseWorkspaceDocuments() ? getCurrentWorkspaceId() : undefined;
        
        // Importer la détection de type de question
        const { detectQuestionType } = await import('@/services/questionTypeDetector');
        const questionType = detectQuestionType(dilemma);
        
        console.log("🚀 [DEBUG] Starting full analysis", { 
          dilemma: dilemma.substring(0, 50) + "...",
          questionType,
          filesCount: uploadedFiles.length,
          workspaceId: workspaceId || 'none'
        });
        
        // Générer un emoji contextuel
        const contextualEmoji = generateContextualEmoji(dilemma);
        
        setResult(null);
        setCriteria([]);
        setEmoji(contextualEmoji);
        setCurrentDecisionId(null);
        setHasChanges(false);
        resetRetry();

        let uploadedFileInfos: UploadedFileInfo[] = [];

        try {
          // Upload des fichiers si présents
          if (uploadedFiles.length > 0) {
            setProgressMessage("Upload des documents en cours...");
            console.log("📤 [DEBUG] Uploading files for analysis...");
            uploadedFileInfos = await uploadFilesToStorage(uploadedFiles);
            console.log("✅ [DEBUG] Files uploaded for analysis");
          }
          
          // Pour les questions factuelles et simple-choice, pas besoin de critères complexes
          if (questionType === 'factual' || questionType === 'simple-choice') {
            const progressMsg = questionType === 'factual' 
              ? "Recherche de la réponse factuelle..."
              : "Recherche de la meilleure recommandation...";
              
            console.log(`🎯 [DEBUG] ${questionType} question detected - generating direct answer`);
            setProgressMessage(workspaceId ? `${progressMsg} avec documents workspace` : progressMsg);
            setAnalysisStep('loading-options');
            
            const optionsResult = await generateOptions(dilemma, [], uploadedFileInfos, workspaceId);
            optionsResult.resultType = questionType;
            
            console.log(`✅ [DEBUG] ${questionType} answer generated successfully`);
            setResult(optionsResult);
            
            const newDecision: IDecision = {
              id: crypto.randomUUID(),
              timestamp: Date.now(),
              dilemma,
              emoji: contextualEmoji,
              criteria: [],
              result: optionsResult,
              category: 'other'
            };
            addDecision(newDecision);
            setCurrentDecisionId(newDecision.id);
            
            setAnalysisStep('done');
            
            const successMessage = optionsResult.workspaceData?.documentsUsed 
              ? `${questionType === 'factual' ? 'Réponse' : 'Recommandation'} générée avec ${optionsResult.workspaceData.documentsUsed} document(s) de votre workspace !`
              : questionType === 'factual' ? "Réponse factuelle trouvée !" : "Recommandation générée !";
            
            toast.success(successMessage);
            return;
          }
          
          // Phase 1: Générer les critères pour les questions comparatives
          console.log("📡 [DEBUG] Phase 1: Generating criteria for comparative question");
          setProgressMessage(workspaceId ? "Analyse du contexte avec documents workspace..." : "Analyse du contexte et génération des critères...");
          
          const response = await generateCriteriaOnly(dilemma, uploadedFileInfos, workspaceId);
          console.log("✅ [DEBUG] Criteria and category generated:", {
            emoji: response.emoji,
            criteriaCount: response.criteria?.length || 0,
            criteria: response.criteria,
            suggestedCategory: response.suggestedCategory,
            filesAnalyzed: uploadedFileInfos.length,
            workspaceDocsUsed: 0
          });
          
          const newCriteria = response.criteria.map((criterion: ICriterion) => ({
            id: crypto.randomUUID(),
            name: criterion.name,
          }));
          
          setCriteria(newCriteria);
          // Utiliser l'emoji contextuel plutôt que celui de l'API
          setEmoji(contextualEmoji);
          setSelectedCategory(response.suggestedCategory);
          setAnalysisStep('criteria-loaded');
          
          // Phase 2: Générer automatiquement les options
          setTimeout(async () => {
            console.log("📡 [DEBUG] Phase 2: Auto-generating options for comparative question");
            setAnalysisStep('loading-options');
            setProgressMessage(workspaceId ? "Génération des options avec documents workspace..." : "Génération des options comparatives...");
            
            try {
              const optionsResult = await generateOptions(dilemma, newCriteria, uploadedFileInfos, workspaceId);
              optionsResult.resultType = questionType;
              
              console.log("✅ [DEBUG] Auto-options generated successfully");
              setResult(optionsResult);
              
              // Définir les critères de référence
              initialCriteriaRef.current = newCriteria;
              
              const newDecision: IDecision = {
                id: crypto.randomUUID(),
                timestamp: Date.now(),
                dilemma,
                emoji: contextualEmoji,
                criteria: newCriteria,
                result: optionsResult,
                category: response.suggestedCategory
              };
              addDecision(newDecision);
              setCurrentDecisionId(newDecision.id);
              
              setAnalysisStep('done');
              
              const successMessage = optionsResult.workspaceData?.documentsUsed 
                ? `Analyse comparative générée avec ${optionsResult.workspaceData.documentsUsed} document(s) de votre workspace !`
                : "Analyse comparative générée !";
              
              toast.success(successMessage);
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
