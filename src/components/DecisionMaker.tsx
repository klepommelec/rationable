import * as React from 'react';
import { useDecisionMaker } from '@/hooks/useDecisionMaker';
import { EmojiPicker } from './EmojiPicker';
import { CriteriaManager } from './CriteriaManager';
import { OptionsLoadingSkeleton } from './OptionsLoadingSkeleton';
import ManualOptionsGenerator from './ManualOptionsGenerator';

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
  return <div className="w-full mx-auto px-4 sm:px-6 lg:px-[80px]">
      {/* Skip to main content link for screen readers */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50" aria-label="Aller au contenu principal">
        Aller au contenu principal
      </a>

      <main id="main-content" role="main" aria-label="Assistant de décision">
        {(analysisStep === 'criteria-loaded' || analysisStep === 'loading-options' || analysisStep === 'done') && <>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 animate-fade-in">
              <div className="flex items-center gap-4 w-full">
                <EmojiPicker emoji={emoji} setEmoji={setEmoji} />
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-left break-words flex-1 min-w-0">
                  {dilemma}
                </h1>
              </div>
            </div>
            <div className="w-full mb-6">
              <CriteriaManager criteria={criteria} setCriteria={setCriteria} isInteractionDisabled={analysisStep === 'loading-options' || isLoading || isUpdating} onUpdateAnalysis={handleManualUpdate} hasChanges={hasChanges} />
            </div>
          </>}

        {analysisStep === 'idle' && <React.Suspense fallback={<div className="flex items-center justify-center p-8" role="status" aria-label="Chargement en cours">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="sr-only">Chargement...</span>
            </div>}>
            <DilemmaSetup dilemma={dilemma} setDilemma={setDilemma} analysisStep={analysisStep} isLoading={isLoading} isUpdating={isUpdating} applyTemplate={applyTemplate} clearSession={clearSession} history={history} loadDecision={loadDecision} deleteDecision={deleteDecision} clearHistory={clearHistory} handleStartAnalysis={handleStartAnalysis} progress={progress} progressMessage={progressMessage} templates={templates} selectedCategory={selectedCategory} onCategoryChange={handleCategoryChange} onUpdateCategory={handleUpdateCategory} uploadedFiles={uploadedFiles} setUploadedFiles={setUploadedFiles} />
          </React.Suspense>}
        
        {analysisStep === 'criteria-loaded' && <div className="mb-6">
            <ManualOptionsGenerator onGenerateOptions={handleManualUpdate} isLoading={isUpdating} hasChanges={hasChanges} />
          </div>}
        
        {analysisStep === 'loading-options' && <OptionsLoadingSkeleton />}
        
        {analysisStep === 'done' && <React.Suspense fallback={<div className="flex items-center justify-center p-8" role="status" aria-label="Chargement des résultats">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="sr-only">Chargement des résultats...</span>
            </div>}>
            <AnalysisResult result={result} isUpdating={isUpdating} clearSession={clearSession} analysisStep={analysisStep} currentDecision={getCurrentDecision()} dilemma={dilemma} />
          </React.Suspense>}
      </main>
    </div>;
};
export default DecisionMaker;