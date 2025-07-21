
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Target, AlertTriangle, TrendingUp } from 'lucide-react';
import { IResult } from '@/types/decision';

interface DecisionExplanationProps {
  result: IResult;
}

export const DecisionExplanation: React.FC<DecisionExplanationProps> = ({ result }) => {
  const topOption = result.breakdown.length > 0 
    ? result.breakdown.reduce((prev, current) => prev.score > current.score ? prev : current)
    : null;

  const scoreRange = result.breakdown.length > 0 
    ? Math.max(...result.breakdown.map(item => item.score)) - Math.min(...result.breakdown.map(item => item.score))
    : 0;

  const getConfidenceLevel = () => {
    if (!topOption || result.breakdown.length < 2) return { level: "Moyenne", color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle };
    
    const otherOptions = result.breakdown.filter(item => item.option !== topOption.option);
    if (otherOptions.length === 0) return { level: "Moyenne", color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle };
    
    const secondBest = otherOptions.reduce((prev, current) => prev.score > current.score ? prev : current);

    const scoreDifference = topOption.score - secondBest.score;
    
    if (scoreDifference >= 20) return { level: "Très Élevée", color: "bg-green-100 text-green-800", icon: TrendingUp };
    if (scoreDifference >= 10) return { level: "Élevée", color: "bg-blue-100 text-blue-800", icon: Target };
    return { level: "Modérée", color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle };
  };

  const confidence = getConfidenceLevel();
  const ConfidenceIcon = confidence.icon;

  const getKeyInsights = () => {
    const insights = [];
    
    if (scoreRange < 15) {
      insights.push("Les options sont très proches en termes de qualité - votre choix dépendra surtout de vos préférences personnelles.");
    }
    
    if (topOption && topOption.score >= 85) {
      insights.push("L'option recommandée se démarque clairement avec un score excellent.");
    }
    
    if (result.breakdown.length >= 3) {
      const medianScore = result.breakdown.map(item => item.score).sort((a, b) => a - b)[Math.floor(result.breakdown.length / 2)];
      if (topOption && topOption.score - medianScore >= 15) {
        insights.push("Il y a une nette différence entre les meilleures et moins bonnes options.");
      }
    }

    return insights;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Pourquoi cette recommandation ?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Niveau de confiance :</span>
          <Badge className={confidence.color}>
            <ConfidenceIcon className="h-3 w-3 mr-1" />
            {confidence.level}
          </Badge>
        </div>
        
        {result.description && (
          <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
            <p className="text-sm text-blue-900">{result.description}</p>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="font-medium text-sm">Points clés de l'analyse :</h4>
          <ul className="space-y-1">
            {getKeyInsights().map((insight, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                {insight}
              </li>
            ))}
          </ul>
        </div>

        {topOption && (
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-900">
              <strong>{topOption.option.replace(/^Option\s+\d+:\s*/i, '').trim()}</strong> obtient 
              le score le plus élevé ({topOption.score}/100) grâce à ses avantages clés : {topOption.pros.slice(0, 2).join(', ')}.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
