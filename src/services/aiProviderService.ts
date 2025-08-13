
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

// Configuration hybride : OpenAI/Claude pour l'analyse, Perplexity pour la recherche
export const AI_PROVIDERS_CONFIG: AIProviderConfig[] = [
  {
    provider: 'openai',
    model: 'gpt-4.1-2025-04-14',
    priority: 1,
    maxRetries: 3,
    costLevel: 'medium',
    capabilities: ['text', 'criteria', 'options', 'structured-analysis']
  },
  {
    provider: 'claude',
    model: 'claude-sonnet-4-20250514',
    priority: 2,
    maxRetries: 3,
    costLevel: 'medium',
    capabilities: ['text', 'criteria', 'options', 'structured-analysis']
  },
  {
    provider: 'perplexity',
    model: 'sonar-pro',
    priority: 3,
    maxRetries: 3,
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
    return AI_PROVIDERS_CONFIG.filter(config => {
      // Pour la recherche, utiliser uniquement Perplexity
      if (requestType === 'search' || requestType === 'real-time') {
        return config.capabilities.includes('search') || config.capabilities.includes('real-time');
      }
      
      // Pour l'analyse structurée (criteria, options), utiliser OpenAI/Claude
      if (requestType === 'criteria' || requestType === 'options') {
        return config.capabilities.includes('structured-analysis') || config.capabilities.includes(requestType);
      }
      
      return config.capabilities.includes(requestType) || config.capabilities.includes('text');
    }).sort((a, b) => a.priority - b.priority);
  }

  async executeWithFallback(request: AIRequest): Promise<AIResponse> {
    const providers = this.getAvailableProviders(request.type);
    console.log(`🔄 Executing ${request.type} request with ${providers.length} provider(s) available`);

    if (providers.length === 0) {
      throw new Error(`No AI provider available for type: ${request.type}`);
    }

    let lastError: Error | null = null;

    for (const providerConfig of providers) {
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
        lastError = new Error(`${providerConfig.provider} failed: ${errorMessage}`);
        
        // Continue to next provider
        continue;
      }
    }

    // All providers failed
    throw lastError || new Error('All providers failed');
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
    const result = await callOpenAiApi(request.prompt, request.files);
    
    return result;
  }

  private async callClaude(config: AIProviderConfig, request: AIRequest): Promise<any> {
    const { makeQuickDecision } = await import('./claudeService');
    
    // Convertir le prompt en structure compatible Claude
    const mockCriteria = [{ id: '1', name: 'Analysis' }];
    const result = await makeQuickDecision(request.prompt, mockCriteria);
    
    return result;
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
      searchQuery: result.searchQuery,
      recommendation: result.content, // Pour compatibilité avec l'interface existante
      description: result.content
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
