
export interface IProgressiveState {
  phase: 'idle' | 'generating-emoji' | 'generating-criteria' | 'analyzing-options' | 'finalizing' | 'done';
  progress: number;
  message: string;
  emoji?: string;
  criteriaGenerated: string[];
  optionsAnalyzed: number;
  totalOptions: number;
}

export interface ICriteriaGenerationStep {
  criterion: string;
  delay: number;
}

export interface IOptionAnalysisStep {
  option: string;
  currentScore: number;
  finalScore: number;
  isComplete: boolean;
}
