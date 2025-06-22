import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, BarChart3, Lightbulb, Target, AlertTriangle, TrendingUp, Trophy, Sparkles } from 'lucide-react';
import { IResult } from '@/types/decision';
import { VisualIndicators } from './VisualIndicators';
import { EnhancedRadarChart } from './EnhancedRadarChart';
import { MetricsVisual } from './MetricsVisual';
import { ExportMenu } from '../ExportMenu';
import { DecisionImage } from './DecisionImage';
import ValidatedLink from '../ValidatedLink';
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
  const scoreRange = result.breakdown.length > 0 ? Math.max(...result.breakdown.map(item => item.score)) - Math.min(...result.breakdown.map(item => item.score)) : 0;
  const getConfidenceLevel = () => {
    if (!topOption || result.breakdown.length < 2) return {
      level: "Moyenne",
      color: "bg-yellow-100 text-yellow-800",
      icon: AlertTriangle
    };
    const secondBest = result.breakdown.filter(item => item.option !== topOption.option).reduce((prev, current) => prev.score > current.score ? prev : current);
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
  const cleanOptionName = topOption.option.replace(/^Option\s+\d+:\s*/i, '').trim();
  return <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Section Recommandation IA améliorée */}
      <Card className="relative overflow-hidden border-2 border-gradient-to-r from-blue-200 to-purple-200 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950 dark:via-slate-900 dark:to-purple-950 dark:border-blue-500/30">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-yellow-300/20 to-transparent rounded-bl-full"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-300/20 to-transparent rounded-tr-full"></div>
        
        <CardHeader className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white animate-pulse">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg text-gray-950 font-medium">Recommandation IA</h2>
                <Trophy className="h-5 w-5 text-yellow-600" />
              </div>
              <p className="text-sm text-muted-foreground">Option optimale identifiée par l'analyse</p>
            </div>
          </div>
          
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg p-4 border border-blue-200/50 dark:border-blue-700/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {cleanOptionName}
                </h3>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">Score :</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-1000 ease-out" style={{
                        width: `${topOption.score}%`
                      }}></div>
                      </div>
                      <span className="text-lg font-mono text-gray-500">
                        {topOption.score}/100
                      </span>
                    </div>
                  </div>
                  
                  <Badge className={`${confidence.color} border-0`}>
                    <ConfidenceIcon className="h-3 w-3 mr-1" />
                    Confiance: {confidence.level}
                  </Badge>
                </div>
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
            
            {result.breakdown.length >= 2 && (() => {
            const secondBest = result.breakdown.filter(item => item.option !== topOption.option).reduce((prev, current) => prev.score > current.score ? prev : current);
            const scoreDifference = topOption.score - secondBest.score;
            return scoreDifference > 5 && <div className="mt-3 p-2 bg-gr rounded-md border bg-gray-100 border-gray-200 ">
                  <p className="text-sm text-gray-950 font-normal">
                    <strong className="font-mono ">+{scoreDifference} points</strong> d'avantage sur la deuxième meilleure option
                  </p>
                </div>;
          })()}
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
              {result.description && <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <p className="text-sm text-blue-900">{result.description}</p>
                </div>}

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Points clés de l'analyse :</h4>
                <ul className="space-y-1">
                  {getKeyInsights().map((insight, index) => <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      {insight}
                    </li>)}
                </ul>
              </div>

              {topOption && <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-900">
                    <strong>{cleanOptionName}</strong> obtient 
                    le score le plus élevé ({topOption.score}/100) grâce à ses avantages clés : {topOption.pros.slice(0, 2).join(', ')}.
                  </p>
                </div>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liens utiles */}
      {(result.infoLinks && result.infoLinks.length > 0 || result.shoppingLinks && result.shoppingLinks.length > 0) && <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              📚 Liens utiles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {result.infoLinks && result.infoLinks.length > 0 && <div>
                  <h4 className="font-medium mb-3">📚 Ressources d'information</h4>
                  <div className="space-y-2">
                    {result.infoLinks.map((link, index) => <ValidatedLink key={index} link={link} fallbackSearchQuery={dilemma} className="block p-2 rounded border hover:bg-muted text-sm" />)}
                  </div>
                </div>}
              
              {result.shoppingLinks && result.shoppingLinks.length > 0 && <div>
                  <h4 className="font-medium mb-3">🛒 Liens d'achat</h4>
                  <div className="space-y-2">
                    {result.shoppingLinks.map((link, index) => <ValidatedLink key={index} link={link} fallbackSearchQuery={`acheter ${result.recommendation}`} className="block p-2 rounded border hover:bg-muted text-sm" />)}
                  </div>
                </div>}
            </div>
          </CardContent>
        </Card>}

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
    </div>;
};
export default AnalysisResult;