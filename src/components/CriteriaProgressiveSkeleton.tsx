
import React, { useState, useEffect } from 'react';
import { Skeleton } from "@/components/ui/skeleton";

interface CriteriaProgressiveSkeletonProps {
  onComplete?: () => void;
}

export const CriteriaProgressiveSkeleton = ({ onComplete }: CriteriaProgressiveSkeletonProps) => {
  const [loadedCriteria, setLoadedCriteria] = useState(0);
  const totalCriteria = 4;

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadedCriteria(prev => {
        if (prev >= totalCriteria) {
          clearInterval(interval);
          setTimeout(() => onComplete?.(), 300);
          return prev;
        }
        return prev + 1;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [onComplete, totalCriteria]);

  return (
    <div className="space-y-4 p-4 rounded-lg bg-accent border animate-fade-in">
      <div className="flex items-center gap-2">
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="h-4 w-8" />
      </div>
      
      <div className="space-y-2 pt-2">
        {[...Array(totalCriteria)].map((_, i) => (
          <div key={i} className={`flex items-center gap-2 transition-all duration-500 ${
            i < loadedCriteria ? 'opacity-100 scale-100' : 'opacity-60 scale-95'
          }`}>
            <div className="h-10 w-10 rounded-md bg-gradient-to-r from-cyan-500/20 to-blue-500/20 animate-pulse" />
            <div className="h-10 flex-grow rounded-md bg-gradient-to-r from-cyan-500/20 to-blue-500/20 animate-pulse" />
            <Skeleton className="h-10 w-10" />
          </div>
        ))}
      </div>
      
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-40" />
        <div className="text-sm text-muted-foreground animate-pulse">
          Génération des critères... ({loadedCriteria}/{totalCriteria})
        </div>
      </div>
    </div>
  );
};
