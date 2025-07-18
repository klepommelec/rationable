
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
import { ValidatedLink } from '@/components/ValidatedLink';
import { ExternalLink, RotateCcw, Lightbulb } from 'lucide-react';

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
              <ConfidenceIndicator level={result.confidenceLevel || 75} />
              <DataFreshnessIndicator freshness={result.dataFreshness || 'moderate'} />
              
              {result.workspaceData?.documentsUsed && (
                <WorkspaceDocumentIndicator 
                  documentsUsed={result.workspaceData.documentsUsed}
                  documentSources={result.workspaceData.documentSources}
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
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearSession}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Nouvelle analyse
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
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
                          href={link.url}
                          className="text-sm text-primary hover:text-primary/80 block"
                        >
                          {link.title}
                        </ValidatedLink>
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
                          href={link.url}
                          className="text-sm text-green-600 hover:text-green-500 block"
                        >
                          {link.title}
                        </ValidatedLink>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Image de la décision */}
          <div className="flex justify-center">
            <DecisionImage 
              imageQuery={result.imageQuery || result.recommendation}
              dilemma={dilemma}
              currentDecision={currentDecision}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
