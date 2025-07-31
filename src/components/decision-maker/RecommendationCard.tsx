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
import { ExternalLink, RotateCcw, Lightbulb, BarChart3, Activity, CheckCircle, Target, Zap, Share2 } from 'lucide-react';
import ShareButton from '@/components/ShareButton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIProviderDashboard } from './AIProviderDashboard';
import { AIProviderMonitor } from './AIProviderMonitor';
import { ExpandableText } from '@/components/ExpandableText';
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
  const resultType = result.resultType || 'comparative';
  const topOption = result.breakdown?.[0];
  const getResultConfig = () => {
    switch (resultType) {
      case 'factual':
        return {
          icon: <CheckCircle className="h-5 w-5 text-emerald-600" />,
          title: 'Réponse',
          badge: 'Réponse factuelle',
          borderColor: 'border-emerald-200',
          bgGradient: '',
          badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100',
          titleColor: 'text-emerald-700 dark:text-emerald-300'
        };
      case 'simple-choice':
        return {
          icon: <Target className="h-5 w-5 text-blue-600" />,
          title: 'Recommandation',
          badge: 'Meilleur choix',
          borderColor: 'border-blue-200',
          bgGradient: 'bg-gradient-to-r from-blue-50 to-indigo-50',
          badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
          titleColor: 'text-blue-700 dark:text-blue-300'
        };
      default:
        // comparative
        return {
          icon: <Lightbulb className="h-5 w-5 text-primary" />,
          title: 'Recommandation',
          badge: 'Solution recommandée',
          borderColor: 'border-primary/20',
          bgGradient: 'bg-gradient-to-r from-primary/5 to-secondary/5',
          badgeColor: 'bg-primary/10 text-primary',
          titleColor: 'text-primary'
        };
    }
  };
  const config = getResultConfig();
  return <Card className={`border-2 ${config.borderColor} ${config.bgGradient} ${resultType === 'factual' ? 'mx-0' : ''}`}>
      <CardContent className="space-y-6 pt-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Badge variant="secondary" className={`mb-2 ${config.badgeColor}`}>
                  {config.badge}
                </Badge>
                <h3 className={`text-lg font-semibold mb-2 ${config.titleColor}`}>
                  {result.recommendation?.replace(/^Option\s+\d+:\s*/i, '').trim()}
                </h3>
                <ConfidenceIndicator breakdown={result.breakdown} topOption={topOption} result={result} />
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                {currentDecision && (
                  <ShareButton decision={currentDecision} />
                )}
                <Button variant="outline" size="sm" onClick={clearSession} className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Nouvelle analyse
                </Button>
                
                {import.meta.env.DEV && <Dialog>
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
                  </Dialog>}
              </div>
            </div>
            
            <div>
              <ExpandableText text={result.description} />
            </div>

            {topOption && (topOption.pros?.length > 0 || topOption.cons?.length > 0) && <div className="grid md:grid-cols-2 gap-4">
                {topOption.pros?.length > 0 && <div className="space-y-2">
                    <h4 className="font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      {resultType === 'factual' ? 'Caractéristiques' : 'Avantages'}
                    </h4>
                    <ul className="space-y-1">
                      {topOption.pros.map((pro, index) => <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          <span>{pro}</span>
                        </li>)}
                    </ul>
                  </div>}
                
                {topOption.cons?.length > 0 && resultType !== 'factual' && <div className="space-y-2">
                    <h4 className="font-medium text-orange-700 dark:text-orange-300 flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Points d'attention
                    </h4>
                    <ul className="space-y-1">
                      {topOption.cons.map((con, index) => <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-orange-500 mt-1">•</span>
                          <span>{con}</span>
                        </li>)}
                    </ul>
                  </div>}
              </div>}

            {/* Section Liens utiles sera gérée par le composant UsefulLinks dans AnalysisResult */}
          </div>

          {result.imageQuery && <div className="hidden lg:flex lg:w-80 justify-center">
              <DecisionImage imageQuery={result.imageQuery || result.recommendation} alt={`Illustration pour ${result.recommendation}`} />
            </div>}
        </div>
      </CardContent>
    </Card>;
};