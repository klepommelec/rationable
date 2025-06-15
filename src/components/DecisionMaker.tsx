
import * as React from 'react';
import { useDecisionMaker } from '@/hooks/useDecisionMaker';
import DilemmaSetup from './decision-maker/DilemmaSetup';
import AnalysisResult from './decision-maker/AnalysisResult';
import { EmojiPicker } from './EmojiPicker';
import { CriteriaManager } from './CriteriaManager';
import { CriteriaSkeleton } from './CriteriaSkeleton';
import { CriteriaGenerator } from './decision-maker/CriteriaGenerator';
import { OptionsAnalyzer } from './decision-maker/OptionsAnalyzer';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

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
    setUseProgressiveMode,
    progressiveState,
    isProgressiveAnalyzing,
    classicState,
    isClassicAnalyzing
  } = useDecisionMaker();

  // Affichage de la configuration initiale
  if (analysisStep === 'idle') {
    return (
      <div className="w-full max-w-3xl mx-auto">
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
          useProgressiveMode={useProgressiveMode}
          setUseProgressiveMode={setUseProgressiveMode}
        />
      </div>
    );
  }

  // Messages pour les différentes phases du mode classique
  const getClassicMessage = () => {
    switch (classicState.phase) {
      case 'generating-emoji':
        return 'Génération de l\'emoji...';
      case 'generating-criteria':
        return 'Génération des critères...';
      case 'thinking':
        return 'L\'IA réfléchit aux meilleures options...';
      case 'analyzing-options':
        return 'Analyse et évaluation des options...';
      default:
        return 'Analyse en cours...';
    }
  };

  // Affichage unifié pour l'analyse (mode classique et progressif)
  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Header avec emoji et titre - toujours visible */}
      <div className="flex items-center gap-4 mb-6 animate-fade-in">
        <div className="relative">
          <EmojiPicker emoji={emoji} setEmoji={setEmoji} />
          {((useProgressiveMode && progressiveState.phase === 'generating-emoji') ||
            (!useProgressiveMode && classicState.phase === 'generating-emoji')) && (
            <div className="absolute -bottom-1 -right-1 flex space-x-0.5">
              <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
            </div>
          )}
        </div>
        <h1 className="text-3xl font-bold text-left">{dilemma}</h1>
      </div>

      {/* Barre de progression - en mode progressif */}
      {useProgressiveMode && isProgressiveAnalyzing && (
        <Card className="backdrop-blur-sm bg-card/70 mb-6">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Analyse en cours</h2>
                <span className="text-sm text-muted-foreground">{progressiveState.progress}%</span>
              </div>
              
              <Progress value={progressiveState.progress} className="h-3" />
              
              <div className="flex items-center gap-2 text-sm font-medium text-cyan-400">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                {progressiveState.message}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section des critères */}
      <div className="w-full mb-6">
        {/* Mode progressif */}
        {useProgressiveMode && isProgressiveAnalyzing ? (
          progressiveState.phase !== 'idle' && progressiveState.phase !== 'generating-emoji' && (
            <CriteriaGenerator 
              progressiveState={progressiveState}
              finalCriteria={criteria}
            />
          )
        ) : 
        /* Mode classique progressif */
        !useProgressiveMode && isClassicAnalyzing ? (
          classicState.phase === 'generating-criteria' ? (
            <CriteriaGenerator 
              progressiveState={{
                phase: 'generating-criteria',
                progress: 0,
                message: 'Génération des critères...',
                criteriaGenerated: classicState.criteriaGenerated,
                optionsAnalyzed: 0,
                totalOptions: 0
              }}
              finalCriteria={criteria}
            />
          ) : classicState.phase === 'thinking' || classicState.phase === 'analyzing-options' ? (
            <div className="space-y-6">
              <CriteriaGenerator 
                progressiveState={{
                  phase: 'done',
                  progress: 100,
                  message: '',
                  criteriaGenerated: criteria.map(c => c.name),
                  optionsAnalyzed: 0,
                  totalOptions: 0
                }}
                finalCriteria={criteria}
              />
              <CriteriaSkeleton message={getClassicMessage()} />
            </div>
          ) : null
        ) : 
        /* Mode analyse classique (fallback) */
        analysisStep === 'analyzing' ? (
          <CriteriaSkeleton />
        ) : 
        /* Mode terminé : gestion des critères */
        criteria.length > 0 ? (
          <CriteriaManager 
            criteria={criteria} 
            setCriteria={setCriteria} 
            isInteractionDisabled={isLoading || isUpdating} 
          />
        ) : null}
      </div>

      {/* Section des options analysées - mode progressif */}
      {useProgressiveMode && isProgressiveAnalyzing && 
        (progressiveState.phase === 'analyzing-options' || progressiveState.phase === 'done') && (
        <div className="mb-6">
          <OptionsAnalyzer 
            progressiveState={progressiveState}
            result={result}
          />
        </div>
      )}
      
      {/* Résultat final */}
      <AnalysisResult
        result={result}
        isUpdating={isUpdating}
        clearSession={clearSession}
        analysisStep={analysisStep}
      />
    </div>
  );
};

export default DecisionMaker;
