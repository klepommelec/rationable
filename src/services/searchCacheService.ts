// Service de cache pour les recherches externes avec TTL
export interface CachedSearchResult {
  content: any;
  timestamp: number;
  expiresAt: number;
  searchQuery: string;
  provider: string;
}

class SearchCacheService {
  private cache = new Map<string, CachedSearchResult>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes en millisecondes

  private generateCacheKey(query: string, context?: string): string {
    // Normaliser et hasher la requête pour la clé de cache
    const normalized = query.toLowerCase().trim();
    const contextKey = context ? `_${context.toLowerCase().trim()}` : '';
    // Utiliser encodeURIComponent pour gérer les caractères Unicode
    const encoded = encodeURIComponent(normalized + contextKey);
    // Créer un hash simple pour la clé de cache
    return encoded.replace(/[.%]/g, '').substring(0, 50);
  }

  private isExpired(cachedResult: CachedSearchResult): boolean {
    return Date.now() > cachedResult.expiresAt;
  }

  get(query: string, context?: string): CachedSearchResult | null {
    const key = this.generateCacheKey(query, context);
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }

    if (this.isExpired(cached)) {
      this.cache.delete(key);
      console.log('🗑️ Cache expired for query:', query.substring(0, 50) + '...');
      return null;
    }

    const ageInMinutes = Math.round((Date.now() - cached.timestamp) / (1000 * 60));
    console.log(`✅ Cache hit for query (${ageInMinutes}min old):`, query.substring(0, 50) + '...');
    return cached;
  }

  set(query: string, context: string | undefined, content: any, provider: string): void {
    const key = this.generateCacheKey(query, context);
    const now = Date.now();
    
    const cachedResult: CachedSearchResult = {
      content,
      timestamp: now,
      expiresAt: now + this.TTL,
      searchQuery: query,
      provider
    };

    this.cache.set(key, cachedResult);
    console.log(`💾 Cached search result from ${provider} for:`, query.substring(0, 50) + '...');
    
    // Nettoyer les entrées expirées de manière périodique
    this.cleanupExpired();
  }

  private cleanupExpired(): void {
    const before = this.cache.size;
    let cleaned = 0;

    for (const [key, value] of this.cache.entries()) {
      if (this.isExpired(value)) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cleaned ${cleaned} expired cache entries (${before} -> ${this.cache.size})`);
    }

    // Si le cache devient trop volumineux, supprimer les plus anciens
    if (this.cache.size > 100) {
      const entries = Array.from(this.cache.entries()).sort((a, b) => a[1].timestamp - b[1].timestamp);
      const toDelete = entries.slice(0, 50); // Supprimer les 50 plus anciens
      
      toDelete.forEach(([key]) => this.cache.delete(key));
      console.log(`🧹 Cache size limit reached, removed ${toDelete.length} oldest entries`);
    }
  }

  clear(): void {
    this.cache.clear();
    console.log('🗑️ Search cache cleared');
  }

  getStats(): { size: number; hitRate: number } {
    // Stats basiques - peut être étendu si nécessaire
    return {
      size: this.cache.size,
      hitRate: 0 // TODO: Implémenter le tracking des hits/misses si nécessaire
    };
  }
}

// Instance singleton
export const searchCacheService = new SearchCacheService();