
import React, { useState } from 'react';
import { IResult, IDecision, IBreakdownItem } from '@/types/decision';
import { RecommendationCard } from './RecommendationCard';
import { ComparisonTable } from './ComparisonTable';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import FollowUpQuestions from './FollowUpQuestions';
import { DataAccuracyIndicator } from './DataAccuracyIndicator';
import { useI18nUI } from '@/contexts/I18nUIContext';
import { CommentSection } from '../comments/CommentSection';
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
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({
  result,
  isUpdating,
  analysisStep,
  currentDecision,
  dilemma,
  onUpdateDecision,
  onFollowUpQuestion,
  onEditOptions
}) => {
  const { t } = useI18nUI();
  const [showAllOptions, setShowAllOptions] = useState(false);
  const [hasComments, setHasComments] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);
  
  const handleAddCommentClick = () => {
    setIsAddingComment(true);
  };
  
  // Nombre d'options à afficher initialement (5)
  const initialOptionsCount = 5;
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
        onEditOptions={onEditOptions}
      />
      
      {hasMultipleOptions && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <CardTitle className="text-lg">
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

      {/* Section Commentaires */}
      {currentDecision?.id && (
        <Card className="mt-6">
          {hasComments && (
            <CardHeader className="h-16 pt-6">
              <div className="flex items-center justify-between h-full">
                <CardTitle className="text-lg">
                  {t('decision.manualOptions.comments')} ({commentsCount})
                </CardTitle>
                {!isAddingComment && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddCommentClick}
                    className="text-black border-gray-300 hover:text-black hover:border-gray-400"
                  >
                    <Plus className="h-4 w-4 mr-2 text-black" />
                    {t('comments.section.addButton')}
                  </Button>
                )}
              </div>
            </CardHeader>
          )}
          <CardContent>
            <CommentSection
              decisionId={currentDecision.id}
              commentType="general"
              title={t('decision.manualOptions.comments')}
              placeholder={t('decision.manualOptions.commentsPlaceholder')}
              onCommentsChange={(hasComments, isAddingComment, count) => {
                setHasComments(hasComments);
                setIsAddingComment(isAddingComment);
                setCommentsCount(count);
              }}
              externalIsAddingComment={isAddingComment}
              onSetIsAddingComment={setIsAddingComment}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalysisResult;
