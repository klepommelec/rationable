
import { ICriterion, IResult, DEFAULT_CATEGORIES } from '@/types/decision';
import { callOpenAiApi } from './openai';
import CacheService from './cacheService';

// Rate limiting
const API_CALLS_LIMIT = 20; // Max calls per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

// Model configuration
const MODEL_CONFIG = {
  CHEAP: 'gpt-4o-mini',
  PREMIUM: 'gpt-4o-mini', // Fallback to same model for now
  FALLBACK_THRESHOLD: 2 // Number of retries before switching model
};

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

// Model selection logic
class ModelSelector {
  private static failureCount: Map<string, number> = new Map();

  static selectModel(isRetry: boolean = false, retryCount: number = 0): string {
    // Start with cheap model for cost optimization
    if (retryCount < MODEL_CONFIG.FALLBACK_THRESHOLD) {
      console.log(`💰 [MODEL] Using cheap model: ${MODEL_CONFIG.CHEAP} (attempt ${retryCount + 1})`);
      return MODEL_CONFIG.CHEAP;
    }
    
    // Fallback to premium model if cheap model fails
    console.log(`⚡ [MODEL] Fallback to premium model: ${MODEL_CONFIG.PREMIUM}`);
    return MODEL_CONFIG.PREMIUM;
  }

  static recordSuccess(model: string) {
    this.failureCount.delete(model);
    console.log(`✅ [MODEL] Success recorded for ${model}`);
  }

  static recordFailure(model: string) {
    const current = this.failureCount.get(model) || 0;
    this.failureCount.set(model, current + 1);
    console.log(`❌ [MODEL] Failure recorded for ${model} (total: ${current + 1})`);
  }
}

export const generateCompleteAnalysis = async (dilemma: string, retryCount: number = 0) => {
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
  const selectedModel = ModelSelector.selectModel(retryCount > 0, retryCount);
  
  // Ultra-optimized prompt for cost reduction
  const prompt = `Analysez: "${dilemma}"

JSON: {"emoji":"","criteria":["","",""],"suggestedCategory":"${categories[0]}","recommendation":"","description":"","imageQuery":"","infoLinks":[{"title":"","url":""}],"shoppingLinks":[{"title":"","url":""}],"breakdown":[{"option":"","pros":["",""],"cons":["",""],"score":0}]}

Limites strictes: 3 critères max, 3 options max, 2 pros/cons max, descriptions <80 mots, 1 lien max.`;

  console.log(`📡 [API] Complete analysis call with ${selectedModel} (${RateLimiter.getRemainingCalls()} remaining)`);
  
  try {
    const response = await callOpenAiApi(prompt, selectedModel);
    
    ModelSelector.recordSuccess(selectedModel);
    
    const result = {
      emoji: response.emoji || '🤔',
      criteria: (response.criteria || []).slice(0, 3), // Limit to 3
      suggestedCategory: response.suggestedCategory,
      result: {
        recommendation: response.recommendation || '',
        description: (response.description || '').slice(0, 150), // Strict limit
        imageQuery: response.imageQuery || '',
        infoLinks: (response.infoLinks || []).slice(0, 1), // Limit to 1
        shoppingLinks: (response.shoppingLinks || []).slice(0, 1), // Limit to 1
        breakdown: (response.breakdown || []).slice(0, 3).map((item: any) => ({
          ...item,
          pros: Array.isArray(item.pros) ? item.pros.slice(0, 2) : [], // Ensure array
          cons: Array.isArray(item.cons) ? item.cons.slice(0, 2) : []  // Ensure array
        }))
      }
    };

    // Cache result for 2 hours
    CacheService.set(cacheKey, result, { ttl: 2 * 60 * 60 * 1000 });
    
    return result;
    
  } catch (error) {
    ModelSelector.recordFailure(selectedModel);
    
    // Retry with different model if under threshold
    if (retryCount < MODEL_CONFIG.FALLBACK_THRESHOLD) {
      console.log(`🔄 [RETRY] Retrying with different model (attempt ${retryCount + 1})`);
      return generateCompleteAnalysis(dilemma, retryCount + 1);
    }
    
    throw error;
  }
};

export const generateOptionsOnly = async (dilemma: string, criteria: ICriterion[], retryCount: number = 0): Promise<IResult> => {
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
  const selectedModel = ModelSelector.selectModel(retryCount > 0, retryCount);
  
  // Ultra-optimized prompt for cost reduction
  const prompt = `"${dilemma}" - Critères: ${criteriaList}

JSON: {"recommendation":"","description":"","imageQuery":"","infoLinks":[{"title":"","url":""}],"shoppingLinks":[{"title":"","url":""}],"breakdown":[{"option":"","pros":["",""],"cons":["",""],"score":0}]}

Limites strictes: 3 options max, 2 pros/cons max, description <60 mots, 1 lien max.`;

  console.log(`📡 [API] Options call with ${selectedModel} (${RateLimiter.getRemainingCalls()} remaining)`);

  try {
    const response = await callOpenAiApi(prompt, selectedModel);
    
    ModelSelector.recordSuccess(selectedModel);

    const result: IResult = {
      recommendation: response.recommendation || '',
      description: (response.description || '').slice(0, 120), // Strict limit
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
    
  } catch (error) {
    ModelSelector.recordFailure(selectedModel);
    
    // Retry with different model if under threshold
    if (retryCount < MODEL_CONFIG.FALLBACK_THRESHOLD) {
      console.log(`🔄 [RETRY] Retrying with different model (attempt ${retryCount + 1})`);
      return generateOptionsOnly(dilemma, criteria, retryCount + 1);
    }
    
    throw error;
  }
};

// Export for debugging
export { RateLimiter, CacheService, ModelSelector };
