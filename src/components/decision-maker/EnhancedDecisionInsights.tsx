import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Users, 
  Shield, 
  ArrowUpDown,
  Zap,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { IResult, IBreakdownItem } from '@/types/decision';
import { useIntelligentConfidence } from '@/hooks/useIntelligentConfidence';

interface EnhancedDecisionInsightsProps {
  result: IResult;
}

export const EnhancedDecisionInsights: React.FC<EnhancedDecisionInsightsProps> = ({ result }) => {
  const { breakdown, realTimeData, resultType } = result;
  
  // Utiliser le hook de confiance intelligent
  const confidenceData = useIntelligentConfidence(
    breakdown,
    realTimeData?.hasRealTimeData,
    realTimeData?.timestamp,
    realTimeData?.sourcesCount,
    resultType
  );

  if (!breakdown || breakdown.length === 0) {
    return null;
  }

  const sortedOptions = [...breakdown].sort((a, b) => b.score - a.score);
  const topOption = sortedOptions[0];
  const secondOption = sortedOptions[1];
  const scoreDifference = secondOption ? topOption.score - secondOption.score : 0;

  // Analyse des critères basée sur les pros/cons
  const getCriteriaAnalysis = () => {
    const allPros = breakdown.flatMap(option => option.pros || []);
    const allCons = breakdown.flatMap(option => option.cons || []);
    
    const criteriaFrequency: Record<string, number> = {};
    [...allPros, ...allCons].forEach(point => {
      const words = point.toLowerCase().split(' ');
      words.forEach(word => {
        if (word.length > 4) {
          criteriaFrequency[word] = (criteriaFrequency[word] || 0) + 1;
        }
      });
    });

    const topCriteria = Object.entries(criteriaFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([word]) => word);

    return {
      dominantFactors: topCriteria,
      strengthsCount: allPros.length,
      challengesCount: allCons.length
    };
  };

  const criteriaAnalysis = getCriteriaAnalysis();

  // Comparaison détaillée entre top 2
  const getDetailedComparison = () => {
    if (!secondOption) return null;

    const topStrengths = topOption.pros?.length || 0;
    const topWeaknesses = topOption.cons?.length || 0;
    const secondStrengths = secondOption.pros?.length || 0;
    const secondWeaknesses = secondOption.cons?.length || 0;

    return {
      scoreGap: scoreDifference,
      strengthsComparison: topStrengths - secondStrengths,
      weaknessesComparison: topWeaknesses - secondWeaknesses,
      topAdvantages: topOption.pros?.slice(0, 2) || [],
      secondAdvantages: secondOption.pros?.slice(0, 2) || []
    };
  };

  const comparison = getDetailedComparison();

  // Facteurs de risque et opportunités
  const getRiskOpportunityFactors = () => {
    const risks = [];
    const opportunities = [];

    if (scoreDifference < 10) {
      risks.push("Décision serrée - Les options sont très proches en qualité");
    }

    if (topOption.cons && topOption.cons.length > 2) {
      risks.push("Option recommandée avec plusieurs points d'attention");
    }

    if (topOption.score >= 85) {
      opportunities.push("Option exceptionnelle avec un score très élevé");
    }

    if (realTimeData?.hasRealTimeData) {
      opportunities.push("Analyse basée sur des données récentes et vérifiées");
    }

    if (breakdown.length >= 4) {
      opportunities.push("Large éventail d'options analysées pour une meilleure perspective");
    }

    return { risks, opportunities };
  };

  const { risks, opportunities } = getRiskOpportunityFactors();

  // Recommandations personnalisées
  const getPersonalizedRecommendations = () => {
    const recommendations = [];

    if (scoreDifference < 15) {
      recommendations.push({
        type: 'attention',
        message: `Considérez vos priorités personnelles car l'écart est de seulement ${scoreDifference} points`,
        icon: AlertTriangle
      });
    }

    if (topOption.cons && topOption.cons.length > 0) {
      recommendations.push({
        type: 'action',
        message: `Préparez-vous à gérer : ${topOption.cons[0]}`,
        icon: Shield
      });
    }

    if (secondOption && secondOption.score > 70) {
      recommendations.push({
        type: 'alternative',
        message: `Gardez ${secondOption.option} comme plan B (score: ${secondOption.score}/100)`,
        icon: Target
      });
    }

    return recommendations;
  };

  const personalizedRecs = getPersonalizedRecommendations();

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          Analyse Approfondie de la Recommandation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="confidence" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="confidence" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Confiance
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4" />
              Comparaison
            </TabsTrigger>
            <TabsTrigger value="risks" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Risques/Opportunités
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Conseils
            </TabsTrigger>
          </TabsList>

          <TabsContent value="confidence" className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className={confidenceData.color}>
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Confiance {confidenceData.level}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Score global: {confidenceData.overallScore}/100
                </span>
              </div>
              <Progress value={confidenceData.overallScore} className="w-32" />
            </div>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border-l-4 border-blue-400">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                {confidenceData.recommendationText}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div className="text-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                <div className="font-semibold text-green-700 dark:text-green-300">
                  {criteriaAnalysis.strengthsCount}
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">Points forts identifiés</div>
              </div>
              <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                <div className="font-semibold text-orange-700 dark:text-orange-300">
                  {criteriaAnalysis.challengesCount}
                </div>
                <div className="text-xs text-orange-600 dark:text-orange-400">Défis à considérer</div>
              </div>
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                <div className="font-semibold text-purple-700 dark:text-purple-300">
                  {breakdown.length}
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-400">Options analysées</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="mt-6 space-y-4">
            {comparison ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-green-700 dark:text-green-300">
                      1. {topOption.option} (Recommandé)
                    </h4>
                    <p className="text-sm text-muted-foreground">Score: {topOption.score}/100</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      +{scoreDifference} pts d'avance
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-950/30 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300">
                      2. {secondOption.option}
                    </h4>
                    <p className="text-sm text-muted-foreground">Score: {secondOption.score}/100</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">
                      Alternative solide
                    </Badge>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h5 className="font-medium flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Avantages clés du choix recommandé
                    </h5>
                    {comparison.topAdvantages.map((advantage, index) => (
                      <div key={index} className="text-sm p-2 bg-green-50 dark:bg-green-950/30 rounded border-l-2 border-green-400">
                        {advantage}
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-3">
                    <h5 className="font-medium flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-500" />
                      Points forts de l'alternative
                    </h5>
                    {comparison.secondAdvantages.map((advantage, index) => (
                      <div key={index} className="text-sm p-2 bg-blue-50 dark:bg-blue-950/30 rounded border-l-2 border-blue-400">
                        {advantage}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Option unique identifiée - Pas de comparaison disponible</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="risks" className="mt-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2 text-orange-700 dark:text-orange-300">
                  <AlertTriangle className="h-4 w-4" />
                  Facteurs de Risque
                </h4>
                {risks.length > 0 ? (
                  risks.map((risk, index) => (
                    <div key={index} className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg border-l-4 border-orange-400">
                      <p className="text-sm text-orange-900 dark:text-orange-100">{risk}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-300">Aucun risque majeur identifié</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2 text-green-700 dark:text-green-300">
                  <Zap className="h-4 w-4" />
                  Opportunités
                </h4>
                {opportunities.length > 0 ? (
                  opportunities.map((opportunity, index) => (
                    <div key={index} className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border-l-4 border-green-400">
                      <p className="text-sm text-green-900 dark:text-green-100">{opportunity}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-3 bg-gray-50 dark:bg-gray-950/30 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300">Analyse standard - Pas d'opportunités spéciales</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="mt-6 space-y-4">
            <div className="space-y-4">
              {personalizedRecs.map((rec, index) => {
                const IconComponent = rec.icon;
                return (
                  <div key={index} className="flex items-start gap-3 p-4 bg-white dark:bg-gray-900/50 rounded-lg border">
                    <IconComponent className="h-5 w-5 mt-0.5 text-primary" />
                    <div>
                      <p className="text-sm font-medium capitalize">{rec.type}</p>
                      <p className="text-sm text-muted-foreground">{rec.message}</p>
                    </div>
                  </div>
                );
              })}
              
              {personalizedRecs.length === 0 && (
                <div className="text-center p-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Recommandation claire - Aucun conseil spécial nécessaire</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};