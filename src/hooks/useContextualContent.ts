import { useAuth } from '@/hooks/useAuth';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { PERSONAL_TEMPLATES, PROFESSIONAL_TEMPLATES } from '@/data/predefinedTemplates';
import { useI18nUI } from '@/contexts/I18nUIContext';

export const useContextualContent = () => {
  const { profile } = useAuth();
  const { currentWorkspace } = useWorkspaces();
  const { currentLanguage } = useI18nUI();
  
  const getTemplates = () => {
  const context = currentWorkspace?.use_context || 'personal';
    return context === 'professional' ? PROFESSIONAL_TEMPLATES : PERSONAL_TEMPLATES;
  };

  const getExamples = () => {
    const context = currentWorkspace?.use_context || 'personal';
    
    if (context === 'professional') {
      return [
        "Ex: Choisir notre stack technique pour le nouveau projet",
        "Ex: Définir notre stratégie marketing pour Q2",
        "Ex: Sélectionner un fournisseur cloud pour notre infrastructure",
        "Ex: Planifier notre roadmap produit pour 2025",
        "Ex: Décider de notre stratégie de recrutement",
        "Ex: Évaluer cette opportunité de partenariat"
      ];
    }
    
    const language = currentLanguage;
    if (language === 'en') {
      return [
        "Ex: Which smartphone should I buy?",
        "Ex: Should I change my career?",
        "Ex: Which city to choose for my studies?",
        "Ex: Invest in stocks or real estate?",
        "Ex: Go on vacation or save money?",
        "Ex: Accept this job offer or keep looking?"
      ];
    }
    return [
      "Ex: Quel smartphone devrais-je acheter ?",
      "Ex: Dois-je changer de carrière professionnelle ?",
      "Ex: Quelle ville choisir pour mes études ?",
      "Ex: Investir en bourse ou dans l'immobilier ?",
      "Ex: Partir en voyage ou économiser de l'argent ?",
      "Ex: Accepter cette offre d'emploi ou continuer à chercher ?"
    ];
  };

  const getContextualTemplates = () => {
    const context = currentWorkspace?.use_context || 'personal';
    
    if (context === 'professional') {
      return [
        {
          name: "🏢 Stack technique",
          dilemma: "Quelle stack technique choisir pour notre nouveau projet ?",
        },
        {
          name: "📈 Stratégie marketing",
          dilemma: "Comment définir notre stratégie marketing pour Q2 ?",
        },
        {
          name: "☁️ Fournisseur cloud",
          dilemma: "Quel fournisseur cloud sélectionner pour notre infrastructure ?",
        },
        {
          name: "🗺️ Roadmap produit",
          dilemma: "Comment planifier notre roadmap produit pour 2025 ?",
        },
        {
          name: "👥 Stratégie recrutement",
          dilemma: "Quelle stratégie de recrutement adopter cette année ?",
        },
        {
          name: "🤝 Partenariat",
          dilemma: "Devons-nous accepter cette opportunité de partenariat ?",
        },
        {
          name: "💼 Prestataire externe",
          dilemma: "Quel prestataire externe choisir pour ce projet ?",
        },
        {
          name: "🎯 Objectifs trimestriels",
          dilemma: "Quels objectifs prioritaires fixer pour ce trimestre ?",
        }
      ];
    }
    
    const language = currentLanguage;
    if (language === 'en') {
      return [
        {
          name: "💻 Choose a Computer",
          dilemma: "Which new laptop should I buy?",
        },
        {
          name: "✈️ Choose Vacation",
          dilemma: "Where should I go for my next vacation?",
        },
        {
          name: "🚗 Buy a Car",
          dilemma: "Which car should I buy according to my budget and needs?",
        },
      ];
    }
    return [
      {
        name: "💻 Choisir un ordinateur",
        dilemma: "Quel nouvel ordinateur portable devrais-je acheter ?",
      },
      {
        name: "✈️ Choisir des vacances",
        dilemma: "Où devrais-je partir pour mes prochaines vacances ?",
      },
      {
        name: "🚗 Acheter une voiture",
        dilemma: "Quelle voiture devrais-je acheter selon mon budget et mes besoins ?",
      },
      {
        name: "🏠 Choisir un logement",
        dilemma: "Dans quel quartier devrais-je déménager ?",
      },
      {
        name: "💼 Opportunité de carrière",
        dilemma: "Devrais-je accepter cette nouvelle offre d'emploi ?",
      },
      {
        name: "📱 Smartphone",
        dilemma: "Quel smartphone choisir pour remplacer mon ancien téléphone ?",
      },
      {
        name: "💰 Investissement financier",
        dilemma: "Comment devrais-je investir mes économies cette année ?",
      },
      {
        name: "🎓 Formation personnelle",
        dilemma: "Quelle formation devrais-je suivre pour mon développement personnel ?",
      }
    ];
  };

  const getWelcomeMessage = () => {
    const context = currentWorkspace?.use_context || 'personal';
    const name = profile?.full_name?.split(' ')[0] || '';
    
    if (context === 'professional') {
      return name 
        ? `Bonjour ${name}, analysons vos défis professionnels ensemble`
        : 'Analysons vos défis professionnels avec l\'IA';
    }
    
    return name
      ? `Bonjour ${name}, prenons la meilleure décision ensemble`
      : 'Prenez la meilleure décision avec l\'IA';
  };

  return {
    getTemplates,
    getExamples,
    getWelcomeMessage,
    getContextualTemplates,
    context: currentWorkspace?.use_context || 'personal'
  };
};