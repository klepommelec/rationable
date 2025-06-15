
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
  imageQuery?: string; // Gardé pour la compatibilité ascendante
  imageBase64?: string; // Nouvelle image générée par l'IA
  infoLinks: ILink[];
  shoppingLinks: ILink[];
  breakdown: IBreakdownItem[];
}

export interface IDecision {
  id: string;
  timestamp: number;
  dilemma: string;
  criteria: ICriterion[];
  result: IResult;
}
