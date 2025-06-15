
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ProgressiveHeader } from './ProgressiveHeader';
import { CriteriaGenerator } from './CriteriaGenerator';
import { OptionsAnalyzer } from './OptionsAnalyzer';
import { IProgressiveState } from '@/types/progressive';
import { ICriterion, IResult } from '@/types/decision';

interface ProgressiveInterfaceProps {
  dilemma: string;
  emoji: string;
  setEmoji: (emoji: string) => void;
  progressiveState: IProgressiveState;
  criteria: ICriterion[];
  result: IResult | null;
}

export const ProgressiveInterface: React.FC<ProgressiveInterfaceProps> = ({
  dilemma,
  emoji,
  setEmoji,
  progressiveState,
  criteria,
  result
}) => {
  const shouldShowCriteria = progressiveState.phase !== 'idle' && progressiveState.phase !== 'generating-emoji';
  const shouldShowOptions = progressiveState.phase === 'analyzing-options' || progressiveState.phase === 'finalizing' || progressiveState.phase === 'done';

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <ProgressiveHeader 
        dilemma={dilemma}
        emoji={emoji}
        setEmoji={setEmoji}
        progressiveState={progressiveState}
      />

      <Card className="backdrop-blur-sm bg-card/70">
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

      {shouldShowCriteria && (
        <CriteriaGenerator 
          progressiveState={progressiveState}
          finalCriteria={criteria}
        />
      )}

      {shouldShowOptions && (
        <OptionsAnalyzer 
          progressiveState={progressiveState}
          result={result}
        />
      )}
    </div>
  );
};
