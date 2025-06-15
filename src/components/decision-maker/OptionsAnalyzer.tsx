
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { IProgressiveState } from '@/types/progressive';
import { IResult } from '@/types/decision';

interface OptionsAnalyzerProps {
  progressiveState: IProgressiveState;
  result: IResult | null;
}

export const OptionsAnalyzer: React.FC<OptionsAnalyzerProps> = ({
  progressiveState,
  result
}) => {
  const isAnalyzing = progressiveState.phase === 'analyzing-options';
  const isComplete = progressiveState.phase === 'done' || progressiveState.phase === 'finalizing';

  if (!isAnalyzing && !isComplete) {
    return null;
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <h3 className="font-semibold text-lg">
        {isAnalyzing ? 'Analyse des options...' : 'Options analysées'}
      </h3>
      
      {isAnalyzing && (
        <div className="text-sm text-muted-foreground mb-4">
          Options analysées : {progressiveState.optionsAnalyzed}/{progressiveState.totalOptions}
        </div>
      )}

      {result?.breakdown.map((option, index) => {
        const isOptionVisible = isComplete || progressiveState.optionsAnalyzed > index;
        
        if (!isOptionVisible) {
          return (
            <div key={index} className="p-4 rounded-lg bg-accent border">
              <div className="flex justify-between items-center mb-3">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-6 w-1/4" />
              </div>
              <Skeleton className="h-16 w-full" />
            </div>
          );
        }

        return (
          <div key={index} className="p-4 rounded-lg bg-accent border animate-fade-in">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold text-cyan-400">{option.option}</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">{option.score}/100</span>
                <Progress value={option.score} className="w-24 h-2" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div>
                <h5 className="font-semibold text-green-400 mb-1">Avantages</h5>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  {option.pros.map((pro, i) => <li key={i}>{pro}</li>)}
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-red-400 mb-1">Inconvénients</h5>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  {option.cons.map((con, i) => <li key={i}>{con}</li>)}
                </ul>
              </div>
            </div>
          </div>
        );
      }) || []}
    </div>
  );
};
