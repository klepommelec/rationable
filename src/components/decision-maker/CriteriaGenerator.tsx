
import React, { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { IProgressiveState } from '@/types/progressive';
import { ICriterion } from '@/types/decision';

interface CriteriaGeneratorProps {
  progressiveState: IProgressiveState;
  finalCriteria: ICriterion[];
}

export const CriteriaGenerator: React.FC<CriteriaGeneratorProps> = ({
  progressiveState,
  finalCriteria
}) => {
  const [visibleCriteria, setVisibleCriteria] = useState<string[]>([]);

  useEffect(() => {
    if (progressiveState.phase === 'generating-criteria') {
      setVisibleCriteria(progressiveState.criteriaGenerated);
    } else if (progressiveState.phase === 'analyzing-options' || progressiveState.phase === 'done') {
      setVisibleCriteria(finalCriteria.map(c => c.name));
    }
  }, [progressiveState, finalCriteria]);

  const isGenerating = progressiveState.phase === 'generating-criteria';
  const shouldShowSkeletons = isGenerating && visibleCriteria.length < 4;

  return (
    <div className="p-4 rounded-lg bg-accent border animate-fade-in">
      <h3 className="font-semibold text-lg mb-4">
        {isGenerating ? 'Critères de décision' : 'Critères de décision'}
      </h3>
      
      <div className="space-y-3">
        {visibleCriteria.map((criterion, index) => (
          <div 
            key={index}
            className="flex items-center gap-3 p-3 bg-background rounded-lg animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {index + 1}
            </div>
            <span className="font-medium">{criterion}</span>
            <div className="ml-auto">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </div>
        ))}
        
        {shouldShowSkeletons && [...Array(4 - visibleCriteria.length)].map((_, index) => (
          <div key={`skeleton-${index}`} className="flex items-center gap-3 p-3 bg-background rounded-lg">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="h-5 flex-grow" />
            <div className="ml-auto">
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
