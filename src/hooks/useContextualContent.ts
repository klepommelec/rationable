import { useAuth } from './useAuth';
import { PERSONAL_TEMPLATES, PROFESSIONAL_TEMPLATES } from '@/data/predefinedTemplates';

export const useContextualContent = () => {
  const { profile } = useAuth();
  
  const getTemplates = () => {
    const context = profile?.use_context || 'personal';
    return context === 'professional' ? PROFESSIONAL_TEMPLATES : PERSONAL_TEMPLATES;
  };

  const getExamples = () => {
    const context = profile?.use_context || 'personal';
    
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
    
    return [
      "Ex: Quel smartphone devrais-je acheter ?",
      "Ex: Dois-je changer de carrière professionnelle ?",
      "Ex: Quelle ville choisir pour mes études ?",
      "Ex: Investir en bourse ou dans l'immobilier ?",
      "Ex: Partir en voyage ou économiser de l'argent ?",
      "Ex: Accepter cette offre d'emploi ou continuer à chercher ?"
    ];
  };

  const getWelcomeMessage = () => {
    const context = profile?.use_context || 'personal';
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
    context: profile?.use_context || 'personal'
  };
};