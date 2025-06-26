
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, Target, Clock, Database } from 'lucide-react';
import { IBreakdownItem, IResult } from '@/types/decision';
import { useIntelligentConfidence } from '@/hooks/useIntelligentConfidence';
import { DataFreshnessIndicator } from './DataFreshnessIndicator';

interface ConfidenceIndicatorProps {
  breakdown: IBreakdownItem[];
  topOption: IBreakdownItem;
  result?: IResult;
}

export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({
  breakdown,
  topOption,
  result
}) => {
  const realTimeData = result?.realTimeData;
  const intelligentConfidence = useIntelligentConfidence(
    breakdown,
    realTimeData?.hasRealTimeData || false,
    realTimeData?.timestamp,
    realTimeData?.sourcesCount || 0
  );
  
  const getIcon = () => {
    switch (intelligentConfidence.icon) {
      case 'TrendingUp':
        return TrendingUp;
      case 'Target':
        return Target;
      case 'Clock':
        return Clock;
      case 'Database':
        return Database;
      default:
        return AlertTriangle;
    }
  };

  const ConfidenceIcon = getIcon();

  return (
    <div 
      className="flex flex-col gap-3 mb-4"
      role="region"
      aria-labelledby="confidence-heading"
    >
      {/* Score Progress Bar */}
      <div className="flex items-center gap-2">
        <span 
          id="confidence-heading"
          className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 flex-shrink-0"
        >
          Score :
        </span>
        <div className="flex items-center gap-2 flex-1 min-w-0 max-w-[240px]">
          <div 
            className="flex-1 h-2 sm:h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden transition-all duration-300"
            role="progressbar"
            aria-valuenow={topOption?.score || 0}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Score de l'option: ${topOption?.score || 0} sur 100`}
          >
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000 ease-out transform origin-left" 
              style={{ 
                width: `${topOption?.score || 0}%`,
                animation: 'scale-x 1s ease-out'
              }}
            />
          </div>
          <span 
            className="font-mono text-gray-500 dark:text-gray-400 text-xs sm:text-sm flex-shrink-0"
            aria-live="polite"
          >
            {topOption?.score || 0}/100
          </span>
        </div>
      </div>

      {/* Confidence Level and Data Freshness */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <Badge 
          className={`${intelligentConfidence.color} border-0 text-xs sm:text-sm transition-all duration-200 hover:scale-105 flex-shrink-0`}
          role="status"
          aria-label={`Niveau de confiance: ${intelligentConfidence.level}`}
          title={intelligentConfidence.recommendationText}
        >
          <ConfidenceIcon className="h-3 w-3 mr-1 flex-shrink-0" aria-hidden="true" />
          <span className="hidden sm:inline">Confiance: </span>
          {intelligentConfidence.level}
        </Badge>

        <DataFreshnessIndicator
          hasRealTimeData={realTimeData?.hasRealTimeData || false}
          timestamp={realTimeData?.timestamp}
          sourcesCount={realTimeData?.sourcesCount}
          dataFreshness={intelligentConfidence.dataFreshness}
        />
      </div>

      {/* Recommendation Text */}
      <p className="text-xs text-muted-foreground italic">
        {intelligentConfidence.recommendationText}
      </p>

      {/* Confidence Factors (expandable details) */}
      <details className="text-xs text-muted-foreground">
        <summary className="cursor-pointer hover:text-foreground transition-colors">
          Détails de l'analyse
        </summary>
        <div className="mt-2 grid grid-cols-2 gap-2 p-2 bg-muted/50 rounded-md">
          <div>Temporel: {intelligentConfidence.factors.temporal}%</div>
          <div>Sources: {intelligentConfidence.factors.sources}%</div>
          <div>Consensus: {intelligentConfidence.factors.consensus}%</div>
          <div>Certitude: {intelligentConfidence.factors.uncertainty}%</div>
        </div>
      </details>
    </div>
  );
};
