import { IBreakdownItem } from '@/types/decision';
import { Award, TrendingUp, Target, Zap, Heart, Shield, Banknote, Globe, Utensils, Car, Smartphone, Home, Briefcase } from 'lucide-react';

export interface ContextualMetric {
  title: string;
  value: number | string;
  icon: any;
  description: string;
  color: string;
}

export interface ContextualDomain {
  id: string;
  name: string;
  keywords: string[];
  metrics: (data: IBreakdownItem[]) => ContextualMetric[];
  icon: any;
  color: string;
}

// Détection du contexte basée sur les mots-clés
export const detectContext = (dilemma: string, options: IBreakdownItem[]): ContextualDomain | null => {
  const text = `${dilemma} ${options.map(o => o.option + ' ' + o.pros.join(' ') + ' ' + o.cons.join(' ')).join(' ')}`.toLowerCase();
  
  // Recherche du domaine correspondant
  for (const domain of contextualDomains) {
    if (domain.keywords.some(keyword => text.includes(keyword))) {
      return domain;
    }
  }
  
  return null; // Fallback vers métriques génériques
};

// Fonctions utilitaires pour calculer des métriques contextuelles
const calculateQualityPriceRatio = (data: IBreakdownItem[]) => {
  const avgScore = data.reduce((sum, item) => sum + item.score, 0) / data.length;
  const priceWords = ['cher', 'coût', 'prix', 'budget', 'économique', 'gratuit', 'payant'];
  
  let priceBonus = 0;
  data.forEach(item => {
    const text = (item.pros.join(' ') + ' ' + item.cons.join(' ')).toLowerCase();
    const hasPriceAdvantage = priceWords.some(word => 
      item.pros.some(pro => pro.toLowerCase().includes(word))
    );
    if (hasPriceAdvantage) priceBonus += 5;
  });
  
  return Math.min(Math.round(avgScore + priceBonus), 100);
};

const calculateInnovationScore = (data: IBreakdownItem[]) => {
  const innovationWords = ['nouveau', 'innovant', 'révolutionnaire', 'moderne', 'récent', 'avancé', 'technologie'];
  const baseScore = data.reduce((sum, item) => sum + item.score, 0) / data.length;
  
  let innovationBonus = 0;
  data.forEach(item => {
    const prosText = item.pros.join(' ').toLowerCase();
    const hasInnovation = innovationWords.some(word => prosText.includes(word));
    if (hasInnovation) innovationBonus += 8;
  });
  
  return Math.min(Math.round(baseScore + innovationBonus), 100);
};

const calculateExperienceScore = (data: IBreakdownItem[]) => {
  const experienceWords = ['expérience', 'qualité', 'service', 'ambiance', 'atmosphère', 'accueil'];
  const baseScore = data.reduce((sum, item) => sum + item.score, 0) / data.length;
  
  let experienceBonus = 0;
  data.forEach(item => {
    const prosText = item.pros.join(' ').toLowerCase();
    const hasExperience = experienceWords.some(word => prosText.includes(word));
    if (hasExperience) experienceBonus += 6;
  });
  
  return Math.min(Math.round(baseScore + experienceBonus), 100);
};

const calculateDiversityIndex = (data: IBreakdownItem[]) => {
  const avgScore = data.reduce((sum, item) => sum + item.score, 0) / data.length;
  const prosVariety = Math.max(...data.map(item => item.pros.length)) - Math.min(...data.map(item => item.pros.length));
  const diversityBonus = Math.min(prosVariety * 3, 20);
  
  return Math.min(Math.round(avgScore + diversityBonus), 100);
};

