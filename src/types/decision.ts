
export interface ICriterion {
  id: string;
  name: string;
  weight: number; // Poids de 1 à 5, par défaut 3
}

export interface IBreakdownItem {
  option: string;
  pros: string[];
  cons: string[];
  score: number;
  weightedScore: number; // Nouveau score calculé avec les poids
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
