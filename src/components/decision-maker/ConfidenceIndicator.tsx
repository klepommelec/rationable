
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, Target } from 'lucide-react';
import { IBreakdownItem } from '@/types/decision';
import { useConfidenceCalculation } from '@/hooks/useConfidenceCalculation';

interface ConfidenceIndicatorProps {
  breakdown: IBreakdownItem[];
  topOption: IBreakdownItem;
}

export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({
  breakdown,
  topOption
}) => {
  const { confidenceLevel } = useConfidenceCalculation(breakdown);
  
  const getIcon = () => {
    switch (confidenceLevel.icon) {
      case 'TrendingUp':
        return TrendingUp;
      case 'Target':
        return Target;
      default:
        return AlertTriangle;
    }
  };

  const ConfidenceIcon = getIcon();

  return (
    <div 
      className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4"
      role="region"
      aria-labelledby="confidence-heading"
    >
      <div className="flex items-center gap-2 flex-1">
        <span 
          id="confidence-heading"
          className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 flex-shrink-0"
        >
          Score :
        </span>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div 
            className="flex-1 h-2 sm:h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden transition-all duration-300"
            role="progressbar"
            aria-valuenow={topOption?.score || 0}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Score de confiance: ${topOption?.score || 0} sur 100`}
          >
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000 ease-out transform origin-left" 
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
      
      <Badge 
        className={`${confidenceLevel.color} border-0 text-xs sm:text-sm transition-all duration-200 hover:scale-105 flex-shrink-0`}
        role="status"
        aria-label={`Niveau de confiance: ${confidenceLevel.level}`}
      >
        <ConfidenceIcon className="h-3 w-3 mr-1 flex-shrink-0" aria-hidden="true" />
        <span className="hidden sm:inline">Confiance: </span>
        {confidenceLevel.level}
      </Badge>
    </div>
  );
};
