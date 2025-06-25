
import { useMemo } from 'react';
import { IBreakdownItem } from '@/types/decision';

export interface ConfidenceLevel {
  level: string;
  color: string;
  icon: 'AlertTriangle' | 'TrendingUp' | 'Target';
}

export const useConfidenceCalculation = (breakdown: IBreakdownItem[]) => {
  const { topOption, confidenceLevel, scoreDifference } = useMemo(() => {
    if (!breakdown || breakdown.length === 0) {
      return {
        topOption: null,
        confidenceLevel: {
          level: "Moyenne",
          color: "bg-yellow-100 text-yellow-800",
          icon: "AlertTriangle" as const
        },
        scoreDifference: 0
      };
    }

    const sortedOptions = [...breakdown].sort((a, b) => b.score - a.score);
    const topOption = sortedOptions[0];
    
    if (breakdown.length < 2) {
      return {
        topOption,
        confidenceLevel: {
          level: "Moyenne",
          color: "bg-yellow-100 text-yellow-800",
          icon: "AlertTriangle" as const
        },
        scoreDifference: 0
      };
    }
    
    const secondBest = sortedOptions[1];
    const scoreDifference = topOption.score - secondBest.score;
    
    let confidenceLevel: ConfidenceLevel;
    if (scoreDifference >= 20) {
      confidenceLevel = {
        level: "Très Élevée",
        color: "bg-green-100 text-green-800",
        icon: "TrendingUp"
      };
    } else if (scoreDifference >= 10) {
      confidenceLevel = {
        level: "Élevée",
        color: "bg-blue-100 text-blue-800",
        icon: "Target"
      };
    } else {
      confidenceLevel = {
        level: "Modérée",
        color: "bg-yellow-100 text-yellow-800",
        icon: "AlertTriangle"
      };
    }

    return {
      topOption,
      confidenceLevel,
      scoreDifference
    };
  }, [breakdown]);

  return {
    topOption,
    confidenceLevel,
    scoreDifference
  };
};
