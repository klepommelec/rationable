
import * as React from 'react';
import { useDecisionMaker } from '@/hooks/useDecisionMaker';
import DilemmaSetup from './decision-maker/DilemmaSetup';
import AnalysisResult from './decision-maker/AnalysisResult';
import { EmojiPicker } from './EmojiPicker';
import { CriteriaManager } from './CriteriaManager';
import { CriteriaSkeleton } from './CriteriaSkeleton';
import { CriteriaProgressiveGenerator } from './CriteriaProgressiveGenerator';
import { ThinkingSkeleton } from './ThinkingSkeleton';

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
    useProgressiveMode,
    generatedCriteria,
    handleProgressiveCriteriaValidation,
  } = useDecisionMaker();

  return (
    <div className="w-full max-w-3xl mx-auto">
      {(analysisStep === 'analyzing' || analysisStep === 'generating-criteria' || analysisStep === 'validating-criteria' || analysisStep === 'final-analysis' || analysisStep === 'done') && (
        <>
          <div className="flex items-center gap-4 mb-6 animate-fade-in">
              <EmojiPicker emoji={emoji} setEmoji={setEmoji} />
              <h1 className="text-3xl font-bold text-left">{dilemma}</h1>
          </div>
          
          <div className="w-full mb-6">
            {/* Mode progressif */}
            {useProgressiveMode && analysisStep === 'generating-criteria' && (
              <CriteriaSkeleton />
            )}
            
            {useProgressiveMode && analysisStep === 'validating-criteria' && (
              <CriteriaProgressiveGenerator
                criteria={generatedCriteria}
                onValidationComplete={handleProgressiveCriteriaValidation}
                validationTimeLimit={20}
              />
            )}
            
            {useProgressiveMode && analysisStep === 'final-analysis' && (
              <ThinkingSkeleton />
            )}
            
            {/* Mode classique */}
            {!useProgressiveMode && analysisStep === 'analyzing' && (
              <CriteriaSkeleton />
            )}
            
            {/* Affichage des critères validés */}
            {analysisStep === 'done' && criteria.length > 0 && (
              <CriteriaManager 
                criteria={criteria} 
                setCriteria={setCriteria} 
                isInteractionDisabled={isLoading || isUpdating} 
              />
            )}
          </div>
        </>
      )}

      {analysisStep === 'idle' && (
        <DilemmaSetup
          dilemma={dilemma}
          setDilemma={setDilemma}
          analysisStep={analysisStep}
          isLoading={isLoading}
          isUpdating={isUpdating}
          applyTemplate={applyTemplate}
          clearSession={clearSession}
          history={history}
          loadDecision={loadDecision}
          deleteDecision={deleteDecision}
          clearHistory={clearHistory}
          handleStartAnalysis={handleStartAnalysis}
          progress={progress}
          progressMessage={progressMessage}
          templates={templates}
        />
      )}
      
      {(analysisStep === 'analyzing' || analysisStep === 'final-analysis' || analysisStep === 'done') && (
        <AnalysisResult
          result={result}
          isUpdating={isUpdating}
          clearSession={clearSession}
          analysisStep={analysisStep}
        />
      )}
    </div>
  );
};

export default DecisionMaker;
