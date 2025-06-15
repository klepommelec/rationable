
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

export interface IResult {
  recommendation: string;
  breakdown: IBreakdownItem[];
}

export interface IDecision {
  id: string;
  timestamp: number;
  dilemma: string;
  criteria: ICriterion[];
  result: IResult;
}
