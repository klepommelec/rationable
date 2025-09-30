// Utilitaire pour charger les liens intelligents depuis le cache persistant
import { actionLinksCacheService } from '@/services/actionLinksCacheService';
import { I18nService } from '@/services/i18nService';
import { BestLinksResponse } from '@/services/firstResultService';

export interface LoadActionLinksOptions {
  optionName: string;
  dilemma: string;
  result?: any;
  onUpdateResult?: (updatedResult: any) => void;
  forceReload?: boolean;
}

export const loadActionLinksFromCache = (options: LoadActionLinksOptions): BestLinksResponse | null => {
  const { optionName, dilemma, result, onUpdateResult, forceReload = false } = options;
  
  // Vérifier d'abord le cache local
  const cachedLinks = result?.cachedActionLinks?.[optionName];
  if (cachedLinks && !forceReload) {
    // Force re-evaluation of action type for bikes to avoid cached 'directions'
    const detectedVertical = I18nService.detectVertical(dilemma + ' ' + optionName);
    if (detectedVertical === 'automotive' && cachedLinks.actionType === 'directions') {
      console.log(`🔄 Forcing re-evaluation for bike product ${optionName} (was cached as directions)`);
      // Don't use cache, force reload
    } else {
      console.log(`✅ Using local cached action links for ${optionName}`);
      return cachedLinks;
    }
  }

  // Si pas de cache local ou force reload, vérifier le cache persistant
  const detectedLanguage = I18nService.getCurrentLanguage();
  const detectedVertical = I18nService.detectVertical(dilemma + ' ' + optionName);
  const persistentCachedLinks = actionLinksCacheService.get(optionName, detectedLanguage, detectedVertical);
  
  if (persistentCachedLinks) {
    console.log(`✅ Using persistent cached action links for ${optionName}`);
    
    // Mettre à jour le cache local pour la cohérence
    if (result && onUpdateResult) {
      const updatedResult = {
        ...result,
        cachedActionLinks: {
          ...result.cachedActionLinks,
          [optionName]: persistentCachedLinks
        }
      };
      onUpdateResult(updatedResult);
    }
    
    return persistentCachedLinks;
  }

  return null;
};

// Fonction pour précharger tous les liens d'une décision depuis le cache persistant
export const preloadAllActionLinks = (breakdown: any[], dilemma: string, result?: any, onUpdateResult?: (updatedResult: any) => void): Record<string, BestLinksResponse> => {
  const loadedLinks: Record<string, BestLinksResponse> = {};
  
  breakdown.forEach(option => {
    const optionName = option.option;
    const cachedLinks = loadActionLinksFromCache({
      optionName,
      dilemma,
      result,
      onUpdateResult
    });
    
    if (cachedLinks) {
      loadedLinks[optionName] = cachedLinks;
    }
  });
  
  if (Object.keys(loadedLinks).length > 0) {
    console.log(`📦 Preloaded ${Object.keys(loadedLinks).length} action links from persistent cache`);
  }
  
  return loadedLinks;
};
