
import { ICriterion, IResult, DEFAULT_CATEGORIES } from '@/types/decision';
import { callOpenAiApi } from './openai';
import CacheService from './cacheService';

// Rate limiting
const API_CALLS_LIMIT = 20; // Max calls per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

class RateLimiter {
  private static calls: number[] = [];

  static canMakeCall(): boolean {
    const now = Date.now();
    this.calls = this.calls.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
    
    if (this.calls.length >= API_CALLS_LIMIT) {
      console.warn(`🚫 [RATE LIMIT] API call limit reached (${API_CALLS_LIMIT}/hour)`);
      return false;
    }

    this.calls.push(now);
    return true;
  }

  static getRemainingCalls(): number {
    const now = Date.now();
    this.calls = this.calls.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
    return Math.max(0, API_CALLS_LIMIT - this.calls.length);
  }
}

export const generateCompleteAnalysis = async (dilemma: string) => {
  // Check cache first
  const cacheKey = CacheService.generateCacheKey(dilemma);
  const cached = CacheService.get(cacheKey);
  
  if (cached) {
    console.log('📋 [CACHE] Using cached complete analysis');
    return cached;
  }

  // Check rate limit
  if (!RateLimiter.canMakeCall()) {
    throw new Error(`Limite d'appels API atteinte. Essayez dans 1 heure. (${RateLimiter.getRemainingCalls()} appels restants)`);
  }

  const categories = DEFAULT_CATEGORIES.map(c => `"${c.id}"`).join(',');
  
  // Optimized prompt with response limits
  const prompt = `Analysez: "${dilemma}"

JSON: {"emoji":"","criteria":["","",""],"suggestedCategory":"${categories[0]}","recommendation":"","description":"","imageQuery":"","infoLinks":[{"title":"","url":""}],"shoppingLinks":[{"title":"","url":""}],"breakdown":[{"option":"","pros":["",""],"cons":["",""],"score":0}]}

Limites: 3 critères max, 3 options max, 2 pros/cons max, descriptions <100 mots, 1 lien info/shopping max.`;

  console.log(`📡 [API] Complete analysis call (${RateLimiter.getRemainingCalls()} remaining)`);
  const response = await callOpenAiApi(prompt);
  
  const result = {
    emoji: response.emoji || '🤔',
    criteria: (response.criteria || []).slice(0, 3), // Limit to 3
    suggestedCategory: response.suggestedCategory,
    result: {
      recommendation: response.recommendation || '',
      description: (response.description || '').slice(0, 200), // Limit description
      imageQuery: response.imageQuery || '',
      infoLinks: (response.infoLinks || []).slice(0, 1), // Limit to 1
      shoppingLinks: (response.shoppingLinks || []).slice(0, 1), // Limit to 1
      breakdown: (response.breakdown || []).slice(0, 3).map((item: any) => ({
        ...item,
        pros: (item.pros || []).slice(0, 2), // Limit pros
        cons: (item.cons || []).slice(0, 2)  // Limit cons
      }))
    }
  };

  // Cache result for 2 hours (longer for complete analysis)
  CacheService.set(cacheKey, result, { ttl: 2 * 60 * 60 * 1000 });
  
  return result;
};

export const generateOptionsOnly = async (dilemma: string, criteria: ICriterion[]): Promise<IResult> => {
  // Check cache first
  const cacheKey = CacheService.generateCacheKey(dilemma, criteria);
  const cached = CacheService.get(cacheKey);
  
  if (cached) {
    console.log('📋 [CACHE] Using cached options analysis');
    return cached;
  }

  // Check rate limit
  if (!RateLimiter.canMakeCall()) {
    throw new Error(`Limite d'appels API atteinte. Essayez dans 1 heure. (${RateLimiter.getRemainingCalls()} appels restants)`);
  }

  const criteriaList = criteria.map(c => c.name).slice(0, 4).join(', '); // Limit criteria
  
  // Optimized prompt with strict limits
  const prompt = `"${dilemma}" - Critères: ${criteriaList}

JSON: {"recommendation":"","description":"","imageQuery":"","infoLinks":[{"title":"","url":""}],"shoppingLinks":[{"title":"","url":""}],"breakdown":[{"option":"","pros":["",""],"cons":["",""],"score":0}]}

Limites: 3 options max, 2 pros/cons max, description <80 mots, 1 lien max.`;

  console.log(`📡 [API] Options call (${RateLimiter.getRemainingCalls()} remaining)`);
  const response = await callOpenAiApi(prompt);

  const result: IResult = {
    recommendation: response.recommendation || '',
    description: (response.description || '').slice(0, 160), // Limit description
    imageQuery: response.imageQuery || '',
    infoLinks: (response.infoLinks || []).slice(0, 1), // Limit to 1
    shoppingLinks: (response.shoppingLinks || []).slice(0, 1), // Limit to 1
    breakdown: (response.breakdown || []).slice(0, 3).map((item: any) => ({
      option: item.option || '',
      pros: Array.isArray(item.pros) ? item.pros.slice(0, 2) : [],
      cons: Array.isArray(item.cons) ? item.cons.slice(0, 2) : [],
      score: item.score || 0
    }))
  };

  // Cache result for 1 hour
  CacheService.set(cacheKey, result, { ttl: 60 * 60 * 1000 });

  return result;
};

// Export for debugging
export { RateLimiter, CacheService };
