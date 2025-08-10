import * as React from 'react';
import { useDecisionMaker } from '@/hooks/useDecisionMaker';
import { useMultiAnalysis } from '@/hooks/useMultiAnalysis';
import { detectQuestionType } from '@/services/questionClassificationService';
import { EmojiPicker } from './EmojiPicker';
import { CriteriaManager } from './CriteriaManager';
import { OptionsLoadingSkeleton } from './OptionsLoadingSkeleton';
import { CommentSection } from './comments/CommentSection';
import ManualOptionsGenerator from './ManualOptionsGenerator';
import AnalysisNavigation from './decision-maker/AnalysisNavigation';
import { toast } from "sonner";

// Lazy load components for better performance
const DilemmaSetup = React.lazy(() => import('./decision-maker/DilemmaSetup'));
const AnalysisResult = React.lazy(() => import('./decision-maker/AnalysisResult'));
const DecisionMaker = () => {
  const {
    dilemma,
    setDilemma,
    emoji,
    setEmoji,
    analysisStep,
    setAnalysisStep,
    progress,
    progressMessage,
    criteria,
    setCriteria,
    result,
    setResult,
    history,
    isUpdating,
    isLoading,
    handleStartAnalysis,
    applyTemplate,
    clearSession,
    loadDecision,
    deleteDecision,
    clearHistory,
    templates,
    hasChanges,
    handleManualUpdate,
    selectedCategory,
    setSelectedCategory,
    handleCategoryChange,
    handleUpdateCategory,
    getCurrentDecision,
    uploadedFiles,
    setUploadedFiles
  } = useDecisionMaker();

  const {
    analyses,
    currentAnalysisIndex,
    getCurrentAnalysis,
    addAnalysis,
    updateCurrentAnalysis,
    navigateToAnalysis,
    clearAnalyses
  } = useMultiAnalysis();

  // Réinitialiser complètement l'état (analyses + session)
  const clearAll = React.useCallback(() => {
    clearAnalyses();
    clearSession();
    setAnalysisStep('idle');
  }, [clearAnalyses, clearSession, setAnalysisStep]);

  // Fonction DIRECTE pour gérer les questions de suivi - SANS double analyse
  const handleFollowUpQuestion = async (questionDilemma: string, questionText?: string) => {
    console.log('🔄 Follow-up question triggered:', questionText || questionDilemma);
    
    try {
      // RESET COMPLET IMMÉDIAT - Tout en synchrone
      console.log('🧹 Complete state reset...');
      setResult(null);
      setCriteria([]);
      // Mettre immédiatement l'état en chargement pour une UX fluide
      setAnalysisStep('loading-options');
      setEmoji('🤔');
      setSelectedCategory(undefined);
      
      // Créer et ajouter la nouvelle analyse
      const newAnalysis = {
        id: crypto.randomUUID(),
        dilemma: questionDilemma,
        displayTitle: questionText,
        emoji: '🤔',
        result: null,
        analysisStep: 'loading-options' as const,
        criteria: [],
        category: undefined,
      };
      
      console.log('➕ Adding new follow-up analysis:', newAnalysis);
      addAnalysis(newAnalysis);
      
      // Mettre à jour l'état principal
      setDilemma(questionDilemma);
      
      // Démarrer DIRECTEMENT l'analyse complète ici
      console.log('🚀 Starting integrated follow-up analysis...');
      await handleStartAnalysis();
      
    } catch (error) {
      console.error('❌ Error in follow-up question:', error);
      toast.error('Erreur lors du traitement de la question de suivi');
    }
  };

  // Fonction pour gérer la navigation entre analyses
  const handleAnalysisNavigation = (analysisIndex: number) => {
    navigateToAnalysis(analysisIndex);
    const analysis = analyses[analysisIndex];
    if (analysis) {
      // SYNCHRONISATION BATCH de tous les états pour éviter les incohérences
      // Utiliser React.startTransition pour grouper toutes les mises à jour
      React.startTransition(() => {
        setDilemma(analysis.dilemma);
        setEmoji(analysis.emoji);
        setResult(analysis.result);
        setCriteria(analysis.criteria);
        setSelectedCategory(analysis.category);
        setAnalysisStep(analysis.analysisStep);
        
        // Forcer la reclassification du type de question pour la nouvelle analyse
        detectQuestionType(analysis.dilemma).then(type => {
          setQuestionType(type);
          console.log(`🔄 Navigation - Question reclassified as: ${type}`);
        }).catch(error => {
          console.error('❌ Error reclassifying question during navigation:', error);
          setQuestionType('comparative');
        });
      });
    }
  };
  const currentDecision = getCurrentDecision();
  const currentAnalysis = getCurrentAnalysis();

  // État pour le type de question avec classification asynchrone
  const [questionType, setQuestionType] = React.useState<'factual' | 'comparative' | 'simple-choice'>('comparative');

  // Effet pour classifier la question quand elle change
  React.useEffect(() => {
    const classifyQuestion = async () => {
      if (dilemma && dilemma.trim()) {
        try {
          const type = await detectQuestionType(dilemma);
          setQuestionType(type);
          console.log(`🎯 Question classified as: ${type}`);
        } catch (error) {
          console.error('❌ Error classifying question:', error);
          // Fallback par défaut
          setQuestionType('comparative');
        }
      }
    };

    // Debounce pour éviter trop d'appels pendant que l'utilisateur tape
    const timeoutId = setTimeout(classifyQuestion, 500);
    return () => clearTimeout(timeoutId);
  }, [dilemma]);

  // Ajouter la première analyse dès qu'elle démarre
  React.useEffect(() => {
    if (dilemma && (analysisStep === 'criteria-loaded' || analysisStep === 'loading-options' || analysisStep === 'done') && analyses.length === 0) {
      const initialAnalysis = {
        id: crypto.randomUUID(),
        dilemma,
        emoji,
        result,
        analysisStep,
        criteria,
        category: selectedCategory
      };
      addAnalysis(initialAnalysis);
    }
  }, [dilemma, analysisStep, analyses.length]);

  // Mettre à jour l'analyse actuelle quand les états changent
  React.useEffect(() => {
    if (currentAnalysis) {
      updateCurrentAnalysis({
        dilemma,
        emoji,
        result,
        analysisStep,
        criteria,
        category: selectedCategory
      });
    }
  }, [dilemma, emoji, result, analysisStep, criteria, selectedCategory]);

  // Note: La synchronisation des états lors de la navigation est gérée par handleAnalysisNavigation

  const shouldShowCriteria = questionType === 'comparative' || questionType === 'simple-choice';
  return <div className="w-full mx-auto px-4 sm:px-6 lg:px-[80px]">
      {/* Skip to main content link for screen readers */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50" aria-label="Aller au contenu principal">
        Aller au contenu principal
      </a>

      <main id="main-content" role="main" aria-label="Assistant de décision">
        {/* Navigation entre analyses */}
        {analysisStep !== 'idle' && (
          <AnalysisNavigation 
            analyses={analyses}
            currentAnalysisIndex={currentAnalysisIndex}
            onNavigate={handleAnalysisNavigation}
          />
        )}

        {(analysisStep === 'criteria-loaded' || analysisStep === 'loading-options' || analysisStep === 'done') && <>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 animate-fade-in">
              <div className="flex items-baseline gap-4 w-full ">
                <EmojiPicker emoji={emoji} setEmoji={setEmoji} />
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-left break-words flex-1 min-w-0">
                  {getCurrentAnalysis()?.displayTitle || dilemma}
                </h1>
              </div>
            </div>
            
            
            {/* Afficher les critères uniquement pour les questions comparatives */}
            {shouldShowCriteria && <div className="w-full mb-6 px-0">
                <CriteriaManager criteria={criteria} setCriteria={setCriteria} isInteractionDisabled={analysisStep === 'loading-options' || isLoading || isUpdating} onUpdateAnalysis={handleManualUpdate} hasChanges={hasChanges} currentDecisionId={currentDecision?.id} />
              </div>}
          </>}

        {analysisStep === 'idle' && <React.Suspense fallback={<div className="flex items-center justify-center p-8" role="status" aria-label="Chargement en cours">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="sr-only">Chargement...</span>
            </div>}>
            <DilemmaSetup dilemma={dilemma} setDilemma={setDilemma} analysisStep={analysisStep} isLoading={isLoading} isUpdating={isUpdating} applyTemplate={applyTemplate} clearSession={clearAll} history={history} loadDecision={loadDecision} deleteDecision={deleteDecision} clearHistory={clearHistory} handleStartAnalysis={handleStartAnalysis} progress={progress} progressMessage={progressMessage} templates={templates} selectedCategory={selectedCategory} onCategoryChange={handleCategoryChange} onUpdateCategory={handleUpdateCategory} uploadedFiles={uploadedFiles} setUploadedFiles={setUploadedFiles} />
          </React.Suspense>}
        
        {/* Bouton de génération manuelle uniquement pour les questions comparatives */}
        {analysisStep === 'criteria-loaded' && shouldShowCriteria && <div className="mb-6">
            <ManualOptionsGenerator onGenerateOptions={handleManualUpdate} isLoading={isUpdating} hasChanges={hasChanges} />
          </div>}
        
        {analysisStep === 'loading-options' && <OptionsLoadingSkeleton />}
        
        {analysisStep === 'done' && <React.Suspense fallback={<div className="flex items-center justify-center p-8" role="status" aria-label="Chargement des résultats">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="sr-only">Chargement des résultats...</span>
            </div>}>
            <AnalysisResult 
              result={result} 
              isUpdating={isUpdating} 
              clearSession={clearAll} 
              analysisStep={analysisStep} 
              currentDecision={getCurrentDecision()} 
              dilemma={dilemma} 
              onUpdateDecision={updatedDecision => {
                // Mettre à jour la décision dans l'état global
                console.log('Decision updated:', updatedDecision);
              }}
              onFollowUpQuestion={handleFollowUpQuestion}
            />
          </React.Suspense>}

        {/* Section commentaires généraux - uniquement en bas de page */}
        {currentDecision && analysisStep !== 'idle' && <div className="mt-12 mb-8 border-t pt-8">
            <CommentSection decisionId={currentDecision.id} commentType="general" title="Commentaires sur cette décision" placeholder="Ajoutez vos réflexions, notes ou commentaires sur cette décision..." />
          </div>}
      </main>
    </div>;
};
export default DecisionMaker;