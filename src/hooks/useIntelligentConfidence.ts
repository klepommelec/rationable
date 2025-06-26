
import { useMemo } from 'react';
import { IBreakdownItem } from '@/types/decision';

export interface IntelligentConfidenceData {
  level: string;
  color: string;
  icon: 'AlertTriangle' | 'TrendingUp' | 'Target' | 'Clock' | 'Database';
  factors: {
    temporal: number;
    sources: number;
    consensus: number;
    uncertainty: number;
  };
  overallScore: number;
  dataFreshness: 'very-fresh' | 'fresh' | 'moderate' | 'stale';
  recommendationText: string;
}

export const useIntelligentConfidence = (
  breakdown: IBreakdownItem[],
  hasRealTimeData: boolean = false,
  dataTimestamp?: string,
  sourcesCount: number = 0
): IntelligentConfidenceData => {
  
  return useMemo(() => {
    if (!breakdown || breakdown.length === 0) {
      return {
        level: "Incertaine",
        color: "bg-red-100 text-red-800",
        icon: "AlertTriangle",
        factors: { temporal: 0, sources: 0, consensus: 0, uncertainty: 0 },
        overallScore: 0,
        dataFreshness: 'stale',
        recommendationText: "Données insuffisantes pour une analyse fiable"
      };
    }

    const sortedOptions = [...breakdown].sort((a, b) => b.score - a.score);
    const topOption = sortedOptions[0];
    const scoreDifference = breakdown.length > 1 ? topOption.score - sortedOptions[1].score : 0;

    // Facteur temporel (0-100)
    const temporalFactor = (() => {
      if (!hasRealTimeData) return 40; // Données potentiellement obsolètes
      
      if (!dataTimestamp) return 60;
      
      const hoursAgo = (Date.now() - new Date(dataTimestamp).getTime()) / (1000 * 60 * 60);
      if (hoursAgo < 1) return 100;
      if (hoursAgo < 24) return 85;
      if (hoursAgo < 168) return 70; // 1 semaine
      if (hoursAgo < 720) return 50; // 1 mois
      return 30;
    })();

    // Facteur sources (0-100)
    const sourcesFactor = Math.min(100, sourcesCount * 20 + (hasRealTimeData ? 20 : 0));

    // Facteur consensus (basé sur l'écart de scores)
    const consensusFactor = (() => {
      if (breakdown.length < 2) return 50;
      if (scoreDifference >= 25) return 95;
      if (scoreDifference >= 15) return 80;
      if (scoreDifference >= 8) return 65;
      if (scoreDifference >= 3) return 45;
      return 25;
    })();

    // Facteur d'incertitude (inverse de la dispersion des scores)
    const uncertaintyFactor = (() => {
      if (breakdown.length < 2) return 50;
      const scores = breakdown.map(item => item.score);
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      const variance = scores.reduce((acc, score) => acc + Math.pow(score - avg, 2), 0) / scores.length;
      const standardDeviation = Math.sqrt(variance);
      return Math.max(0, 100 - standardDeviation * 3);
    })();

    // Score global pondéré
    const overallScore = Math.round(
      temporalFactor * 0.3 +
      sourcesFactor * 0.2 +
      consensusFactor * 0.3 +
      uncertaintyFactor * 0.2
    );

    // Fraîcheur des données
    const dataFreshness = (() => {
      if (temporalFactor >= 85) return 'very-fresh';
      if (temporalFactor >= 70) return 'fresh';
      if (temporalFactor >= 50) return 'moderate';
      return 'stale';
    })() as const;

    // Niveau de confiance et couleur
    const { level, color, icon } = (() => {
      if (overallScore >= 85) return {
        level: "Très Élevée",
        color: "bg-green-100 text-green-800",
        icon: "TrendingUp" as const
      };
      if (overallScore >= 70) return {
        level: "Élevée",
        color: "bg-blue-100 text-blue-800",
        icon: "Target" as const
      };
      if (overallScore >= 50) return {
        level: "Modérée",
        color: "bg-yellow-100 text-yellow-800",
        icon: "AlertTriangle" as const
      };
      if (overallScore >= 30) return {
        level: "Faible",
        color: "bg-orange-100 text-orange-800",
        icon: "Clock" as const
      };
      return {
        level: "Très Faible",
        color: "bg-red-100 text-red-800",
        icon: "AlertTriangle" as const
      };
    })();

    // Texte de recommandation
    const recommendationText = (() => {
      if (!hasRealTimeData && temporalFactor < 60) {
        return "Données potentiellement obsolètes - Recommandation basée sur l'IA uniquement";
      }
      if (overallScore >= 85) {
        return "Analyse très fiable avec données récentes et consensus fort";
      }
      if (overallScore >= 70) {
        return "Analyse fiable avec bonnes sources d'information";
      }
      if (overallScore >= 50) {
        return "Analyse modérément fiable - Vérification recommandée";
      }
      return "Analyse peu fiable - Sources additionnelles recommandées";
    })();

    return {
      level,
      color,
      icon,
      factors: {
        temporal: Math.round(temporalFactor),
        sources: Math.round(sourcesFactor),
        consensus: Math.round(consensusFactor),
        uncertainty: Math.round(uncertaintyFactor)
      },
      overallScore,
      dataFreshness,
      recommendationText
    };
  }, [breakdown, hasRealTimeData, dataTimestamp, sourcesCount]);
};
