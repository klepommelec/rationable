import { useMemo } from 'react';
import { IBreakdownItem } from '@/types/decision';
import { getContextualMetrics, detectContext, type ContextualMetric } from '@/services/contextualMetricsService';

export const useContextualMetrics = (dilemma: string, data: IBreakdownItem[]) => {
  const contextualData = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        metrics: [],
        context: null,
        isContextual: false
      };
    }
    
    const context = detectContext(dilemma, data);
    const metrics = getContextualMetrics(dilemma, data);
    
    return {
      metrics,
      context,
      isContextual: context !== null
    };
  }, [dilemma, data]);
  
  return contextualData;
};