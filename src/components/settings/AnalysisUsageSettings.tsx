import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAnalysisUsageStats } from '@/hooks/useAnalysisUsageStats';
import { Button } from '@/components/ui/button';
import { RefreshCw, DollarSign, BarChart3 } from 'lucide-react';
const LIMIT = 10;

export default function AnalysisUsageSettings() {
  const { stats, loading, error, refresh } = useAnalysisUsageStats(LIMIT);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Usage des analyses (10 dernières)
          </CardTitle>
          <CardDescription>
            Coût estimé par analyse (tokens IA) pour suivre le pricing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && (
            <p className="text-sm text-muted-foreground">Chargement...</p>
          )}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          {!loading && !error && (
            <>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-4 py-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Coût moyen / analyse</span>
                  <span className="font-mono text-sm">
                    ${stats.averageCostUsd.toFixed(4)} USD
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-4 py-2">
                  <span className="text-sm font-medium">Total ({stats.count} analyses)</span>
                  <span className="font-mono text-sm">
                    ${stats.totalCostUsd.toFixed(4)} USD
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={refresh} className="shrink-0">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Actualiser
                </Button>
              </div>
              {stats.lastAnalyses.length > 0 ? (
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-2 font-medium">Date</th>
                        <th className="text-left p-2 font-medium">Provider</th>
                        <th className="text-right p-2 font-medium">Tokens (in / out)</th>
                        <th className="text-right p-2 font-medium">Coût (USD)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.lastAnalyses.map((row) => (
                        <tr key={row.id} className="border-b last:border-0">
                          <td className="p-2 text-muted-foreground">
                            {new Date(row.created_at).toLocaleString()}
                          </td>
                          <td className="p-2">{row.provider}</td>
                          <td className="p-2 text-right font-mono">
                            {row.prompt_tokens} / {row.completion_tokens}
                          </td>
                          <td className="p-2 text-right font-mono">
                            ${Number(row.estimated_cost_usd).toFixed(4)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Aucune analyse enregistrée. Les analyses avec usage IA enregistreront ici le coût estimé.
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
