
import React, { memo, useMemo } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from 'lucide-react';
import { IResult } from '@/types/decision';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { AnalysisInsights } from './AnalysisInsights';
import { UsefulLinks } from './UsefulLinks';
import { ExportMenu } from '../ExportMenu';
import { Button } from "@/components/ui/button";
import { RotateCcw } from 'lucide-react';
import { useConfidenceCalculation } from '@/hooks/useConfidenceCalculation';

interface RecommendationCardProps {
  result: IResult;
  dilemma?: string;
  currentDecision?: any;
  clearSession: () => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = memo(({
  result,
  dilemma,
  currentDecision,
  clearSession
}) => {
  const { topOption, scoreDifference } = useConfidenceCalculation(result.breakdown);
  
  const cleanOptionName = useMemo(() => {
    return topOption?.option.replace(/^Option\s+\d+:\s*/i, '').trim() || '';
  }, [topOption]);

  const shouldShowCollapsible = useMemo(() => {
    return result.breakdown.length >= 2 && scoreDifference > 5;
  }, [result.breakdown.length, scoreDifference]);

  if (!topOption) return null;

  return (
    <Card 
      className="relative overflow-hidden border bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-blue-950 dark:via-slate-900 dark:to-purple-950 rounded-xl shadow-lg dark:shadow-2xl transition-all duration-300 hover:shadow-xl dark:hover:shadow-3xl"
      role="article"
      aria-labelledby="recommendation-title"
    >
      <CardHeader className="relative">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full transition-transform duration-200 hover:scale-110">
              <img 
                src="/lovable-uploads/b5fcad52-5808-4dc8-b6ff-0cd99578dade.png" 
                alt="Rationable AI Assistant" 
                className="h-5 w-5 sm:h-6 sm:w-6" 
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 
                  id="recommendation-title"
                  className="text-base sm:text-lg text-gray-950 dark:text-white font-medium truncate"
                >
                  Résultat de l'analyse IA
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Votre option rationnelle identifiée par l'analyse
              </p>
            </div>
          </div>
          
          <div className="flex gap-1 sm:gap-2 flex-wrap items-center flex-shrink-0">
            {currentDecision && (
              <div className="order-2 sm:order-1">
                <ExportMenu decisions={[]} singleDecision={currentDecision} />
              </div>
            )}
            <Button 
              variant="outline" 
              onClick={clearSession} 
              size="sm" 
              className="text-xs sm:text-sm order-1 sm:order-2 transition-all duration-200 hover:scale-105" 
              aria-label="Commencer une nouvelle analyse"
            >
              <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" aria-hidden="true" />
              <span className="hidden sm:inline">Nouvelle analyse</span>
              <span className="sm:hidden">Nouveau</span>
            </Button>
          </div>
        </div>
        
        <div className="relative border border-gray-200 dark:border-gray-700 rounded-lg bg-gradient-to-br from-purple-50 via-blue-50 to-blue-100 dark:from-blue-950 dark:to-slate-800 p-3 sm:p-4 transition-all duration-300">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex-1">
              <h3 
                className="text-lg sm:text-xl lg:text-2xl xl:text-3xl text-gray-900 dark:text-white mb-3 font-bold break-words leading-tight"
                id="option-name"
              >
                {cleanOptionName}
              </h3>
              
              <ConfidenceIndicator 
                breakdown={result.breakdown} 
                topOption={topOption}
              />
              
              {result.description && (
                <p className="text-sm sm:text-base text-muted-foreground mt-2 leading-relaxed">
                  {result.description}
                </p>
              )}
            </div>
          </div>
          
          {shouldShowCollapsible && (
            <Collapsible defaultOpen={false} className="mt-4">
              <CollapsibleTrigger 
                className="flex items-center justify-between w-full group p-2 sm:p-3 bg-white/80 dark:bg-slate-800/80 rounded-md border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-200 data-[state=open]:rounded-b-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-expanded="false"
                aria-controls="analysis-insights"
              >
                <p className="text-xs sm:text-sm text-gray-950 dark:text-white font-normal text-left">
                  <strong className="font-mono text-green-600 dark:text-green-400">
                    +{scoreDifference} points
                  </strong> d'avantage sur la deuxième meilleure option
                </p>
                <ChevronDown 
                  className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" 
                  aria-hidden="true"
                />
              </CollapsibleTrigger>
              
              <CollapsibleContent 
                className="border border-t-0 border-gray-200 dark:border-gray-600 rounded-b-md bg-white/90 dark:bg-slate-800/90 p-3 sm:p-4 animate-accordion-down data-[state=closed]:animate-accordion-up"
                id="analysis-insights"
              >
                <AnalysisInsights 
                  breakdown={result.breakdown}
                  topOption={topOption}
                  cleanOptionName={cleanOptionName}
                />
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="px-3 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
          <div 
            className="text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 p-3 sm:p-4 rounded-lg transition-all duration-200 hover:bg-green-100 dark:hover:bg-green-900/30"
            role="region"
            aria-labelledby="pros-heading"
          >
            <h4 
              id="pros-heading"
              className="font-medium mb-2 text-xs sm:text-sm pb-1 text-green-800 dark:text-green-200"
            >
              Points forts ({topOption.pros.length})
            </h4>
            <ul className="space-y-1" role="list">
              {topOption.pros.map((pro, i) => (
                <li 
                  key={i} 
                  className="text-xs sm:text-sm text-green-900 dark:text-green-100 leading-relaxed"
                >
                  • {pro}
                </li>
              ))}
            </ul>
          </div>
          
          <div 
            className="text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 p-3 sm:p-4 rounded-lg transition-all duration-200 hover:bg-red-100 dark:hover:bg-red-900/30"
            role="region"
            aria-labelledby="cons-heading"
          >
            <h4 
              id="cons-heading"
              className="font-medium mb-2 text-xs sm:text-sm pb-1 text-red-800 dark:text-red-200"
            >
              Points faibles ({topOption.cons.length})
            </h4>
            <ul className="space-y-1" role="list">
              {topOption.cons.map((con, i) => (
                <li 
                  key={i} 
                  className="text-xs sm:text-sm text-red-900 dark:text-red-100 leading-relaxed"
                >
                  • {con}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Liens utiles intégrés en bas de la carte */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 sm:pt-6">
          <UsefulLinks 
            infoLinks={result.infoLinks}
            shoppingLinks={result.shoppingLinks}
            dilemma={dilemma}
            recommendation={result.recommendation}
          />
        </div>
      </CardContent>
    </Card>
  );
});

RecommendationCard.displayName = 'RecommendationCard';
