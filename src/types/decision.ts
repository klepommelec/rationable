
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
  url: string;
  description?: string;
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
  category?: string;
  tags?: string[];
}

export interface IDecisionCategory {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

// Catégories prédéfinies
export const DEFAULT_CATEGORIES: IDecisionCategory[] = [
  { id: 'tech', name: 'Technologie', emoji: '💻', color: 'blue' },
  { id: 'travel', name: 'Voyages', emoji: '✈️', color: 'green' },
  { id: 'career', name: 'Carrière', emoji: '🚀', color: 'purple' },
  { id: 'lifestyle', name: 'Style de vie', emoji: '🏠', color: 'orange' },
  { id: 'finance', name: 'Finance', emoji: '💰', color: 'yellow' },
  { id: 'health', name: 'Santé', emoji: '🏥', color: 'red' },
  { id: 'education', name: 'Éducation', emoji: '📚', color: 'indigo' },
  { id: 'other', name: 'Autre', emoji: '🤔', color: 'gray' }
];
