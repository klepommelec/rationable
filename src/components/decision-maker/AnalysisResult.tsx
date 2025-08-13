
import React, { useState } from 'react';
import { IResult, IDecision, IBreakdownItem } from '@/types/decision';
import { RecommendationCard } from './RecommendationCard';
import { ComparisonTable } from './ComparisonTable';
import { UsefulLinks } from './UsefulLinks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table2, ChevronDown, ChevronUp } from 'lucide-react';
import FollowUpQuestions from './FollowUpQuestions';
import { DataAccuracyIndicator } from './DataAccuracyIndicator';

interface AnalysisResultProps {
  result: IResult | null;
  isUpdating: boolean;
  clearSession: () => void;
  analysisStep: string;
  currentDecision: IDecision | null;
  dilemma: string;
  onUpdateDecision?: (updatedDecision: IDecision) => void;
  onFollowUpQuestion?: (enrichedDilemma: string) => void;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({
  result,
  isUpdating,
  clearSession,
  analysisStep,
  currentDecision,
  dilemma,
  onUpdateDecision,
  onFollowUpQuestion
}) => {
  const [showAllOptions, setShowAllOptions] = useState(false);
  
  // Nombre d'options à afficher initialement (3-4)
  const initialOptionsCount = 3;
  if (!result) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center p-8">
          <p className="text-muted-foreground">Aucun résultat disponible</p>
        </div>
      </div>
    );
  }

  const hasMultipleOptions = result.breakdown && result.breakdown.length > 1;
  
  // Gestion des options affichées
  const allOptions = result.breakdown || [];
  const displayedOptions = showAllOptions ? allOptions : allOptions.slice(0, initialOptionsCount);
  const hasMoreOptions = allOptions.length > initialOptionsCount;

  // Affichage unifié pour tous les types de questions
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Indicateur de fraîcheur des données */}
      <DataAccuracyIndicator result={result} />
      
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <CardTitle className="flex items-center gap-2">
                <Table2 className="h-5 w-5" />
                Tableau comparatif
              </CardTitle>
              <Badge variant="outline" className="self-start sm:self-center">
                {result.breakdown?.length || 0} options
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ComparisonTable 
              breakdown={displayedOptions} 
              dilemma={dilemma}
            />
            {hasMoreOptions && (
              <div className="flex justify-center mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAllOptions(!showAllOptions)}
                  className="flex items-center gap-2"
                >
                  {showAllOptions ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Voir moins d'options
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      Voir plus d'options ({allOptions.length - initialOptionsCount} autres)
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {onFollowUpQuestion && (
        <FollowUpQuestions
          dilemma={dilemma}
          result={result}
          category={currentDecision?.category}
          onQuestionSelect={onFollowUpQuestion}
          isLoading={isUpdating}
        />
      )}
    </div>
  );
};

export default AnalysisResult;
