
import React, { memo } from 'react';
import { IBreakdownItem } from '@/types/decision';
import { useAnalysisInsights } from '@/hooks/useAnalysisInsights';
import { useConfidenceCalculation } from '@/hooks/useConfidenceCalculation';

interface AnalysisInsightsProps {
  breakdown: IBreakdownItem[];
  topOption: IBreakdownItem;
  cleanOptionName: string;
}

export const AnalysisInsights: React.FC<AnalysisInsightsProps> = memo(({
  breakdown,
  topOption,
  cleanOptionName
}) => {
  const insights = useAnalysisInsights(breakdown);
  const { scoreDifference } = useConfidenceCalculation(breakdown);

  if (insights.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h4 className="font-medium text-sm">Points clés de l'analyse :</h4>
        <ul className="space-y-1">
          {insights.map((insight, index) => (
            <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              {insight}
            </li>
          ))}
        </ul>
      </div>

      {topOption && scoreDifference > 5 && (
        <div className="p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-900">
            <strong>{cleanOptionName}</strong> obtient 
            le score le plus élevé ({topOption.score}/100) grâce à ses avantages clés : {topOption.pros.slice(0, 2).join(', ')}.
          </p>
        </div>
      )}
    </div>
  );
});

AnalysisInsights.displayName = 'AnalysisInsights';
