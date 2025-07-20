
import { useMemo } from 'react';
import { IBreakdownItem, IResult } from '@/types/decision';

export interface IntelligentConfidenceData {
  level: string;
  color: string;
  icon: 'AlertTriangle' | 'TrendingUp' | 'Target' | 'Clock' | 'Database';
  overallScore: number;
  recommendationText: string;
}

export const useIntelligentConfidence = (
  breakdown: IBreakdownItem[],
  hasRealTimeData: boolean = false,
  dataTimestamp?: string,
  sourcesCount: number = 0,
  resultType?: 'factual' | 'comparative'
): IntelligentConfidenceData => {
  
  return useMemo(() => {
    if (!breakdown || breakdown.length === 0) {
      return {
        level: "Incertaine",
        color: "bg-red-100 text-red-800",
        icon: "AlertTriangle",
        overallScore: 0,
        recommendationText: "Données insuffisantes pour une analyse fiable"
      };
    }

    // Pour les questions factuelles : confiance automatiquement élevée
    if (resultType === 'factual') {
      const topOption = breakdown[0];
      const isHighScore = topOption.score >= 95;
      
      return {
        level: "Très Élevée",
        color: "bg-green-100 text-green-800",
        icon: "Target",
        overallScore: isHighScore ? 95 : 85,
        recommendationText: "Réponse factuelle vérifiée - Information fiable"
      };
    }

    // Pour les questions comparatives : logique existante
    const sortedOptions = [...breakdown].sort((a, b) => b.score - a.score);
    const topOption = sortedOptions[0];
    const scoreDifference = breakdown.length > 1 ? topOption.score - sortedOptions[1].score : 0;

    let confidenceScore = 50;

    if (scoreDifference >= 25) confidenceScore = 95;
    else if (scoreDifference >= 15) confidenceScore = 85;
    else if (scoreDifference >= 10) confidenceScore = 75;
    else if (scoreDifference >= 5) confidenceScore = 65;
    else confidenceScore = 45;

    if (hasRealTimeData && sourcesCount > 0) {
      confidenceScore += 5;
    }

    confidenceScore = Math.min(100, confidenceScore);

    const { level, color, icon } = (() => {
      if (confidenceScore >= 85) return {
        level: "Très Élevée",
        color: "bg-green-100 text-green-800",
        icon: "TrendingUp" as const
      };
      if (confidenceScore >= 70) return {
        level: "Élevée",
        color: "bg-blue-100 text-blue-800",
        icon: "Target" as const
      };
      if (confidenceScore >= 55) return {
        level: "Modérée",
        color: "bg-yellow-100 text-yellow-800",
        icon: "AlertTriangle" as const
      };
      return {
        level: "Faible",
        color: "bg-orange-100 text-orange-800",
        icon: "AlertTriangle" as const
      };
    })();

    const recommendationText = (() => {
      if (confidenceScore >= 85) {
        return "Analyse très fiable - Recommandation forte";
      }
      if (confidenceScore >= 70) {
        return "Analyse fiable - Bonne recommandation";
      }
      if (confidenceScore >= 55) {
        return "Analyse modérément fiable - Vérification recommandée";
      }
      return "Analyse peu fiable - Options très proches";
    })();

    return {
      level,
      color,
      icon,
      overallScore: confidenceScore,
      recommendationText
    };
  }, [breakdown, hasRealTimeData, dataTimestamp, sourcesCount, resultType]);
};
