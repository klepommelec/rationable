
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

export interface IYouTubeVideo {
  id: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  viewCount: string;
  url: string;
}

export interface ISocialContent {
  youtubeVideos?: IYouTubeVideo[];
}

export interface IResult {
  recommendation: string;
  description: string;
  breakdown: IBreakdownItem[];
  infoLinks?: ILink[];
  shoppingLinks?: ILink[];
  socialContent?: ISocialContent;
  imageQuery?: string;
  workspaceData?: {
    documentsUsed: number;
    documentsContent: string[];
    documentSources?: string[];
  };
  realTimeData?: {
    hasRealTimeData: boolean;
    timestamp?: string;
    sourcesCount?: number;
    provider?: string;
    searchQuery?: string;
    sources?: string[];
  };
  aiProvider?: {
    provider: string;
    model: string;
    success: boolean;
    error?: string;
  };
  dataFreshness?: 'very-fresh' | 'fresh' | 'moderate' | 'stale';
  resultType?: 'factual' | 'comparative' | 'simple-choice'; // Nouveau champ
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
