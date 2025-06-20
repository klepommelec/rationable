
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RotateCcw, BarChart3, PieChart, Radar, TrendingUp, Share2 } from 'lucide-react';
import { IResult } from '@/types/decision';
import DecisionExplanation from './DecisionExplanation';
import ComparisonTable from './ComparisonTable';
import { ScorePieChart } from './PieChart';
import { VisualIndicators } from './VisualIndicators';
import { EnhancedRadarChart } from './EnhancedRadarChart';
import { MetricsVisual } from './MetricsVisual';
import { ScoreChart } from './ScoreChart';
import { ExportMenu } from '../ExportMenu';

interface AnalysisResultProps {
    result: IResult | null;
    isUpdating: boolean;
    clearSession: () => void;
    analysisStep: string;
    currentDecision?: any;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ 
  result, 
  isUpdating, 
  clearSession, 
  analysisStep,
  currentDecision 
}) => {
    if (!result) return null;

    const topOption = result.breakdown.reduce((prev, current) => 
        current.score > prev.score ? current : prev
    );

    return (
        <div className="space-y-6 animate-fade-in">
            {/* En-tête avec actions */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl mb-2">Résultat de l'analyse</CardTitle>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                                ✅ Recommandation: {topOption.option.replace(/^Option\s+\d+:\s*/i, '').trim()}
                            </Badge>
                        </div>
                        <div className="flex gap-2">
                            {currentDecision && <ExportMenu singleDecision={currentDecision} />}
                            <Button variant="outline" onClick={clearSession}>
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Nouvelle analyse
                            </Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Explication de la décision */}
            <DecisionExplanation result={result} />

            {/* Visualisations dans des onglets */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Visualisations et Analyses
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="overview" className="flex items-center gap-1">
                                <TrendingUp className="h-4 w-4" />
                                Vue d'ensemble
                            </TabsTrigger>
                            <TabsTrigger value="pie" className="flex items-center gap-1">
                                <PieChart className="h-4 w-4" />
                                Répartition
                            </TabsTrigger>
                            <TabsTrigger value="radar" className="flex items-center gap-1">
                                <Radar className="h-4 w-4" />
                                Radar
                            </TabsTrigger>
                            <TabsTrigger value="comparison">
                                Comparaison
                            </TabsTrigger>
                            <TabsTrigger value="metrics">
                                Métriques
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="mt-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <VisualIndicators data={result.breakdown} />
                                <ScoreChart data={result.breakdown} />
                            </div>
                        </TabsContent>

                        <TabsContent value="pie" className="mt-6">
                            <ScorePieChart data={result.breakdown} />
                        </TabsContent>

                        <TabsContent value="radar" className="mt-6">
                            <EnhancedRadarChart data={result.breakdown} />
                        </TabsContent>

                        <TabsContent value="comparison" className="mt-6">
                            <ComparisonTable breakdown={result.breakdown} />
                        </TabsContent>

                        <TabsContent value="metrics" className="mt-6">
                            <MetricsVisual data={result.breakdown} />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default AnalysisResult;
