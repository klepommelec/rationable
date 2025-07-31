
import React from 'react';
import { IResult, IDecision, IBreakdownItem } from '@/types/decision';
import { RecommendationCard } from './RecommendationCard';
import { ComparisonTable } from './ComparisonTable';
import { UsefulLinks } from './UsefulLinks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table2, ExternalLink } from 'lucide-react';
import YouTubeVideoCard from '@/components/YouTubeVideoCard';
import ExpandOptionsButton from './ExpandOptionsButton';

interface AnalysisResultProps {
  result: IResult | null;
  isUpdating: boolean;
  clearSession: () => void;
  analysisStep: string;
  currentDecision: IDecision | null;
  dilemma: string;
  onUpdateDecision?: (updatedDecision: IDecision) => void;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({
  result,
  isUpdating,
  clearSession,
  analysisStep,
  currentDecision,
  dilemma,
  onUpdateDecision
}) => {
  const handleNewOptions = (newOptions: IBreakdownItem[]) => {
    if (!currentDecision || !onUpdateDecision) return;
    
    const updatedBreakdown = [...currentDecision.result.breakdown, ...newOptions]
      .slice(0, 10) // Limite à 10 options
      .sort((a, b) => b.score - a.score); // Re-trier par score
    
    const updatedDecision = {
      ...currentDecision,
      result: {
        ...currentDecision.result,
        breakdown: updatedBreakdown
      }
    };
    
    onUpdateDecision(updatedDecision);
  };
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
            {currentDecision && onUpdateDecision && (
              <ExpandOptionsButton
                decision={currentDecision}
                currentOptions={result.breakdown || []}
                onNewOptions={handleNewOptions}
              />
            )}
          </CardContent>
        </Card>
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
