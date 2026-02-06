import { useState, useEffect, useCallback } from 'react';
import { getLastAnalysesUsage, type UsageStats } from '@/services/analysisUsageService';

const DEFAULT_LIMIT = 10;

export function useAnalysisUsageStats(limit: number = DEFAULT_LIMIT) {
  const [stats, setStats] = useState<UsageStats>({
    lastAnalyses: [],
    averageCostUsd: 0,
    totalCostUsd: 0,
    count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLastAnalysesUsage(limit);
      setStats(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur chargement usage');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { stats, loading, error, refresh };
}
