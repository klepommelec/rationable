
export type AIProvider = 'perplexity';

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

// Configuration simplifiée : UNIQUEMENT Perplexity pour les données récentes
export const AI_PROVIDERS_CONFIG: AIProviderConfig[] = [
  {
    provider: 'perplexity',
    model: 'sonar-pro',
    priority: 1,
    maxRetries: 3,
    costLevel: 'low',
    capabilities: ['text', 'search', 'real-time', 'criteria', 'options']
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
      return config.capabilities.includes(requestType) || 
             config.capabilities.includes('text') ||
             config.capabilities.includes('search');
    });
  }

  async executeWithFallback(request: AIRequest): Promise<AIResponse> {
    const providers = this.getAvailableProviders(request.type);
    console.log(`🔄 Executing ${request.type} request with Perplexity only`);

    const providerConfig = providers[0]; // Seul Perplexity disponible
    
    if (!providerConfig) {
      throw new Error('No AI provider available');
    }

    console.log(`🚀 Using provider: ${providerConfig.provider} (${providerConfig.model})`);
    
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
      
      throw new Error(`Perplexity failed: ${errorMessage}`);
    }
  }

  private async callProvider(config: AIProviderConfig, request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      let result: any;

      if (config.provider === 'perplexity') {
        result = await this.callPerplexity(config, request);
      } else {
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
