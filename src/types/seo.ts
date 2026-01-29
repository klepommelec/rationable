// Types pour la gestion de contenu SEO
export interface Keyword {
  id: string;
  keyword: string;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  competition: 'low' | 'medium' | 'high';
  trend: 'rising' | 'stable' | 'falling';
  position?: number;
  clicks?: number;
  impressions?: number;
  ctr?: number;
  conversions?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Content {
  id: string;
  title: string;
  url?: string;
  content: string;
  type: 'article' | 'blog' | 'page' | 'product';
  status: 'draft' | 'published' | 'archived';
  seoScore: number;
  mainKeyword: string;
  keywords: string[];
  metaDescription: string;
  wordCount: number;
  readabilityScore: number;
  views: number;
  shares: number;
  comments: number;
  authorId: string;
  workspaceId: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SEOAnalysis {
  id: string;
  contentId: string;
  overallScore: number;
  technicalScore: number;
  contentScore: number;
  keywordScore: number;
  suggestions: SEOSuggestion[];
  analyzedAt: Date;
}

export interface SEOSuggestion {
  id: string;
  type: 'keyword' | 'content' | 'technical' | 'meta';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
  aiGenerated: boolean;
  createdAt: Date;
}

export interface Competitor {
  id: string;
  name: string;
  domain: string;
  keywords: number;
  estimatedTraffic: number;
  domainAuthority: number;
  backlinks: number;
  commonKeywords: number;
  positionGap: number;
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SEOReport {
  id: string;
  title: string;
  type: 'performance' | 'keyword' | 'content' | 'competitor' | 'technical';
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    visitors: number;
    pageViews: number;
    bounceRate: number;
    conversionRate: number;
    averagePosition: number;
    totalKeywords: number;
    newKeywords: number;
    lostKeywords: number;
  };
  content: any; // JSON content of the report
  workspaceId: string;
  createdAt: Date;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  domain?: string;
  language: string;
  timezone: string;
  settings: {
    autoAnalysis: boolean;
    aiSuggestions: boolean;
    competitorTracking: boolean;
    reportFrequency: 'daily' | 'weekly' | 'monthly';
  };
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Types pour les API externes
export interface KeywordResearchResult {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  competition: string;
  trend: string;
  relatedKeywords: string[];
}

export interface ContentOptimizationResult {
  score: number;
  suggestions: {
    title: string;
    description: string;
    impact: string;
    difficulty: string;
  }[];
  keywordDensity: Record<string, number>;
  readabilityScore: number;
  technicalIssues: string[];
}







