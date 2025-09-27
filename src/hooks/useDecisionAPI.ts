
import { toast } from "sonner";
import { useCallback } from 'react';
import { ICriterion, IResult, IDecision } from '@/types/decision';
import { generateCriteriaWithFallback, generateOptionsWithFallback } from '@/services/enhancedDecisionService';
import { uploadFilesToStorage, deleteFileFromStorage, UploadedFileInfo } from '@/services/fileUploadService';
import { UploadedFile } from '@/components/FileUpload';
import { AnalysisStep } from './useDecisionState';
import { useWorkspaceContext } from './useWorkspaceContext';
import { generateContextualEmoji } from '@/services/contextualEmojiService';
import { detectQuestionType } from '@/services/questionClassificationService';
import { useAuth } from '@/hooks/useAuth';
import { detectLanguage } from '@/utils/languageDetection';
import { I18nService } from '@/services/i18nService';

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
    realTimeSearchEnabled: boolean;
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
    realTimeSearchEnabled,
    currentDecisionId,
    setCurrentDecisionId,
    history,
    updateDecision,
    addDecision,
    uploadedFiles = []
}: UseDecisionAPIProps) => {
    const { getCurrentWorkspaceId, shouldUseWorkspaceDocuments } = useWorkspaceContext();
    const { user, profile } = useAuth();
    
    // Get user display name helper
    const getUserDisplayName = () => {
        if (profile?.full_name) return profile.full_name;
        if (profile?.email) return profile.email;
        return 'Utilisateur';
    };

    const handleGenerateOptions = async (isRetry = false, forcedType?: 'comparative') => {
        const currentCriteria = criteria;
        const workspaceId = shouldUseWorkspaceDocuments() ? getCurrentWorkspaceId() : undefined;
        // Utiliser systématiquement la langue de l'interface utilisateur
        const userInterfaceLanguage = I18nService.getCurrentLanguage();
        const contentLanguage = userInterfaceLanguage;
        
        console.log("🔄 [DEBUG] Starting options generation", {
            isRetry,
            retryCount,
            criteriaCount: currentCriteria.length,
            filesCount: uploadedFiles.length,
            workspaceId: workspaceId || 'none',
            contentLanguage,
            dilemma: dilemma.substring(0, 50) + "..."
        });
        
        // Vérifier les critères pour les questions nécessitant une analyse comparative
        if (currentCriteria.length >= 2) {
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
          
          setProgressMessage(workspaceId ? "Analyse en cours avec documents workspace..." : "Analyse en cours...");
          console.log("📡 [DEBUG] Calling generateOptions API...");
          const startTime = Date.now();
          
          const apiResult = await generateOptionsWithFallback(dilemma, currentCriteria, uploadedFileInfos, workspaceId, contentLanguage, realTimeSearchEnabled);
          
          const endTime = Date.now();
          console.log("✅ [DEBUG] API call successful", {
            duration: `${endTime - startTime}ms`,
            filesAnalyzed: uploadedFileInfos.length,
            workspaceDocsUsed: apiResult.workspaceData?.documentsUsed || 0,
            resultStructure: {
              hasRecommendation: !!apiResult.recommendation,
              hasDescription: !!apiResult.description,
              breakdownCount: apiResult.breakdown?.length || 0,
              infoLinksCount: apiResult.infoLinks?.length || 0,
              shoppingLinksCount: apiResult.shoppingLinks?.length || 0
            }
          });
          
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
                  result: apiResult,
                  updatedAt: Date.now(),
                  updatedById: user?.id,
                  updatedByName: getUserDisplayName()
                };
                updateDecision(updated);
            }
          }
          
          let successMessage;
          if (apiResult.workspaceData?.documentsUsed) {
            successMessage = `Analyse générée avec ${apiResult.workspaceData.documentsUsed} document(s) de votre workspace !`;
          } else {
            successMessage = isRetry ? "Analyse générée avec succès !" : "Analyse mise à jour !";
          }
          
          toast.success(successMessage);
          
        } catch (error) {
          console.error("❌ [DEBUG] Error in generateOptions:", {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            retryCount,
            filesCount: uploadedFiles.length,
            workspaceId
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
            setTimeout(() => handleGenerateOptions(true, forcedType), 1500);
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

    // NOUVELLE VERSION OPTIMISÉE - Analyse parallélisée
    const handleStartAnalysis = useCallback(async (forcedType?: 'comparative', options?: { threadFromId?: string; dilemmaOverride?: string }) => {
        const workspaceId = shouldUseWorkspaceDocuments() ? getCurrentWorkspaceId() : undefined;
        const effectiveDilemma = options?.dilemmaOverride ?? dilemma;
        // Utiliser systématiquement la langue de l'interface utilisateur
        const userInterfaceLanguage = I18nService.getCurrentLanguage();
        const contentLanguage = userInterfaceLanguage;
        
        console.log("🚀 [OPTIMIZED] Starting PARALLEL analysis", { 
          dilemma: effectiveDilemma.substring(0, 50) + "...",
          filesCount: uploadedFiles.length,
          workspaceId: workspaceId || 'none',
          contentLanguage
        });
        
        resetRetry();
        setResult(null);
        setHasChanges(false);
        setSelectedCategory(undefined);
        initialCriteriaRef.current = [];

        try {
            // PHASE 1: Démarrage en parallèle de 3 tâches non-bloquantes
            console.log("⚡ Starting 3 parallel tasks...");
            
            // Tâche 1: Upload fichiers (background, non-bloquant)
            let uploadPromise: Promise<UploadedFileInfo[]> = Promise.resolve([]);
            if (uploadedFiles.length > 0) {
                console.log("📤 Starting background file upload...");
                uploadPromise = uploadFilesToStorage(uploadedFiles).catch(error => {
                    console.error("❌ File upload failed:", error);
                    return [];
                });
            }
            
            // Tâche 2: Génération emoji (background, non-bloquant)  
            const contextualEmoji = generateContextualEmoji(effectiveDilemma);
            
            // Tâche 3: Génération critères (bloquante pour la suite mais démarre immédiatement)
            console.log("📡 Starting criteria generation...");
            setAnalysisStep('loading-options');
            setProgressMessage('Génération des critères...');
            
            const criteriaPromise = generateCriteriaWithFallback(effectiveDilemma, [], workspaceId, contentLanguage, realTimeSearchEnabled);
            
            // Attendre seulement les critères (rapide)
            const criteriaResponse = await criteriaPromise;
            console.log("✅ Criteria generated quickly");
            
            // Mise à jour immédiate de l'interface avec les critères
            const criteriaArray = criteriaResponse?.criteria || [];
            const newCriteria = criteriaArray.map((criterionName: string) => ({
                id: crypto.randomUUID(),
                name: criterionName,
            }));
            
            setCriteria(newCriteria);
            setSelectedCategory(criteriaResponse.suggestedCategory);
            setAnalysisStep('done'); // Montrer immédiatement les critères
            setProgressMessage('Critères générés ! Génération des options...');
            
            // Appliquer l'emoji immédiatement
            setEmoji(contextualEmoji);
            
            // PHASE 2: Génération des options avec les fichiers uploadés en parallèle
            setAnalysisStep('loading-options');
            
            // Attendre les fichiers uploadés maintenant
            const uploadedFileInfos = await uploadPromise;
            console.log(`✅ Files ready (${uploadedFileInfos.length} files)`);
            
            console.log("✅ Emoji ready:", contextualEmoji);
            
            // Générer les options avec tous les éléments prêts
            console.log("📡 Generating options with all assets ready...");
            const optionsResult = await generateOptionsWithFallback(effectiveDilemma, newCriteria, uploadedFileInfos, workspaceId, contentLanguage, realTimeSearchEnabled);
            console.log("✅ Options generated successfully");
            
            setResult(optionsResult);
            setAnalysisStep('done');
            setProgressMessage('Analyse terminée !');
            
            // Créer la nouvelle décision
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
                category: criteriaResponse.suggestedCategory,
                threadId,
                parentId: parentDecision?.id,
                createdById: user?.id,
                createdByName: getUserDisplayName(),
                language: contentLanguage
            };
            addDecision(newDecision);
            setCurrentDecisionId(newDecision.id);
            initialCriteriaRef.current = newCriteria;
            
            const successMessage = optionsResult.workspaceData?.documentsUsed 
                ? `Analyse générée avec ${optionsResult.workspaceData.documentsUsed} document(s) de votre workspace !`
                : "Analyse optimisée générée avec succès !";
            
            toast.success(successMessage);
            
        } catch (error) {
            console.error("❌ Optimized analysis failed:", error);
            setAnalysisStep('idle');
            
            // En mode manuel, ne pas retry automatiquement
            if (!realTimeSearchEnabled) {
                console.log('📝 Manual mode - no retry needed');
                setProgressMessage('Mode manuel activé');
                return;
            }
            
            if (retryCount < 2) {
                console.log('🔄 Retrying optimized analysis...');
                incrementRetry();
                setProgressMessage('Nouvelle tentative...');
                setTimeout(() => handleStartAnalysis(forcedType, options), 1500);
            } else {
                const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
                toast.error(`Erreur après ${retryCount + 1} tentatives: ${errorMessage}`);
                setProgressMessage('');
                resetRetry();
            }
        }
    }, [
        dilemma, uploadedFiles, resetRetry, setResult, setHasChanges, setSelectedCategory,
        initialCriteriaRef, setCriteria, setEmoji, setAnalysisStep, setProgressMessage,
        getCurrentWorkspaceId, shouldUseWorkspaceDocuments, history, addDecision,
        setCurrentDecisionId, retryCount, incrementRetry
    ]);

    return {
        handleGenerateOptions,
        handleStartAnalysis
    };
};
