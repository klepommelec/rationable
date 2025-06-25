
import React from 'react';
import { IResult } from '@/types/decision';
import { RecommendationCard } from './RecommendationCard';
import { UsefulLinks } from './UsefulLinks';
import { AnalysisCharts } from './AnalysisCharts';

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
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      <RecommendationCard 
        result={result}
        dilemma={dilemma}
        currentDecision={currentDecision}
        clearSession={clearSession}
      />

      {/* Liens utiles intégrés dans la carte de recommandation */}
      <div className="px-6 pb-6 -mt-6">
        <UsefulLinks 
          infoLinks={result.infoLinks}
          shoppingLinks={result.shoppingLinks}
          dilemma={dilemma}
          recommendation={result.recommendation}
        />
      </div>

      <AnalysisCharts 
        breakdown={result.breakdown}
        dilemma={dilemma}
      />
    </div>
  );
};

export default AnalysisResult;
