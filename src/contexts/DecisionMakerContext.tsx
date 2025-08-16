import React, { createContext, useContext } from 'react';
import { useDecisionMaker } from '@/hooks/useDecisionMaker';

type DecisionMakerContextType = ReturnType<typeof useDecisionMaker>;

const DecisionMakerContext = createContext<DecisionMakerContextType | null>(null);

export const DecisionMakerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const decisionMaker = useDecisionMaker();
  
  return (
    <DecisionMakerContext.Provider value={decisionMaker}>
      {children}
    </DecisionMakerContext.Provider>
  );
};

export const useDecisionMakerContext = (): DecisionMakerContextType => {
  const context = useContext(DecisionMakerContext);
  if (!context) {
    throw new Error('useDecisionMakerContext must be used within a DecisionMakerProvider');
  }
  return context;
};