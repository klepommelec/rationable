import { SupportedLanguage } from '@/i18n/ui';

export interface MonthlyTemplate {
  id: string;
  prompt: string;
  context: 'personal' | 'professional';
  month: string; // format: "2024-12"
}

export interface MonthlyTemplatesData {
  currentMonth: string;
  templates: MonthlyTemplate[];
  archived: MonthlyTemplate[];
}

// Templates trending pour décembre 2024
export const MONTHLY_TEMPLATES_DATA: MonthlyTemplatesData = {
  currentMonth: "2024-12",
  templates: [
    // Personal December 2024 - French
    {
      id: "dec-2024-personal-1-fr",
      prompt: "Quel cadeau de Noël acheter pour mes proches cette année ?",
      context: "personal",
      month: "2024-12"
    },
    {
      id: "dec-2024-personal-2-fr", 
      prompt: "Dois-je déménager dans une nouvelle ville en 2025 ?",
      context: "personal",
      month: "2024-12"
    },
    {
      id: "dec-2024-personal-3-fr",
      prompt: "Comment organiser mes résolutions pour la nouvelle année ?",
      context: "personal", 
      month: "2024-12"
    },
    // Personal December 2024 - English
    {
      id: "dec-2024-personal-1-en",
      prompt: "What Christmas gifts should I buy for my loved ones this year?",
      context: "personal",
      month: "2024-12"
    },
    {
      id: "dec-2024-personal-2-en",
      prompt: "Should I move to a new city in 2025?", 
      context: "personal",
      month: "2024-12"
    },
    {
      id: "dec-2024-personal-3-en",
      prompt: "How should I organize my New Year resolutions?",
      context: "personal",
      month: "2024-12"
    },
    // Professional December 2024 - French
    {
      id: "dec-2024-professional-1-fr",
      prompt: "Quelle stratégie adopter pour mon business en 2025 ?",
      context: "professional",
      month: "2024-12"
    },
    {
      id: "dec-2024-professional-2-fr",
      prompt: "Dois-je changer de poste avant la fin d'année ?",
      context: "professional", 
      month: "2024-12"
    },
    {
      id: "dec-2024-professional-3-fr",
      prompt: "Comment négocier mon salaire pour 2025 ?",
      context: "professional",
      month: "2024-12"
    },
    // Professional December 2024 - English  
    {
      id: "dec-2024-professional-1-en",
      prompt: "What strategy should I adopt for my business in 2025?",
      context: "professional",
      month: "2024-12"
    },
    {
      id: "dec-2024-professional-2-en", 
      prompt: "Should I change jobs before the end of the year?",
      context: "professional",
      month: "2024-12"
    },
    {
      id: "dec-2024-professional-3-en",
      prompt: "How should I negotiate my salary for 2025?",
      context: "professional",
      month: "2024-12"
    }
  ],
  archived: [
    // Previous months' templates will be added here automatically when rotating
  ]
};

// Translation mapping for template labels
export const MONTHLY_TEMPLATE_LABELS = {
  fr: {
    trendingThisMonth: "Tendances du mois de Décembre",
    monthlyTrends: "Tendances mensuelles"
  },
  en: {
    trendingThisMonth: "December Trending Topics", 
    monthlyTrends: "Monthly Trends"
  }
};