
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from 'lucide-react';
import { IResult } from '@/types/decision';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { ExportMenu } from '../ExportMenu';
import { Button } from "@/components/ui/button";
import { RotateCcw } from 'lucide-react';

interface RecommendationCardProps {
  result: IResult;
  dilemma?: string;
  currentDecision?: any;
  clearSession: () => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  result,
  dilemma,
  currentDecision,
  clearSession
}) => {
  const topOption = result.breakdown.reduce((prev, current) => current.score > prev.score ? current : prev);
  const cleanOptionName = topOption.option.replace(/^Option\s+\d+:\s*/i, '').trim();

  const getKeyInsights = () => {
    const insights = [];
    const scoreRange = result.breakdown.length > 0 ? Math.max(...result.breakdown.map(item => item.score)) - Math.min(...result.breakdown.map(item => item.score)) : 0;
    
    if (scoreRange < 15) {
      insights.push("Les options sont très proches en termes de qualité - votre choix dépendra surtout de vos préférences personnelles.");
    }
    if (topOption && topOption.score >= 85) {
      insights.push("L'option recommandée se démarque clairement avec un score excellent.");
    }
    if (result.breakdown.length >= 3) {
      const medianScore = result.breakdown.map(item => item.score).sort((a, b) => a - b)[Math.floor(result.breakdown.length / 2)];
      if (topOption && topOption.score - medianScore >= 15) {
        insights.push("Il y a une nette différence entre les meilleures et moins bonnes options.");
      }
    }
    return insights;
  };

  return (
    <Card className="relative overflow-hidden border bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-blue-950 dark:via-slate-900 dark:to-purple-950 rounded-xl">
      <CardHeader className="relative">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white animate-pulse rounded-full">
              <img src="/lovable-uploads/b5fcad52-5808-4dc8-b6ff-0cd99578dade.png" alt="Rationable" className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg text-gray-950 font-medium">Résultat de l'analyse IA</h2>
              </div>
              <p className="text-sm text-muted-foreground">Votre option rationnelle identifiée par l'analyse</p>
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap items-center">
            {currentDecision && <ExportMenu decisions={[]} singleDecision={currentDecision} />}
            <Button variant="outline" onClick={clearSession} size="sm" className="text-xs sm:text-sm" aria-label="Commencer une nouvelle analyse">
              <RotateCcw className="h-4 w-4 mr-2" aria-hidden="true" />
              <span className="hidden sm:inline">Nouvelle analyse</span>
              <span className="sm:hidden">Nouveau</span>
            </Button>
          </div>
        </div>
        
        <div className="relative border border-gray-200 dark:border-gray-700 rounded-lg bg-gradient-to-br from-purple-50 via-blue-50 to-blue-100 dark:from-blue-950 dark:to-slate-800 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-xl text-gray-900 dark:text-white mb-2 font-bold sm:text-3xl">
                {cleanOptionName}
              </h3>
              
              <ConfidenceIndicator 
                breakdown={result.breakdown} 
                topOption={topOption}
              />
              
              {result.description && (
                <p className="text-muted-foreground">{result.description}</p>
              )}
            </div>
          </div>
          
          {result.breakdown.length >= 2 && (() => {
            const secondBest = result.breakdown.filter(item => item.option !== topOption.option).reduce((prev, current) => prev.score > current.score ? prev : current);
            const scoreDifference = topOption.score - secondBest.score;
            return scoreDifference > 5 && (
              <Collapsible defaultOpen={false} className="mt-3">
                <CollapsibleTrigger className="flex items-center justify-between w-full group p-2 bg-white rounded-md border border-gray-200 hover:bg-gray-100 transition-colors data-[state=open]:rounded-b-none">
                  <p className="text-sm text-gray-950 font-normal">
                    <strong className="font-mono">+{scoreDifference} points</strong> d'avantage sur la deuxième meilleure option
                  </p>
                  <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                
                <CollapsibleContent className="border border-t-0 border-gray-200 rounded-b-md bg-white p-4 space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Points clés de l'analyse :</h4>
                    <ul className="space-y-1">
                      {getKeyInsights().map((insight, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {topOption && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-900">
                        <strong>{cleanOptionName}</strong> obtient 
                        le score le plus élevé ({topOption.score}/100) grâce à ses avantages clés : {topOption.pros.slice(0, 2).join(', ')}.
                      </p>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            );
          })()}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 gap-2 mb-6">
          <div className="text-green-700 bg-green-50 p-2 rounded">
            <div className="font-medium mb-1 text-xs pb-0.5">Points forts ({topOption.pros.length})</div>
            {topOption.pros.map((pro, i) => <div key={i} className="text-xs text-black py-[0.5px]">• {pro}</div>)}
          </div>
          <div className="text-red-700 bg-red-50 p-2 rounded">
            <div className="font-medium mb-1 text-xs pb-0.5">Points faibles ({topOption.cons.length})</div>
            {topOption.cons.map((con, i) => <div key={i} className="text-xs text-black py-px">• {con}</div>)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
