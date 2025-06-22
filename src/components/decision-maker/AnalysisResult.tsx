
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, BarChart3, Lightbulb, Target, AlertTriangle, TrendingUp } from 'lucide-react';
import { IResult } from '@/types/decision';
import { VisualIndicators } from './VisualIndicators';
import { EnhancedRadarChart } from './EnhancedRadarChart';
import { MetricsVisual } from './MetricsVisual';
import { ExportMenu } from '../ExportMenu';
import { DecisionImage } from './DecisionImage';

interface AnalysisResultProps {
  result: IResult | null;
  isUpdating: boolean;
  clearSession: () => void;
  analysisStep: string;
  currentDecision?: any;
  dilemma?: string;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({
  result,
  isUpdating,
  clearSession,
  analysisStep,
  currentDecision,
  dilemma
}) => {
  if (!result) return null;

  const topOption = result.breakdown.reduce((prev, current) => current.score > prev.score ? current : prev);
  
  // Logic from DecisionExplanation
  const scoreRange = result.breakdown.length > 0 
    ? Math.max(...result.breakdown.map(item => item.score)) - Math.min(...result.breakdown.map(item => item.score))
    : 0;

  const getConfidenceLevel = () => {
    if (!topOption || result.breakdown.length < 2) return { level: "Moyenne", color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle };
    
    const secondBest = result.breakdown
      .filter(item => item.option !== topOption.option)
      .reduce((prev, current) => prev.score > current.score ? prev : current);

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
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Header with actions and main image */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl sm:text-2xl mb-2 break-words">
                Résultat de l'analyse
              </CardTitle>
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 text-xs sm:text-sm inline-flex items-center gap-1 max-w-full">
                <span className="flex-shrink-0" aria-hidden="true">✅</span>
                <span className="truncate">
                  Recommandation: {topOption.option.replace(/^Option\s+\d+:\s*/i, '').trim()}
                </span>
              </Badge>
            </div>
            <div className="flex gap-2 flex-wrap justify-end">
              {currentDecision && <ExportMenu decisions={[]} singleDecision={currentDecision} />}
              <Button variant="outline" onClick={clearSession} className="text-xs sm:text-sm" aria-label="Commencer une nouvelle analyse">
                <RotateCcw className="h-4 w-4 mr-2" aria-hidden="true" />
                <span className="hidden sm:inline">Nouvelle analyse</span>
                <span className="sm:hidden">Nouveau</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-start">
            <DecisionImage imageQuery={result.imageQuery} alt={`Illustration pour ${result.recommendation}`} size="large" className="max-w-xs" option={topOption.option} dilemma={dilemma} index={0} />
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-6">
            <div className="text-green-700 bg-green-50 p-2 rounded">
              <div className="font-medium mb-1 text-xs pb-0.5">Points forts ({topOption.pros.length})</div>
              {topOption.pros.map((pro, i) => <div key={i} className="text-xs text-black py-[0.5px]">• {pro}</div>)}
            </div>
            <div className="text-red-700 bg-red-50 p-2 rounded">
              <div className="font-medium mb-1 text-xs pb-0.5">Points faibles ({topOption.cons.length})</div>
              {topOption.cons.map((con, i) => <div key={i} className="text-xs text-black py-px">• {con}</div>)}
            </div>
          </div>

          {/* Integrated DecisionExplanation content */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Pourquoi cette recommandation ?</h3>
            </div>
            
            <div className="space-y-4">
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
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <BarChart3 className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
            <span className="text-2xl">Analyse IA</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="order-1">
                <MetricsVisual data={result.breakdown} dilemma={dilemma} />
              </div>
              <div className="order-2">
                <VisualIndicators data={result.breakdown} />
              </div>
            </div>
            
            <div className="w-full overflow-hidden">
              <EnhancedRadarChart data={result.breakdown} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisResult;
