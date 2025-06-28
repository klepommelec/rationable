
import React from 'react';
import { IResult } from '@/types/decision';
import { RecommendationCard } from './RecommendationCard';
import { AnalysisCharts } from './AnalysisCharts';
import { CommentSection } from '../comments/CommentSection';

interface AnalysisResultProps {
  result: IResult | null;
  isUpdating: boolean;
  clearSession: () => void;
  analysisStep: string;
  currentDecision?: any;
  dilemma?: string;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({
  result,
  isUpdating,
  clearSession,
  analysisStep,
  currentDecision,
  dilemma
}) => {
  if (!result) return null;

  return (
    <div role="main" aria-label="Résultats de l'analyse de décision" className="space-y-6 sm:space-y-8 animate-fade-in max-w-7xl mx-auto sm:px-4 px-0">
      {/* Skip to charts link for screen readers */}
      <a href="#analysis-charts" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50 transition-all duration-200" aria-label="Aller aux graphiques d'analyse">
        Aller aux graphiques
      </a>

      <RecommendationCard
        result={result}
        dilemma={dilemma}
        currentDecision={currentDecision}
        clearSession={clearSession}
      />

      {/* Section commentaires sur la recommandation */}
      {currentDecision && (
        <div className="mb-6">
          <CommentSection
            decisionId={currentDecision.id}
            commentType="recommendation"
            title="Commentaires sur la recommandation"
            placeholder="Ajoutez un commentaire sur la recommandation proposée..."
          />
        </div>
      )}

      <div id="analysis-charts" className="scroll-mt-4">
        <AnalysisCharts breakdown={result.breakdown} dilemma={dilemma} />
      </div>

      {/* Section commentaires sur les options */}
      {currentDecision && (
        <div className="mt-6">
          <CommentSection
            decisionId={currentDecision.id}
            commentType="option"
            title="Commentaires sur les options"
            placeholder="Ajoutez un commentaire sur les différentes options analysées..."
          />
        </div>
      )}
    </div>
  );
};

export default AnalysisResult;
