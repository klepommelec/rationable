
import { toast } from "sonner";
import { ICriterion, IResult, IDecision } from '@/types/decision';
import { generateCriteriaWithPerplexity, generateOptimizedDecision } from '@/services/optimizedDecisionService';
import { uploadFilesToStorage, deleteFileFromStorage, UploadedFileInfo } from '@/services/fileUploadService';
import { UploadedFile } from '@/components/FileUpload';
import { AnalysisStep } from './useDecisionState';
import { useWorkspaceContext } from './useWorkspaceContext';
import { generateContextualEmoji } from '@/services/contextualEmojiService';
import { detectQuestionType } from '@/services/questionClassificationService';

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

    const handleGenerateOptions = async (isRetry = false, forcedType?: 'factual' | 'comparative' | 'simple-choice') => {
        const currentCriteria = criteria;
        const workspaceId = shouldUseWorkspaceDocuments() ? getCurrentWorkspaceId() : undefined;
        
        // Utiliser le type forcé si fourni, sinon classifier
        const questionType = forcedType ?? await detectQuestionType(dilemma);
        
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
            : "Analyse des options en cours...";
          
          setProgressMessage(workspaceId ? `${progressMessage} avec documents workspace` : progressMessage);
          console.log("📡 [DEBUG] Calling generateOptions API...");
          const startTime = Date.now();
          
          const apiResult = await generateOptimizedDecision(dilemma, currentCriteria, uploadedFileInfos, workspaceId, questionType);
          
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
            setTimeout(() => handleGenerateOptions(true, questionType), 1500);
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

    const handleStartAnalysis = async (forcedType?: 'factual' | 'comparative' | 'simple-choice', options?: { threadFromId?: string; dilemmaOverride?: string }) => {
        const workspaceId = shouldUseWorkspaceDocuments() ? getCurrentWorkspaceId() : undefined;
        
        // Utiliser le type forcé si fourni, sinon classifier
        const effectiveDilemma = options?.dilemmaOverride ?? dilemma;
        const questionType = forcedType ?? await detectQuestionType(effectiveDilemma);
        
        console.log("🚀 [DEBUG] Starting full analysis", { 
          dilemma: effectiveDilemma.substring(0, 50) + "...",
          questionType,
          filesCount: uploadedFiles.length,
          workspaceId: workspaceId || 'none'
        });
        
        // Générer un emoji contextuel
        const contextualEmoji = generateContextualEmoji(effectiveDilemma);
        
        // FORCE un reset complet pour éviter la réutilisation d'anciens états
        setResult(null);
        
        setEmoji(contextualEmoji);
        // keep currentDecisionId for threading context
        setHasChanges(false);
        setSelectedCategory(undefined);
        resetRetry();
        
        // Effacer la référence aux anciens critères
        initialCriteriaRef.current = [];

        // Afficher immédiatement un état de chargement pour une UX fluide
        setAnalysisStep('loading-options');

        let uploadedFileInfos: UploadedFileInfo[] = [];

        try {
          // Upload des fichiers si présents
          if (uploadedFiles.length > 0) {
            setProgressMessage("Upload des documents en cours...");
            console.log("📤 [DEBUG] Uploading files for analysis...");
            uploadedFileInfos = await uploadFilesToStorage(uploadedFiles);
            console.log("✅ [DEBUG] Files uploaded for analysis");
          }
          
          // Pour les questions factuelles, pas besoin de critères complexes
          if (questionType === 'factual') {
            const progressMsg = "Recherche de la réponse factuelle...";
              
            console.log(`🎯 [DEBUG] ${questionType} question detected - generating direct answer`);
            setProgressMessage(workspaceId ? `${progressMsg} avec documents workspace` : progressMsg);
            setAnalysisStep('loading-options');
            
            const optionsResult = await generateOptimizedDecision(effectiveDilemma, [], uploadedFileInfos, workspaceId, questionType);
            optionsResult.resultType = questionType;
            
            console.log(`✅ [DEBUG] ${questionType} answer generated successfully`);
            setResult(optionsResult);
            
            // Threading: link to parent if provided
            const parentDecision = options?.threadFromId ? history.find(d => d.id === options.threadFromId) : undefined;
            const newId = crypto.randomUUID();
            const threadId = parentDecision ? (parentDecision.threadId || parentDecision.id) : newId;

            const newDecision: IDecision = {
              id: newId,
              timestamp: Date.now(),
              dilemma: effectiveDilemma,
              emoji: contextualEmoji,
              criteria: [],
              result: optionsResult,
              category: 'other',
              threadId,
              parentId: parentDecision?.id
            };
            addDecision(newDecision);
            setCurrentDecisionId(newDecision.id);
            
            setAnalysisStep('done');
            
            const successMessage = optionsResult.workspaceData?.documentsUsed 
              ? `Réponse générée avec ${optionsResult.workspaceData.documentsUsed} document(s) de votre workspace !`
              : "Réponse factuelle trouvée !";
            
            
            toast.success(successMessage);
            return;
          }
          
          // Phase 1: Générer les critères pour les questions comparatives et simple-choice
          console.log("📡 [DEBUG] Phase 1: Generating criteria for question");
          setProgressMessage(workspaceId ? "Analyse du contexte avec documents workspace..." : "Analyse du contexte et génération des critères...");
          
          const response = await generateCriteriaWithPerplexity(effectiveDilemma, uploadedFileInfos, workspaceId);
          console.log("✅ [DEBUG] Criteria and category generated:", {
            emoji: response.emoji,
            criteriaCount: response.criteria?.length || 0,
            criteria: response.criteria,
            suggestedCategory: response.suggestedCategory,
            filesAnalyzed: uploadedFileInfos.length,
            workspaceDocsUsed: 0
          });
          
          const newCriteria = response.criteria.map((criterionName: string) => ({
            id: crypto.randomUUID(),
            name: criterionName,
          }));
          
          setCriteria(newCriteria);
          // Utiliser l'emoji contextuel plutôt que celui de l'API
          setEmoji(contextualEmoji);
          setSelectedCategory(response.suggestedCategory);
          setAnalysisStep('criteria-loaded');
          
          // Phase 2: Générer automatiquement les options - SANS setTimeout pour éviter les race conditions
          console.log("📡 [DEBUG] Phase 2: Auto-generating options for comparative question");
          setAnalysisStep('loading-options');
          setProgressMessage(workspaceId ? "Génération des options avec documents workspace..." : "Génération des options comparatives...");
          
          try {
            const optionsResult = await generateOptimizedDecision(effectiveDilemma, newCriteria, uploadedFileInfos, workspaceId, questionType);
            optionsResult.resultType = questionType;
            
            console.log("✅ [DEBUG] Auto-options generated successfully");
            setResult(optionsResult);
            
            // Définir les critères de référence
            initialCriteriaRef.current = newCriteria;
            
            // Threading: link to parent if provided
            const parentDecision = options?.threadFromId ? history.find(d => d.id === options.threadFromId) : undefined;
            const newId = crypto.randomUUID();
            const threadId = parentDecision ? (parentDecision.threadId || parentDecision.id) : newId;

            const newDecision: IDecision = {
              id: newId,
              timestamp: Date.now(),
              dilemma: effectiveDilemma,
              emoji: contextualEmoji,
              criteria: newCriteria,
              result: optionsResult,
              category: response.suggestedCategory,
              threadId,
              parentId: parentDecision?.id
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
          
        } catch (error) {
          console.error("❌ [DEBUG] Error in analysis start:", error);
          const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
          toast.error(`Erreur lors de l'analyse : ${errorMessage}`);
          setAnalysisStep('loading-options');
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
