
import { useMemo } from 'react';
import { IBreakdownItem } from '@/types/decision';

export const useAnalysisInsights = (breakdown: IBreakdownItem[]) => {
  const insights = useMemo(() => {
    if (!breakdown || breakdown.length === 0) return [];
    
    const insights: string[] = [];
    const scores = breakdown.map(item => item.score);
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);
    const scoreRange = maxScore - minScore;
    
    if (scoreRange < 15) {
      insights.push("Les options sont très proches en termes de qualité - votre choix dépendra surtout de vos préférences personnelles.");
    }
    
    if (maxScore >= 85) {
      insights.push("L'option recommandée se démarque clairement avec un score excellent.");
    }
    
    if (breakdown.length >= 3) {
      const sortedScores = [...scores].sort((a, b) => a - b);
      const medianScore = sortedScores[Math.floor(sortedScores.length / 2)];
      if (maxScore - medianScore >= 15) {
        insights.push("Il y a une nette différence entre les meilleures et moins bonnes options.");
      }
    }
    
    return insights;
  }, [breakdown]);

  return insights;
};
