
import { ICriterion, IResult, DEFAULT_CATEGORIES } from '@/types/decision';
import { UploadedFileInfo } from './fileUploadService';
import { generateCriteriaWithFallback, generateOptionsWithFallback } from './enhancedDecisionService';

// Réexporter les fonctions avec fallback comme interface principale
export const generateCriteriaOnly = generateCriteriaWithFallback;
export const generateOptions = generateOptionsWithFallback;

// Garder les anciennes fonctions pour la compatibilité (elles utilisent maintenant le système multi-fournisseurs)
export { generateCriteriaWithFallback as generateCriteriaOnlyWithFallback };
export { generateOptionsWithFallback as generateOptionsWithMultiProvider };
