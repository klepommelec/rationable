
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IResult } from '@/types/decision';
import { DecisionImage } from './DecisionImage';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { DataFreshnessIndicator } from './DataFreshnessIndicator';
import { WorkspaceDocumentIndicator } from './WorkspaceDocumentIndicator';
import { AIProviderIndicator } from './AIProviderIndicator';
import ValidatedLink from '@/components/ValidatedLink';
import { ExternalLink, RotateCcw, Lightbulb, BarChart3, Activity } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIProviderDashboard } from './AIProviderDashboard';
import { AIProviderMonitor } from './AIProviderMonitor';

interface RecommendationCardProps {
  result: IResult;
  dilemma: string;
  currentDecision: any;
  clearSession: () => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  result,
  dilemma,
  currentDecision,
  clearSession
}) => {
  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-xl mb-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Recommandation
            </CardTitle>
            
            {/* Indicateurs de qualité */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <ConfidenceIndicator 
                breakdown={result.breakdown}
                topOption={result.breakdown[0]}
                result={result}
              />
              <DataFreshnessIndicator 
                hasRealTimeData={result.realTimeData?.hasRealTimeData || false}
                timestamp={result.realTimeData?.timestamp}
                sourcesCount={result.realTimeData?.sourcesCount}
                dataFreshness={result.dataFreshness || 'moderate'}
              />
              
              {result.workspaceData && (
                <WorkspaceDocumentIndicator 
                  workspaceData={result.workspaceData}
                />
              )}
              
              {result.aiProvider && (
                <AIProviderIndicator
                  provider={result.aiProvider.provider}
                  model={result.aiProvider.model}
                  success={result.aiProvider.success}
                  realTimeProvider={result.realTimeData?.provider}
                />
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearSession}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Nouvelle analyse
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Dashboard AI
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Dashboard AI Providers</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="dashboard" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="dashboard">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Statistiques
                    </TabsTrigger>
                    <TabsTrigger value="monitoring">
                      <Activity className="h-4 w-4 mr-2" />
                      Monitoring
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="dashboard" className="mt-4">
                    <AIProviderDashboard />
                  </TabsContent>
                  <TabsContent value="monitoring" className="mt-4">
                    <AIProviderMonitor />
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-4">
            <div>
              <Badge variant="secondary" className="mb-2 bg-primary/10 text-primary">
                Solution recommandée
              </Badge>
              <h3 className="text-lg font-semibold text-primary mb-2">
                {result.recommendation}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {result.description}
              </p>
            </div>

            {/* Liens utiles */}
            {(result.infoLinks?.length > 0 || result.shoppingLinks?.length > 0) && (
              <div className="space-y-3">
                {result.infoLinks?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Liens utiles
                    </h4>
                     <div className="space-y-1">
                       {result.infoLinks.map((link, index) => (
                         <ValidatedLink
                           key={index}
                           link={link}
                           className="text-sm text-primary hover:text-primary/80 block"
                         />
                       ))}
                     </div>
                  </div>
                )}

                {result.shoppingLinks?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Liens d'achat</h4>
                     <div className="space-y-1">
                       {result.shoppingLinks.map((link, index) => (
                         <ValidatedLink
                           key={index}
                           link={link}
                           className="text-sm text-green-600 hover:text-green-500 block"
                         />
                       ))}
                     </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Image de la décision - cachée sur mobile, visible sur desktop */}
          {result.imageQuery && (
            <div className="hidden lg:flex lg:w-80 justify-center">
              <DecisionImage 
                imageQuery={result.imageQuery || result.recommendation}
                alt={`Illustration pour ${result.recommendation}`}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
