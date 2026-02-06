import { supabase } from '@/integrations/supabase/client';

export interface AnalysisUsageRow {
  id: string;
  user_id: string;
  decision_id: string;
  provider: string;
  prompt_tokens: number;
  completion_tokens: number;
  estimated_cost_usd: number;
  created_at: string;
}

export interface UsageStats {
  lastAnalyses: AnalysisUsageRow[];
  averageCostUsd: number;
  totalCostUsd: number;
  count: number;
}

/**
 * Enregistre l'usage d'une analyse (tokens + coût estimé) pour suivi pricing.
 */
export async function recordAnalysisUsage(params: {
  userId: string;
  decisionId: string;
  provider: string;
  promptTokens: number;
  completionTokens: number;
  estimatedCostUsd: number;
}): Promise<void> {
  const { error } = await supabase.from('analysis_usage').insert({
    user_id: params.userId,
    decision_id: params.decisionId,
    provider: params.provider,
    prompt_tokens: params.promptTokens,
    completion_tokens: params.completionTokens,
    estimated_cost_usd: params.estimatedCostUsd,
  });
  if (error) {
    console.warn('Failed to record analysis usage:', error.message);
  }
}

/**
 * Récupère les N dernières analyses et calcule le coût moyen.
 */
export async function getLastAnalysesUsage(
  limit: number = 10
): Promise<UsageStats> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { lastAnalyses: [], averageCostUsd: 0, totalCostUsd: 0, count: 0 };
  }

  const { data, error } = await supabase
    .from('analysis_usage')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.warn('Failed to fetch analysis usage:', error.message);
    return { lastAnalyses: [], averageCostUsd: 0, totalCostUsd: 0, count: 0 };
  }

  const lastAnalyses = (data || []) as AnalysisUsageRow[];
  const totalCostUsd = lastAnalyses.reduce((sum, row) => sum + Number(row.estimated_cost_usd), 0);
  const count = lastAnalyses.length;
  const averageCostUsd = count > 0 ? totalCostUsd / count : 0;

  return {
    lastAnalyses,
    averageCostUsd,
    totalCostUsd,
    count,
  };
}
