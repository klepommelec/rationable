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
      const language = currentLanguage;
      if (language === 'en') {
        return [
          "Ex: Choose our tech stack for the new project",
          "Ex: Define our marketing strategy for Q2",
          "Ex: Select a cloud provider for our infrastructure",
          "Ex: Plan our product roadmap for 2025",
          "Ex: Decide on our recruitment strategy",
          "Ex: Evaluate this partnership opportunity"
        ];
      }
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
    // Templates contextuels désactivés pour éviter la consommation involontaire de crédits
    return [];
  };

  const getWelcomeMessage = () => {
    const context = currentWorkspace?.use_context || 'personal';
    const name = profile?.full_name?.split(' ')[0] || '';
    const language = currentLanguage;
    
    if (context === 'professional') {
      if (language === 'en') {
        return name 
          ? `Hello ${name}, let's analyze your professional challenges together`
          : 'Analyze your professional challenges with AI';
      }
      return name 
        ? `Bonjour ${name}, analysons vos défis professionnels ensemble`
        : 'Analysons vos défis professionnels avec l\'IA';
    }
    
    if (language === 'en') {
      return name
        ? `Hello ${name}, let's make the best decision together`
        : 'Make the best decision with AI';
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