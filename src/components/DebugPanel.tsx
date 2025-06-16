
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface DebugPanelProps {
  debugMode: boolean;
  setDebugMode: (enabled: boolean) => void;
  analysisStep: string;
  lastApiResponse: any;
  criteria: any[];
  result: any;
}

const DebugPanel: React.FC<DebugPanelProps> = ({
  debugMode,
  setDebugMode,
  analysisStep,
  lastApiResponse,
  criteria,
  result
}) => {
  const copyToClipboard = (data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    toast.success('Données copiées dans le presse-papier');
  };

  if (!debugMode) {
    return (
      <div className="fixed bottom-4 right-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDebugMode(true)}
          className="opacity-50 hover:opacity-100"
        >
          <Eye className="h-4 w-4 mr-2" />
          Debug
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-96 overflow-auto">
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-orange-800">Mode Debug</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDebugMode(false)}
              className="h-6 w-6 p-0"
            >
              <EyeOff className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <div>
            <span className="font-medium">État actuel: </span>
            <Badge variant="outline">{analysisStep}</Badge>
          </div>
          
          <div>
            <span className="font-medium">Critères: </span>
            <span>{criteria.length} définis</span>
          </div>

          {lastApiResponse && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">Dernière réponse API:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(lastApiResponse)}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className="bg-white p-2 rounded border text-xs overflow-auto max-h-32">
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(lastApiResponse, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {result && (
            <div>
              <span className="font-medium">Résultat traité: </span>
              <div className="text-xs space-y-1">
                <div>• Recommandation: {result.recommendation ? '✅' : '❌'}</div>
                <div>• Options: {result.breakdown?.length || 0}</div>
                <div>• Liens info: {result.infoLinks?.length || 0}</div>
                <div>• Liens achat: {result.shoppingLinks?.length || 0}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DebugPanel;
