
import { useMemo } from 'react';
import { IBreakdownItem } from '@/types/decision';

export const useOptimizedCalculations = (breakdown: IBreakdownItem[]) => {
  const memoizedData = useMemo(() => {
    if (!breakdown || breakdown.length === 0) {
      return {
        sortedOptions: [],
        scoreStats: {
          min: 0,
          max: 0,
          average: 0,
          range: 0
        },
        hasSignificantDifference: false
      };
    }

    const sortedOptions = [...breakdown].sort((a, b) => b.score - a.score);
    const scores = breakdown.map(item => item.score);
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const range = max - min;
    const hasSignificantDifference = range >= 15;

    return {
      sortedOptions,
      scoreStats: {
        min,
        max,
        average: Math.round(average),
        range
      },
      hasSignificantDifference
    };
  }, [breakdown]);

  return memoizedData;
};