// Définition des domaines contextuels
export const contextualDomains: ContextualDomain[] = [
  {
    id: 'tech',
    name: 'Technologie',
    keywords: ['smartphone', 'ordinateur', 'laptop', 'téléphone', 'iphone', 'android', 'mac', 'pc', 'tablette', 'technologie', 'app', 'logiciel'],
    icon: Smartphone,
    color: 'blue',
    metrics: (data: IBreakdownItem[]) => [
      {
        title: 'Innovation Score',
        value: calculateInnovationScore(data),
        icon: Zap,
        description: 'Niveau d\'innovation technologique',
        color: 'text-blue-600'
      },
      {
        title: 'Rapport Qualité-Prix',
        value: calculateQualityPriceRatio(data),
        icon: Target,
        description: 'Équilibre performance/coût',
        color: 'text-green-600'
      },
      {
        title: 'Score Performance',
        value: Math.max(...data.map(item => item.score)),
        icon: TrendingUp,
        description: 'Meilleure performance technique',
        color: 'text-purple-600'
      },
      {
        title: 'Fiabilité Index',
        value: Math.round(data.reduce((sum, item) => sum + (item.cons.length > 0 ? 100 - item.cons.length * 10 : 100), 0) / data.length),
        icon: Shield,
        description: 'Stabilité et fiabilité',
        color: 'text-orange-600'
      }
    ]
  },
  {
    id: 'travel',
    name: 'Voyage',
    keywords: ['voyage', 'destination', 'vacances', 'hôtel', 'vol', 'séjour', 'pays', 'ville', 'plage', 'montagne', 'ski', 'station'],
    icon: Globe,
    color: 'green',
    metrics: (data: IBreakdownItem[]) => [
      {
        title: 'Indice Aventure',
        value: calculateDiversityIndex(data),
        icon: Globe,
        description: 'Diversité des expériences',
        color: 'text-green-600'
      },
      {
        title: 'Confort Score',
        value: calculateExperienceScore(data),
        icon: Heart,
        description: 'Niveau de confort et services',
        color: 'text-pink-600'
      },
      {
        title: 'Budget Optimisé',
        value: calculateQualityPriceRatio(data),
        icon: Banknote,
        description: 'Meilleur rapport qualité-prix',
        color: 'text-yellow-600'
      },
      {
        title: 'Score Authenticité',
        value: Math.round(data.reduce((sum, item) => sum + item.score, 0) / data.length),
        icon: Award,
        description: 'Expérience authentique',
        color: 'text-blue-600'
      }
    ]
  },
  {
    id: 'food',
    name: 'Restauration',
    keywords: ['restaurant', 'cuisine', 'nourriture', 'repas', 'chef', 'gastronomie', 'menu', 'plat', 'bar', 'café'],
    icon: Utensils,
    color: 'orange',
    metrics: (data: IBreakdownItem[]) => [
      {
        title: 'Expérience Culinaire',
        value: calculateExperienceScore(data),
        icon: Utensils,
        description: 'Qualité des plats et cuisine',
        color: 'text-orange-600'
      },
      {
        title: 'Ambiance Score',
        value: Math.round(data.reduce((sum, item) => sum + item.score, 0) / data.length),
        icon: Heart,
        description: 'Atmosphère et cadre',
        color: 'text-pink-600'
      },
      {
        title: 'Value Score',
        value: calculateQualityPriceRatio(data),
        icon: Target,
        description: 'Rapport qualité-prix repas',
        color: 'text-green-600'
      },
      {
        title: 'Service Excellence',
        value: Math.min(Math.max(...data.map(item => item.score)) + 5, 100),
        icon: Award,
        description: 'Qualité du service',
        color: 'text-blue-600'
      }
    ]
  },
  {
    id: 'transport',
    name: 'Transport',
    keywords: ['voiture', 'auto', 'véhicule', 'transport', 'conduite', 'carburant', 'essence', 'électrique', 'hybride'],
    icon: Car,
    color: 'red',
    metrics: (data: IBreakdownItem[]) => [
      {
        title: 'Efficacité Énergétique',
        value: calculateInnovationScore(data),
        icon: Zap,
        description: 'Consommation et écologie',
        color: 'text-green-600'
      },
      {
        title: 'Sécurité Index',
        value: Math.round(data.reduce((sum, item) => sum + item.score, 0) / data.length),
        icon: Shield,
        description: 'Niveau de sécurité',
        color: 'text-blue-600'
      },
      {
        title: 'Coût Total',
        value: calculateQualityPriceRatio(data),
        icon: Banknote,
        description: 'Coût d\'acquisition et usage',
        color: 'text-yellow-600'
      },
      {
        title: 'Performance',
        value: Math.max(...data.map(item => item.score)),
        icon: TrendingUp,
        description: 'Performances et fiabilité',
        color: 'text-purple-600'
      }
    ]
  },
  {
    id: 'career',
    name: 'Carrière',
    keywords: ['emploi', 'travail', 'carrière', 'poste', 'job', 'entreprise', 'salaire', 'métier', 'profession'],
    icon: Briefcase,
    color: 'purple',
    metrics: (data: IBreakdownItem[]) => [
      {
        title: 'Opportunité Score',
        value: Math.max(...data.map(item => item.score)),
        icon: TrendingUp,
        description: 'Potentiel de croissance',
        color: 'text-purple-600'
      },
      {
        title: 'Équilibre Vie-Pro',
        value: calculateExperienceScore(data),
        icon: Heart,
        description: 'Qualité de vie au travail',
        color: 'text-pink-600'
      },
      {
        title: 'Rémunération',
        value: calculateQualityPriceRatio(data),
        icon: Banknote,
        description: 'Package salarial attractif',
        color: 'text-green-600'
      },
      {
        title: 'Stabilité',
        value: Math.round(data.reduce((sum, item) => sum + item.score, 0) / data.length),
        icon: Shield,
        description: 'Sécurité de l\'emploi',
        color: 'text-blue-600'
      }
    ]
  },
  {
    id: 'housing',
    name: 'Logement',
    keywords: ['appartement', 'maison', 'logement', 'immobilier', 'loyer', 'achat', 'location', 'habitation'],
    icon: Home,
    color: 'indigo',
    metrics: (data: IBreakdownItem[]) => [
      {
        title: 'Confort Habitat',
        value: calculateExperienceScore(data),
        icon: Home,
        description: 'Qualité de vie quotidienne',
        color: 'text-indigo-600'
      },
      {
        title: 'Localisation',
        value: Math.round(data.reduce((sum, item) => sum + item.score, 0) / data.length),
        icon: Globe,
        description: 'Emplacement et commodités',
        color: 'text-green-600'
      },
      {
        title: 'Investissement',
        value: calculateQualityPriceRatio(data),
        icon: TrendingUp,
        description: 'Potentiel financier',
        color: 'text-yellow-600'
      },
      {
        title: 'Praticité',
        value: calculateDiversityIndex(data),
        icon: Target,
        description: 'Facilité du quotidien',
        color: 'text-blue-600'
      }
    ]
  }
];

export const getContextualMetrics = (dilemma: string, data: IBreakdownItem[]): ContextualMetric[] => {
  const context = detectContext(dilemma, data);
  
  if (context) {
    return context.metrics(data);
  }
  
  // Métriques génériques par défaut
  const averageScore = Math.round(data.reduce((acc, item) => acc + item.score, 0) / data.length);
  const maxScore = Math.max(...data.map(item => item.score));
  const scoreRange = maxScore - Math.min(...data.map(item => item.score));
  
  return [
    {
      title: 'Meilleur Score',
      value: maxScore,
      icon: Award,
      description: data.find(item => item.score === maxScore)?.option.replace(/^Option\s+\d+:\s*/i, '').trim() || 'Meilleure option',
      color: 'text-yellow-600'
    },
    {
      title: 'Score Moyen',
      value: averageScore,
      icon: Target,
      description: 'Moyenne générale',
      color: 'text-blue-600'
    },
    {
      title: 'Écart de Scores',
      value: scoreRange,
      icon: TrendingUp,
      description: `Différence entre options`,
      color: 'text-purple-600'
    },
    {
      title: 'Options Analysées',
      value: data.length,
      icon: Shield,
      description: 'Alternatives évaluées',
      color: 'text-green-600'
    }
  ];
};