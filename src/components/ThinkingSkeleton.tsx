
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Brain } from 'lucide-react';

export const ThinkingSkeleton = () => {
  return (
    <div className="space-y-6 p-6 rounded-lg bg-accent border animate-fade-in">
      <div className="flex items-center gap-3">
        <Brain className="h-6 w-6 text-purple-500 animate-pulse" />
        <h3 className="font-semibold text-lg">🤔 L'IA analyse vos critères et génère les options...</h3>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((index) => (
            <div key={index} className="space-y-3 p-4 rounded-md bg-background">
              <Skeleton className="h-5 w-2/3" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
              </div>
              <Skeleton className="h-8 w-16 rounded-full" />
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Skeleton className="h-5 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <span>Analyse en cours...</span>
      </div>
    </div>
  );
};
