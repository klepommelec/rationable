
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, Target } from 'lucide-react';
import { IBreakdownItem } from '@/types/decision';

interface ConfidenceIndicatorProps {
  breakdown: IBreakdownItem[];
  topOption: IBreakdownItem;
}

export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({
  breakdown,
  topOption
}) => {
  const getConfidenceLevel = () => {
    if (!topOption || breakdown.length < 2) return {
      level: "Moyenne",
      color: "bg-yellow-100 text-yellow-800",
      icon: AlertTriangle
    };
    
    const secondBest = breakdown.filter(item => item.option !== topOption.option)
      .reduce((prev, current) => prev.score > current.score ? prev : current);
    const scoreDifference = topOption.score - secondBest.score;
    
    if (scoreDifference >= 20) return {
      level: "Très Élevée",
      color: "bg-green-100 text-green-800",
      icon: TrendingUp
    };
    if (scoreDifference >= 10) return {
      level: "Élevée",
      color: "bg-blue-100 text-blue-800",
      icon: Target
    };
    return {
      level: "Modérée",
      color: "bg-yellow-100 text-yellow-800",
      icon: AlertTriangle
    };
  };

  const confidence = getConfidenceLevel();
  const ConfidenceIcon = confidence.icon;

  return (
    <div className="flex items-center gap-4 flex-wrap mb-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-500">Score :</span>
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-1000 ease-out" 
              style={{ width: `${topOption.score}%` }}
            />
          </div>
          <span className="font-mono text-gray-500 text-sm">
            {topOption.score}/100
          </span>
        </div>
      </div>
      
      <Badge className={`${confidence.color} border-0`}>
        <ConfidenceIcon className="h-3 w-3 mr-1" />
        Confiance: {confidence.level}
      </Badge>
    </div>
  );
};
