
import React, { Suspense } from 'react';
import { IResult, IDecision } from '@/types/decision';
import { RecommendationCard } from './RecommendationCard';
import { ComparisonTable } from './ComparisonTable';
import { AnalysisCharts } from './AnalysisCharts';
import { UsefulLinks } from './UsefulLinks';
import { AnalysisInsights } from './AnalysisInsights';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Table2, ExternalLink, Lightbulb } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import YouTubeVideoCard from '@/components/YouTubeVideoCard';

interface AnalysisResultProps {
  result: IResult | null;
  isUpdating: boolean;
  clearSession: () => void;
  analysisStep: string;
  currentDecision: IDecision | null;
  dilemma: string;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({
  result,
  isUpdating,
  clearSession,
  analysisStep,
  currentDecision,
  dilemma
}) => {
  if (!result) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center p-8">
          <p className="text-muted-foreground">Aucun résultat disponible</p>
        </div>
      </div>
    );
  }

  const resultType = result.resultType || 'comparative';
  const hasMultipleOptions = result.breakdown && result.breakdown.length > 1;
  const hasYouTubeVideos = result.socialContent?.youtubeVideos && result.socialContent.youtubeVideos.length > 0;

  // Pour les questions factuelles, on simplifie l'affichage
  if (resultType === 'factual') {
    return (
      <div className="space-y-6 animate-fade-in">
        <RecommendationCard 
          result={result}
          dilemma={dilemma}
          currentDecision={currentDecision}
          clearSession={clearSession}
        />
        
        <UsefulLinks 
          infoLinks={result.infoLinks}
          shoppingLinks={result.shoppingLinks}
          socialContent={result.socialContent}
          dilemma={dilemma}
          recommendation={result.recommendation}
        />
        
        {hasYouTubeVideos && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Contenu vidéo recommandé
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {result.socialContent!.youtubeVideos!.slice(0, 6).map((video) => (
                  <YouTubeVideoCard key={video.id} video={video} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        <AnalysisInsights 
          breakdown={result.breakdown || []}
          topOption={result.breakdown?.[0] || {} as any}
          cleanOptionName={result.breakdown?.[0]?.option || result.recommendation}
        />
      </div>
    );
  }

  // Pour les questions de choix (comparative/simple-choice), affichage complet
  return (
    <div className="space-y-6 animate-fade-in">
      <RecommendationCard 
        result={result}
        dilemma={dilemma}
        currentDecision={currentDecision}
        clearSession={clearSession}
      />
      
      <UsefulLinks 
        infoLinks={result.infoLinks}
        shoppingLinks={result.shoppingLinks}
        socialContent={result.socialContent}
        dilemma={dilemma}
        recommendation={result.recommendation}
      />
      
      {hasMultipleOptions && (
        <Tabs defaultValue="comparison" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="comparison" className="flex items-center gap-2">
              <Table2 className="h-4 w-4" />
              Comparaison
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analyse
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Insights
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="comparison" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Table2 className="h-5 w-5" />
                    Tableau comparatif
                  </CardTitle>
                  <Badge variant="outline">
                    {result.breakdown?.length || 0} options
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ComparisonTable 
                  breakdown={result.breakdown || []} 
                  dilemma={dilemma}
                  resultType={resultType}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analysis" className="mt-6">
            <Suspense fallback={<div>Chargement des graphiques...</div>}>
              <AnalysisCharts breakdown={result.breakdown || []} />
            </Suspense>
          </TabsContent>
          
          <TabsContent value="insights" className="mt-6">
            <AnalysisInsights 
              breakdown={result.breakdown || []}
              topOption={result.breakdown?.[0] || {} as any}
              cleanOptionName={result.breakdown?.[0]?.option || result.recommendation}
            />
          </TabsContent>
        </Tabs>
      )}
      
      {hasYouTubeVideos && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Contenu vidéo recommandé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {result.socialContent!.youtubeVideos!.slice(0, 6).map((video) => (
                <YouTubeVideoCard key={video.id} video={video} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalysisResult;
