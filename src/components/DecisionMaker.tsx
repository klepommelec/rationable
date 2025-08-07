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
    progress,
    progressMessage,
    criteria,
    setCriteria,
    result,
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

  // Fonction pour gérer les questions de suivi
  const handleFollowUpQuestion = (enrichedDilemma: string) => {
    // Créer une nouvelle analyse
    const newAnalysis = {
      id: crypto.randomUUID(),
      dilemma: enrichedDilemma,
      emoji: '🤔',
      result: null,
      analysisStep: 'idle' as const,
      criteria: [],
      category: undefined
    };

    addAnalysis(newAnalysis);
    
    // Mettre à jour l'état principal pour la nouvelle analyse
    setDilemma(enrichedDilemma);
    
    // Relancer l'analyse avec le dilemme enrichi
    setTimeout(() => {
      handleStartAnalysis();
    }, 100);
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

  // Synchroniser les états quand on navigue entre analyses
  React.useEffect(() => {
    if (currentAnalysis) {
      setDilemma(currentAnalysis.dilemma);
      setEmoji(currentAnalysis.emoji);
      // Note: On ne synchronise pas result et analysisStep pour éviter les conflits
    }
  }, [currentAnalysisIndex]);

  const shouldShowCriteria = questionType === 'comparative' || questionType === 'simple-choice';
  return <div className="w-full mx-auto px-4 sm:px-6 lg:px-[80px]">
      {/* Skip to main content link for screen readers */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50" aria-label="Aller au contenu principal">
        Aller au contenu principal
      </a>

      <main id="main-content" role="main" aria-label="Assistant de décision">
        {/* Navigation entre analyses */}
        <AnalysisNavigation 
          analyses={analyses}
          currentAnalysisIndex={currentAnalysisIndex}
          onNavigate={navigateToAnalysis}
        />

        {(analysisStep === 'criteria-loaded' || analysisStep === 'loading-options' || analysisStep === 'done') && <>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 animate-fade-in">
              <div className="flex items-baseline gap-4 w-full ">
                <EmojiPicker emoji={emoji} setEmoji={setEmoji} />
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-left break-words flex-1 min-w-0">
                  {dilemma}
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
            <DilemmaSetup dilemma={dilemma} setDilemma={setDilemma} analysisStep={analysisStep} isLoading={isLoading} isUpdating={isUpdating} applyTemplate={applyTemplate} clearSession={clearSession} history={history} loadDecision={loadDecision} deleteDecision={deleteDecision} clearHistory={clearHistory} handleStartAnalysis={handleStartAnalysis} progress={progress} progressMessage={progressMessage} templates={templates} selectedCategory={selectedCategory} onCategoryChange={handleCategoryChange} onUpdateCategory={handleUpdateCategory} uploadedFiles={uploadedFiles} setUploadedFiles={setUploadedFiles} />
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
              clearSession={clearSession} 
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