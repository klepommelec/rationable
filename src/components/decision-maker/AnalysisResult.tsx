import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, BarChart3 } from 'lucide-react';
import { IResult } from '@/types/decision';
import { DecisionExplanation } from './DecisionExplanation';
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
  return <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
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
          
          <div className="grid grid-cols-2 gap-2">
            <div className="text-green-700 bg-green-50 p-2 rounded">
              <div className="font-medium mb-1 text-xs pb-0.5">Points forts ({topOption.pros.length})</div>
              {topOption.pros.map((pro, i) => <div key={i} className="text-xs text-black ">• {pro}</div>)}
            </div>
            <div className="text-red-700 bg-red-50 p-2 rounded">
              <div className="font-medium mb-1 text-xs pb-0.5">Points faibles ({topOption.cons.length})</div>
              {topOption.cons.map((con, i) => <div key={i} className="text-xs text-black ">• {con}</div>)}
            </div>
          </div>
        </CardContent>
      </Card>

      <DecisionExplanation result={result} />

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