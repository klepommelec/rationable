
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, CheckCircle, XCircle, RotateCcw, Share2 } from 'lucide-react';
import { IResult, IDecision } from '@/types/decision';
import { DecisionExplanation } from './DecisionExplanation';
import { ComparisonTable } from './ComparisonTable';
import { ShareButton } from '../ShareButton';

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
      <div className="text-center py-8">
        <p className="text-muted-foreground">Aucun résultat disponible.</p>
      </div>
    );
  }

  const handleLinkClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const renderOption = (option: any, index: number) => (
    <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-semibold text-foreground">{option.option}</h3>
          <Badge variant="secondary" className="ml-2 font-bold text-lg">
            {option.score}/100
          </Badge>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="font-medium text-green-700 dark:text-green-400 mb-2 flex items-center">
              <CheckCircle className="h-4 w-4 mr-1" />
              Avantages
            </h4>
            <ul className="space-y-1">
              {option.pros?.map((pro: string, idx: number) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start">
                  <span className="text-green-500 mr-2 mt-1">•</span>
                  {pro}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-red-700 dark:text-red-400 mb-2 flex items-center">
              <XCircle className="h-4 w-4 mr-1" />
              Inconvénients
            </h4>
            <ul className="space-y-1">
              {option.cons?.map((con: string, idx: number) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start">
                  <span className="text-red-500 mr-2 mt-1">•</span>
                  {con}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Recommendation Section */}
      {result.recommendation && (
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl text-primary flex items-center gap-2">
              <CheckCircle className="h-6 w-6" />
              Recommandation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg font-medium">{result.recommendation}</p>
            {result.description && (
              <p className="text-muted-foreground leading-relaxed">{result.description}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Decision Explanation */}
      <DecisionExplanation 
        result={result} 
        currentDecision={currentDecision} 
        dilemma={dilemma}
      />

      {/* Options Breakdown */}
      {result.breakdown && result.breakdown.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Analyse détaillée des options</h2>
          <div className="grid gap-4">
            {result.breakdown.map((option, index) => renderOption(option, index))}
          </div>
        </div>
      )}

      {/* Comparison Table */}
      <ComparisonTable result={result} />

      {/* Links Section */}
      {((result.infoLinks && result.infoLinks.length > 0) || 
        (result.shoppingLinks && result.shoppingLinks.length > 0)) && (
        <div className="grid md:grid-cols-2 gap-6">
          {result.infoLinks && result.infoLinks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Liens d'information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {result.infoLinks.map((link, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start h-auto p-3"
                    onClick={() => handleLinkClick(link.url)}
                  >
                    <ExternalLink className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-left text-wrap">{link.title}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}

          {result.shoppingLinks && result.shoppingLinks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Liens d'achat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {result.shoppingLinks.map((link, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start h-auto p-3"
                    onClick={() => handleLinkClick(link.url)}
                  >
                    <ExternalLink className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-left text-wrap">{link.title}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <Button 
          onClick={clearSession} 
          variant="outline" 
          className="flex-1"
          disabled={isUpdating}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Nouvelle analyse
        </Button>
        
        <ShareButton 
          decision={currentDecision} 
          className="flex-1"
        />
      </div>
    </div>
  );
};

export default AnalysisResult;
