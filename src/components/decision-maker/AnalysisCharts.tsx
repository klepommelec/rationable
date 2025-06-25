
import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from 'lucide-react';
import { IBreakdownItem } from '@/types/decision';
import { VisualIndicators } from './VisualIndicators';
import { EnhancedRadarChart } from './EnhancedRadarChart';
import { MetricsVisual } from './MetricsVisual';

interface AnalysisChartsProps {
  breakdown: IBreakdownItem[];
  dilemma?: string;
}

export const AnalysisCharts: React.FC<AnalysisChartsProps> = memo(({
  breakdown,
  dilemma
}) => {
  return (
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
              <MetricsVisual data={breakdown} dilemma={dilemma} />
            </div>
            <div className="order-2">
              <VisualIndicators data={breakdown} />
            </div>
          </div>
          
          <div className="w-full overflow-hidden">
            <EnhancedRadarChart data={breakdown} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

AnalysisCharts.displayName = 'AnalysisCharts';
