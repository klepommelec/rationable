
import React from 'react';
import { EnhancedDecisionHistory } from './EnhancedDecisionHistory';
import { IDecision } from '@/types/decision';

interface DecisionHistoryProps {
  history: IDecision[];
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  onClose: () => void;
  onUpdateCategory?: (decisionId: string, categoryId: string | undefined) => void;
}

export const DecisionHistory: React.FC<DecisionHistoryProps> = ({ 
  history, 
  onLoad, 
  onDelete, 
  onClear, 
  onClose,
  onUpdateCategory = () => {}
}) => {
  return (
    <EnhancedDecisionHistory
      history={history}
      onLoad={onLoad}
      onDelete={onDelete}
      onClear={onClear}
      onClose={onClose}
      onUpdateCategory={onUpdateCategory}
    />
  );
};
