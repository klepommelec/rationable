
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
    <div className="flex items-center gap-4 flex-wrap mb-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-500">Score :</span>
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-1000 ease-out" 
              style={{ width: `${topOption?.score || 0}%` }}
            />
          </div>
          <span className="font-mono text-gray-500 text-sm">
            {topOption?.score || 0}/100
          </span>
        </div>
      </div>
      
      <Badge className={`${confidenceLevel.color} border-0`}>
        <ConfidenceIcon className="h-3 w-3 mr-1" />
        Confiance: {confidenceLevel.level}
      </Badge>
    </div>
  );
};
