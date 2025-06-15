
import * as React from 'react';
import { ResultSkeleton } from './ResultSkeleton';
import { useDecisionMaker } from '@/hooks/useDecisionMaker';
import DilemmaSetup from './decision-maker/DilemmaSetup';
import AnalysisResult from './decision-maker/AnalysisResult';

const DecisionMaker = () => {
  const {
    dilemma,
    setDilemma,
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
  } = useDecisionMaker();

  return (
    <div className="w-full max-w-3xl mx-auto">
      {analysisStep === 'done' && result && (
        <h1 className="text-3xl font-bold mb-6 text-center animate-fade-in">{dilemma}</h1>
      )}

      {analysisStep !== 'done' && (
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
      
      {analysisStep === 'analyzing' && <ResultSkeleton />}
      
      {result && analysisStep === 'done' && (
        <AnalysisResult
          result={result}
          criteria={criteria}
          setCriteria={setCriteria}
          isLoading={isLoading}
          isUpdating={isUpdating}
          clearSession={clearSession}
        />
      )}
    </div>
  );
};

export default DecisionMaker;
