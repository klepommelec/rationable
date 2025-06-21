
import { ICriterion, IResult, DEFAULT_CATEGORIES } from '@/types/decision';
import { callOpenAiApi } from './openai';

// Cache intelligent pour éviter les re-générations
const analysisCache = new Map<string, any>();

// Fonction pour créer une clé de cache basée sur le dilemme
const createCacheKey = (dilemma: string): string => {
  return dilemma.toLowerCase().trim().substring(0, 100);
};

// Vérifier la similarité entre dilemmes pour réutiliser les analyses
const getSimilarAnalysis = (dilemma: string): any | null => {
  const cacheKey = createCacheKey(dilemma);
  
  // Recherche exacte d'abord
  if (analysisCache.has(cacheKey)) {
    console.log('💰 Analyse trouvée en cache (gratuit):', dilemma.substring(0, 50));
    return analysisCache.get(cacheKey);
  }
  
  // Recherche de similarité basique (peut être améliorée)
  const dilemmaWords = dilemma.toLowerCase().split(' ');
  for (const [cachedKey, cachedValue] of analysisCache.entries()) {
    const cachedWords = cachedKey.split(' ');
    const commonWords = dilemmaWords.filter(word => cachedWords.includes(word) && word.length > 3);
    
    // Si 40% des mots sont en commun, réutiliser l'analyse
    if (commonWords.length >= Math.min(dilemmaWords.length * 0.4, 3)) {
      console.log('💰 Analyse similaire trouvée en cache:', cachedKey);
      return cachedValue;
    }
  }
  
  return null;
};

export const generateCriteriaOnly = async (dilemma: string) => {
  // Vérifier le cache d'abord
  const cachedAnalysis = getSimilarAnalysis(dilemma);
  if (cachedAnalysis) {
    return {
      emoji: cachedAnalysis.emoji || '🤔',
      criteria: cachedAnalysis.criteria || [],
      suggestedCategory: cachedAnalysis.suggestedCategory
    };
  }

  // Prompt ultra-optimisé (réduction de 70% vs ancien)
  const prompt = `Analysez: "${dilemma.substring(0, 200)}"

Retournez JSON avec:
- "emoji": emoji du dilemme
- "criteria": 3-4 critères max
- "suggestedCategory": ID parmi ${DEFAULT_CATEGORIES.map(c => c.id).join(',')}

Exemple: {"emoji": "💻", "criteria": ["Prix", "Performance"], "suggestedCategory": "tech"}`;

  try {
    const response = await callOpenAiApi(prompt);
    
    // Mettre en cache pour éviter les futurs coûts
    const cacheKey = createCacheKey(dilemma);
    analysisCache.set(cacheKey, response);
    
    return {
      emoji: response.emoji || '🤔',
      criteria: response.criteria || [],
      suggestedCategory: response.suggestedCategory
    };
  } catch (error) {
    console.error('Error in criteria generation:', error);
    // Fallback économique
    return {
      emoji: '🤔',
      criteria: ['Prix', 'Qualité', 'Facilité'],
      suggestedCategory: 'tech'
    };
  }
};

export const generateOptions = async (dilemma: string, criteria: ICriterion[]): Promise<IResult> => {
  // Vérifier le cache pour cette combinaison
  const cacheKey = `options_${createCacheKey(dilemma)}_${criteria.map(c => c.name).join('_')}`;
  
  if (analysisCache.has(cacheKey)) {
    console.log('💰 Options trouvées en cache (gratuit):', dilemma.substring(0, 50));
    return analysisCache.get(cacheKey);
  }

  const criteriaList = criteria.map(c => c.name).join(', ');
  
  // Prompt optimisé (réduction de 50% vs ancien)
  const prompt = `Dilemme: "${dilemma.substring(0, 150)}"
Critères: ${criteriaList}

JSON avec:
- "recommendation": meilleure option
- "description": pourquoi (max 100 mots)
- "imageQuery": description image (anglais, 20 mots max)
- "infoLinks": 2 liens max avec title/url
- "shoppingLinks": 2 liens max avec title/url  
- "breakdown": 3 options avec option/pros/cons/score

Concis et actionnable.`;

  try {
    const result = await callOpenAiApi(prompt);
    
    // Mettre en cache
    analysisCache.set(cacheKey, result);
    
    return result;
  } catch (error) {
    console.error('Error in options generation:', error);
    throw error;
  }
};

// Fonction pour vider le cache si nécessaire (pour éviter qu'il grossisse trop)
export const clearAnalysisCache = () => {
  analysisCache.clear();
  console.log('Cache d\'analyse vidé');
};

// Fonction pour obtenir les statistiques du cache
export const getCacheStats = () => {
  return {
    size: analysisCache.size,
    keys: Array.from(analysisCache.keys()).slice(0, 5) // Premiers 5 pour debug
  };
};
