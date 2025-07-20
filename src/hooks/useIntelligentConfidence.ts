
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

    // Pour les questions factuelles : confiance automatiquement très élevée
    if (resultType === 'factual') {
      const topOption = breakdown[0];
      const hasGoodScore = topOption.score >= 90;
      
      return {
        level: "Très Élevée",
        color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100",
        icon: "Target",
        overallScore: hasGoodScore ? 95 : 90,
        recommendationText: hasRealTimeData 
          ? "Réponse factuelle vérifiée avec données récentes" 
          : "Réponse factuelle basée sur des sources fiables"
      };
    }

    // Pour les questions comparatives : logique basée sur l'écart entre options
    const sortedOptions = [...breakdown].sort((a, b) => b.score - a.score);
    const topOption = sortedOptions[0];
    
    // Si une seule option, c'est probablement une erreur de détection
    if (breakdown.length === 1) {
      return {
        level: "Élevée",
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
        icon: "TrendingUp",
        overallScore: 80,
        recommendationText: "Recommandation unique basée sur l'analyse des critères"
      };
    }
    
    const secondOption = sortedOptions[1];
    const scoreDifference = secondOption ? topOption.score - secondOption.score : 0;

    let confidenceScore = 50;

    // Calculer la confiance basée sur l'écart
    if (scoreDifference >= 25) confidenceScore = 95;
    else if (scoreDifference >= 15) confidenceScore = 85;
    else if (scoreDifference >= 10) confidenceScore = 75;
    else if (scoreDifference >= 5) confidenceScore = 65;
    else confidenceScore = 45;

    // Bonus pour données temps réel
    if (hasRealTimeData && sourcesCount > 0) {
      confidenceScore += 5;
    }

    confidenceScore = Math.min(100, confidenceScore);

    const { level, color, icon } = (() => {
      if (confidenceScore >= 85) return {
        level: "Très Élevée",
        color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100",
        icon: "TrendingUp" as const
      };
      if (confidenceScore >= 70) return {
        level: "Élevée",
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
        icon: "Target" as const
      };
      if (confidenceScore >= 55) return {
        level: "Modérée",
        color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
        icon: "AlertTriangle" as const
      };
      return {
        level: "Faible",
        color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
        icon: "AlertTriangle" as const
      };
    })();

    const recommendationText = (() => {
      if (confidenceScore >= 85) {
        return `Recommandation forte avec écart significatif (${scoreDifference} pts)`;
      }
      if (confidenceScore >= 70) {
        return `Bonne recommandation avec écart notable (${scoreDifference} pts)`;
      }
      if (confidenceScore >= 55) {
        return `Recommandation modérée - Options proches (écart: ${scoreDifference} pts)`;
      }
      return `Options très proches - Choix difficile (écart: ${scoreDifference} pts)`;
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
