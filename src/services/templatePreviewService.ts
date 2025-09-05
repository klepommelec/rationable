import { IDecision } from '@/types/decision';

// Service pour prévisualiser les templates sans authentification
// Utilise le localStorage pour stocker temporairement les données du template

const TEMPLATE_PREVIEW_KEY = 'template_preview_data';

export const shareTemplateForPreview = (templateData: IDecision): string => {
  // Générer un ID unique pour cette preview
  const previewId = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Stocker les données dans le localStorage avec l'ID
  const previewData = {
    id: previewId,
    data: templateData,
    timestamp: Date.now(),
    expires: Date.now() + (24 * 60 * 60 * 1000) // Expire dans 24h
  };
  
  // Récupérer les previews existantes et nettoyer les expirées
  const existingPreviews = getStoredPreviews();
  const validPreviews = existingPreviews.filter(p => p.expires > Date.now());
  
  // Ajouter la nouvelle preview
  validPreviews.push(previewData);
  
  // Limiter à 10 previews max pour éviter de surcharger le localStorage
  if (validPreviews.length > 10) {
    validPreviews.splice(0, validPreviews.length - 10);
  }
  
  localStorage.setItem(TEMPLATE_PREVIEW_KEY, JSON.stringify(validPreviews));
  
  return previewId;
};

export const getTemplatePreview = (previewId: string): IDecision | null => {
  const previews = getStoredPreviews();
  const preview = previews.find(p => p.id === previewId && p.expires > Date.now());
  
  return preview ? preview.data : null;
};

const getStoredPreviews = (): Array<{
  id: string;
  data: IDecision;
  timestamp: number;
  expires: number;
}> => {
  try {
    const stored = localStorage.getItem(TEMPLATE_PREVIEW_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error parsing stored template previews:', error);
    return [];
  }
};

// Nettoyer les previews expirées
export const cleanupExpiredPreviews = () => {
  const validPreviews = getStoredPreviews().filter(p => p.expires > Date.now());
  localStorage.setItem(TEMPLATE_PREVIEW_KEY, JSON.stringify(validPreviews));
};