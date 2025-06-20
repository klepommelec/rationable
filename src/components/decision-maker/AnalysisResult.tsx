
import * as React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eraser, Trophy, BookOpen, ShoppingCart, Star, TrendingUp, BarChart3, PieChart, Radar, Activity } from 'lucide-react';
import { IResult } from '@/types/decision';
import { ScoreChart } from './ScoreChart';
import { ScorePieChart } from './PieChart';
import { EnhancedRadarChart } from './EnhancedRadarChart';
import { VisualIndicators } from './VisualIndicators';
import { MetricsVisual } from './MetricsVisual';
import { ComparisonTable } from './ComparisonTable';
import { DecisionExplanation } from './DecisionExplanation';
import { Skeleton } from '@/components/ui/skeleton';
import ValidatedLink from '@/components/ValidatedLink';

interface AnalysisResultProps {
  result: IResult | null;
  isUpdating: boolean;
  clearSession: () => void;
  analysisStep: 'idle' | 'analyzing' | 'done';
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({
  result,
  isUpdating,
  clearSession,
  analysisStep
}) => {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  // Reset image state when result changes
  React.useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [result?.recommendation]);

  if (analysisStep === 'analyzing' || !result) {
    return <div className="space-y-6 animate-fade-in">
            <Card className="overflow-hidden backdrop-blur-sm bg-card/70">
                <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="p-6 flex flex-col">
                        <CardContent className="p-0 flex-grow space-y-4">
                            <Skeleton className="h-5 w-2/3" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-20 w-full" />
                        </CardContent>
                        <CardFooter className="p-0 pt-6">
                            <Skeleton className="h-10 w-1/2" />
                        </CardFooter>
                    </div>
                    <div className="relative min-h-[250px] md:min-h-0 bg-muted"></div>
                </div>
            </Card>

            <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    {[...Array(3)].map((_, i) => <div key={i} className="p-4 rounded-lg bg-accent border space-y-3">
                            <div className="flex justify-between items-center">
                                <Skeleton className="h-6 w-1/3" />
                                <Skeleton className="h-6 w-1/4" />
                            </div>
                            <Skeleton className="h-16 w-full" />
                        </div>)}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <Card className="h-full ">
                        <CardHeader>
                            <Skeleton className="h-7 w-2/3" />
                        </CardHeader>
                        <CardContent className="space-y-4 pt-2">
                           <Skeleton className="h-6 w-full" />
                           <Skeleton className="h-6 w-full" />
                           <Skeleton className="h-6 w-full" />
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card className="h-full">
                        <CardHeader>
                            <Skeleton className="h-7 w-2/3" />
                        </CardHeader>
                        <CardContent>
                           <Skeleton className="w-full h-[250px]" />
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Card>
                <CardFooter className="p-0">
                    <Skeleton className="h-16 w-full rounded-md" />
                </CardFooter>
            </Card>
        </div>;
  }

  const averageScore = result.breakdown.length > 0 ? Math.round(result.breakdown.reduce((acc, item) => acc + item.score, 0) / result.breakdown.length) : 0;
  const topOption = result.breakdown.length > 0 ? result.breakdown.reduce((prev, current) => prev.score > current.score ? prev : current) : null;

  // Get recommendation badge
  const getRecommendationBadge = () => {
    if (!topOption) return null;
    
    if (topOption.score >= 90) {
      return (
        <Badge className="bg-gold text-white border-gold">
          <Star className="h-3 w-3 mr-1" />
          Choix Exceptionnel
        </Badge>
      );
    } else if (topOption.score >= 80) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-300">
          <Trophy className="h-3 w-3 mr-1" />
          Excellent Choix
        </Badge>
      );
    } else if (topOption.score >= 70) {
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-300">
          <TrendingUp className="h-3 w-3 mr-1" />
          Bon Choix
        </Badge>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="overflow-hidden backdrop-blur-sm bg-card/70">
        <div className="p-6">
          <CardContent className="p-0 flex-grow">
            <p className="text-muted-foreground pb-2">Basé sur votre analyse, voici la meilleure option :</p>
            <div className="bg-gradient-to-b from-white to-gray-100 border p-4 rounded-lg">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-xl text-foreground font-semibold flex items-center gap-2">
                  <Trophy className="text-gold" />
                  {result.recommendation}
                </h3>
                {getRecommendationBadge()}
              </div>
            </div>
            {result.description && <p className="text-muted-foreground mt-4">{result.description}</p>}
          </CardContent>
          
          <CardFooter className="p-0 pt-6">
            <div className="w-full space-y-4">
              {result.infoLinks && result.infoLinks.length > 0 && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2 text-sm mb-2">
                    <BookOpen className="h-4 w-4" />
                    Pour en savoir plus
                  </h4>
                  <div className="flex flex-col items-start gap-1.5">
                    {result.infoLinks.map((link, i) => (
                      <ValidatedLink key={i} link={link} fallbackSearchQuery={result.recommendation} />
                    ))}
                  </div>
                </div>
              )}
              
              {result.shoppingLinks && result.shoppingLinks.length > 0 && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2 text-sm mb-2">
                    <ShoppingCart className="h-4 w-4" />
                    Où l'acheter ?
                  </h4>
                  <div className="flex flex-col items-start gap-1.5">
                    {result.shoppingLinks.map((link, i) => (
                      <ValidatedLink key={i} link={link} fallbackSearchQuery={result.recommendation} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardFooter>
        </div>
      </Card>

      <DecisionExplanation result={result} />

      {/* Nouvelles visualisations interactives avec onglets */}
      <Tabs defaultValue="charts" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="charts" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Graphiques
          </TabsTrigger>
          <TabsTrigger value="indicators" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Indicateurs
          </TabsTrigger>
          <TabsTrigger value="radar" className="flex items-center gap-2">
            <Radar className="h-4 w-4" />
            Radar
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Métriques
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="charts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ScoreChart data={result.breakdown} />
            <ScorePieChart data={result.breakdown} />
          </div>
        </TabsContent>
        
        <TabsContent value="indicators" className="space-y-6">
          <VisualIndicators data={result.breakdown} />
        </TabsContent>
        
        <TabsContent value="radar" className="space-y-6">
          <EnhancedRadarChart data={result.breakdown} />
        </TabsContent>
        
        <TabsContent value="metrics" className="space-y-6">
          <MetricsVisual data={result.breakdown} />
        </TabsContent>
      </Tabs>

      <ComparisonTable breakdown={result.breakdown} />

      <Card>
        <CardFooter className="p-0">
          <Button onClick={clearSession} variant="secondary" className="w-full font-bold text-lg py-6" disabled={isUpdating}>
            <Eraser className="h-5 w-5 mr-2" />
            Recommencer une nouvelle analyse
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AnalysisResult;
