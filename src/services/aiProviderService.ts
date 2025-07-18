
export type AIProvider = 'openai' | 'claude' | 'perplexity';

export interface AIProviderConfig {
  provider: AIProvider;
  model: string;
  priority: number;
  maxRetries: number;
  costLevel: 'low' | 'medium' | 'high';
  capabilities: string[];
}

export interface AIRequest {
  prompt: string;
  context?: string;
  type: 'criteria' | 'options' | 'search';
  files?: any[];
  workspaceId?: string;
}

export interface AIResponse {
  content: any;
  provider: AIProvider;
  model: string;
  success: boolean;
  error?: string;
  metadata?: {
    tokens?: number;
    cost?: number;
    duration?: number;
  };
}

// Configuration des fournisseurs par ordre de priorité
export const AI_PROVIDERS_CONFIG: AIProviderConfig[] = [
  {
    provider: 'openai',
    model: 'gpt-4o-mini',
    priority: 1,
    maxRetries: 3,
    costLevel: 'medium',
    capabilities: ['text', 'vision', 'json', 'criteria', 'options']
  },
  {
    provider: 'claude',
    model: 'claude-3-5-sonnet-20241022',
    priority: 2,
    maxRetries: 2,
    costLevel: 'high',
    capabilities: ['text', 'vision', 'complex-reasoning', 'criteria', 'options']
  },
  {
    provider: 'perplexity',
    model: 'llama-3.1-sonar-small-128k-online',
    priority: 3,
    maxRetries: 2,
    costLevel: 'low',
    capabilities: ['search', 'real-time']
  }
];

export class AIProviderService {
  private static instance: AIProviderService;
  private successRates: Map<AIProvider, number> = new Map();
  private lastFailure: Map<AIProvider, number> = new Map();

  constructor() {
    // Initialiser les taux de succès
    AI_PROVIDERS_CONFIG.forEach(config => {
      this.successRates.set(config.provider, 100);
    });
  }

  static getInstance(): AIProviderService {
    if (!AIProviderService.instance) {
      AIProviderService.instance = new AIProviderService();
    }
    return AIProviderService.instance;
  }

  getAvailableProviders(requestType: string): AIProviderConfig[] {
    return AI_PROVIDERS_CONFIG
      .filter(config => {
        // Filtrer par capacités
        if (requestType === 'search') {
          return config.capabilities.includes('search') || config.capabilities.includes('real-time');
        }
        return config.capabilities.includes(requestType) || 
               config.capabilities.includes('text');
      })
      .sort((a, b) => {
        // Trier par priorité et taux de succès
        const aSuccessRate = this.successRates.get(a.provider) || 0;
        const bSuccessRate = this.successRates.get(b.provider) || 0;
        
        if (Math.abs(aSuccessRate - bSuccessRate) > 20) {
          return bSuccessRate - aSuccessRate; // Meilleur taux de succès en premier
        }
        
        return a.priority - b.priority; // Sinon par priorité
      });
  }

  async executeWithFallback(request: AIRequest): Promise<AIResponse> {
    const providers = this.getAvailableProviders(request.type);
    console.log(`🔄 Executing ${request.type} request with ${providers.length} available providers`);

    let lastError: string = '';

    for (const providerConfig of providers) {
      // Vérifier si le fournisseur est temporairement indisponible
      const lastFailTime = this.lastFailure.get(providerConfig.provider);
      if (lastFailTime && Date.now() - lastFailTime < 30000) { // 30 secondes de cooldown
        console.log(`⏸️ Skipping ${providerConfig.provider} - cooling down`);
        continue;
      }

      console.log(`🚀 Trying provider: ${providerConfig.provider} (${providerConfig.model})`);
      
      try {
        const response = await this.callProvider(providerConfig, request);
        
        if (response.success) {
          this.updateSuccessRate(providerConfig.provider, true);
          console.log(`✅ Success with ${providerConfig.provider}`);
          return response;
        } else {
          throw new Error(response.error || 'Provider returned unsuccessful response');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ ${providerConfig.provider} failed:`, errorMessage);
        
        this.updateSuccessRate(providerConfig.provider, false);
        this.lastFailure.set(providerConfig.provider, Date.now());
        lastError = errorMessage;
      }
    }

    throw new Error(`All AI providers failed. Last error: ${lastError}`);
  }

  private async callProvider(config: AIProviderConfig, request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      let result: any;

      switch (config.provider) {
        case 'openai':
          result = await this.callOpenAI(config, request);
          break;
        case 'claude':
          result = await this.callClaude(config, request);
          break;
        case 'perplexity':
          result = await this.callPerplexity(config, request);
          break;
        default:
          throw new Error(`Unknown provider: ${config.provider}`);
      }

      return {
        content: result,
        provider: config.provider,
        model: config.model,
        success: true,
        metadata: {
          duration: Date.now() - startTime
        }
      };
    } catch (error) {
      return {
        content: null,
        provider: config.provider,
        model: config.model,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          duration: Date.now() - startTime
        }
      };
    }
  }

  private async callOpenAI(config: AIProviderConfig, request: AIRequest): Promise<any> {
    const { callOpenAiApi } = await import('./openai');
    return await callOpenAiApi(request.prompt, request.files);
  }

  private async callClaude(config: AIProviderConfig, request: AIRequest): Promise<any> {
    // Pour l'instant, utiliser OpenAI comme fallback
    // TODO: Implémenter l'API Claude directement
    console.log('🔄 Claude not implemented yet, using OpenAI as fallback');
    return await this.callOpenAI(config, request);
  }

  private async callPerplexity(config: AIProviderConfig, request: AIRequest): Promise<any> {
    const { searchWithPerplexity } = await import('./perplexityService');
    const result = await searchWithPerplexity(request.prompt, request.context);
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    return {
      content: result.content,
      sources: result.sources,
      timestamp: result.timestamp,
      searchQuery: result.searchQuery
    };
  }

  private updateSuccessRate(provider: AIProvider, success: boolean): void {
    const currentRate = this.successRates.get(provider) || 50;
    const adjustment = success ? 5 : -10;
    const newRate = Math.max(0, Math.min(100, currentRate + adjustment));
    this.successRates.set(provider, newRate);
    
    console.log(`📊 ${provider} success rate: ${newRate}%`);
  }

  getProviderStats(): { provider: AIProvider; successRate: number }[] {
    return AI_PROVIDERS_CONFIG.map(config => ({
      provider: config.provider,
      successRate: this.successRates.get(config.provider) || 0
    }));
  }
}
