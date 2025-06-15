
export interface ICriterion {
  id: string;
  name: string;
}

export interface IBreakdownItem {
  option: string;
  pros: string[];
  cons: string[];
  score: number;
}

export interface ILink {
  title: string;
  url:string;
}

export interface IResult {
  recommendation: string;
  description: string;
  imageQuery: string;
  imageBase64?: string; // Kept for backwards compatibility
  infoLinks: ILink[];
  shoppingLinks: ILink[];
  breakdown: IBreakdownItem[];
}

export interface IDecision {
  id: string;
  timestamp: number;
  dilemma: string;
  emoji: string;
  criteria: ICriterion[];
  result: IResult;
}

export type AnalysisStep = 'idle' | 'generating-criteria' | 'validating-criteria' | 'final-analysis' | 'done';
