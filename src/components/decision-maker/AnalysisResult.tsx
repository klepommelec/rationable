
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
        
        {result.breakdown && result.breakdown.length > 0 && (
          <AnalysisInsights 
            breakdown={result.breakdown}
            topOption={result.breakdown[0]}
            cleanOptionName={result.breakdown[0]?.option || result.recommendation}
          />
        )}
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
        <Suspense fallback={<div>Chargement des graphiques...</div>}>
          <AnalysisCharts breakdown={result.breakdown || []} />
        </Suspense>
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
