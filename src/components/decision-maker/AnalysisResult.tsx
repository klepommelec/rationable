
import React, { useState } from 'react';
import { IResult, IDecision, IBreakdownItem } from '@/types/decision';
import { RecommendationCard } from './RecommendationCard';
import { ComparisonTable } from './ComparisonTable';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import FollowUpQuestions from './FollowUpQuestions';
import { DataAccuracyIndicator } from './DataAccuracyIndicator';
import { useI18nUI } from '@/contexts/I18nUIContext';
import { OptionsLoadingSkeleton } from '../OptionsLoadingSkeleton';

interface AnalysisResultProps {
  result: IResult | null;
  isUpdating: boolean;
  analysisStep: string;
  currentDecision: IDecision | null;
  dilemma: string;
  onUpdateDecision?: (updatedDecision: IDecision) => void;
  onFollowUpQuestion?: (enrichedDilemma: string) => void;
  onEditOptions?: () => void;
  /** Si false, n'affiche pas DataAccuracyIndicator (déjà rendu au-dessus par le parent). */
  showDataAccuracyIndicator?: boolean;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({
  result,
  isUpdating,
  analysisStep,
  currentDecision,
  dilemma,
  onUpdateDecision,
  onFollowUpQuestion,
  onEditOptions,
  showDataAccuracyIndicator = true
}) => {
  const { t } = useI18nUI();

  if (!result) {
    // Si on est en train de mettre à jour, afficher le skeleton de chargement
    if (isUpdating) {
      return <OptionsLoadingSkeleton />;
    }
    
    // Sinon, afficher le message "Aucun résultat disponible"
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center p-8">
          <p className="text-muted-foreground">Aucun résultat disponible</p>
        </div>
      </div>
    );
  }

  const hasMultipleOptions = result.breakdown && result.breakdown.length > 1;
  const allOptions = result.breakdown || [];

  // Affichage unifié pour tous les types de questions
  return (
    <div className="space-y-6 animate-fade-in pt-6">
      {/* Indicateur de sources et mise à jour (optionnel : rendu au-dessus dans DecisionMaker) */}
      {showDataAccuracyIndicator && (
        <DataAccuracyIndicator result={result} currentDecision={currentDecision} />
      )}

      <RecommendationCard 
        result={result}
        dilemma={dilemma}
        currentDecision={currentDecision}
        onEditOptions={onEditOptions}
        onUpdateResult={onUpdateDecision ? (updatedResult) => {
          if (currentDecision) {
            onUpdateDecision({
              ...currentDecision,
              result: updatedResult
            });
          }
        } : undefined}
      />
      
      {hasMultipleOptions && (
        <Card className="mt-0 bg-transparent border-0 shadow-none" style={{ overflow: 'visible' }}>
          <CardHeader className="px-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <CardTitle className="text-lg">
                {t('decision.comparisonTable')}
              </CardTitle>
              <Badge variant="outline" className="self-start sm:self-center bg-white">
                {result.breakdown?.length || 0} options
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="px-0" style={{ overflow: 'visible' }}>
            <ComparisonTable 
              breakdown={allOptions} 
              dilemma={dilemma}
              result={result}
              decisionId={currentDecision?.id || undefined}
              showVoting={!!currentDecision?.id}
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
          </CardContent>
        </Card>
      )}

      
      {/* Questions de suivi automatiques pour les décisions intelligentes */}
      {onFollowUpQuestion && !result.recommendation?.includes("Options créées manuellement") && (
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
                    category: 'practical_info' as const
                  }))
                }
              };
              onUpdateDecision(updatedDecision);
            }
          }}
          isLoading={isUpdating}
        />
      )}

      {/* Questions de suivi manuelles pour les décisions manuelles - seulement le bouton */}
      {onFollowUpQuestion && result.recommendation?.includes(t('decision.manualOptions.manualAnalysisDescription')) && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{t('decision.manualOptions.createFollowUpQuestion')}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {t('decision.manualOptions.followUpDescription')}
            </p>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => onFollowUpQuestion(dilemma)}
              disabled={isUpdating}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('decision.manualOptions.createFollowUpQuestion')}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalysisResult;
