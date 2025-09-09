
import React, { useState } from 'react';
import { IResult, IDecision, IBreakdownItem } from '@/types/decision';
import { RecommendationCard } from './RecommendationCard';
import { ComparisonTable } from './ComparisonTable';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table2, ChevronDown, ChevronUp } from 'lucide-react';
import FollowUpQuestions from './FollowUpQuestions';
import { DataAccuracyIndicator } from './DataAccuracyIndicator';
import { useI18nUI } from '@/contexts/I18nUIContext';

interface AnalysisResultProps {
  result: IResult | null;
  isUpdating: boolean;
  analysisStep: string;
  currentDecision: IDecision | null;
  dilemma: string;
  onUpdateDecision?: (updatedDecision: IDecision) => void;
  onFollowUpQuestion?: (enrichedDilemma: string) => void;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({
  result,
  isUpdating,
  analysisStep,
  currentDecision,
  dilemma,
  onUpdateDecision,
  onFollowUpQuestion
}) => {
  const { t } = useI18nUI();
  const [showAllOptions, setShowAllOptions] = useState(false);
  
  // Nombre d'options à afficher initialement (5)
  const initialOptionsCount = 5;
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
      {/* Indicateur de sources et mise à jour */}
      <DataAccuracyIndicator result={result} currentDecision={currentDecision} />
      
      <RecommendationCard 
        result={result}
        dilemma={dilemma}
        currentDecision={currentDecision}
      />
      
      {hasMultipleOptions && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <CardTitle className="flex items-center gap-2">
                <Table2 className="h-5 w-5" />
                {t('decision.comparisonTable')}
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
              result={result}
              onUpdateResult={(updatedResult) => {
                // Sauvegarder les liens en cache dans la décision courante
                if (onUpdateDecision && currentDecision) {
                  const updatedDecision = {
                    ...currentDecision,
                    result: updatedResult
                  };
                  onUpdateDecision(updatedDecision);
                }
              }}
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
                      {t('decision.seeMoreOptions')} ({allOptions.length - initialOptionsCount} autres)
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
          onQuestionSelect={(enrichedDilemma: string) => {
            // Sauvegarder les questions dans l'historique si elles ont été mises à jour
            if (result.followUpQuestions && onUpdateDecision && currentDecision) {
              const updatedDecision = {
                ...currentDecision,
                result: { ...result }
              };
              onUpdateDecision(updatedDecision);
            }
            onFollowUpQuestion(enrichedDilemma);
          }}
          onCacheQuestions={(questions) => {
            // Persist follow-up questions immediately
            if (currentDecision && onUpdateDecision) {
              const updatedDecision = {
                ...currentDecision,
                result: {
                  ...currentDecision.result,
                  followUpQuestions: questions.map(text => ({ 
                    id: crypto.randomUUID(), 
                    text, 
                    category: 'general' as const
                  }))
                }
              };
              onUpdateDecision(updatedDecision);
            }
          }}
          isLoading={isUpdating}
        />
      )}
    </div>
  );
};

export default AnalysisResult;
