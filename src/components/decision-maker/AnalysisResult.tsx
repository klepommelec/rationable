
import React from 'react';
import { IResult } from '@/types/decision';
import { RecommendationCard } from './RecommendationCard';
import { AnalysisCharts } from './AnalysisCharts';
import { UsefulLinks } from './UsefulLinks';
import { ScoreChart } from './ScoreChart';
import { EnhancedRadarChart } from './EnhancedRadarChart';
import { ScorePieChart } from './PieChart';
import { ComparisonTable } from './ComparisonTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Radar, PieChart, Table } from 'lucide-react';

interface AnalysisResultProps {
  result: IResult;
  isUpdating: boolean;
  clearSession: () => void;
  analysisStep: string;
  currentDecision: any;
  dilemma: string;
}

const AnalysisResult = ({ 
  result, 
  isUpdating, 
  clearSession, 
  analysisStep, 
  currentDecision, 
  dilemma 
}: AnalysisResultProps) => {
  const isLoading = isUpdating && analysisStep === 'loading-options';

  if (isLoading || !result?.breakdown || result.breakdown.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Carte de recommandation principale */}
      <RecommendationCard
        result={result}
        dilemma={dilemma}
        currentDecision={currentDecision}
        clearSession={clearSession}
      />

      {/* Liens utiles */}
      {(result.infoLinks?.length > 0 || result.shoppingLinks?.length > 0 || (result as any).socialContent?.youtubeVideos?.length > 0) && (
        <UsefulLinks
          infoLinks={result.infoLinks}
          shoppingLinks={result.shoppingLinks}
          socialContent={(result as any).socialContent}
          dilemma={dilemma}
          recommendation={result.recommendation}
        />
      )}

      {/* Graphiques et visualisations avec onglets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Visualisations et Analyses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Vue d'ensemble
              </TabsTrigger>
              <TabsTrigger value="charts" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Scores
              </TabsTrigger>
              <TabsTrigger value="radar" className="flex items-center gap-2">
                <Radar className="h-4 w-4" />
                Radar
              </TabsTrigger>
              <TabsTrigger value="pie" className="flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                Répartition
              </TabsTrigger>
              <TabsTrigger value="table" className="flex items-center gap-2">
                <Table className="h-4 w-4" />
                Tableau
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-6">
              <AnalysisCharts breakdown={result.breakdown} dilemma={dilemma} />
            </TabsContent>
            
            <TabsContent value="charts" className="mt-6">
              <ScoreChart data={result.breakdown} />
            </TabsContent>
            
            <TabsContent value="radar" className="mt-6">
              <EnhancedRadarChart data={result.breakdown} />
            </TabsContent>
            
            <TabsContent value="pie" className="mt-6">
              <ScorePieChart data={result.breakdown} />
            </TabsContent>
            
            <TabsContent value="table" className="mt-6">
              <ComparisonTable breakdown={result.breakdown} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisResult;
